# Tools and Skills Needed

## Current app type

POT Budget is a static web app.

Current skills needed:

- HTML
- CSS
- JavaScript
- Browser localStorage
- Basic finance logic
- Git/GitHub
- GitHub Pages deployment

No backend is currently required.

## Recommended tools

### Code editor

Use one:

- Cursor
- VS Code + GitHub Copilot
- VS Code + Continue extension
- Claude Code if comfortable with terminal-based coding

For this specific app, Cursor is probably the easiest because it can read the whole repo and edit multiple files.

### Local server

Use one:

- VS Code Live Server extension
- `npx serve`
- Python local server

Examples:

```bash
python3 -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```

### Browser dev tools

Use Chrome or Safari developer tools to inspect:

- Console errors
- Application storage
- localStorage
- Service worker/cache behavior

### GitHub Pages

Use GitHub Pages to host the static app.

### Optional future tools

If the app grows:

| Need | Recommended tool |
|---|---|
| Multi-device sync | Supabase or Firebase |
| Login | Supabase Auth or Firebase Auth |
| Larger local data | IndexedDB |
| Charts | Chart.js |
| Automated tests | Playwright |
| Formatting | Prettier |
| Type safety | TypeScript |
| App framework | React or Svelte |

## Skills to preserve

### Finance logic

The app is not just a pretty expense tracker.

Core finance skills needed:

- Difference between budget allowance and cash flow
- Effective-dated fixed bills
- Finalized/frozen historical records
- Running POT/cushion logic
- Planned expenses vs recurring expenses
- Paycheck timing vs spending allowance

### UX logic

Important UX skills:

- Keep sections collapsible
- Keep fixed bills hidden unless needed
- Keep weekly cards visually separated
- Make locked vs editable fields obvious
- Avoid overwhelming the user

### Data design

Important data skills:

- localStorage persistence
- Migration between app versions
- JSON backup/import
- Avoid breaking old saved data
- Do not change field names without migration

## Recommended next feature

Add JSON backup/import before adding cloud sync.

This solves the immediate problem of app-entered local data not being visible to VS Code or an LLM.
