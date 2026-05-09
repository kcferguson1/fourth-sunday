# Fourth Sunday

A Google Sheets + Apps Script template for LDS stake executive secretaries managing 4th Sunday stake council speaking assignments.

Clone the template sheet, paste in your stake's data, and the tool handles speaker notifications, schedule rotation, and weekly digests — at zero cost.

---

## What it does

Every month on the 4th Sunday, stake council members speak at ward sacrament meetings. Tracking who goes where, assigning topics, and sending reminders is manual, error-prone work. This template automates the routine parts:

- **Rotation** — generates a full year's schedule from your speaker and ward lists using a Latin-square algorithm that distributes assignments evenly
- **Reminders** — emails each speaker their topic, ward meeting time, and bishop's name 21 days before their date (configurable)
- **Weekly digest** — emails the exec sec every Monday with the next 60 days of assignments, flagging missing topics and double-duty conflicts
- **Swap requests** — a linked Google Form lets speakers request swaps; the exec sec approves from a menu and both speakers are notified
- **Calendar invites** — optional; when enabled, creates a Google Calendar event for each confirmed assignment

Everything lives in Google Workspace tools you already have. No servers, no subscriptions, no accounts to create.

---

## Five-minute setup

**What you need:** a Google account with Google Sheets and Gmail access.

### Step 1 — Copy the template sheet

1. Open the [template sheet](https://docs.google.com/spreadsheets/d/TEMPLATE_ID_HERE) (link updated after release)
2. **File → Make a copy** — save it to your Drive
3. Name it something like `Stake Speaking Schedule 2026`

### Step 2 — Add your data

The sheet has six tabs. Fill them in order:

| Tab | What to add |
|-----|-------------|
| **Settings** | Stake name, your name, your email, time zone |
| **Speakers** | One row per stake council member: name, email, calling |
| **Wards** | One row per ward: name, building, meeting time, bishop name and email |
| **Topics** | Pre-populated with 2026 Come Follow Me themes — add or edit as needed |
| **Schedule** | Leave blank — the rollover menu item fills this |
| **Log** | Leave blank — auto-populated by the script |

Delete the sample rows before adding real data. The Speakers tab has a privacy banner reminding you to do this.

### Step 3 — Authorize the script

1. In the sheet: **Extensions → Apps Script**
2. Click **Run** on any function — Google will ask you to authorize
3. Grant the requested permissions (Gmail send, Calendar read/write if you enable that setting)
4. Close the Apps Script editor and return to the sheet

### Step 4 — Generate the schedule

1. In the sheet menu: **Fourth Sunday → Run Rollover**
2. The script fills the Schedule tab with proposed assignments for the current year
3. Review the assignments — the exec sec digest will flag any conflicts
4. When you're happy, manually lock rows you want to protect from future rollovers (set the `Locked` column to `TRUE`)

### Step 5 — Enable daily reminders

1. In the Apps Script editor: **Triggers (clock icon) → Add Trigger**
2. Function: `runDailyJobs`, event source: time-driven, type: day timer, time: 6–7am
3. Add a second trigger: function `runWeeklyDigest`, type: week timer, day: Monday, time: 7–8am

That's it. The script runs automatically from here.

---

## Configuration

Edit the **Settings** tab to change behavior without touching code.

| Setting | Default | Notes |
|---------|---------|-------|
| Stake Name | — | Appears in email subject lines |
| Exec Sec Name | — | Used in digest emails |
| Exec Sec Email | — | Digest destination |
| Reminder Days | 21 | Days before assignment to send reminder |
| Time Zone | America/Denver | Any IANA tz string |
| Calendar Sync | FALSE | Set to TRUE to enable Google Calendar invites |
| Default Language | en | Only `en` ships in v1; Spanish structure is there |
| Rollover Algorithm | latin_square | Only algorithm in v1 |

---

## How rotation works

The Latin-square algorithm spreads speakers across wards so each speaker visits each ward roughly once before cycling. Given N speakers and M wards sorted by meeting time, the assignment for a given month is:

```
speaker = speakers[(month_index + ward_index) % N]
```

This means in month 0, speaker 0 goes to ward 0, speaker 1 to ward 1, and so on. In month 1, the whole list shifts by one. No speaker gets the same ward two months in a row.

Ward Conferences, Missionary Homecomings, Fast Sundays, and holidays are marked in an Overrides tab. The algorithm skips those cells and the exec sec can lock any cell to prevent it from being changed on the next rollover.

Full details: [docs/rotation-rules.md](docs/rotation-rules.md)

---

## Repo structure

```
src/          Apps Script source files
template/     Example sheet schema and setup notes
examples/     Sample stake-config.json
docs/         Setup guide, config reference, rotation rules, translation guide
adr/          Architecture decision records
```

---

## Contributing

Bug reports and pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Before contributing code, read the ADRs — they explain why several non-obvious choices were made.

---

## License

MIT. See [LICENSE](LICENSE).
