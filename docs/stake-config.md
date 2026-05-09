# Stake Configuration Reference

All configuration lives in the **Settings** tab of the Google Sheet. Each row has a `Key` and a `Value` column. Do not change the key names — the script reads them by exact string match.

---

## Required settings

### Stake Name
The name of your stake, used in email subject lines and signatures.

Example: `Mountain View Stake`

### Exec Sec Name
Your name (or whoever manages the sheet). Used in digest emails.

### Exec Sec Email
The email address that receives the weekly digest and swap request notifications.

### Reminder Days
How many days before an assignment to send the speaker their reminder email.

Default: `21`

Must be a positive integer. If you change this mid-year, reminders already sent won't be re-sent.

### Time Zone
An IANA time zone string for the stake. Used to calculate "today" for the daily trigger and to format dates in emails.

Examples:
- `America/Salt_Lake_City`
- `America/Denver`
- `America/Los_Angeles`
- `America/New_York`
- `Pacific/Auckland`
- `Australia/Sydney`

Full list: [IANA tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## Optional settings

### Calendar Sync
Whether to create Google Calendar events when topics are assigned to schedule rows.

Values: `TRUE` or `FALSE` (default `FALSE`)

When enabled, the script creates a 70-minute calendar event on the exec sec's default calendar and invites the speaker. The event title, description, and guest list are updated if the row is modified later.

Calendar events are not created retroactively — only rows where the topic is set after Calendar Sync is turned on will get events.

### Default Language
The locale code for all user-facing strings (email text, menu labels, alerts).

Values: `en` (default), `es` (Spanish strings are placeholder in v1 — see `docs/translation-guide.md`)

### Rollover Algorithm
Which algorithm to use when generating the annual schedule.

Values: `latin_square` (the only option in v1)

### Swap Form URL
The shareable URL of your Google Form for swap requests. Included in speaker reminder emails so speakers know where to go if they need a change.

Leave blank if you have not set up the swap form yet.

---

## Adding custom settings

The Settings tab is a simple key-value store. You can add rows for any custom values you want to reference in a localized fork of the script. The `getSettingValue(key)` function will return `undefined` for keys not in the catalog — handle that in your code.

---

## Settings the script reads but you don't set

These are populated automatically by the script and don't need manual entries:

- **Calendar Event ID** (per-row in the Schedule tab, not in Settings)
- All Log tab values

---

## Example Settings tab layout

| Key | Value |
|-----|-------|
| Stake Name | Mountain View Stake |
| Exec Sec Name | Kelly Ferguson |
| Exec Sec Email | exec.sec@example.com |
| Reminder Days | 21 |
| Time Zone | America/Denver |
| Calendar Sync | FALSE |
| Default Language | en |
| Rollover Algorithm | latin_square |
| Swap Form URL | https://forms.gle/... |
