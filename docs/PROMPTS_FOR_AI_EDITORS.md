# Prompts for AI Editors

Use these prompts with Cursor, Claude Code, GitHub Copilot Chat, or ChatGPT.

## General edit prompt

```txt
Read AI_INSTRUCTIONS.md and DATA_MODEL.md first. Then make the requested change without breaking the weekly allowance formula, fixed bill effective dates, finalized weeks, POT behavior, cash-flow separation, category learning, or localStorage migration.
```

## Bug fix prompt

```txt
Find the bug causing [describe issue]. Before changing code, identify whether the bug affects core budget logic, fixed bills, finalized weeks, POT, cash flow, planned expenses, or UI only. Preserve all rules in AI_INSTRUCTIONS.md.
```

## Feature prompt

```txt
Add [feature]. It should fit the existing app structure and preserve the finance logic in AI_INSTRUCTIONS.md. If data fields change, add migration support from older localStorage keys.
```

## Refactor prompt

```txt
Refactor this code for clarity without changing behavior. Do not change the data model unless necessary. Preserve all formulas, finalized week logic, and localStorage migration.
```

## Data backup prompt

```txt
Add JSON export/import. Export should download the full app data object. Import should validate the JSON, replace local app data, save it to localStorage, and re-render the app. Do not remove CSV export.
```

## Testing prompt

```txt
Create a manual test checklist for this app. Include tests for changing a fixed bill in the future, finalizing a week, unfinalizing a week, adding a planned expense, locking cash-flow constants, and category autofill.
```
