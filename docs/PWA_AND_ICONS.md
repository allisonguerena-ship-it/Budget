# PWA and Icons

POT Budget should behave like an installable personal app.

It should work well when saved to an iPhone home screen.

## Required app files

Keep:

- `manifest.json`
- `service-worker.js`
- `index.html`

## Recommended icons

Use an `icons/` folder with:

- `favicon.ico`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `maskable-icon.png`

## Manifest rules

`manifest.json` should include:

- App name
- Short name
- Theme color
- Background color
- Display mode
- Start URL
- Icons

## iPhone support

`index.html` should include Apple home-screen tags when possible:

- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-title`
- `apple-touch-icon`

## Service worker rules

Do not break offline support.

When changing cached files, update the cache version.

Do not cache secrets or private config files.

## Config safety

Do not commit real Supabase credentials.

Keep:

- `js/config.template.js`

Ignore:

- `js/config.js`
