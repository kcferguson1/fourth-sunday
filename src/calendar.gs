/**
 * @file calendar.gs
 * Optional Google Calendar integration.
 *
 * Only active when Settings.Calendar Sync = TRUE.
 * When a topic is assigned to a schedule row, creates (or updates) a
 * calendar event and invites the speaker.
 */

/**
 * Creates or updates a Google Calendar event for the given schedule row.
 * Does nothing if Calendar Sync is not TRUE in Settings.
 *
 * @param {Object} scheduleRow   A single row from the Schedule tab
 */
function syncCalendarEvent(scheduleRow) {
  if (!_calendarEnabled()) return;

  const tz        = getSettingValue('Time Zone') || 'UTC';
  const speakers  = readActiveSpeakers();
  const wards     = readWards();
  const topics    = readTopics();

  const speakerMap = _indexBy(speakers, 'Name');
  const wardMap    = _indexBy(wards,    'Name');
  const topicMap   = _indexBy(topics,   'Title');

  const speakerName = String(scheduleRow['Speaker'] || '').trim();
  const wardName    = String(scheduleRow['Ward']    || '').trim();
  const topicTitle  = String(scheduleRow['Topic']   || '').trim();

  if (!speakerName || !wardName) return;

  const speakerRecord = speakerMap[speakerName] || {};
  const wardRecord    = wardMap[wardName]        || {};
  const topicRecord   = topicMap[topicTitle]     || {};

  const dateStr = normalizeDate(scheduleRow['Date']);
  if (!dateStr) return;

  // Parse meeting time — expects "H:MM AM/PM" or "HH:MM"
  const meetingTime  = String(wardRecord['Meeting Time'] || '').trim();
  const eventStart   = _parseMeetingDateTime(dateStr, meetingTime, tz);
  if (!eventStart) {
    Logger.log(`[WARN] Cannot parse meeting time "${meetingTime}" for ${wardName} on ${dateStr}`);
    return;
  }

  const eventEnd = new Date(eventStart.getTime() + 70 * 60 * 1000); // 70-minute block

  const s     = getStrings();
  const title = fillTemplate(s.calendarEventTitle, { speakerName, wardName });
  const desc  = fillTemplate(s.calendarEventDescription, {
    topicTitle:    topicTitle || '(topic not yet assigned)',
    scriptureRefs: topicRecord['Scripture Refs'] || '',
    bishopName:    wardRecord['Bishop Name'] || '',
  });

  const calendar = CalendarApp.getDefaultCalendar();
  const existingEventId = scheduleRow['Calendar Event ID'];

  let event;
  if (existingEventId) {
    try {
      event = CalendarApp.getEventById(existingEventId);
    } catch (e) {
      event = null;
    }
  }

  if (event) {
    event.setTitle(title);
    event.setDescription(desc);
    event.setTime(eventStart, eventEnd);
  } else {
    event = calendar.createEvent(title, eventStart, eventEnd, { description: desc });
    // Record the event ID back to the sheet so we can update it later
    updateScheduleRow(scheduleRow['Date'], wardName, { 'Calendar Event ID': event.getId() });
  }

  // Invite the speaker if they have an email
  const speakerEmail = speakerRecord['Email'];
  if (speakerEmail) {
    const guests = event.getGuestList().map(g => g.getEmail());
    if (!guests.includes(speakerEmail)) {
      event.addGuest(speakerEmail);
    }
  }

  logAction('CALENDAR_SYNC', `${dateStr}:${wardName}`, '', event.getId());
}

/**
 * Removes the calendar event associated with a schedule row, if any.
 *
 * @param {Object} scheduleRow
 */
function removeCalendarEvent(scheduleRow) {
  if (!_calendarEnabled()) return;
  const eventId = scheduleRow['Calendar Event ID'];
  if (!eventId) return;
  try {
    const event = CalendarApp.getEventById(eventId);
    if (event) event.deleteEvent();
    logAction('CALENDAR_REMOVE', `${normalizeDate(scheduleRow['Date'])}:${scheduleRow['Ward']}`, eventId, '');
  } catch (e) {
    Logger.log(`[WARN] Could not remove calendar event ${eventId}: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/** @returns {boolean} */
function _calendarEnabled() {
  return String(getSettingValue('Calendar Sync') || '').trim().toUpperCase() === 'TRUE';
}

/**
 * Parses a "YYYY-MM-DD" date and "H:MM AM/PM" time into a Date object in
 * the stake's time zone.
 *
 * @param {string} dateStr   "YYYY-MM-DD"
 * @param {string} timeStr   "9:00 AM" or "14:00"
 * @param {string} tz        IANA tz string
 * @returns {Date|null}
 */
function _parseMeetingDateTime(dateStr, timeStr, tz) {
  if (!timeStr) return null;
  // Normalize: "9:00 AM" → "09:00", "2:00 PM" → "14:00"
  let normalized = timeStr.trim().toUpperCase();
  const ampm = normalized.match(/([AP])M$/);
  normalized = normalized.replace(/\s*[AP]M$/, '');
  const [hourStr, minuteStr] = normalized.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr || '0', 10);
  if (isNaN(hour)) return null;
  if (ampm) {
    if (ampm[1] === 'P' && hour !== 12) hour += 12;
    if (ampm[1] === 'A' && hour === 12) hour = 0;
  }
  // Build ISO string and parse in the target tz
  const iso = `${dateStr}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`;
  // Apps Script: use Utilities.parseDate for tz-aware parsing
  try {
    return Utilities.parseDate(iso, tz, "yyyy-MM-dd'T'HH:mm:ss");
  } catch (e) {
    return null;
  }
}
