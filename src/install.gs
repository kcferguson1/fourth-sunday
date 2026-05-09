/**
 * @file install.gs
 * First-time setup and maintenance utilities callable from the menu.
 *
 * Safe to re-run at any time:
 *   - Existing tabs are never touched or overwritten
 *   - Topics are only seeded if the tab is empty
 *   - Triggers are deleted and re-created (no duplicates)
 */

/**
 * Entry point called from the "First-time Setup" menu item.
 * Orchestrates tab creation, data validation, topic seeding,
 * trigger installation, and schema validation in one pass.
 */
function runInstall() {
  installTabs();
  seedTopics();       // defined in topics-seed.gs; skips if Topics already has data
  installTriggers();
  validateSetup();    // defined in Code.gs; logs any header warnings
  SpreadsheetApp.getUi().alert(getStrings().installComplete);
}

/**
 * Creates any missing required tabs with their header rows and applies
 * data validation (dropdowns and checkboxes) to key columns.
 * Tabs that already exist are left completely untouched.
 */
function installTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const required = [
    { name: TAB.SCHEDULE,  headers: ['Year','Date','Ward','Speaker','Topic','Status','Notes','Locked'] },
    { name: TAB.SPEAKERS,  headers: ['Name','Email','Phone','Calling','Active','Notes'] },
    { name: TAB.WARDS,     headers: ['Name','Building','Meeting Time','Bishop Name','Bishop Email','Sort Order'] },
    { name: TAB.TOPICS,    headers: ['Title','Source','Scripture Refs','Notes','Last Used Date'] },
    { name: TAB.SETTINGS,  headers: ['Key','Value'] },
    { name: TAB.LOG,       headers: ['Timestamp','User','Action','Field','Old Value','New Value'] },
  ];

  required.forEach(({ name, headers }) => {
    if (!ss.getSheetByName(name)) {
      const sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      Logger.log(`Created tab: ${name}`);
    }
  });

  _applyDataValidation(ss);
  _seedSettingsIfEmpty();
}

/**
 * Removes all existing project triggers and installs the two required ones:
 *   - runDailyJobs   → every day at 6am
 *   - runWeeklyDigest → every Monday at 7am
 *
 * Deleting before re-creating prevents duplicates if this is re-run.
 */
function installTriggers() {
  // Only delete time-based triggers to avoid removing an existing onFormSubmit trigger
  ScriptApp.getProjectTriggers()
    .filter(t => t.getEventType() === ScriptApp.EventType.CLOCK)
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('runDailyJobs')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  ScriptApp.newTrigger('runWeeklyDigest')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .create();

  Logger.log('Triggers installed: runDailyJobs (daily 6am), runWeeklyDigest (Monday 7am)');
}

/**
 * Creates the swap request Google Form, links it to this spreadsheet,
 * installs the onFormSubmit trigger, and saves the form URL to Settings.
 *
 * Safe to re-run — prompts for confirmation if a form URL is already set.
 */
function createSwapForm() {
  const ui = SpreadsheetApp.getUi();
  const s  = getStrings();

  const existingUrl = getSettingValue('Swap Form URL');
  if (existingUrl) {
    const response = ui.alert(
      'A swap form URL is already saved in Settings.',
      'Create a new form anyway? The old URL will be replaced.',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }

  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const form = FormApp.create('Fourth Sunday Swap Request');

  form.setDescription(
    'Use this form to request a speaking assignment swap. ' +
    'Your stake executive secretary will be notified and will approve or reach out.'
  );

  form.addTextItem()
    .setTitle('Your name')
    .setRequired(true);

  form.addDateItem()
    .setTitle('Your assignment date')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Swap with')
    .setHelpText('Full name of the speaker you would like to swap with')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Reason')
    .setRequired(false);

  // Link form responses to this spreadsheet
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Install the form-submit trigger (remove any existing one first to avoid duplicates)
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'onSwapFormSubmit')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('onSwapFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  // Save the published form URL to Settings
  const formUrl = form.getPublishedUrl();
  _setSettingValue('Swap Form URL', formUrl);

  logAction('SWAP_FORM_CREATED', 'Swap Form URL', existingUrl || '', formUrl);

  ui.alert(
    fillTemplate(s.swapFormComplete, { formUrl })
  );
}

/**
 * Sets Locked = TRUE on every Schedule row where Status is
 * "reminder_sent" or "complete". Shows a count of rows locked.
 */
function lockConfirmedRows() {
  const ui       = SpreadsheetApp.getUi();
  const sheet    = getSheet(TAB.SCHEDULE);
  const data     = sheet.getDataRange().getValues();
  const headers  = data[0].map(h => String(h).trim());
  const statusCol = headers.indexOf('Status');
  const lockedCol = headers.indexOf('Locked');

  if (statusCol < 0 || lockedCol < 0) {
    ui.alert('Schedule tab is missing Status or Locked columns. Run First-time Setup first.');
    return;
  }

  const lockableStatuses = new Set(['reminder_sent', 'complete']);
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][statusCol]).trim();
    const locked = String(data[i][lockedCol]).trim().toUpperCase();
    if (lockableStatuses.has(status) && locked !== 'TRUE') {
      sheet.getRange(i + 1, lockedCol + 1).setValue(true);
      count++;
    }
  }

  ui.alert(fillTemplate(getStrings().lockConfirmedComplete, { count }));
  if (count > 0) logAction('LOCK_CONFIRMED', 'Schedule', '', `${count} rows locked`);
}

/**
 * Replaces all sheet data with sample placeholder data so the sheet can be
 * shared publicly as a template. Prompts for confirmation before wiping data.
 *
 * Run this from the Apps Script editor (not from the menu) to avoid accidents.
 * After running: File → Share → Anyone with the link → Viewer.
 */
