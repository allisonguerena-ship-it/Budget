# Cloud Sync Options

The current app is local-first and browser-only.

Cloud sync is optional.

## Why cloud sync might be needed

Add cloud sync only if the user wants:

- Same data on phone and laptop
- Login
- Backups without exporting files
- Data available after clearing browser storage
- Data visible to other tools or AI workflows

## Option 1: Supabase

Recommended first cloud option.

Pros:

- Free tier is usually enough for personal app use
- Database + auth in one place
- Easier than Azure for this use case
- Works well with JavaScript apps

Use for:

- User login
- Budget data table
- Expense table
- Fixed bill table
- Planned expense table

## Option 2: Firebase

Also a good option.

Pros:

- Good auth
- Good real-time sync
- Common for small apps

Cons:

- Data model can feel less intuitive than SQL
- Security rules need care

## Option 3: Azure

Not recommended for this personal app right now.

Azure is powerful, but it is more complex than needed.

Use Azure only if:

- The user wants Microsoft login
- The app needs Microsoft Graph integration
- The app is being deployed into a work Microsoft tenant
- There is a specific Microsoft cloud requirement

## Option 4: GitHub Gist backup

Possible but hacky.

Could save encrypted JSON backups to a private Gist.

Not recommended for sensitive financial data unless implemented carefully.

## Current recommendation

Do this order:

1. Keep localStorage.
2. Add JSON export/import.
3. Deploy to GitHub Pages.
4. Add Supabase only if multi-device sync becomes necessary.

## Security note

Budget data can be sensitive.

Do not add cloud sync without thinking through:

- Authentication
- Access control
- Backups
- Encryption
- What data is stored
