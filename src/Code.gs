/**
 * @file Code.gs
 * Entry points: custom menu, installable triggers, and one-shot manual actions.
 *
 * Trigger wiring (set up once via Extensions → Apps Script → Triggers):
 *   runDailyJobs    → time-driven, day timer, 6–7 am stake time
 *   runWeeklyDigest → time-driven, week timer, Monday, 7–8 am stake time
 */

// ---------------------------------------------------------------------------
// Sheet open — build the custom menu
// ---------------------------------------------------------------------------

function onOpen() {
  const s = getStrings();
  SpreadsheetApp.getUi()
    .createMenu(s.menuName)
    .addItem(s.menuInstall,       'runInstall')
    .addSeparator()
    .addItem(s.menuRunRollover,   'menuRunRollover')
    .addItem(s.menuSendDigest,    'menuSendDigest')
    .addItem(s.menuTestReminder,  'menuTestReminder')
    .addSeparator()
    .addItem(s.menuApproveSwaps,  'menuApproveSwaps')
    .addToUi();
}

// ---------------------------------------------------------------------------
// Menu actions
// ---------------------------------------------------------------------------

/** Runs the annual rollover and shows a completion alert. */
function menuRunRollover() {
  const ui = SpreadsheetApp.getUi();
  const s = getStrings();

  const speakers = readActiveSpeakers();
  const wards    = readWards();
  if (speakers.length === 0 || wards.length === 0) {
    ui.alert(s.rolloverNoData);
    return;
  }

  runRollover();
  ui.alert(s.rolloverComplete);
}

/** Sends the exec sec digest immediately (bypasses weekly schedule). */
function menuSendDigest() {
  sendDigest();
  const email = getSettingValue('Exec Sec Email') || '';
  SpreadsheetApp.getUi().alert(fillTemplate(getStrings().digestSent, { email }));
}

/**
 * Sends a test reminder to the exec sec's address so they can verify
 * the email template before real reminders go out.
 */
function menuTestReminder() {
  const s = getStrings();
  const settings = getAllSettings();
  const email = settings['Exec Sec Email'];
  if (!email) {
    SpreadsheetApp.getUi().alert('Set Exec Sec Email in the Settings tab first.');
    return;
  }

  sendReminderEmail({
    speakerName: settings['Exec Sec Name'] || 'Test Speaker',
    speakerEmail: email,
    date: Utilities.formatDate(new Date(), settings['Time Zone'] || 'UTC', 'MMMM d, yyyy'),
    wardName: 'Sample Ward',
    meetingTime: '10:00 AM',
    bishopName: 'Bishop Sample',
    topicTitle: 'Come, Follow Me — Sample Topic',
    scriptureRefs: 'Scripture reference here',
    swapFormUrl: getSettingValue('Swap Form URL') || '(swap form URL not set)',
    stakeName: settings['Stake Name'] || 'Your Stake',
  });

  SpreadsheetApp.getUi().alert(
    fillTemplate(s.testReminderSent, { email })
  );
}

/** Opens the approve-swaps flow for all pending swap requests. */
function menuApproveSwaps() {
  approvePendingSwaps();
}

// ---------------------------------------------------------------------------
// Installable trigger handlers
// ---------------------------------------------------------------------------

/**
 * Daily trigger entry point (run around 6 am stake time).
 * Sends speaker reminders for assignments coming up in Settings.Reminder Days.
 */
function runDailyJobs() {
  sendPendingReminders();
}

/**
 * Weekly trigger entry point (run Monday mornings).
 * Emails the exec sec a 60-day digest.
 */
function runWeeklyDigest() {
  sendDigest();
}

// ---------------------------------------------------------------------------
// Schema validation helper — run once after initial setup
// ---------------------------------------------------------------------------

/**
 * Validates all tab headers and logs warnings for any missing columns.
 * Useful to run after cloning the template sheet and before first rollover.
 */
function validateSetup() {
  validateSheetHeaders(TAB.SCHEDULE,  ['Year','Date','Ward','Speaker','Topic','Status','Notes','Locked']);
  validateSheetHeaders(TAB.SPEAKERS,  ['Name','Email','Phone','Calling','Active','Notes']);
  validateSheetHeaders(TAB.WARDS,     ['Name','Building','Meeting Time','Bishop Name','Bishop Email','Sort Order']);
  validateSheetHeaders(TAB.TOPICS,    ['Title','Source','Scripture Refs','Notes','Last Used Date']);
  validateSheetHeaders(TAB.SETTINGS,  ['Key','Value']);
  validateSheetHeaders(TAB.LOG,       ['Timestamp','User','Action','Field','Old Value','New Value']);
  Logger.log('Setup validation complete. Check warnings above if any columns were flagged.');
}
