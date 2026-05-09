/**
 * @file data.gs
 * Sheet read/write helpers. All sheet I/O goes through these functions so
 * the business-logic files never reference SpreadsheetApp directly.
 *
 * Tab name constants live here. If you rename a tab, change it in one place.
 */

const TAB = {
  SCHEDULE: 'Schedule',
  SPEAKERS: 'Speakers',
  WARDS:    'Wards',
  TOPICS:   'Topics',
  SETTINGS: 'Settings',
  LOG:      'Log',
  OVERRIDES: 'Overrides',
};

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/**
 * Returns the sheet by name, throwing if it doesn't exist.
 *
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`Tab "${name}" not found. Check your sheet setup.`);
  return sheet;
}

/**
 * Reads all data rows from a sheet (skips the header row).
 * Returns an array of objects keyed by the header values.
 *
 * @param {string} sheetName
 * @returns {Object[]}
 */
function readRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i]]))
  ).filter(row => headers.some(h => row[h] !== '' && row[h] !== null));
}

/**
 * Overwrites the data rows in a sheet, preserving the header.
 * Clears existing data below the header first.
 *
 * @param {string} sheetName
 * @param {string[]} headers  Column names in order
 * @param {Array[]} rows      Array of value arrays matching headers
 */
function writeRows(sheetName, headers, rows) {
  const sheet = getSheet(sheetName);
  // Clear everything below header
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  if (rows.length === 0) return;
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

/**
 * Appends a single row to a sheet.
 *
 * @param {string} sheetName
 * @param {Array} rowValues
 */
function appendRow(sheetName, rowValues) {
  getSheet(sheetName).appendRow(rowValues);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/**
 * Returns the value for a settings key, or undefined if not found.
 *
 * @param {string} key
 * @returns {*}
 */
function getSettingValue(key) {
  const rows = readRows(TAB.SETTINGS);
  const row = rows.find(r => String(r['Key']).trim() === key);
  return row ? row['Value'] : undefined;
}

/**
 * Returns all settings as a plain object.
 *
 * @returns {Object}
 */
function getAllSettings() {
  const rows = readRows(TAB.SETTINGS);
  return Object.fromEntries(rows.map(r => [String(r['Key']).trim(), r['Value']]));
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ScheduleRow
 * @property {string} Year
 * @property {Date|string} Date
 * @property {string} Ward
 * @property {string} Speaker
 * @property {string} Topic
 * @property {string} Status
 * @property {string} Notes
 * @property {boolean|string} Locked
 */

const SCHEDULE_HEADERS = ['Year', 'Date', 'Ward', 'Speaker', 'Topic', 'Status', 'Notes', 'Locked'];

/** @returns {ScheduleRow[]} */
function readSchedule() {
  return readRows(TAB.SCHEDULE);
}

/**
 * Writes the full schedule, replacing all non-header rows.
 *
 * @param {ScheduleRow[]} rows
 */
function writeSchedule(rows) {
  const values = rows.map(r => SCHEDULE_HEADERS.map(h => r[h] ?? ''));
  writeRows(TAB.SCHEDULE, SCHEDULE_HEADERS, values);
}

/**
 * Updates a single schedule row identified by (date, ward).
 * Writes only the provided field(s); leaves others unchanged.
 *
 * @param {Date|string} date
 * @param {string} wardName
 * @param {Object} updates  key→value pairs from SCHEDULE_HEADERS
 */
function updateScheduleRow(date, wardName, updates) {
  const sheet = getSheet(TAB.SCHEDULE);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  const dateCol = headers.indexOf('Date');
  const wardCol = headers.indexOf('Ward');

  const targetDate = normalizeDate(date);

  for (let i = 1; i < data.length; i++) {
    const rowDate = normalizeDate(data[i][dateCol]);
    if (rowDate === targetDate && String(data[i][wardCol]).trim() === wardName) {
      Object.entries(updates).forEach(([key, val]) => {
        const col = headers.indexOf(key);
        if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(val);
      });
      return;
    }
  }
  throw new Error(`Schedule row not found: ${date} / ${wardName}`);
}

// ---------------------------------------------------------------------------
// Speakers
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Speaker
 * @property {string} Name
 * @property {string} Email
 * @property {string} Phone
 * @property {string} Calling
 * @property {boolean|string} Active
 * @property {string} Notes
 */

/**
 * Returns only active speakers, sorted by Name.
 *
 * @returns {Speaker[]}
 */
function readActiveSpeakers() {
  return readRows(TAB.SPEAKERS)
    .filter(r => String(r['Active']).trim().toUpperCase() !== 'FALSE' && r['Name'])
    .sort((a, b) => String(a['Name']).localeCompare(String(b['Name'])));
}

// ---------------------------------------------------------------------------
// Wards
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Ward
 * @property {string} Name
 * @property {string} Building
 * @property {string} Meeting Time
 * @property {string} Bishop Name
 * @property {string} Bishop Email
 * @property {number|string} Sort Order
 */

/**
 * Returns wards sorted by Sort Order, then Meeting Time.
 *
 * @returns {Ward[]}
 */
function readWards() {
  return readRows(TAB.WARDS)
    .filter(r => r['Name'])
    .sort((a, b) => {
      const orderDiff = (Number(a['Sort Order']) || 0) - (Number(b['Sort Order']) || 0);
      if (orderDiff !== 0) return orderDiff;
      return String(a['Meeting Time']).localeCompare(String(b['Meeting Time']));
    });
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Topic
 * @property {string} Title
 * @property {string} Source
 * @property {string} Scripture Refs
 * @property {string} Notes
 * @property {Date|string} Last Used Date
 */

/** @returns {Topic[]} */
function readTopics() {
  return readRows(TAB.TOPICS).filter(r => r['Title']);
}

// ---------------------------------------------------------------------------
// Overrides
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Override
 * @property {Date|string} Date
 * @property {string} Ward   Ward name, or "*" to apply to all wards that date
 * @property {string} Label  e.g. "Ward Conference", "Missionary Homecoming"
 */

/** @returns {Override[]} */
function readOverrides() {
  try {
    return readRows(TAB.OVERRIDES).filter(r => r['Date']);
  } catch (e) {
    // Overrides tab is optional
    return [];
  }
}

// ---------------------------------------------------------------------------
// Log
// ---------------------------------------------------------------------------

/**
 * Appends an audit log entry.
 *
 * @param {string} action   Short action code, e.g. "REMINDER_SENT"
 * @param {string} field    Column or subject being changed
 * @param {*}      oldValue
 * @param {*}      newValue
 */
function logAction(action, field, oldValue, newValue) {
  const user = Session.getActiveUser().getEmail() || 'script';
  appendRow(TAB.LOG, [
    new Date(),
    user,
    action,
    field,
    oldValue,
    newValue,
  ]);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Returns a date as "YYYY-MM-DD" string for comparison.
 * Accepts Date objects and strings.
 *
 * @param {Date|string} d
 * @returns {string}
 */
function normalizeDate(d) {
  if (!d) return '';
  const date = (d instanceof Date) ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d).trim();
  return Utilities.formatDate(date, getSettingValue('Time Zone') || 'UTC', 'yyyy-MM-dd');
}

/**
 * Returns an array of Date objects for every 4th Sunday in a given year,
 * excluding any dates in the excludedDates set.
 *
 * @param {number} year
 * @param {string[]} excludedDates  Array of "YYYY-MM-DD" strings to skip
 * @returns {Date[]}
 */
function getFourthSundays(year, excludedDates) {
  const excluded = new Set(excludedDates || []);
  const results = [];
  for (let month = 0; month < 12; month++) {
    // Find the 4th Sunday
    let sundayCount = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d.getDay() === 0) { // Sunday
        sundayCount++;
        if (sundayCount === 4) {
          const key = Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
          if (!excluded.has(key)) results.push(d);
          break;
        }
      }
    }
  }
  return results;
}

/**
 * Validates that a sheet has the expected column headers.
 * Logs a warning (does not throw) for missing columns.
 *
 * @param {string} sheetName
 * @param {string[]} requiredHeaders
 * @returns {boolean}  true if all headers present
 */
function validateSheetHeaders(sheetName, requiredHeaders) {
  const sheet = getSheet(sheetName);
  const firstRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const present = firstRow.map(h => String(h).trim());
  const missing = requiredHeaders.filter(h => !present.includes(h));
  if (missing.length > 0) {
    Logger.log(`[WARN] ${sheetName} is missing columns: ${missing.join(', ')}`);
    return false;
  }
  return true;
}
