# Setup Guide

This guide walks through a complete installation from a fresh Google account to a running schedule. Budget 30 minutes the first time; repeat setups take about 10.

---

## Prerequisites

- A Google account (personal or GSuite)
- Access to Gmail and Google Sheets in that account
- Basic familiarity with Google Sheets (you know how to type in cells)

If you want calendar invites for speakers, you also need Google Calendar — but that's optional and off by default.

---

## Step 1 — Copy the template sheet

1. Open the public template link: `https://docs.google.com/spreadsheets/d/TEMPLATE_ID_HERE`
   *(This link will be live after the v1 release. Until then, see `template/README.md` for how to build the sheet manually from `stake-schedule.example.csv`.)*
2. Go to **File → Make a copy**
3. Name it something like `[Stake Name] Speaking Schedule 2026`
4. Save it to your Google Drive

---

## Step 2 — Fill in the Settings tab

Open the **Settings** tab and fill in the `Value` column for each key:

| Key | Example value | Required? |
|-----|--------------|-----------|
| Stake Name | Mountain View Stake | Yes |
| Exec Sec Name | Your Name | Yes |
| Exec Sec Email | your@email.com | Yes |
| Reminder Days | 21 | Yes (default 21) |
| Time Zone | America/Denver | Yes |
| Calendar Sync | FALSE | No (enable later if wanted) |
| Default Language | en | No (default en) |
| Rollover Algorithm | latin_square | No (default latin_square) |
| Swap Form URL | (add after Step 5) | No |

For `Time Zone`, use an [IANA time zone string](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) — e.g., `America/Salt_Lake_City`, `America/Phoenix`, `Pacific/Auckland`.

---

## Step 3 — Add your wards

Go to the **Wards** tab. Delete the sample rows first, then add one row per ward.

Required columns:
- **Name** — the ward's name exactly as you want it to appear in emails
- **Meeting Time** — format: `9:00 AM`, `10:30 AM`, `1:00 PM`
- **Sort Order** — integer (1, 2, 3…) controlling column order in reports

Recommended columns:
- **Building** — building name, useful for exec sec reference
- **Bishop Name** — included in speaker reminder emails
- **Bishop Email** — used by the calendar invite feature if enabled

Sort Order determines how wards are listed in digests and how the rotation algorithm orders them. Wards in the same building that meet at different times should have adjacent sort numbers to make double-assignment checking easier.

---

## Step 4 — Add your speakers

Go to the **Speakers** tab. The privacy banner at the top of the tab is a reminder to delete the sample data — do that first.

Required columns:
- **Name** — full name as it will appear in the schedule
- **Email** — where reminders are sent
- **Active** — `TRUE` (included in rotation) or `FALSE` (on leave, new calling, etc.)

Optional:
- **Calling** — e.g., "2nd Counselor in Stake Presidency"
- **Phone** — not used by the script, but useful for exec sec reference
- **Notes** — any constraints you want to remember (e.g., "lives in 1st Ward, avoid that ward")

Speakers are sorted alphabetically when building the rotation list. If you want to control rotation order, prefix names with a number or adjust the list after rollover.

---

## Step 5 — Add your topics (optional)

The **Topics** tab comes pre-populated with 2026 Come Follow Me weekly themes and recent General Conference talk titles. You can use these as-is, edit them, or delete and start fresh.

When you assign a topic to a schedule row (type the topic title in the `Topic` column), the reminder email will include the scripture references from the Topics tab automatically.

You don't need to pre-assign topics before running the rollover — the rollover leaves the Topic column blank and flags missing topics in the weekly digest.

---

## Step 6 — Run the rollover

1. In the sheet's menu bar, look for the **Fourth Sunday** menu (it appears after the script is authorized — see Step 7 if you haven't done that yet)
2. Click **Fourth Sunday → Run Rollover**
3. The script fills the Schedule tab with the proposed year's assignments
4. Review the output. The exec sec digest will flag any double-duty conflicts.
5. To protect a row from future rollovers, set its `Locked` column to `TRUE`

---

## Step 7 — Authorize the script

The first time you access the **Fourth Sunday** menu, Google will ask you to authorize the script.

1. Click through the authorization dialog
2. You may see a "This app isn't verified" warning — click **Advanced → Go to [script name] (unsafe)**. This is expected for private Apps Scripts that haven't been published to the Google Marketplace.
3. Grant the requested permissions:
   - **Gmail**: to send reminder and digest emails
   - **Spreadsheet**: to read and write the sheet
   - **Calendar**: only if you enable Calendar Sync

You only need to do this once. If the sheet is copied to another account, that account's user will need to authorize separately.

---

## Step 8 — Set up the swap request form

1. Go to **Extensions → Apps Script** in your sheet
2. In the left panel, find the file `swap.gs` and read the comment at the top — it lists the exact form field names needed
3. Create a new Google Form with those fields
4. In the Form editor: **Responses → Link to spreadsheet** → choose your schedule sheet, tab name "Swap Requests"
5. Back in Apps Script, add an installable trigger:
   - Function: `onSwapFormSubmit`
   - Event source: From spreadsheet
   - Event type: On form submit
6. Copy the form's shareable link into Settings → `Swap Form URL`

---

## Step 9 — Set up automated triggers

In Apps Script (**Extensions → Apps Script**):

1. Click the clock icon (Triggers) in the left sidebar
2. Add a trigger:
   - Function: `runDailyJobs`
   - Deployment: Head
   - Event source: Time-driven
   - Type: Day timer
   - Time: 6am–7am (your local time)
3. Add another trigger:
   - Function: `runWeeklyDigest`
   - Deployment: Head
   - Event source: Time-driven
   - Type: Week timer
   - Day: Monday
   - Time: 7am–8am

That's it. The script runs on its own from here.

---

## Verifying everything works

Send a test reminder email before real reminders go out:

1. **Fourth Sunday → Send Test Reminder Email**
2. Check your inbox — the exec sec email should receive a sample reminder

Send a test digest:

1. **Fourth Sunday → Send Digest Now**
2. Check your inbox — you should see the 60-day summary

Run setup validation:

1. **Extensions → Apps Script**
2. Select `validateSetup` from the function dropdown and click Run
3. Check the execution log for any missing-column warnings

---

## Troubleshooting

**The Fourth Sunday menu doesn't appear:**
Open Apps Script (Extensions → Apps Script) and run `onOpen` manually. The menu should appear. If you don't see Apps Script in the Extensions menu, the sheet was not copied correctly — try again from the template link.

**"Tab 'X' not found" error:**
The sheet is missing a required tab. Check that all six tabs (Schedule, Speakers, Wards, Topics, Settings, Log) exist with those exact names.

**Reminder emails aren't being sent:**
- Check that `Exec Sec Email` is set in Settings
- Check that the speaker has a value in the Email column of the Speakers tab
- Check that the schedule row has Status = `topic_assigned` (reminders only go to rows in that state)
- Check the Apps Script execution log for errors

**The rollover produced no output:**
The Speakers or Wards tab is empty, or the script couldn't find a Fourth Sunday for the year. Check both tabs have at least one row below the header.
