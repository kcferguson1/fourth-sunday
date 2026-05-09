/**
 * @file strings.gs
 * All user-facing strings, keyed by locale. Add a new locale by copying the
 * "en" block and translating values — never translate keys.
 *
 * Usage:
 *   const s = getStrings();
 *   s.reminderSubject  // → "Your speaking assignment — {wardName}"
 */

/** @returns {Object} String map for the active locale (falls back to "en") */
function getStrings() {
  const lang = getSettingValue('Default Language') || 'en';
  return STRINGS[lang] || STRINGS['en'];
}

// ---------------------------------------------------------------------------
// String catalog
// ---------------------------------------------------------------------------

const STRINGS = {

  en: {
    // ---- email: speaker reminder ----
    reminderSubject:
      'Your speaking assignment on {date} — {wardName}',
    reminderBody:
      'Hello {speakerName},\n\n' +
      'This is a reminder that you have a speaking assignment coming up.\n\n' +
      'Date: {date}\n' +
      'Ward: {wardName}\n' +
      'Sacrament meeting time: {meetingTime}\n' +
      'Bishop: {bishopName}\n\n' +
      'Topic: {topicTitle}\n' +
      '{scriptureRefs}' +
      '\nPlease contact the bishop if you have any questions about the ward.\n\n' +
      'If you need to request a swap, use this form: {swapFormUrl}\n\n' +
      '{stakeName} Stake',

    // ---- email: weekly exec sec digest ----
    digestSubject:
      'Fourth Sunday digest — {startDate} through {endDate}',
    digestBody:
      '{stakeName} Fourth Sunday — assignments for the next 60 days\n\n' +
      '{assignmentList}' +
      '\n--- Flags ---\n' +
      '{flagList}' +
      '\nGenerated {generatedAt}',
    digestAssignmentLine:
      '{date}  {wardName:<20}  {speakerName:<25}  {status}',
    digestFlagMissingTopic:
      'MISSING TOPIC  {date}  {wardName}',
    digestFlagMissingSpeaker:
      'MISSING SPEAKER  {date}  {wardName}',
    digestFlagDoubleAssignment:
      'DOUBLE DUTY  {speakerName}  {date}  ({wards})',
    digestNoFlags:
      'No flags — all good.',

    // ---- email: swap notification to exec sec ----
    swapRequestSubject:
      'Swap request: {requesterName} on {date}',
    swapRequestBody:
      '{requesterName} has requested a swap for their {date} assignment at {wardName}.\n\n' +
      'Requested swap with: {swapWithName}\n' +
      'Reason: {reason}\n\n' +
      'To approve, open the sheet and use Fourth Sunday → Approve Pending Swaps.',

    // ---- email: swap confirmation to speakers ----
    swapConfirmedSubjectRequester:
      'Your assignment swap has been approved',
    swapConfirmedBodyRequester:
      'Hello {requesterName},\n\n' +
      'Your swap request was approved. You are no longer assigned on {originalDate} at {originalWard}.\n\n' +
      'Your new assignment: {newDate} at {newWard}.\n\n' +
      '{stakeName} Stake',
    swapConfirmedSubjectCounterpart:
      'You have a new speaking assignment — {date}',
    swapConfirmedBodyCounterpart:
      'Hello {counterpartName},\n\n' +
      'A swap has been approved that affects your schedule.\n\n' +
      'Your new assignment: {newDate} at {newWard}.\n' +
      'Topic: {topicTitle}\n\n' +
      '{stakeName} Stake',

    // ---- calendar events ----
      calendarEventTitle:
      'Stake Council — {speakerName} at {wardName}',
    calendarEventDescription:
      'Topic: {topicTitle}\n{scriptureRefs}\nBishop: {bishopName}',

    // ---- custom menu items ----
    menuName:              'Fourth Sunday',
    menuInstall:           'First-time Setup',
    menuSetUpSwapForm:     'Set Up Swap Form',
    menuRunRollover:       'Run Rollover',
    menuLockConfirmed:     'Lock Confirmed Rows',
    menuSendDigest:        'Send Digest Now',
    menuTestReminder:      'Send Test Reminder Email',
    menuApproveSwaps:      'Approve Pending Swaps',

    // ---- UI alerts ----
    installComplete:
      'Setup complete.\n\n' +
      'Tabs created, topics loaded, and automatic reminders scheduled.\n\n' +
      'Next: fill in the Settings, Wards, and Speakers tabs, then click Fourth Sunday → Run Rollover.',
    swapFormComplete:
      'Swap form created and linked to this sheet.\n\n' +
      'Form URL (share this with speakers):\n{formUrl}\n\n' +
      'The URL has been saved to Settings → Swap Form URL automatically.',
    lockConfirmedComplete:
      'Locked {count} confirmed rows.',
    rolloverComplete:
      'Rollover complete. Review the Schedule tab and lock rows you want to keep.',
    rolloverNoData:
      'Cannot run rollover — Speakers or Wards tab is empty.',
    digestSent:
      'Digest sent to {email}.',
    testReminderSent:
      'Test reminder sent to {email}.',
    noSwapsPending:
      'No pending swap requests.',
    swapApproved:
      'Swap approved. Both speakers have been notified.',

    // ---- schedule status values ----
    statusPending:        'pending',
    statusTopicAssigned:  'topic_assigned',
    statusReminderSent:   'reminder_sent',
    statusComplete:       'complete',
    statusSkipped:        'skipped',

    // ---- speakers tab privacy banner ----
    privacyBanner:
      '⚠ Delete sample data before entering real names or email addresses.',
  },

  // ---- Spanish placeholder ----
  // Translate each value below. Do not change the keys.
  // See docs/translation-guide.md for instructions.
  es: {
    reminderSubject:          'Su asignación para hablar el {date} — {wardName}',
    reminderBody:             'TODO: translate reminderBody',
    digestSubject:            'TODO: translate digestSubject',
    digestBody:               'TODO: translate digestBody',
    digestAssignmentLine:     '{date}  {wardName:<20}  {speakerName:<25}  {status}',
    digestFlagMissingTopic:   'TODO: translate digestFlagMissingTopic',
    digestFlagMissingSpeaker: 'TODO: translate digestFlagMissingSpeaker',
    digestFlagDoubleAssignment: 'TODO: translate digestFlagDoubleAssignment',
    digestNoFlags:            'TODO: translate digestNoFlags',
    swapRequestSubject:       'TODO: translate swapRequestSubject',
    swapRequestBody:          'TODO: translate swapRequestBody',
    swapConfirmedSubjectRequester:   'TODO: translate',
    swapConfirmedBodyRequester:      'TODO: translate',
    swapConfirmedSubjectCounterpart: 'TODO: translate',
    swapConfirmedBodyCounterpart:    'TODO: translate',
    calendarEventTitle:       'TODO: translate calendarEventTitle',
    calendarEventDescription: 'TODO: translate calendarEventDescription',
    menuName:                 'Cuarto Domingo',
    menuInstall:              'Configuración Inicial',
    menuSetUpSwapForm:        'Configurar Formulario de Cambio',
    menuRunRollover:          'Generar Rotación',
    menuLockConfirmed:        'Bloquear Filas Confirmadas',
    installComplete:          'TODO: translate installComplete',
    swapFormComplete:         'TODO: translate swapFormComplete',
    lockConfirmedComplete:    'TODO: translate lockConfirmedComplete',
    menuSendDigest:           'Enviar Resumen Ahora',
    menuTestReminder:         'Enviar Correo de Prueba',
    menuApproveSwaps:         'Aprobar Cambios Pendientes',
    rolloverComplete:         'TODO: translate rolloverComplete',
    rolloverNoData:           'TODO: translate rolloverNoData',
    digestSent:               'TODO: translate digestSent',
    testReminderSent:         'TODO: translate testReminderSent',
    noSwapsPending:           'TODO: translate noSwapsPending',
    swapApproved:             'TODO: translate swapApproved',
    statusPending:            'pendiente',
    statusTopicAssigned:      'tema_asignado',
    statusReminderSent:       'recordatorio_enviado',
    statusComplete:           'completado',
    statusSkipped:            'omitido',
    privacyBanner:            '⚠ Elimine los datos de muestra antes de ingresar nombres o correos reales.',
  },
};

/**
 * Replaces {key} placeholders in a template string with values from a map.
 *
 * @param {string} template
 * @param {Object} vars  key → value pairs
 * @returns {string}
 */
function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] !== undefined ? vars[key] : match
  );
}
