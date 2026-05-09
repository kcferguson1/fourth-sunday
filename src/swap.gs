/**
 * @file swap.gs
 * Google Form trigger and exec sec approval flow for speaker swap requests.
 *
 * Form setup: create a Google Form with these fields (exact names matter):
 *   "Your name"         — text, required
 *   "Your assignment date" — date, required
 *   "Swap with"         — text (speaker name), required
 *   "Reason"            — paragraph text, optional
 *
 * Link the form to the sheet via Form → Responses → Link to spreadsheet,
 * choosing the "Swap Requests" tab. Then add an installable trigger:
 *   function: onSwapFormSubmit, event: From spreadsheet, On form submit
 */

const SWAP_TAB = 'Swap Requests';

// Swap request status values
const SWAP_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  DENIED:   'denied',
};

/**
 * Installable trigger: fires when the Swap Requests form is submitted.
 * Logs the request and emails the exec sec for approval.
 *
 * @param {GoogleAppsScript.Events.SheetsOnFormSubmit} e
 */
function onSwapFormSubmit(e) {
  const responses = e.namedValues;
  const requesterName = _firstValue(responses['Your name']);
  const dateStr       = _firstValue(responses['Your assignment date']);
  const swapWithName  = _firstValue(responses['Swap with']);
  const reason        = _firstValue(responses['Reason']) || '';

  if (!requesterName || !dateStr || !swapWithName) {
    Logger.log('[WARN] Swap form submission missing required fields — skipped');
    return;
  }

  // Find the requester's assignment
  const schedule = readSchedule();
  const requesterRow = schedule.find(r =>
    String(r['Speaker']).trim() === requesterName &&
    normalizeDate(r['Date']) === normalizeDate(dateStr) &&
    String(r['Status']).trim() !== 'skipped'
  );

  if (!requesterRow) {
    Logger.log(`[WARN] No matching assignment found for ${requesterName} on ${dateStr}`);
    return;
  }

  const wardName = String(requesterRow['Ward']).trim();

  // Append to Swap Requests tab
  _ensureSwapTab();
  appendRow(SWAP_TAB, [
    new Date(),
    requesterName,
    dateStr,
    wardName,
    swapWithName,
    reason,
    SWAP_STATUS.PENDING,
  ]);

  // Notify exec sec
  const settings  = getAllSettings();
  const execEmail = settings['Exec Sec Email'];
  if (!execEmail) {
    Logger.log('[WARN] Exec Sec Email not set — swap notification skipped');
    return;
  }

  const s = getStrings();
  const subject = fillTemplate(s.swapRequestSubject, {
    requesterName,
    date: dateStr,
  });
  const body = fillTemplate(s.swapRequestBody, {
    requesterName,
    date:         dateStr,
    wardName,
    swapWithName,
    reason:       reason || '(none given)',
  });

  GmailApp.sendEmail(execEmail, subject, body);
  logAction('SWAP_REQUESTED', `${normalizeDate(dateStr)}:${wardName}`, requesterName, swapWithName);
}

/**
 * Called from the custom menu. Finds all pending swap requests, shows a
 * confirmation dialog, and approves them one by one.
 *
 * For each approval:
 *   - Swaps the Speaker values on both schedule rows
 *   - Marks both rows pending (topic re-assignment may be needed)
 *   - Emails both speakers confirmation
 *   - Updates the swap request row to "approved"
 */
