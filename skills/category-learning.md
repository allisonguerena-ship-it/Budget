# Skill: Category Learning

Use this skill whenever editing expense descriptions or categories.

## Behavior

When the user types a description and assigns a category, the app should remember that association.

Example:

```txt
Trader Joe's -> Groceries
Waymo -> Uber/Waymo
```

Future matching descriptions should autofill the category.

## Normalization

Descriptions should be normalized before matching:

- Lowercase
- Remove punctuation/apostrophes
- Trim spaces
- Collapse repeated spaces

## Preserve this feature

Do not remove category learning when refactoring expense rows.
