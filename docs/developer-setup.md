# Developer Setup

This guide is for the person who owns the repo — the one who creates and maintains the published template sheet that everyone else copies. You do this once. After that, the end-user setup guide handles everything.

Estimated time: 45–60 minutes the first time.

---

## What you're doing

Google Apps Script code can't be distributed as a file download — it has to live inside a Google Sheet. The path is:

1. Push the code from this repo into a new Google Sheet using a tool called clasp
2. Test it with real stake data
3. Make a clean copy with sample-only data and share it publicly
4. Update the README with the public template link

---

## Part A — Push the code into a Google Sheet

### Step 1 — Install Node.js

Node.js is a JavaScript runtime that clasp runs on. You install it once and don't need to think about it again.

1. Go to [nodejs.org](https://nodejs.org)
2. Click the **LTS** button (the left one — "Recommended For Most Users")
3. Run the downloaded installer, click through the defaults
4. When it finishes, open Terminal (Mac: press `Command + Space`, type `Terminal`, press Enter)
5. Type `node --version` and press Enter. You should see something like `v20.x.x`. That means it worked.

### Step 2 — Install clasp

In Terminal, type this and press Enter:

```
npm install -g @google/clasp
```

You'll see a lot of text scroll by. When it stops and you get a new prompt, it's done.

### Step 3 — Log clasp into your Google account

```
clasp login
```

This opens a browser window. Sign in with the Google account that will own the sheet. Click **Allow** when Google asks for permissions. You'll see "Logged in!" in the browser — close that tab and go back to Terminal.

### Step 4 — Create a new Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and click the blank `+` to create a new sheet
2. Name it: `Fourth Sunday — Working Copy`
3. You need to create the six tabs manually. At the bottom of the sheet, click the `+` button to add sheets and name them exactly:
   - `Schedule`
   - `Speakers`
   - `Wards`
   - `Topics`
   - `Settings`
   - `Log`
4. For each tab, add the header row (row 1) from this table:

| Tab | Row 1 headers (type each one in a separate column) |
|-----|---------------------------------------------------|
| Schedule | `Year` · `Date` · `Ward` · `Speaker` · `Topic` · `Status` · `Notes` · `Locked` |
| Speakers | `Name` · `Email` · `Phone` · `Calling` · `Active` · `Notes` |
| Wards | `Name` · `Building` · `Meeting Time` · `Bishop Name` · `Bishop Email` · `Sort Order` |
| Topics | `Title` · `Source` · `Scripture Refs` · `Notes` · `Last Used Date` |
| Settings | `Key` · `Value` |
| Log | `Timestamp` · `User` · `Action` · `Field` · `Old Value` · `New Value` |

Spelling matters — the script reads these headers by exact name.

### Step 5 — Get the Script ID

1. In your new sheet, click **Extensions → Apps Script**
2. A new tab opens with the script editor
3. Look at the URL in your browser. It looks like this:
   ```
   https://script.google.com/home/projects/1BxA...long string.../edit
   ```
4. The Script ID is the long string between `/projects/` and `/edit`. Copy it.

### Step 6 — Connect the repo to the sheet

1. In Terminal, navigate to the `src/` folder in this repo:
   ```
   cd "/Users/YOUR_USERNAME/Desktop/Claude Code/stake_speakers_google/src"
   ```
   (Replace `YOUR_USERNAME` with your Mac username)

2. Create a file called `.clasp.json` in that folder. The easiest way is to type this in Terminal, replacing the placeholder with your Script ID:
   ```
   echo '{"scriptId":"PASTE_YOUR_SCRIPT_ID_HERE","rootDir":"."}' > .clasp.json
   ```

### Step 7 — Push the code

```
clasp push
```

When it asks "Manifest file has been updated. Do you want to push and overwrite?" type `y` and press Enter.

You'll see a list of files being pushed. When it finishes, go back to your Google Sheet and reload the page. You should see a **Fourth Sunday** menu appear in the menu bar.

If the menu doesn't appear after reloading: go to Extensions → Apps Script and click Run on the `onOpen` function manually.

### Step 8 — Validate the setup

1. In Apps Script (Extensions → Apps Script), find the function dropdown at the top (it probably says `myFunction` or the last function you ran)
2. Change it to `validateSetup`
3. Click the **Run** button (triangle/play icon)
4. Click **Execution log** at the bottom to see the output. You should see "Setup validation complete." If you see any warnings about missing columns, go back and double-check the header rows in Step 4.

### Step 9 — Seed the Topics tab

1. In Apps Script, change the function dropdown to `seedTopics`
2. Click Run
3. Go back to your sheet and check the Topics tab — it should have 40+ rows of Come Follow Me and General Conference topics.

---

## Part B — Fill in your stake data and test everything

### Step 10 — Fill in Settings

Go to the Settings tab and add these rows (one per row, Key in column A, Value in column B):

| Key | What to type in Value |
|-----|-----------------------|
| Stake Name | Your stake's full name |
| Exec Sec Name | Your name |
| Exec Sec Email | Your email address |
| Reminder Days | `21` |
| Time Zone | Your time zone — see the table below |
| Calendar Sync | `FALSE` |
| Default Language | `en` |
| Rollover Algorithm | `latin_square` |
| Swap Form URL | (leave blank for now) |

**Finding your time zone value:** Use the exact string from this list:

| If you're in... | Use this value |
|-----------------|----------------|
| Utah / Colorado / Wyoming / Arizona (no DST) | `America/Denver` or `America/Phoenix` |
| California / Nevada / Oregon / Washington | `America/Los_Angeles` |
| Texas / Illinois / Wisconsin / Minnesota | `America/Chicago` |
| New York / Florida / Georgia / Ohio | `America/New_York` |
| Idaho / Montana | `America/Denver` |
| Hawaii | `Pacific/Honolulu` |
| Alberta / BC | `America/Edmonton` or `America/Vancouver` |
| Ontario / Quebec | `America/Toronto` |
| UK | `Europe/London` |
| Australia (east) | `Australia/Sydney` |
| New Zealand | `Pacific/Auckland` |

For anywhere else: go to [this list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), find your country, and use the value in the "TZ identifier" column.

### Step 11 — Add your wards

Go to the Wards tab. Add one row per ward:

- **Name** — the ward's name (e.g., "Mountain View 1st Ward")
- **Building** — building name, for your reference
- **Meeting Time** — type it like `9:00 AM` or `1:30 PM`
- **Bishop Name** — first and last name
- **Bishop Email** — bishop's email address
- **Sort Order** — type `1` for the first ward, `2` for the second, etc.

### Step 12 — Add your speakers

Go to the Speakers tab. Delete the three sample rows first (select them, right-click → Delete rows).

Add one row per stake council member who speaks at 4th Sunday:

- **Name** — full name
- **Email** — the email address where reminders should go
- **Calling** — e.g., "High Councilor" or "Second Counselor in Stake Presidency"
- **Active** — type `TRUE` (included in rotation) or `FALSE` (currently on leave)

### Step 13 — Test the rollover

In the sheet: **Fourth Sunday → Run Rollover**

The Schedule tab should fill in with a full year's worth of assignments. Scroll through and verify the speaker names and ward names look right.

### Step 14 — Send a test digest

**Fourth Sunday → Send Digest Now**

Check your inbox within a minute. You should receive an email with the next 60 days of assignments. If you don't receive it:
- Check your spam folder
- Verify Exec Sec Email is set correctly in Settings
- Open Extensions → Apps Script → **Executions** (left sidebar) to see if there was an error

### Step 15 — Send a test reminder email

**Fourth Sunday → Send Test Reminder Email**

Check your inbox. You should receive a sample reminder email. This shows what speakers will see when their reminder goes out.

---

## Part C — Create the public template

Once everything works with real data, create the clean copy that you'll share publicly.

### Step 16 — Make a copy

In your working sheet: **File → Make a copy**

Name it: `Fourth Sunday — Public Template`

### Step 17 — Clean out the real data

In the public template copy:

1. **Speakers tab**: Delete all your real rows. Add 4 placeholder rows:
   ```
   Sample Speaker A | speaker.a@example.com | 555-0101 | High Councilor | TRUE |
   Sample Speaker B | speaker.b@example.com | 555-0102 | High Councilor | TRUE |
   Sample Speaker C | speaker.c@example.com | 555-0103 | High Councilor | TRUE |
   Sample Speaker D | speaker.d@example.com | 555-0104 | High Councilor | FALSE |
   ```
2. **Wards tab**: Delete your real rows. Add 3 placeholder rows:
   ```
   Sample Ward 1 | North Building | 9:00 AM | Bishop Sample | bishop@example.com | 1
   Sample Ward 2 | North Building | 11:00 AM | Bishop Sample | bishop@example.com | 2
   Sample Ward 3 | South Building | 1:00 PM | Bishop Sample | bishop@example.com | 3
   ```
3. **Schedule tab**: Select all rows below the header and delete them
4. **Log tab**: Select all rows below the header and delete them
5. **Settings tab**: Clear the values for Stake Name, Exec Sec Name, and Exec Sec Email (leave the keys, just erase the values)

### Step 18 — Share it

In the public template copy: **Share** (top-right button) → **Change to anyone with the link** → Set to **Viewer** → Done

### Step 19 — Get the template URL

Look at the URL of the public template sheet. It looks like:
```
https://docs.google.com/spreadsheets/d/1BxA...SHEET_ID.../edit
```

Copy the Sheet ID — the long string between `/d/` and `/edit`.

### Step 20 — Update the README

In the repo, open `README.md`. Find this line:

```
Open the [template sheet](https://docs.google.com/spreadsheets/d/TEMPLATE_ID_HERE)
```

Replace `TEMPLATE_ID_HERE` with your actual Sheet ID.

Do the same in `docs/setup-guide.md` — it has the same placeholder.

Then commit and push:

```
git add README.md docs/setup-guide.md
git commit -m "docs: add real template sheet link"
git push
```

---

## Part D — Set up triggers on your working copy

These are for your own stake's live schedule. Do this on the **working copy**, not the public template.

### Step 21 — Open the Triggers panel

In your working sheet: **Extensions → Apps Script**

In the Apps Script editor, look at the left sidebar. Click the **clock icon** (Triggers).

### Step 22 — Add the daily reminder trigger

Click the blue **+ Add Trigger** button (bottom-right).

Fill in the fields:
- **Choose which function to run**: `runDailyJobs`
- **Choose which deployment should run**: `Head`
- **Select event source**: `Time-driven`
- **Select type of time based trigger**: `Day timer`
- **Select time of day**: `6am to 7am`

Click Save.

### Step 23 — Add the weekly digest trigger

Click **+ Add Trigger** again.

- **Choose which function to run**: `runWeeklyDigest`
- **Choose which deployment should run**: `Head`
- **Select event source**: `Time-driven`
- **Select type of time based trigger**: `Week timer`
- **Select day of week**: `Monday`
- **Select time of day**: `7am to 8am`

Click Save.

You're done. The script will now send reminder emails automatically 21 days before each assignment and email you a digest every Monday morning.

---

## Optional: Set up the swap request form

If you want speakers to be able to request swaps via a form:

1. Go to [forms.google.com](https://forms.google.com) and create a blank form
2. Add these questions with these exact names:
   - "Your name" (Short answer, required)
   - "Your assignment date" (Date, required)
   - "Swap with" (Short answer — speaker's name, required)
   - "Reason" (Paragraph, optional)
3. In the form editor: click the **Responses** tab → click the Google Sheets icon (Link to Sheets) → choose "Select existing spreadsheet" → choose your working copy → the tab will be named "Form Responses 1" automatically
4. Back in Apps Script: Triggers → Add Trigger:
   - Function: `onSwapFormSubmit`
   - Event source: `From spreadsheet`
   - Event type: `On form submit`
5. Copy the form's shareable link (Send → Link icon in the form editor)
6. In your sheet Settings tab: add a row with Key = `Swap Form URL` and paste the link as the Value

---

## Keeping the code updated

When a new version is released:

```
git pull origin main
cd src
clasp push
```

That's it. The sheet gets the updated code automatically.
