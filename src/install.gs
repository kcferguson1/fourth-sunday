/**
 * @file install.gs
 * First-time setup: creates required tabs, seeds Topics, and installs
 * time-based triggers — all from a single menu click.
 *
 * Safe to re-run at any time:
 *   - Existing tabs are never touched or overwritten
 *   - Topics are only seeded if the tab is empty
 *   - Triggers are deleted and re-created (no duplicates)
 */

/**
 * Entry point called from the "First-time Setup" menu item.
 * Orchestrates tab creation, topic seeding, trigger installation,
 * and schema validation in one pass.
 */
function runInstall() {
  installTabs();
  seedTopics();       // defined in topics-seed.gs; skips if Topics already has data
  installTriggers();
  validateSetup();    // defined in Code.gs; logs any header warnings
  SpreadsheetApp.getUi().alert(getStrings().installComplete);
}

/**
 * Creates any missing required tabs with their header rows.
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

  // Seed the Settings tab with default keys if it was just created empty
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
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

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

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

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
