# GitHub Copilot Instructions

Before suggesting or making changes, follow the repo rules in:

- `docs/AI_INSTRUCTIONS.md`
- `docs/DATA_MODEL.md`
- `docs/CHANGELOG.md`

## Core rules to preserve

- Weekly allowance must be calculated as:
  `(monthly income - fixed bills active for that week) * 12 / 365 * 7`
- Do not divide monthly leftover by 4, 4.5, or 5.
- Fixed bills must use start/end dates.
- Fixed bill changes should affect future/unfinalized weeks only.
- Finalized weeks must stay frozen unless manually unfinalized.
- POT should update from weekly leftover or negative amounts.
- Do not preload POT into cash-flow projections.
- Keep cash-flow planner separate from weekly budget.
- Keep cash-flow constants locked by default with an unlock option.
- Keep fixed bills collapsible/dropdown because there can be many rows.
- Preserve category learning/autofill.
- Preserve localStorage migration when changing storage keys.
- **Do not add random features or unnecessary filters.** Keep it simple and functional.
- **Prioritize multi-device sync support (cloud sync).**

## Editing style

Keep the app simple, soft, mobile-friendly, and easy to use. Do not make the UI more technical or cluttered unless requested.

## Development philosophy

Before making changes:

1. Read the relevant files in the `/docs` folder.
2. Explain the implementation plan.
3. Prefer the smallest safe change.
4. Preserve backwards compatibility.
5. Test before considering work complete.

If documentation conflicts with assumptions, documentation always wins.
