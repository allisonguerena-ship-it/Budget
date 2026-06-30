# Skill: Finalized Weeks and POT

Use this skill whenever editing week finalization, freezing, or POT.

## Finalized week definition

A finalized week is frozen.

It should preserve:

- Week start date
- Fixed bills used
- Weekly allowance
- Spent
- Left over
- Starting POT
- Ending POT
- Finalized date

## POT logic

```txt
leftover = weekly allowance - spent
ending POT = starting POT + leftover
```

If leftover is negative, subtract from POT.

If leftover is positive, add to POT.

## Frozen behavior

Future changes to income or fixed bills must not rewrite finalized weeks.

The user may manually unfinalize a week to recalculate it.

## UI behavior

Finalized weeks should:

- Show a finalized badge
- Disable editing
- Offer an Unfinalize button
- Show the finalized date if available

Open weeks should:

- Offer Add cost
- Offer Finalize week
