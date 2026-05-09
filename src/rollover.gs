/**
 * @file rollover.gs
 * Annual schedule generation using a Latin-square rotation.
 *
 * The core algorithm is a pure function — no sheet I/O — so it can be
 * unit-tested independently of Google Sheets. The wrapper `runRollover()`
 * reads inputs from the sheet and writes outputs back.
 */

// ---------------------------------------------------------------------------
// Pure algorithm (unit-testable)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Assignment
 * @property {string} date       "YYYY-MM-DD"
 * @property {string} ward       Ward name
 * @property {string} speaker    Speaker name, or empty string for overrides
 * @property {string} status     One of the STATUS_* constants
 * @property {string} notes      Override label if status is "skipped", else ""
 * @property {boolean} locked    Always false for new proposals
 */

/**
 * @typedef {Object} RolloverInputs
 * @property {string[]} speakers     Active speaker names, in rotation order
 * @property {string[]} wards        Ward names sorted by meeting time
 * @property {string[]} dates        4th-Sunday dates as "YYYY-MM-DD" strings
 * @property {Object}   overrides    { "YYYY-MM-DD:WardName": label } — use "*" for all wards
 * @property {Set}      lockedCells  Set of "YYYY-MM-DD:WardName" strings already confirmed
 */

/**
 * Proposes a full schedule from the given inputs.
 * Does not touch any external I/O.
 *
 * @param {RolloverInputs} inputs
 * @returns {Assignment[]}
 */
function proposeSchedule(inputs) {
  const { speakers, wards, dates, overrides, lockedCells } = inputs;

  if (!speakers || speakers.length === 0) throw new Error('proposeSchedule: speakers list is empty');
  if (!wards    || wards.length === 0)    throw new Error('proposeSchedule: wards list is empty');
  if (!dates    || dates.length === 0)    throw new Error('proposeSchedule: dates list is empty');

  const N = speakers.length;
  const assignments = [];

  dates.forEach((date, monthIndex) => {
    wards.forEach((ward, wardIndex) => {
      const cellKey = `${date}:${ward}`;

      // Skip locked cells — they'll be carried forward from existing schedule
      if (lockedCells && lockedCells.has(cellKey)) return;

      // Check for a ward-specific or wildcard override
      const wardOverrideLabel  = overrides[cellKey];
      const wildcardOverrideLabel = overrides[`${date}:*`];
      const overrideLabel = wardOverrideLabel || wildcardOverrideLabel;

      if (overrideLabel) {
        assignments.push({
          date,
          ward,
          speaker: '',
          status: 'skipped',
          notes: overrideLabel,
          locked: false,
        });
        return;
      }

      const speaker = speakers[(monthIndex + wardIndex) % N];
      assignments.push({
        date,
        ward,
        speaker,
        status: 'pending',
        notes: '',
        locked: false,
      });
    });
  });

  return assignments;
}

/**
 * Scans a list of assignments and returns any cases where one speaker
 * is assigned to multiple wards on the same date.
 *
 * @param {Assignment[]} assignments
 * @returns {Object[]}  Array of { date, speaker, wards[] }
 */
function findDoubleAssignments(assignments) {
  const map = {};
  assignments.forEach(a => {
    if (!a.speaker) return;
    const key = `${a.date}:${a.speaker}`;
    if (!map[key]) map[key] = { date: a.date, speaker: a.speaker, wards: [] };
    map[key].wards.push(a.ward);
  });
  return Object.values(map).filter(x => x.wards.length > 1);
}

// ---------------------------------------------------------------------------
// Sheet integration wrapper
// ---------------------------------------------------------------------------

/**
 * Reads inputs from the sheet, calls proposeSchedule(), and writes results.
 * Existing locked rows are preserved; unlocked rows are replaced.
 */
