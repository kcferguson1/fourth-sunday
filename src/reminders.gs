/**
 * @file reminders.gs
 * Daily job: find assignments due within Settings.Reminder Days and send
 * the speaker their topic, ward info, and meeting time.
 */

/**
 * Scans the schedule for assignments where the date is exactly
 * Settings.Reminder Days from today, topic is set, and status is
 * "topic_assigned". Sends a reminder email and updates the row status.
 *
 * Called by the daily trigger in Code.gs.
 */
function sendPendingReminders() {
  const settings      = getAllSettings();
  const tz            = settings['Time Zone'] || 'UTC';
  const reminderDays  = parseInt(settings['Reminder Days'] || '21', 10);
  const stakeName     = settings['Stake Name'] || 'Your Stake';
  const swapFormUrl   = settings['Swap Form URL'] || '';

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + reminderDays);
  const targetStr  = Utilities.formatDate(targetDate, tz, 'yyyy-MM-dd');

  const schedule   = readSchedule();
  const speakers   = readActiveSpeakers();
  const wards      = readWards();
  const topics     = readTopics();

  const speakerMap = _indexBy(speakers, 'Name');
  const wardMap    = _indexBy(wards,    'Name');
  const topicMap   = _indexBy(topics,   'Title');

  schedule.forEach(row => {
    const rowDate = normalizeDate(row['Date']);
    if (rowDate !== targetStr) return;
    if (String(row['Status']).trim() !== 'topic_assigned') return;
    if (!row['Topic']) return;

    const speakerName = String(row['Speaker']).trim();
    const wardName    = String(row['Ward']).trim();
    const topicTitle  = String(row['Topic']).trim();

    const speakerRecord = speakerMap[speakerName];
    if (!speakerRecord || !speakerRecord['Email']) {
      Logger.log(`[WARN] No email for speaker "${speakerName}" — reminder skipped`);
      return;
    }

    const wardRecord    = wardMap[wardName] || {};
    const topicRecord   = topicMap[topicTitle] || {};

    const scriptureRefs = topicRecord['Scripture Refs']
      ? `Scripture references: ${topicRecord['Scripture Refs']}\n`
      : '';

    sendReminderEmail({
      speakerName,
      speakerEmail: speakerRecord['Email'],
      date:         Utilities.formatDate(targetDate, tz, 'MMMM d, yyyy'),
      wardName,
      meetingTime:  wardRecord['Meeting Time'] || '(time not set)',
      bishopName:   wardRecord['Bishop Name']  || '(bishop not set)',
      topicTitle,
      scriptureRefs,
      swapFormUrl,
      stakeName,
    });

    updateScheduleRow(row['Date'], wardName, { Status: 'reminder_sent' });
    logAction('REMINDER_SENT', `${rowDate}:${wardName}`, 'topic_assigned', 'reminder_sent');
  });
}

/**
 * Sends a single speaker reminder email.
 * Exported so Code.gs can call it for the test-email menu item.
 *
 * @param {Object} params
 * @param {string} params.speakerName
 * @param {string} params.speakerEmail
 * @param {string} params.date           Human-readable date string
 * @param {string} params.wardName
 * @param {string} params.meetingTime
 * @param {string} params.bishopName
 * @param {string} params.topicTitle
 * @param {string} params.scriptureRefs  Pre-formatted line, or empty string
 * @param {string} params.swapFormUrl
 * @param {string} params.stakeName
 */
function sendReminderEmail(params) {
  const s = getStrings();
  const subject = fillTemplate(s.reminderSubject, params);
  const body    = fillTemplate(s.reminderBody,    params);
  GmailApp.sendEmail(params.speakerEmail, subject, body);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Indexes an array of objects by a field, for O(1) lookup.
 *
 * @param {Object[]} arr
 * @param {string}   field
 * @returns {Object}  { fieldValue: row }
 */
function _indexBy(arr, field) {
  const map = {};
  arr.forEach(item => {
    const key = String(item[field] || '').trim();
    if (key) map[key] = item;
  });
  return map;
}
