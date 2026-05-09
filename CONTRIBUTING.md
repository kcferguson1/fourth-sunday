# Contributing

## Reporting issues

Use GitHub Issues. Include your stake's approximate size (number of wards, number of speakers) and the full error text from the Apps Script execution log.

## Pull requests

1. Fork the repo and create a branch from `main`
2. If your change touches the rotation algorithm, update or add tests in `src/rollover.test.js`
3. If your change adds a new setting, document it in `docs/stake-config.md`
4. Use conventional commit messages: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
5. Open the PR against `main`

## Apps Script development

The source lives in `src/`. To work on it:

1. Install [clasp](https://github.com/google/clasp): `npm install -g @google/clasp`
2. Log in: `clasp login`
3. From the `src/` directory: `clasp push` to deploy to your dev sheet
4. `clasp pull` to sync changes made in the browser editor back to disk

## i18n

All user-facing strings live in `src/strings.gs`. To add a translation:

1. Copy the `en` block and rename it to your locale code (e.g., `pt`, `fr`)
2. Translate each string value — do not change the keys
3. Open a PR with the locale code in the branch name
4. See [docs/translation-guide.md](docs/translation-guide.md) for full instructions

## Code style

- JSDoc on every exported function
- No inline `console.log` left in merged code — use `Logger.log`
- The Latin-square logic in `rollover.gs` must remain a pure function — no sheet I/O inside `proposeSchedule()`
- No AI-pattern prose in docs or comments (see README for the list)

## What's out of scope for v1

- Speaker confirmation web app
- HTML email templates
- Multi-stake tooling

These are welcome as community experiments but won't be merged into `main` until a v2 planning discussion happens.
