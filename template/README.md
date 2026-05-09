# Template Sheet

The easiest path is to copy the published template Google Sheet — see the main README for the link.

If you want to build the sheet manually (e.g., you're setting up a fork and need to create a fresh template for distribution), follow the schema below.

---

## Required tabs

Create these six tabs in order. Tab names must match exactly.

### Schedule

Headers (row 1):
```
Year | Date | Ward | Speaker | Topic | Status | Notes | Locked
```

- **Year** — integer (2026)
- **Date** — date value (Google Sheets date format)
- **Ward** — text, must match a Name in the Wards tab
- **Speaker** — text, must match a Name in the Speakers tab
- **Topic** — text, must match a Title in the Topics tab (or blank)
- **Status** — one of: `pending`, `topic_assigned`, `reminder_sent`, `complete`, `skipped`
- **Notes** — free text (override labels go here for skipped rows)
- **Locked** — `TRUE` or `FALSE`

### Speakers

Headers:
```
Name | Email | Phone | Calling | Active | Notes
```

- **Active** — `TRUE` or `FALSE`

Add a text note in row 1 or a banner row above the header warning to delete sample data.

### Wards

Headers:
```
Name | Building | Meeting Time | Bishop Name | Bishop Email | Sort Order
```

- **Meeting Time** — format `9:00 AM` or `14:00`
- **Sort Order** — integer

### Topics

Headers:
```
Title | Source | Scripture Refs | Notes | Last Used Date
```

### Settings

Headers:
```
Key | Value
```

Add one row per setting key listed in `docs/stake-config.md`. Leave `Value` blank for optional settings you're not using.

### Log

Headers:
```
Timestamp | User | Action | Field | Old Value | New Value
```

Leave all data rows blank — the script appends to this tab automatically.

---

## Optional: Overrides tab

If you want to support Ward Conferences and other overrides, add a seventh tab named **Overrides**:

Headers:
```
Date | Ward | Label
```

This tab is optional. The script handles a missing Overrides tab gracefully.

---

## Column formatting tips

- **Date columns** (Schedule.Date, Overrides.Date): set cell format to `Date` so Google Sheets stores a proper date value
- **Locked column**: set column format to `Checkbox` or `Plain Text` — both work
- **Active column** in Speakers: set to `Checkbox` for a cleaner UI
- **Sort Order** in Wards: set to `Number`

---

## Sample data

See `stake-schedule.example.csv` for a CSV with placeholder data showing the expected shape of each tab's rows. Use it as a reference, not as something to import directly — the CSV format flattens multi-tab sheets.
