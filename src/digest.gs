/**
 * @file digest.gs
 * Weekly exec sec digest: next 60 days of assignments, with flags for
 * missing topics, missing speakers, and double-duty conflicts.
 */

/**
 * Builds and sends the digest email to the exec sec.
 * Called by the Monday morning trigger in Code.gs.
 */
function sendDigest() {
  const settings    = getAllSettings();
  const tz          = settings['Time Zone'] || 'UTC';
  const stakeName   = settings['Stake Name'] || 'Your Stake';
  const execEmail   = settings['Exec Sec Email'];

  if (!execEmail) {
    Logger.log('[WARN] Exec Sec Email not set — digest skipped');
    return;
  }

  const today   = new Date();
  const cutoff  = new Date(today);
  cutoff.setDate(cutoff.getDate() + 60);

  const todayStr  = Utilities.formatDate(today,  tz, 'yyyy-MM-dd');
  const cutoffStr = Utilities.formatDate(cutoff, tz, 'yyyy-MM-dd');

  const schedule = readSchedule().filter(row => {
    const d = normalizeDate(row['Date']);
    return d >= todayStr && d <= cutoffStr;
  }).sort((a, b) => normalizeDate(a['Date']).localeCompare(normalizeDate(b['Date'])));

  const s = getStrings();

  // Build assignment list lines
  const assignmentLines = schedule.map(row => {
    const date      = normalizeDate(row['Date']);
    const wardName  = String(row['Ward']    || '').trim().padEnd(20);
    const speaker   = String(row['Speaker'] || '—').trim().padEnd(25);
    const status    = String(row['Status']  || '').trim();
    return fillTemplate(s.digestAssignmentLine, { date, wardName, speakerName: speaker, status });
  });

  // Build flags
  const flags = _buildDigestFlags(schedule, s);

  const startDate = Utilities.formatDate(today,  tz, 'MMM d');
  const endDate   = Utilities.formatDate(cutoff, tz, 'MMM d, yyyy');

  const body = fillTemplate(s.digestBody, {
    stakeName,
    assignmentList: assignmentLines.join('\n') || '(no assignments in this window)',
    flagList:       flags.length > 0 ? flags.join('\n') : s.digestNoFlags,
    generatedAt:    Utilities.formatDate(today, tz, 'MMM d, yyyy h:mm a z'),
  });

  const subject = fillTemplate(s.digestSubject, { startDate, endDate });
  GmailApp.sendEmail(execEmail, subject, body);
  logAction('DIGEST_SENT', 'Exec Sec', '', execEmail);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Generates flag lines for the digest.
 *
 * @param {Object[]} schedule  Filtered rows for the digest window
 * @param {Object}   s         Strings object
 * @returns {string[]}
 */
function _buildDigestFlags(schedule, s) {
  const flags = [];

  // Missing topics
  schedule.forEach(row => {
    if (String(row['Status']).trim() === 'skipped') return;
    if (!row['Speaker']) {
      flags.push(fillTemplate(s.digestFlagMissingSpeaker, {
        date:     normalizeDate(row['Date']),
        wardName: row['Ward'],
      }));
    } else if (!row['Topic']) {
      flags.push(fillTemplate(s.digestFlagMissingTopic, {
        date:     normalizeDate(row['Date']),
        wardName: row['Ward'],
      }));
    }
  });

  // Double-duty: same speaker on the same date at multiple wards
  const byDateSpeaker = {};
  schedule.forEach(row => {
    const speaker = String(row['Speaker'] || '').trim();
    if (!speaker) return;
    const key = `${normalizeDate(row['Date'])}::${speaker}`;
    if (!byDateSpeaker[key]) byDateSpeaker[key] = { date: normalizeDate(row['Date']), speaker, wards: [] };
    byDateSpeaker[key].wards.push(String(row['Ward']).trim());
  });

  Object.values(byDateSpeaker).forEach(entry => {
    if (entry.wards.length > 1) {
      flags.push(fillTemplate(s.digestFlagDoubleAssignment, {
        speakerName: entry.speaker,
        date:        entry.date,
        wards:       entry.wards.join(', '),
      }));
    }
  });

  return flags;
}
