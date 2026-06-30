# Changelog

## v5

- Added finalized/frozen weeks.
- Finalized weeks freeze allowance, spending, leftover, fixed bills used, and POT.
- Added opening POT.
- Removed POT preload from cash-flow planner.
- Made cash-flow planner a separate tab/sub-app.
- Locked cash-flow constants by default.
- Added unlock button for cash-flow constants.
- Made fixed bills collapsible by default.
- Clarified that weeks are always 7 days.
- Weekly allowance uses:
  ```txt
  (monthly income - fixed bills active for that week) * 12 / 365 * 7
  ```
- Added data migration from older localStorage keys.

## v4

- Added fixed bills/recurring costs table.
- Added start/end dates for fixed bills.
- Weekly allowance became date-based.
- Fixed bill changes only affect weeks where the bill is active.
- Past weeks were protected conceptually from future changes.

## v3

- Added cash-flow planner.
- Added paydays, rent due date, credit card due date, planned expenses, and timeline.
- Added lowest projected cash metric.
- Added planned expense tracker for items like bachelorette trip flights.

## v2

- Added month/history navigation.
- Added Add Month and Add Week.
- Added category learning/autofill.
- Reframed weekly cards around allowance, spent, and left over.
- Made POT quieter visually.

## v1

- Initial installable HTML app.
- Weekly POT budget dashboard.
- Separate weekly cards.
- Weekly cost entry rows.
- Automatic weekly totals.
- POT rolling forward.
- Browser localStorage saving.
- Manifest and service worker for app-like behavior.
