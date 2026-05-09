# ADR 001 — Schedule tab: long format vs. grid format

**Status:** Accepted

---

## Context

The real-world exec sec workflow uses a grid: rows are months, columns are wards, and each cell holds a speaker name. This is what most people picture when they think about the schedule.

Two layouts were possible for the Schedule tab:

**Grid format** — mirrors the paper workflow exactly. Easy to read at a glance. Hard to add metadata (topic, status, notes) per cell without secondary tabs or named ranges.

**Long format** — one row per (date, ward) assignment. Verbose, harder to scan visually. Supports arbitrary per-row metadata, consistent with how Apps Script works best (range reads, row appends).

---

## Decision

Long format.

---

## Reasons

1. **Per-row metadata.** Each assignment needs a topic, a status, notes, a locked flag, and optionally a calendar event ID. Storing this in a grid would require parallel shadow sheets or complex named-range gymnastics.

2. **Apps Script ergonomics.** Reading a range and iterating rows is the natural Apps Script pattern. Grid-format lookups require column-index arithmetic that breaks whenever the ward list changes.

3. **Log tab consistency.** The Log tab is also long-format append-only. Keeping both tabs in the same shape makes the audit trail straightforward — a log row points to a (date, ward) pair that maps directly to a schedule row.

4. **Future-proofing without over-engineering.** Adding a new column (e.g., `Calendar Event ID`) to long format is one header change. Adding it to grid format means either a new parallel tab or per-cell notes — both are messier.

---

## Trade-offs accepted

The long format is harder to read manually. Users who want the familiar grid view can use a Pivot Table or a separate summary view — Google Sheets makes that straightforward.

The exec sec digest provides the "what's coming up" view in the email; there's no strong need for a visual grid in the sheet itself.
