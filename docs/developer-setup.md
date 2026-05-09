# Developer Setup

This guide is for the person who owns the repo — the one who creates and maintains the published template sheet that everyone else copies. You do this once. After that, the end-user setup guide handles everything.

Estimated time: 15–20 minutes.

---

## What you're doing

Google Apps Script code can't be distributed as a file download — it has to live inside a Google Sheet. The path is:

1. Run one shell script that creates the sheet, pushes the code, and opens it in your browser
2. Click one menu item in the sheet that creates all tabs, seeds topics, and installs triggers
3. Test it with real stake data
4. Make a clean copy with sample-only data and share it publicly
5. Update the README with the public template link

---

## Part A — Push the code into a Google Sheet

### Step 1 — Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Click the **LTS** button (the left one — "Recommended For Most Users")
3. Run the downloaded installer and click through the defaults
4. Open Terminal (Mac: press `Command + Space`, type `Terminal`, press Enter)
5. Type `node --version` and press Enter. You should see something like `v20.x.x`.

### Step 2 — Run the setup script

In Terminal:

```
cd "/Users/YOUR_USERNAME/Desktop/Claude Code/stake_speakers_google"
bash scripts/setup.sh
```

The script will:
- Install clasp if it's not already installed
- Ask you to log into your Google account in a browser (one-time)
- Create a new Google Sheet automatically — **no copy-paste of IDs needed**
- Push all the code to that sheet
- Open the sheet in your browser

When it finishes, you'll see next steps printed on screen.

### Step 3 — Run First-time Setup in the sheet

1. Go back to your Google Sheet and reload the page (`Cmd+R`)
2. You should see a **Fourth Sunday** menu in the menu bar
3. Click **Fourth Sunday → First-time Setup**
4. Google will ask you to authorize the script — click through the prompts
   - If you see "This app isn't verified": click **Advanced → Go to Fourth Sunday (unsafe)**. This is Google's standard disclaimer for private scripts.
5. Wait about 15 seconds for the setup to complete
6. A message appears: "Setup complete. Tabs created, topics loaded, and automatic reminders scheduled."

**What just happened automatically:**
- All 6 required tabs were created with correct headers
- Settings tab was pre-filled with default keys (blank values for you to fill in)
- Topics tab was seeded with 40+ Come Follow Me and General Conference topics
- Daily reminder trigger (6am) and weekly digest trigger (Monday 7am) were installed

---

## Part B — Fill in your stake data and test

### Step 6 — Fill in Settings

Click the **Settings** tab. Fill in the Value column for each key:

| Key | What to type |
|-----|-------------|
| Stake Name | Your stake's full name |
| Exec Sec Name | Your name |
| Exec Sec Email | Your email address |
| Reminder Days | `21` |
| Time Zone | See the time zone table in [docs/setup-guide.md](setup-guide.md#step-2----fill-in-your-settings-5-minutes) |
| Calendar Sync | `FALSE` |
| Default Language | `en` |
| Rollover Algorithm | `latin_square` |

### Step 7 — Add wards and speakers

- **Wards tab**: One row per ward. Fill in Name, Building, Meeting Time (`9:00 AM` format), Bishop Name, Bishop Email, Sort Order.
- **Speakers tab**: Delete the sample rows first. One row per stake council member: Name, Email, Calling, Active (`TRUE`/`FALSE`).

### Step 8 — Test the rollover

**Fourth Sunday → Run Rollover**

The Schedule tab should fill with a year's assignments. Scroll through and check that speaker names and ward names look correct.

### Step 9 — Test the digest and reminder email

- **Fourth Sunday → Send Digest Now** — check your inbox within a minute
- **Fourth Sunday → Send Test Reminder Email** — check your inbox

If emails don't arrive, check spam, then verify Exec Sec Email is set in the Settings tab.

---

## Part C — Create the public template

### Step 10 — Make a copy

In your working sheet: **File → Make a copy** → name it `Fourth Sunday — Public Template`

### Step 11 — Clean out the real data

In the public template copy, open **Extensions → Apps Script** and run `preparePublicTemplate()` from the function dropdown. It will:
- Replace your real speakers and wards with sample placeholder rows
- Clear the Schedule and Log tabs
- Clear your personal Settings values

Alternatively, do it manually:
1. **Speakers tab**: Delete all your real rows. Add 3–4 placeholder rows with names like `Sample Speaker A` and emails like `speaker.a@example.com`
2. **Wards tab**: Delete your real rows. Add 2–3 placeholder rows
3. **Schedule tab**: Delete all rows below the header
4. **Log tab**: Delete all rows below the header
5. **Settings tab**: Clear the values for Stake Name, Exec Sec Name, and Exec Sec Email

### Step 12 — Share it publicly

**Share** (top-right) → **Change to anyone with the link** → **Viewer** → Done

### Step 13 — Get the template Sheet ID

Look at the URL of the public template:
```
https://docs.google.com/spreadsheets/d/  1BxA...SHEET_ID.../edit
```
Copy the Sheet ID — the string between `/d/` and `/edit`.

### Step 14 — Update the README

In the repo, open `README.md` and `docs/setup-guide.md`. Find `TEMPLATE_ID_HERE` in both files and replace it with your real Sheet ID. Then:

```
git add README.md docs/setup-guide.md
git commit -m "docs: add real template sheet link"
git push
```

---

## Part D — Triggers are already installed

The `First-time Setup` step in Part A installed the triggers automatically. Nothing more to do.

---

## Keeping the code updated

When a new version is released:

```
git pull origin main
cd src
clasp push
```

That's it.

---

## Optional: Set up the swap request form

Same as end users — click **Fourth Sunday → Set Up Swap Form**. The script creates and configures the form automatically.
