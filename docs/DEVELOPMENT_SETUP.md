# Development Setup

This repo is intentionally lightweight.

The app is currently a static browser app:

- `index.html`
- `manifest.json`
- `service-worker.js`
- `icon.svg`

It does not require Azure, a backend, a database, or a build system to run locally.

## Recommended local workflow

Use VS Code with a simple local server.

Recommended extensions are listed in:

```txt
.vscode/extensions.json
```

The simplest option is **Live Server**.

## How to run locally

1. Open the repo folder in VS Code.
2. Right-click `index.html`.
3. Click **Open with Live Server**.
4. Use the browser tab that opens.

Do not rely on double-clicking the HTML file forever because `file://` origins can behave differently from a real local server.

## Where app data is stored

The app saves user-entered data in browser `localStorage`.

That means:

- Expenses entered in the browser are not saved into `index.html`.
- VS Code cannot automatically see expenses entered in the app.
- GitHub cannot automatically see local browser data.
- An LLM editing the source code cannot see the browser’s saved app data.

This is normal for static browser apps.

## How to move data between browser and code

Use one of these options:

### Option A: CSV export

The app has an export CSV feature.

Use this before major code changes.

### Option B: JSON backup/import

Recommended future feature.

Add buttons:

- Export JSON backup
- Import JSON backup

This would allow the app state to be saved as a file and reloaded later.

### Option C: Cloud database

Only needed if you want:

- Sync across devices
- Login
- Data available to the app from anywhere
- Data not tied to one browser

Good options:

- Supabase
- Firebase
- SQLite with a backend
- GitHub Gist only for personal experimental use

Azure is not required for the current version.

## GitHub Pages

GitHub Pages hosts the app files.

GitHub Pages does not automatically store app data.

If the app is opened from the same GitHub Pages URL, browser `localStorage` usually remains available for that site unless the user clears browser data.

## Safe update process

Before replacing app files:

1. Open the live app.
2. Export CSV backup.
3. Replace files in GitHub.
4. Commit changes.
5. Reopen the same GitHub Pages URL.
6. Confirm data migrated/loaded.