function approvePendingSwaps() {
  const ui = SpreadsheetApp.getUi();
  const s  = getStrings();

  _ensureSwapTab();
  const swapSheet = getSheet(SWAP_TAB);
  const data      = swapSheet.getDataRange().getValues();
  if (data.length < 2) {
    ui.alert(s.noSwapsPending);
    return;
  }

  const headers    = data[0].map(h => String(h).trim());
  const statusCol  = headers.indexOf('Status');
  const pendingRows = [];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][statusCol]).trim() === SWAP_STATUS.PENDING) {
      pendingRows.push({ rowIndex: i + 1, data: data[i], headers });
    }
  }

  if (pendingRows.length === 0) {
    ui.alert(s.noSwapsPending);
    return;
  }

  const settings  = getAllSettings();
  const speakers  = readActiveSpeakers();
  const wards     = readWards();
  const speakerMap = _indexBy(speakers, 'Name');
  const wardMap    = _indexBy(wards,    'Name');
  const schedule  = readSchedule();

  pendingRows.forEach(swap => {
    const requesterName = String(swap.data[swap.headers.indexOf('Requester Name')]).trim();
    const originalDate  = normalizeDate(swap.data[swap.headers.indexOf('Date')]);
    const originalWard  = String(swap.data[swap.headers.indexOf('Ward')]).trim();
    const swapWithName  = String(swap.data[swap.headers.indexOf('Swap With')]).trim();

    // Find the counterpart's current assignment (pick the soonest upcoming one)
    const counterpartRow = schedule.find(r =>
      String(r['Speaker']).trim() === swapWithName &&
      normalizeDate(r['Date']) >= originalDate &&
      String(r['Status']).trim() !== 'skipped'
    );

    if (!counterpartRow) {
      Logger.log(`[WARN] Cannot find upcoming assignment for swap target "${swapWithName}" — skipping`);
      return;
    }

    const counterpartDate = normalizeDate(counterpartRow['Date']);
    const counterpartWard = String(counterpartRow['Ward']).trim();

    // Execute the swap
    updateScheduleRow(originalDate, originalWard, { Speaker: swapWithName, Status: 'pending' });
    updateScheduleRow(counterpartDate, counterpartWard, { Speaker: requesterName, Status: 'pending' });

    logAction('SWAP_APPROVED', `${originalDate}:${originalWard}`, requesterName, swapWithName);

    // Notify both speakers
    const requesterRecord    = speakerMap[requesterName]    || {};
    const counterpartRecord  = speakerMap[swapWithName]     || {};
    const newWardRecord      = wardMap[counterpartWard]     || {};
    const originalWardRecord = wardMap[originalWard]        || {};

    const stakeName = settings['Stake Name'] || 'Your Stake';

    if (requesterRecord['Email']) {
      const subj = s.swapConfirmedSubjectRequester;
      const body = fillTemplate(s.swapConfirmedBodyRequester, {
        requesterName,
        originalDate,
        originalWard,
        newDate:    counterpartDate,
        newWard:    counterpartWard,
        stakeName,
      });
      GmailApp.sendEmail(requesterRecord['Email'], subj, body);
    }

    if (counterpartRecord['Email']) {
      const topicTitle = String(counterpartRow['Topic'] || '').trim();
      const subj = fillTemplate(s.swapConfirmedSubjectCounterpart, { date: originalDate });
      const body = fillTemplate(s.swapConfirmedBodyCounterpart, {
        counterpartName: swapWithName,
        newDate:     originalDate,
        newWard:     originalWard,
        topicTitle:  topicTitle || '(topic not yet assigned)',
        stakeName,
      });
      GmailApp.sendEmail(counterpartRecord['Email'], subj, body);
    }

    // Mark swap request as approved
    swapSheet.getRange(swap.rowIndex, statusCol + 1).setValue(SWAP_STATUS.APPROVED);
  });

  ui.alert(s.swapApproved);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Creates the Swap Requests tab with headers if it doesn't already exist.
 */
function _ensureSwapTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(SWAP_TAB)) {
    const sheet = ss.insertSheet(SWAP_TAB);
    sheet.appendRow([
      'Submitted At', 'Requester Name', 'Date', 'Ward',
      'Swap With', 'Reason', 'Status',
    ]);
  }
}

/**
 * Returns the first value from a form response array, trimmed.
 *
 * @param {string[]} arr
 * @returns {string}
 */
function _firstValue(arr) {
  if (!arr || arr.length === 0) return '';
  return String(arr[0]).trim();
}
