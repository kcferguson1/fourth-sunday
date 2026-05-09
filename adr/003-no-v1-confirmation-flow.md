# ADR 003 — No speaker confirmation flow in v1

**Status:** Accepted

---

## Context

A natural feature would be a speaker confirmation step: after a reminder goes out, the speaker clicks a link to confirm they received it and will attend. This requires a web endpoint to receive the click, update the sheet, and optionally notify the exec sec.

---

## Decision

Out of scope for v1. The feature is noted but not built.

---

## Reasons

1. **Zero-cost constraint.** Hosting a web endpoint that accepts unauthenticated POST requests and writes to a Google Sheet requires either a deployed Apps Script Web App (which has its own auth complexity) or an external host (which has a cost). Neither is trivial to set up for a non-technical exec sec.

2. **Real-world behavior.** In practice, exec secs don't wait for confirmations — they follow up by phone or text when a speaker hasn't responded. A confirmation flow automates something that usually gets handled personally.

3. **Scope discipline.** Adding a confirmation flow means adding a web app endpoint, a new status value (`confirmed`), new email templates (confirmation request + confirmed receipt), and documentation for setup. That's 30–40% more code for a feature the core workflow doesn't require.

4. **The swap form covers the actionable case.** If a speaker can't do their assignment, they use the swap form. The confirmation flow's value is mainly notification that a speaker saw the email — the daily job already records `reminder_sent` status.

---

## What v2 might look like

A Google Apps Script Web App with `doGet()` accepting a signed token would work without external hosting. The token encodes the (date, ward) pair; clicking the link flips status to `confirmed` and logs the action. This is viable but complex enough to warrant its own planning discussion.
