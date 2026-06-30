# Skill: Fixed Bills and Effective Dates

Use this skill whenever editing recurring bills.

## Required behavior

Each fixed bill must have:

- Name
- Category
- Monthly amount
- Start date
- Optional end date
- Active status

## Effective date logic

A bill counts for a week only if the week start date falls inside the bill's active date range.

Pseudo-logic:

```js
bill.startDate <= weekStartDate && weekStartDate <= bill.endDate
```

If there is no end date, treat the bill as active indefinitely.

## Cancellation behavior

If the user cancels a subscription, the app should stop counting it only after the end date.

Past weeks should not change.

Finalized weeks should never change unless manually unfinalized.

## UI behavior

The fixed bills section should be collapsible by default.

The fixed bills total should be visible in the main dashboard.
