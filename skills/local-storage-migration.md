# Skill: Local Storage and Migration

Use this skill whenever changing data storage.

## Current storage

The app stores data in browser localStorage.

## Rule

Do not wipe user data.

## Changing storage keys

If changing the storage key, preserve migration from old keys.

Example:

```js
const STORAGE_KEY = "alli_pot_budget_app_v5";
const OLD_KEYS = [
  "alli_pot_budget_app_v4",
  "alli_pot_budget_app_v3",
  "alli_pot_budget_app_v2"
];
```

Load current key first. If missing, try old keys.

## Future recommended feature

Add JSON export/import.

CSV export is useful, but JSON export/import is better for full app backups.
