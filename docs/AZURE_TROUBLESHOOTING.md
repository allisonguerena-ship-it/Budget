# Azure Troubleshooting

## Error

The user saw an error like:

```txt
Selected user account does not exist in tenant 'Microsoft Services'
and cannot access the application 'c44b4083-3bb0-49c1-b47d-974e53cbdf3c'
in that tenant. The account needs to be added as an external user in the tenant first.
Please use a different account.
```

## What this usually means

This is a Microsoft Entra ID / Azure tenant login issue.

It usually means the Microsoft account being used is trying to access an app or tenant where that account is not recognized as a member or guest.

It does not mean the POT Budget app needs Azure.

## Relevance to this app

For the current POT Budget app:

Azure is not required.

The app is static and uses browser localStorage.

No Azure app registration is needed unless adding Microsoft login, Microsoft Graph, or Azure-hosted backend services.

## What to do now

Recommended:

1. Do not register an Azure app for this localStorage issue.
2. Use GitHub Pages for hosting.
3. Add JSON backup/import for data portability.
4. Consider Supabase later if cloud sync is needed.

## If Azure is still needed later

Use a personal Microsoft account or create/access the correct Azure tenant.

Make sure the account is a member or guest of the tenant being used.

If the tenant belongs to a school/work org, the admin may need to add the user as an external guest.

## Common mistaken assumption

Mistake:

> VS Code cannot see app data, so I need Azure.

Reality:

> VS Code cannot see app data because the data is in browser localStorage, not in the repo.

Cloud sync can solve that, but Azure is only one possible cloud option and is probably not the simplest one.
