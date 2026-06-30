# TODO

## High priority

- **[IN PROGRESS]** Add cloud sync with Firebase or Supabase (multi-device support).
  - ✅ Cloud sync architecture designed
  - ✅ Auth module created
  - ✅ Supabase data client created
  - ✅ Storage adapter (offline + cloud) created
  - ✅ Supabase setup guide written
  - ⏳ Integrate into existing app (add auth UI, update storage.js)
  - ⏳ Test multi-device sync
- Test finalized week behavior after changing fixed bills.
- Add import from CSV backup (complement to export).
- Add clearer backup/restore controls.
- Add a warning before changing fixed bills if many future weeks are open.
- Add a compact mobile-first weekly entry mode.

## Medium priority

- Add recurring planned expenses.
- Add paycheck-specific cash-flow view.
- Add category summaries by month.
- Add spending trend chart.
- Add ability to rename week labels.
- Add ability to set a custom first week start date.
- Add option to archive old months.

## Nice to have
- Add login.
- Add iPhone home-screen polish.
- Add dark mode.
- Add custom colors.
- Add reminders for credit card due date or planned expenses.
- Add notes field for fixed bills.
- Add vendor-specific budget insights.

## Finance logic ideas

- Show which fixed bills changed this month.
- Show future allowance changes based on upcoming bill start/end dates.
- Show “rent-heavy week” warnings in cash-flow planner.
- Show outstanding planned expenses separately from normal weekly spending.
- Add “safe to spend before next paycheck” estimate.
- Add “do not go below this cash buffer” warnings.

## Do not forget

- Preserve 7-day weekly allowance formula.
- Preserve finalized week freezing.
- Preserve fixed bill date ranges.
- Keep cash flow separate from POT.
- Keep fixed bills collapsible.
- Keep cash-flow constants locked by default.
- Preserve localStorage migrations.
