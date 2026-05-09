# Rotation Rules

How the annual schedule generation works, and how to influence it.

---

## The algorithm

The rollover uses a Latin-square rotation. Given N active speakers and M wards sorted by meeting time, the assignment for a given (month, ward) pair is:

```
speaker = speakers[(monthIndex + wardIndex) % N]
```

Where `monthIndex` is 0 for the first 4th Sunday of the year, 1 for the second, and so on; `wardIndex` is 0 for the first ward (lowest Sort Order), 1 for the second, etc.

This produces a matrix where:
- In any given month, no speaker appears in the rotation more than once unless there are more wards than speakers.
- Across months, the assignment shifts so each speaker gradually rotates through every ward.
- No speaker visits the same ward two months in a row (assuming N > 1).

The full schedule for a year with N=4 speakers and M=3 wards would look like this (using speaker indices 0–3):

| Month | Ward A | Ward B | Ward C |
|-------|--------|--------|--------|
| Jan   | 0      | 1      | 2      |
| Feb   | 1      | 2      | 3      |
| Mar   | 2      | 3      | 0      |
| Apr   | 3      | 0      | 1      |
| May   | 0      | 1      | 2      |
| ...   | ...    | ...    | ...    |

With 10 months of 4th Sundays (skipping September and December), each speaker speaks roughly 7–8 times and visits each ward about 2–3 times over the year.

---

## What the rollover skips

Two dates are excluded from the generated schedule automatically:

**September** — the 4th Sunday in September is Fast Sunday in most years. The script detects this and writes no assignments for that month.

**December** — the 4th Sunday in December falls within the Christmas week in most years. The script excludes December entirely.

These exclusions are hardcoded in `rollover.gs`. If your stake has different exclusion rules, edit `_getFourthSundayOfMonthStr` calls in `runRollover()`.

---

## Overrides tab

For dates that need special handling beyond the two standard exclusions, use the **Overrides** tab.

| Column | Example | Notes |
|--------|---------|-------|
| Date | 2026-06-28 | The 4th Sunday you want to override |
| Ward | First Ward | Specific ward name, or `*` to apply to all wards that date |
| Label | Ward Conference | Text that appears in the Notes column and in digest flags |

Common override labels:
- `Ward Conference`
- `Missionary Homecoming`
- `Stake Conference` (typically use `*` for ward)
- `Pioneer Day` (Utah stakes only — July 4th Sunday near July 24)

When a row has `Ward = *`, the override applies to every ward on that date. Ward-specific overrides apply only to that one ward.

Overrides produce `status = skipped` rows in the Schedule tab. These rows are visible in the weekly digest.

---

## Locked rows

Any row in the Schedule tab with `Locked = TRUE` is skipped by future rollovers. The row stays exactly as it is.

Use locked rows for:
- Confirmed assignments you've already sent reminders for
- Manual swaps that should survive a re-roll
- Any assignment that was hand-placed and shouldn't be touched

The rollover does not set `Locked = TRUE` on any row it creates — all proposed rows start unlocked. You lock them manually after review.

---

## Double-assignment flag

If N < M (fewer speakers than wards), the modular arithmetic guarantees that at least one speaker will be assigned to two wards on the same date in some months. The rollover detects this and:

1. Logs a warning in the Apps Script execution log
2. Records the conflict in the Log tab with action `ROLLOVER_DOUBLES`

The assignments are still written — the exec sec decides whether to accept the double assignment (common for small stakes where "doubles" are normal) or manually swap one of the rows.

The weekly digest also flags double assignments in the 60-day window.

---

## Changing speaker order

The rotation order is determined by alphabetical sort of the Speakers tab. To change which speaker leads each rotation:

1. Add a numeric prefix to names in the Speakers tab: `01 Smith, John`, `02 Jones, Mary`, etc.
2. Or run the rollover, then manually adjust the first few rows before locking them — the next rollover will preserve those locked rows.

---

## Re-running the rollover mid-year

You can run the rollover at any time. It:
- Keeps all rows where `Locked = TRUE`
- Replaces all unlocked rows with fresh proposals
- Re-flags any double assignments

If you've been managing the schedule manually and want to lock your work before re-running, select all rows in the Schedule tab and bulk-set `Locked = TRUE` on the ones you want to keep.
