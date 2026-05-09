# Setup Guide

Everything you need to get Fourth Sunday running for your stake. No technical background required.

Total time: about 30 minutes.

---

## Before you start

You need:
- A Google account (the same one you use for Gmail and Drive)
- Your stake's ward list with meeting times and bishop names
- A list of stake council members with their email addresses

That's it. No software to install, no accounts to create.

---

## Step 1 — Copy the template sheet (2 minutes)

1. Open the template: [click here](https://docs.google.com/spreadsheets/d/TEMPLATE_ID_HERE)
2. In the menu at the top of the sheet, click **File → Make a copy**
3. Name it something like `Mountain View Stake — Speaking Schedule 2026`
4. Make sure "My Drive" is selected as the folder, then click **Make a copy**

You now have your own private copy. Changes you make won't affect anyone else.

---

## Step 2 — Fill in your settings (5 minutes)

Click the **Settings** tab at the bottom of the sheet.

You'll see a list of settings with a Key column and a Value column. Fill in the Value column for each row:

**Stake Name**
Type your stake's full name. This appears in email subject lines.
> Example: `Mountain View Stake`

**Exec Sec Name**
Your name.
> Example: `Kelly Ferguson`

**Exec Sec Email**
Your email address. The weekly digest and swap notifications will go here.
> Example: `kelly@example.com`

**Reminder Days**
How many days before an assignment to send the speaker their reminder. The default is `21` — leave it unless your stake president wants a different number.
> Type: `21`

**Time Zone**
Find your time zone in the table below and copy the exact value shown.

| Your location | Type this |
|---------------|-----------|
| Utah, Colorado, Wyoming, New Mexico, North Dakota, South Dakota | `America/Denver` |
| Arizona (most of the state — no daylight saving) | `America/Phoenix` |
| California, Oregon, Washington, Nevada, Idaho, Montana | `America/Los_Angeles` |
| Texas, Oklahoma, Kansas, Nebraska, Minnesota, Wisconsin, Illinois, Missouri, Louisiana, Mississippi, Alabama | `America/Chicago` |
| New York, Florida, Georgia, North Carolina, South Carolina, Virginia, Ohio, Pennsylvania, Michigan, Indiana | `America/New_York` |
| Hawaii | `Pacific/Honolulu` |
| Alaska | `America/Anchorage` |
| Alberta, Saskatchewan | `America/Edmonton` |
| British Columbia | `America/Vancouver` |
| Ontario, Quebec | `America/Toronto` |
| England, Wales, Scotland | `Europe/London` |
| South Africa | `Africa/Johannesburg` |
| Australia (NSW, VIC, QLD, TAS) | `Australia/Sydney` |
| New Zealand | `Pacific/Auckland` |
| Philippines | `Asia/Manila` |
| Mexico City | `America/Mexico_City` |

Not on the list? [Look yours up here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) — find your country, copy the value from the "TZ identifier" column.

**Calendar Sync**
Leave this as `FALSE` for now. If you want calendar invites sent to speakers later, you can change it to `TRUE` after setup.

**Default Language**
Leave as `en`.

**Rollover Algorithm**
Leave as `latin_square`.

**Swap Form URL**
Leave blank for now. You'll fill this in if you set up the optional swap request form in Step 9.

---

## Step 3 — Add your wards (5 minutes)

Click the **Wards** tab.

Delete the three sample rows (click the row number on the left to select the whole row, then right-click → Delete row). Do this for all three sample rows.

Then add one row for each ward in your stake. Each column:

- **Name** — the ward's full name, exactly as you want it in emails. Example: `Mountain View 1st Ward`
- **Building** — the meeting building name. For your reference only.
- **Meeting Time** — the time sacrament meeting starts. Type it like `9:00 AM` or `1:30 PM` — include the AM/PM.
- **Bishop Name** — the bishop's first and last name. This appears in speaker reminder emails.
- **Bishop Email** — the bishop's email. Used only if you enable Calendar Sync.
- **Sort Order** — type `1` for the first ward in your building order, `2` for the second, and so on. This controls the order wards are listed in digests.

---

## Step 4 — Add your speakers (5 minutes)

Click the **Speakers** tab.

You'll see a yellow warning banner at the top that says to delete the sample data. Do that first — select and delete the sample rows.

Add one row per stake council member who speaks at 4th Sunday sacrament meetings:

- **Name** — full name, spelled exactly as you want it in emails
- **Email** — the email address where their reminder will be sent. This must be filled in for reminders to work.
- **Phone** — optional. For your own reference.
- **Calling** — their calling (e.g., `High Councilor`, `Second Counselor in Stake Presidency`)
- **Active** — type `TRUE` if they're currently serving and should be in the rotation. Type `FALSE` if they're on leave, recently released, or you want to temporarily remove them.
- **Notes** — optional. Anything you want to remember, like "lives in 3rd Ward, swap if assigned there."

---

## Step 5 — Authorize the script (2 minutes)

The script needs permission to send emails on your behalf. This is a one-time step.

1. Look at the menu bar at the top of the sheet. You should see a **Fourth Sunday** menu. Click it.

   *If you don't see a Fourth Sunday menu: click the menu bar and wait a few seconds — it sometimes takes a moment to load after copying. If it still doesn't appear, go to Extensions → Apps Script and click the Run button on any function.*

2. Click **Run Rollover**

3. A pop-up will appear: "Authorization required." Click **Continue.**

4. Choose your Google account.

5. You'll see a screen that says **"Google hasn't verified this app"** with a warning. This is normal — it appears for any private Google script that hasn't been published to the Google Marketplace. It is safe to proceed.

   Click **Advanced** (small text at the bottom left of that screen).

   Then click **Go to Fourth Sunday (unsafe)** — the word "unsafe" is Google's standard disclaimer for unverified apps, not a warning about this specific script.

6. Review the permissions and click **Allow**.

You're back in the sheet. The authorization is saved — you won't need to do this again.

---

## Step 6 — Generate the year's schedule (1 minute)

1. Click **Fourth Sunday → Run Rollover**
2. Wait about 10–15 seconds
3. A message will appear: "Rollover complete. Review the Schedule tab and lock rows you want to keep."

Click the **Schedule** tab. You should see one row per ward per 4th Sunday for the year, with speakers assigned using the rotation. September and December are skipped automatically.

**Review the schedule now.** Look for:
- Any ward missing a speaker (the Speaker column is blank)
- Any speaker assigned to two wards on the same date (the weekly digest will flag these too)
- Anything you want to lock in permanently

To lock a row so it won't be changed on future rollovers: click the cell in the **Locked** column for that row and type `TRUE`.

---

## Step 7 — Send yourself a test email (1 minute)

**Fourth Sunday → Send Test Reminder Email**

Check your inbox within a minute or two. You should receive a sample reminder email that looks like what speakers will receive. This lets you confirm emails are working and see what the format looks like before real reminders go out.

If the email doesn't arrive:
- Check your spam folder
- Confirm Exec Sec Email is set correctly in the Settings tab

---

## Step 8 — Set up automatic reminders and digest (5 minutes)

This step tells Google to run the script automatically — sending reminders and your weekly digest without you having to do anything.

1. In the sheet: click **Extensions → Apps Script**

   A new browser tab opens with the script editor. (You don't need to read or change anything here — just use the menus.)

2. In the left sidebar, look for a **clock icon** (it's labeled "Triggers" if you hover over it). Click it.

3. Click the blue **+ Add Trigger** button in the bottom-right corner.

4. A form appears. Fill it in exactly like this:

   | Field | Select |
   |-------|--------|
   | Choose which function to run | `runDailyJobs` |
   | Choose which deployment should run | `Head` |
   | Select event source | `Time-driven` |
   | Select type of time based trigger | `Day timer` |
   | Select time of day | `6am to 7am` |

   Click **Save**.

5. Click **+ Add Trigger** again. Fill it in:

   | Field | Select |
   |-------|--------|
   | Choose which function to run | `runWeeklyDigest` |
   | Choose which deployment should run | `Head` |
   | Select event source | `Time-driven` |
   | Select type of time based trigger | `Week timer` |
   | Select day of week | `Monday` |
   | Select time of day | `7am to 8am` |

   Click **Save**.

6. Close the Apps Script tab and go back to your sheet.

The script will now:
- Check every morning at 6am for upcoming assignments and send reminder emails to speakers 21 days out
- Email you every Monday with a digest of the next 60 days

---

## Step 9 — Set up the swap request form (optional, 10 minutes)

If you want speakers to be able to request swaps without calling you, this form gives them a way to do it. The script notifies you automatically when a request comes in.

### Create the form

1. Go to [forms.google.com](https://forms.google.com)
2. Click the blank `+` to create a new form
3. Name it: `Fourth Sunday Swap Request`
4. Delete the default "Untitled Question"

Now add these four questions. The names must match exactly — the script reads them by name:

**Question 1:**
- Click "Add question" (the `+` button in the floating toolbar on the right)
- Question title: `Your name`
- Answer type: **Short answer**
- Toggle "Required" on

**Question 2:**
- Add question
- Title: `Your assignment date`
- Answer type: **Date**
- Toggle "Required" on

**Question 3:**
- Add question
- Title: `Swap with`
- Answer type: **Short answer** (they'll type the other speaker's name)
- Toggle "Required" on

**Question 4:**
- Add question
- Title: `Reason`
- Answer type: **Paragraph**
- Leave "Required" off

### Link the form to your sheet

1. In the form editor: click the **Responses** tab at the top
2. Click the Google Sheets icon (green spreadsheet icon — "Link to Sheets")
3. Select **"Select existing spreadsheet"**
4. Find and select your schedule sheet
5. Click **Create** — the form responses will now go into a "Form Responses 1" tab in your sheet

### Add the trigger

1. In your schedule sheet: **Extensions → Apps Script**
2. Click the **clock icon** (Triggers)
3. Click **+ Add Trigger**:

   | Field | Select |
   |-------|--------|
   | Choose which function to run | `onSwapFormSubmit` |
   | Choose which deployment should run | `Head` |
   | Select event source | `From spreadsheet` |
   | Select event type | `On form submit` |

4. Click **Save**

### Copy the form link into Settings

1. In the form editor: click **Send** (top-right)
2. Click the link icon
3. Copy the short URL (click "Shorten URL" if you want a shorter one)
4. Go back to your sheet, click the **Settings** tab
5. Find the row with Key = `Swap Form URL` and paste the link in the Value column

Now when a speaker submits the form, you'll receive an email. To approve a swap: **Fourth Sunday → Approve Pending Swaps**.

---

## You're done

The schedule is live, reminders will go out automatically, and you'll get a Monday digest every week.

A few things to do as the year goes on:

- **Assign topics**: When the stake presidency assigns a topic, go to the Schedule tab and type the topic title in the Topic column. Make sure it matches a title in the Topics tab exactly — that's how the script finds the scripture references for the reminder email.
- **Lock confirmed rows**: Once you're happy with an assignment and have notified the speaker, set Locked = TRUE so it survives any future rollover re-runs.
- **Mark completed assignments**: After a date passes, you can manually set Status = `complete` for those rows to keep the digest clean.
- **Update speakers**: If someone is released or called, go to the Speakers tab and set Active = FALSE. They'll be excluded from the next rollover.

---

## Troubleshooting

**The Fourth Sunday menu isn't appearing**

Go to Extensions → Apps Script. In the dropdown at the top (showing a function name), select `onOpen` and click the Run button (triangle). Then go back to your sheet and reload the page.

**An email isn't sending**

1. In the sheet: Extensions → Apps Script
2. In the left sidebar, click the **clock icon** — then look for a "Failed" status next to any trigger
3. For more detail: click **Executions** (the play-button icon in the left sidebar). This shows a log of every time the script has run. Click any row to see the full error message.

**The rollover ran but the Schedule tab is empty**

Check that the Speakers tab and Wards tab both have at least one row of data below the header. Also verify the header row spellings match the table in Step 4.

**I got a "This app isn't verified" warning again**

This can happen after a long period of inactivity or if you sign out and back in. Follow the same steps from Step 5 — click Advanced, then "Go to Fourth Sunday (unsafe)."

**I need to re-run the rollover after making changes**

That's fine. Any row with Locked = TRUE will be preserved. All unlocked rows will be replaced with fresh proposals. If you want to keep your current schedule and just add a new year, lock all the rows you want to keep before re-running.