function preparePublicTemplate() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Prepare Public Template',
    'This will DELETE all real data in Speakers, Wards, Schedule, and Log, ' +
    'and replace it with sample placeholder data.\n\n' +
    'Make sure you are running this on the TEMPLATE COPY, not your working copy.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Clear Schedule and Log (keep header only)
  _clearDataRows(ss, TAB.SCHEDULE);
  _clearDataRows(ss, TAB.LOG);

  // Replace Speakers with placeholders
  const speakersSheet = ss.getSheetByName(TAB.SPEAKERS);
  if (speakersSheet) {
    if (speakersSheet.getLastRow() > 1) {
      speakersSheet.getRange(2, 1, speakersSheet.getLastRow() - 1, speakersSheet.getLastColumn()).clearContent();
    }
    speakersSheet.getRange(2, 1, 4, 6).setValues([
      ['Sample Speaker A', 'speaker.a@example.com', '555-0101', 'High Councilor',              true,  ''],
      ['Sample Speaker B', 'speaker.b@example.com', '555-0102', 'High Councilor',              true,  ''],
      ['Sample Speaker C', 'speaker.c@example.com', '555-0103', 'Second Counselor',            true,  ''],
      ['Sample Speaker D', 'speaker.d@example.com', '555-0104', 'High Councilor (On leave)',   false, ''],
    ]);
  }

  // Replace Wards with placeholders
  const wardsSheet = ss.getSheetByName(TAB.WARDS);
  if (wardsSheet) {
    if (wardsSheet.getLastRow() > 1) {
      wardsSheet.getRange(2, 1, wardsSheet.getLastRow() - 1, wardsSheet.getLastColumn()).clearContent();
    }
    wardsSheet.getRange(2, 1, 3, 6).setValues([
      ['Sample Ward 1', 'North Building', '9:00 AM',  'Bishop Sample One',   'bishop1@example.com', 1],
      ['Sample Ward 2', 'North Building', '11:00 AM', 'Bishop Sample Two',   'bishop2@example.com', 2],
      ['Sample Ward 3', 'South Building', '1:00 PM',  'Bishop Sample Three', 'bishop3@example.com', 3],
    ]);
  }

  // Clear personal Settings values
  const settingsSheet = ss.getSheetByName(TAB.SETTINGS);
  if (settingsSheet) {
    const settingsData = settingsSheet.getDataRange().getValues();
    const keyCol = 0;
    const valCol = 1;
    const clearKeys = new Set(['Stake Name', 'Exec Sec Name', 'Exec Sec Email', 'Swap Form URL']);
    for (let i = 1; i < settingsData.length; i++) {
      if (clearKeys.has(String(settingsData[i][keyCol]).trim())) {
        settingsSheet.getRange(i + 1, valCol + 1).clearContent();
      }
    }
  }

  ui.alert(
    'Template prepared.\n\n' +
    'Next steps:\n' +
    '1. Click Share (top-right)\n' +
    '2. Change to "Anyone with the link"\n' +
    '3. Set permission to Viewer\n' +
    '4. Copy the Sheet ID from the URL (the string between /d/ and /edit)\n' +
    '5. Update TEMPLATE_ID_HERE in README.md and docs/setup-guide.md'
  );
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Applies data validation to key columns across all required tabs.
 * Only sets validation — never touches existing cell values.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function _applyDataValidation(ss) {
  const maxRows = 1000; // apply validation this far down

  // Schedule.Status — dropdown
  const scheduleSheet = ss.getSheetByName(TAB.SCHEDULE);
  if (scheduleSheet) {
    const statusCol   = 6; // column F (1-indexed)
    const lockedCol   = 8; // column H
    const statusRule  = SpreadsheetApp.newDataValidation()
      .requireValueInList(['pending','topic_assigned','reminder_sent','complete','skipped'], true)
      .setAllowInvalid(false)
      .build();
    scheduleSheet.getRange(2, statusCol, maxRows, 1).setDataValidation(statusRule);

    // Schedule.Locked — checkbox
    scheduleSheet.getRange(2, lockedCol, maxRows, 1)
      .insertCheckboxes();
  }

  // Speakers.Active — checkbox
  const speakersSheet = ss.getSheetByName(TAB.SPEAKERS);
  if (speakersSheet) {
    const activeCol = 5; // column E
    speakersSheet.getRange(2, activeCol, maxRows, 1)
      .insertCheckboxes();
  }
}

/**
 * If the Settings tab was just created (only a header row), writes the
 * default setting keys with empty values so the exec sec knows what to fill in.
 */
function _seedSettingsIfEmpty() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB.SETTINGS);
  if (!sheet || sheet.getLastRow() > 1) return;

  const defaults = [
    ['Stake Name',          ''],
    ['Exec Sec Name',       ''],
    ['Exec Sec Email',      ''],
    ['Reminder Days',       '21'],
    ['Time Zone',           'America/Denver'],
    ['Calendar Sync',       'FALSE'],
    ['Default Language',    'en'],
    ['Rollover Algorithm',  'latin_square'],
    ['Swap Form URL',       ''],
  ];

  sheet.getRange(2, 1, defaults.length, 2).setValues(defaults);
  Logger.log('Settings tab seeded with default keys.');
}

/**
 * Writes or updates a single Settings row by key.
 *
 * @param {string} key
 * @param {string} value
 */
function _setSettingValue(key, value) {
  const sheet = getSheet(TAB.SETTINGS);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  // Key not found — append a new row
  sheet.appendRow([key, value]);
}

/**
 * Clears all data rows in a sheet, preserving the header row.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} tabName
 */
function _clearDataRows(ss, tabName) {
  const sheet = ss.getSheetByName(tabName);
  if (!sheet || sheet.getLastRow() <= 1) return;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
}
