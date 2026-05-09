# Translation Guide

All user-facing strings live in `src/strings.gs` under a locale key (e.g., `en`, `es`). To add a new language:

1. Open `src/strings.gs`
2. Copy the entire `en` block
3. Rename it to your locale code (e.g., `pt` for Portuguese, `fr` for French, `de` for German)
4. Translate each value — **do not change any key names**
5. Set `Default Language` in the Settings tab to your locale code
6. Open a PR with the locale code in the branch name: `feat/locale-pt`

---

## Placeholder syntax

Template variables use `{variableName}` syntax:

```
'Your assignment on {date} at {wardName}'
```

Keep all `{...}` placeholders in your translation — they're replaced at runtime. You can move them around in the sentence, but don't remove them or change their names.

---

## Spanish status values

The `statusPending`, `statusTopicAssigned`, etc. strings are written to the Schedule sheet's Status column. If you translate these, all your sheet queries and status comparisons must use the translated values consistently. This is error-prone — for v1, the Spanish block uses the same English status values. A future version may separate display labels from internal status codes.

---

## Testing a translation

1. Set `Default Language` in Settings to your locale code
2. Use **Fourth Sunday → Send Test Reminder Email** to see the reminder in your language
3. Use **Fourth Sunday → Send Digest Now** to see the digest

---

## What's not translated

- Column headers in the sheet tabs (Year, Date, Ward, etc.)
- The `Key` column in Settings
- Log tab entries
- Apps Script execution log messages (always English)

Translating column headers would require changes throughout `data.gs`. That's a v2 concern.

---

## Current translation status

| Locale | Status |
|--------|--------|
| `en`   | Complete |
| `es`   | Placeholder (all values present, most say "TODO: translate") |
