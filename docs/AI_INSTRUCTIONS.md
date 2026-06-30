# AI Editing Instructions

These instructions are for any LLM, coding assistant, or AI editor modifying this repository.

## Project identity

This is a personal budgeting app called **POT Budget**.

The app is not a generic expense tracker. It is built around a specific weekly allowance and POT logic.

Do not remove the personal finance logic to make the app more generic.

## Highest-priority rules

1. Preserve the weekly allowance formula.
2. Preserve fixed bill start/end date behavior.
3. Preserve finalized week freezing.
4. Preserve POT behavior.
5. Keep cash-flow planning separate from weekly budgeting.
6. Preserve category learning/autofill.
7. Preserve localStorage migration when changing storage keys.
8. Keep the UI simple, clear, and non-cluttered.
9. **Do not add unnecessary features or filters.** Keep the app focused and functional.
10. **Prioritize multi-device sync over nice-to-have cosmetic features.**

## Weekly allowance formula

The weekly allowance must be:

```txt
(monthly income - fixed bills active for that week) * 12 / 365 * 7
```

Do not use:

```txt
monthly leftover / 4
monthly leftover / 4.5
monthly leftover / 5
```

Reason: every week is 7 days, but months do not all contain the same number of weeks.

## Fixed bills

Fixed bills are the source of truth for monthly fixed costs.

Examples:

- Rent
- Parking
- Pet rent
- Car payment
- Car insurance
- Health insurance
- Phone
- Subscriptions
- Utilities
- Debt payments

Each fixed bill should have:

- Name
- Category
- Monthly amount
- Start date
- Optional end date
- Active/inactive status

The total fixed bills number should be calculated from the fixed bill rows. It should not be a manually edited standalone number.

## Date-based fixed bill behavior

If a user changes a fixed bill, cancels a subscription, or adds a new bill, that change should apply only to dates where the bill is active.

A fixed bill should be active for a week if the bill's active date range includes that week's start date.

Do not let a future cancellation increase past weekly allowance.

Do not let a future cancellation falsely add money to past POT.

## Finalized weeks

Each week should have a way to finalize or freeze it.

When a week is finalized, freeze:

- Week start date
- Monthly fixed bill total used for that week
- Weekly allowance
- Spending
- Left over
- Starting POT
- Ending POT
- Finalized date

After a week is finalized, future changes to fixed bills or income should not rewrite that week's allowance or POT.

Only change a finalized week if the user manually unfinalizes it.

## POT behavior

POT means the leftover running cushion after each week.

For an open/unfinalized week:

```txt
leftover = weekly allowance - amount spent
ending POT = starting POT + leftover
```

If leftover is negative, it subtracts from POT.

If leftover is positive, it adds to POT.

When a week is finalized, that weekly result becomes locked.

POT should not be preloaded into the cash-flow planner.

## Opening POT

Opening POT is the starting cushion before the first tracked/finalized week.

Do not automatically load or estimate POT from cash-flow starting cash.

POT and cash flow are related conceptually, but they should remain separate app concepts.

## Weekly/monthly history

The app may show months for navigation, but the budget math is weekly.

A month can contain 4, 5, or partial-view weeks depending on how the app displays it.

The allowance formula should not depend on how many weeks are visible in a month.

## Cash-flow planner

Cash-flow planning is a separate section/sub-app.

It is for actual date timing, such as:

- Paychecks
- Rent due date
- Credit card due date
- Planned one-off expenses
- Safety buffer

Cash-flow constants should be locked by default:

- Pay dates
- Paycheck amount
- Rent due date
- Rent amount
- Credit card due date

There should be an unlock button for editing those values.

Manual starting cash is required because the app cannot read the user's bank account.

If starting cash is blank or zero, show a clear warning that the projection may look wrong.

Do not automatically use POT as cash-flow starting cash.

## Planned expenses

Planned expenses are for one-off or future costs, such as:

- Sister bachelorette trip flights
- Hotel deposit
- Moving costs
- Gifts
- Annual bills
- Medical costs

Planned expenses should have:

- Date
- Description
- Type/category
- Amount
- Paid/outstanding status

Outstanding planned expenses should appear in the cash-flow timeline.

Paid planned expenses should stay in history but stop affecting the future projection.

## Fixed bills UI

The fixed bills section should be collapsible/dropdown by default because it can contain many rows.

Do not put all fixed bill rows permanently expanded at the top unless the user explicitly asks.

## Category learning/autofill

Preserve category learning.

If the user types a description like "Trader Joe's" and assigns it to Groceries, the app should remember that association.

Future entries with matching or similar descriptions should autofill the learned category.

Do not remove this logic when refactoring.

## Local storage and migration

The app stores user data in browser `localStorage`.

When changing the storage key, migrate old saved data from previous keys if possible.

Do not wipe or ignore old app data unless the user explicitly asks.

Recommended pattern:

```js
const STORAGE_KEY = "alli_pot_budget_app_vX";
const OLD_KEYS = ["alli_pot_budget_app_vPrevious"];
```

Then load from the current key first, and fall back to older keys.

## Styling preferences

Keep the app:

- Simple
- Clean
- Soft/color-coordinated
- Easy to use
- Not overly technical
- Mobile-friendly
- Visually separated by week
- Clear about what is editable vs locked

Current aesthetic:

- Cream background
- Soft pink
- Sage green
- Warm gold
- Rounded cards
- Collapsible sections
- Calm dashboard feel

## Do not do these things

Do not:

- Replace the 7-day allowance formula with monthly/4 math.
- Make fixed bills a single manually edited number only.
- Recalculate finalized weeks unless manually unfinalized.
- Use POT as cash-flow starting cash.
- Remove category learning.
- Remove localStorage migration.
- Make the fixed bills section permanently huge and expanded.
- Combine weekly budget and cash-flow logic into one confusing number.
- Assume a month has exactly 4 weeks.
- Hide the financial assumptions from the user.

## Safe edit strategy

When modifying the app:

1. Identify which part is affected:
   - Core budget
   - Fixed bills
   - Weekly entries
   - Finalized weeks
   - POT
   - Cash flow
   - Planned expenses
   - UI only
2. Preserve existing data model fields.
3. Add migration code if fields change.
4. Test that:
   - Fixed bill changes affect future open weeks only.
   - Finalized weeks stay frozen.
   - Weekly allowance uses active fixed bills.
   - POT changes by weekly leftover.
   - Cash flow does not preload POT.
5. Keep the UI concise and understandable.