function runRollover() {
  const settings   = getAllSettings();
  const tz         = settings['Time Zone'] || 'UTC';
  const year       = new Date().getFullYear();

  const speakers   = readActiveSpeakers().map(s => s['Name']);
  const wards      = readWards().map(w => w['Name']);

  // Build excluded dates: Fast Sunday (September 4th Sunday) and Christmas month (December)
  // December's 4th Sunday is close to Christmas, and many stakes skip it.
  const decemberFourthSunday = _getFourthSundayOfMonth(year, 11); // month 11 = December
  const excludedDates = [
    _getFourthSundayOfMonthStr(year, 8, tz),  // September = Fast Sunday
    _getFourthSundayOfMonthStr(year, 11, tz), // December  = Christmas proximity
  ];

  const rawDates   = getFourthSundays(year, excludedDates);
  const dateStrs   = rawDates.map(d => Utilities.formatDate(d, tz, 'yyyy-MM-dd'));

  // Build overrides map from the Overrides tab
  const overrideRows = readOverrides();
  const overrides = {};
  overrideRows.forEach(row => {
    const dateKey = normalizeDate(row['Date']);
    const ward    = String(row['Ward'] || '*').trim();
    const label   = String(row['Label'] || 'Override').trim();
    overrides[`${dateKey}:${ward}`] = label;
  });

  // Build locked cell set from existing schedule
  const existingSchedule = readSchedule();
  const lockedCells = new Set(
    existingSchedule
      .filter(r => String(r['Locked']).trim().toUpperCase() === 'TRUE')
      .map(r => `${normalizeDate(r['Date'])}:${String(r['Ward']).trim()}`)
  );

  // Carry locked rows forward unchanged
  const lockedRows = existingSchedule.filter(r =>
    String(r['Locked']).trim().toUpperCase() === 'TRUE'
  );

  const proposed = proposeSchedule({ speakers, wards, dates: dateStrs, overrides, lockedCells });

  // Flag double assignments in the log
  const doubles = findDoubleAssignments(proposed);
  if (doubles.length > 0) {
    doubles.forEach(d =>
      Logger.log(`[WARN] Double assignment: ${d.speaker} on ${d.date} at ${d.wards.join(', ')}`)
    );
    logAction('ROLLOVER_DOUBLES', 'Schedule', '', JSON.stringify(doubles));
  }

  // Merge proposed rows with locked rows
  const lockedMap = {};
  lockedRows.forEach(r => {
    lockedMap[`${normalizeDate(r['Date'])}:${String(r['Ward']).trim()}`] = r;
  });

  const finalRows = proposed.map(a => {
    const key = `${a.date}:${a.ward}`;
    if (lockedMap[key]) {
      const lr = lockedMap[key];
      return SCHEDULE_HEADERS.map(h => lr[h] ?? '');
    }
    return [
      year,
      a.date,
      a.ward,
      a.speaker,
      '',          // Topic — left blank for exec sec to assign
      a.status,
      a.notes,
      a.locked,
    ];
  });

  writeRows(TAB.SCHEDULE, SCHEDULE_HEADERS, finalRows);
  logAction('ROLLOVER', 'Schedule', '', `Generated ${finalRows.length} rows for ${year}`);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Returns the 4th Sunday of a given month as a Date.
 *
 * @param {number} year
 * @param {number} month  0-indexed (0=January, 11=December)
 * @returns {Date}
 */
function _getFourthSundayOfMonth(year, month) {
  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    if (new Date(year, month, day).getDay() === 0) {
      count++;
      if (count === 4) return new Date(year, month, day);
    }
  }
  return null;
}

/**
 * Returns the 4th Sunday of a given month as a "YYYY-MM-DD" string.
 *
 * @param {number} year
 * @param {number} month  0-indexed
 * @param {string} tz     IANA time zone string
 * @returns {string}
 */
function _getFourthSundayOfMonthStr(year, month, tz) {
  const d = _getFourthSundayOfMonth(year, month);
  if (!d) return '';
  return Utilities.formatDate(d, tz || 'UTC', 'yyyy-MM-dd');
}
