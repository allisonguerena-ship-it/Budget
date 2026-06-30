# Data Model

This document explains the meaning of the main data concepts in POT Budget.

## Overview

The app saves data in browser `localStorage`.

The current key may change by version, but the app should migrate older keys when possible.

Example:

```js
const STORAGE_KEY = "alli_pot_budget_app_v5";
const OLD_KEYS = [
  "alli_pot_budget_app_v4",
  "alli_pot_budget_app_v3",
  "alli_pot_budget_app_v2"
];
```

## Top-level data shape

Approximate shape:

```js
{
  currentMonth: "2026-07",
  income: 5708.68,
  openingPot: 0,
  learnedCategories: {},
  fixedBills: [],
  cash: {},
  plannedExpenses: [],
  months: {}
}
```

## income

Monthly take-home income.

This is one of the most important inputs.

It is used to calculate weekly allowance.

## fixedBills

Array of recurring monthly bills.

Each fixed bill should look like:

```js
{
  name: "Rent",
  category: "Housing",
  amount: 3098,
  startDate: "2026-07-01",
  endDate: "",
  active: true
}
```

### Fixed bill fields

| Field | Meaning |
|---|---|
| `name` | User-facing bill name |
| `category` | Housing, Car, Insurance, Subscription, etc. |
| `amount` | Monthly amount |
| `startDate` | First date the bill should count |
| `endDate` | Optional date the bill stops counting |
| `active` | Whether the bill is active |

## Active fixed bills

A fixed bill is active on a week if the week start date falls within the bill's start/end range.

Pseudo-logic:

```js
startDate <= weekStartDate <= endDate
```

If `endDate` is blank, treat it as active indefinitely.

Inactive bills should not count.

## monthlyFixedOn(date)

Calculated total of fixed bills active on a given date.

This should be calculated from `fixedBills`.

Do not rely on a manually edited fixed-bills total.

## weeklyAllowance(date)

Weekly allowance for a specific week.

Formula:

```txt
(monthly income - fixed bills active for that week) * 12 / 365 * 7
```

This is date-specific because fixed bills can change over time.

## months

Object keyed by month:

```js
months: {
  "2026-07": {
    weekStarts: ["2026-07-01", "2026-07-08", "2026-07-15"],
    expenses: [],
    finalizedWeeks: {}
  }
}
```

Months are used for navigation and history. They do not determine allowance math.

## weekStarts

Array of 7-day week start dates.

Weeks are always treated as 7-day periods.

Do not assume each month has exactly 4 or 5 weeks.

## expenses

Weekly cost entries.

Example:

```js
{
  week: 0,
  date: "2026-07-03",
  desc: "Trader Joe's",
  category: "Groceries",
  amount: 68.25
}
```

### Expense fields

| Field | Meaning |
|---|---|
| `week` | Index of the week in the current month view |
| `date` | Purchase date |
| `desc` | Description/vendor |
| `category` | Spending category |
| `amount` | Cost |

## learnedCategories

Maps normalized descriptions to categories.

Example:

```js
{
  "trader joes": "Groceries",
  "waymo": "Uber/Waymo"
}
```

When a user assigns a category to a description, the app learns it.

## finalizedWeeks

Object keyed by week index.

Example:

```js
finalizedWeeks: {
  0: {
    date: "2026-07-01",
    startPot: 0,
    allowance: 507.27,
    used: 430.12,
    leftover: 77.15,
    endingPot: 77.15,
    fixed: 3504.49,
    finalizedAt: "2026-07-07"
  }
}
```

### Finalized week fields

| Field | Meaning |
|---|---|
| `date` | Week start date |
| `startPot` | POT before the week |
| `allowance` | Frozen weekly allowance |
| `used` | Frozen spending total |
| `leftover` | Frozen allowance minus spending |
| `endingPot` | Frozen POT after the week |
| `fixed` | Frozen fixed bill total used |
| `finalizedAt` | Date user finalized the week |

## POT

POT is the weekly rolling cushion.

For open weeks:

```txt
leftover = weekly allowance - spent
ending POT = starting POT + leftover
```

For finalized weeks, use frozen values.

Opening POT is the starting point before the first tracked/finalized week.

## cash

Cash-flow settings.

Example:

```js
{
  cashStart: 0,
  paycheckAmount: 2854.34,
  payday1: 5,
  payday2: 20,
  rentDueDay: 30,
  rentAmount: 3098,
  ccDueDay: 14,
  ccPaymentAmount: 0,
  bufferTarget: 2000,
  locked: true
}
```

Cash-flow constants are locked by default.

## plannedExpenses

One-off future or outstanding expenses.

Example:

```js
{
  date: "2026-07-15",
  desc: "Sister bachelorette trip flights",
  type: "Trip/Travel",
  amount: 350,
  paid: false
}
```

Only unpaid planned expenses should affect future cash-flow projection.

Paid planned expenses should remain visible as history.

## Separation of concepts

Do not merge these concepts:

| Concept | Purpose |
|---|---|
| Weekly budget | How much can be spent weekly |
| POT | Weekly leftover cushion |
| Fixed bills | Recurring monthly obligations |
| Cash flow | Actual timing of income/outflows |
| Planned expenses | Specific upcoming one-off costs |

Cash flow can reference rent/pay/card/planned expenses, but it should not preload POT as starting cash.
