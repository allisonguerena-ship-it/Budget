# Components

## Metric card

Purpose: show a high-level number.

Examples:

- Current weekly allowance
- Spent in view
- Left over in view
- Projected POT

Rules:

- Use a short uppercase label.
- Use a large value.
- Use one helper sentence.
- Do not overload with multiple numbers.

## Weekly budget card

Each week should be its own card.

Required content:

- Week number
- Date range
- Finalized/open status
- Fixed bills used
- Weekly allowance
- Spent
- Left over
- POT after week
- Expense rows
- Add cost button
- Finalize week or Unfinalize week button

Rules:

- Left over should be visually emphasized more than POT.
- POT should be visible but not the main emotional focus.
- Finalized weeks should look locked/frozen.
- Frozen weeks should disable editing unless unfinalized.

## Fixed bills dropdown

Purpose: hold recurring monthly costs without cluttering the app.

Rules:

- Collapsed by default.
- Show total fixed bills in the main dashboard.
- Rows should include name, category, monthly amount, start date, end date, active status.
- AI tools should never replace this with one flat fixed-cost input only.

## Cash-flow planner

Purpose: date timing, not allowance.

Should be separate from weekly budget, preferably a tab or separate section.

Required:

- Manual starting cash
- Paycheck amount
- Pay dates
- Rent due date
- Rent amount
- Credit card due date
- Credit card payment
- Safety buffer
- Planned expenses
- Timeline

Rules:

- Locked constants by default.
- Unlock button required.
- Warn when starting cash is zero/blank.
- Do not preload POT as starting cash.

## Planned expense row

Fields:

- Date
- Description
- Type
- Amount
- Paid/outstanding

Rules:

- Outstanding affects cash-flow timeline.
- Paid stays in history but stops affecting projection.

## Collapsible section

Use for:

- Fixed bills
- Advanced settings
- Data tools
- Long history sections

Rules:

- Keep summary label clear.
- Add helper text explaining what is inside.
- Do not hide primary weekly budget cards.

## Tabs

Use tabs when switching mental modes.

Current recommended tabs:

- Weekly budget
- Cash-flow planner

Do not mix cash-flow projection into weekly allowance cards too heavily.
