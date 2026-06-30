# Local Data and Storage

## Important concept

The app has two separate things:

1. **Source code**
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
   - `icon.svg`

2. **User data**
   - Expenses
   - Fixed bills
   - Planned expenses
   - Finalized weeks
   - Category learning
   - Cash-flow settings

The source code lives in GitHub/VS Code.

The user data lives in the browser's `localStorage`.

## Why VS Code cannot see expenses added in the browser

When you add an expense in the app, JavaScript runs this kind of logic:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
```

That stores the data in the browser for that site.

It does not edit the app files.

So VS Code and GitHub do not know about those inline app changes.

## Why an LLM cannot see app-entered data

If an LLM is editing the repo, it can see the code files.

It cannot see browser `localStorage` unless you export the data and give it the file.

## Recommended solution

Add JSON backup/import.

### Export JSON backup

This should download the full app data object, not just CSV.

### Import JSON backup

This should let the user upload a JSON backup and restore app data.

## Future cloud sync

If the user wants real multi-device sync, add a backend.

Recommended options:

| Tool | Why |
|---|---|
| Supabase | Simple database + auth, good free tier |
| Firebase | Good for auth + real-time sync |
| IndexedDB | Better local-only storage |
| GitHub Gist | Possible for personal hacky backup, not ideal |

## Do not use Azure just to save local data

Azure App Registration is for Microsoft identity/authentication and API access.

It is not needed for this app unless the user explicitly wants Microsoft login or Azure-hosted cloud sync.
