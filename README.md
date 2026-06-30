# POT Budget

POT Budget is a personal weekly budgeting app that tracks allowance, spending, leftover money, fixed bills, planned expenses, and cash-flow timing.

The app is intentionally simple and browser-based. It saves data locally in the browser using `localStorage`.

## Core purpose

This app helps answer:

- How much can I spend each week?
- How much did I actually spend?
- What is left over this week?
- How does leftover money affect my POT?
- What fixed bills are reducing my allowance?
- What future planned expenses are coming up?
- When do paychecks, rent, and credit card payments hit?

## Main files

```txt
index.html
manifest.json
service-worker.js
icon.svg
README.md
AI_INSTRUCTIONS.md
DATA_MODEL.md
CHANGELOG.md
TODO.md
.github/copilot-instructions.md
```

## Budget formula

Weekly allowance must always be calculated as:

```txt
(monthly income - fixed bills active for that week) * 12 / 365 * 7
```

Do not divide the month by 4 weeks or 5 weeks. Every budget week is 7 days, even though months have different lengths.

## Important design decisions

- Fixed bills are date-based.
- Finalized weeks are frozen.
- POT should not be rewritten by future bill changes.
- Cash-flow planning is separate from weekly budget allowance.
- Fixed bills should stay collapsible because there can be many rows.
- Cash-flow constants are locked by default.
- Category learning/autofill should be preserved.

## Running locally

Open `index.html` in a browser.

## Deploying to GitHub Pages

1. Put the app files in a GitHub repository.
2. Go to repository Settings.
3. Go to Pages.
4. Select the branch and root folder.
5. Save.
6. Open the published GitHub Pages URL.

## Updating the app

When replacing files, keep the same site URL if possible so browser `localStorage` data remains available.

Before major changes, use the app's CSV export as a backup.
