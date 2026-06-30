# Cloud Sync Integration Guide

This guide explains how to integrate cloud sync into the existing POT Budget app.

## Overview

The cloud sync system allows POT Budget to work on multiple devices by syncing data to Supabase.

**Key features:**
- Works offline (localStorage is always primary)
- Queues changes when offline, syncs when online
- Can be disabled (use localStorage only)
- Optional login (existing users can keep using local-only mode)

## Architecture

```
App (index.html, app.js)
  ↓
CloudSync (js/cloud-sync.js)
  ├─ AuthManager (js/auth.js) - handles login/signup
  ├─ StorageAdapter (js/storage-adapter.js) - localStorage ↔ cloud sync
  └─ SupabaseDataClient (js/supabase-client.js) - Supabase queries
```

## Files Added

| File | Purpose |
|------|---------|
| `js/auth.js` | Authentication (login, signup, logout) |
| `js/supabase-client.js` | Supabase database queries |
| `js/storage-adapter.js` | Abstraction for localStorage + cloud |
| `js/cloud-sync.js` | Main orchestrator |
| `js/config.template.js` | Configuration template |
| `docs/CLOUD_SYNC_IMPLEMENTATION.md` | Technical design |
| `docs/SUPABASE_SETUP.md` | Supabase setup steps |

## Integration Steps

### 1. Update index.html

Add Supabase client library to `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Add auth UI elements (can be a modal or separate page). Example:

```html
<div id="auth-modal" style="display:none;">
  <h2>POT Budget</h2>
  <div id="auth-content">
    <!-- Login form or signup form goes here -->
  </div>
</div>
```

### 2. Update js/app.js

Before loading data, initialize cloud sync:

```javascript
// At the top of app.js
import { CloudSync, authManager } from './cloud-sync.js';
import { SUPABASE_CONFIG, FEATURES } from './config.js';

let cloudSync = null;

async function initializeApp() {
  // Initialize cloud sync
  if (FEATURES.enableCloudSync) {
    cloudSync = new CloudSync(SUPABASE_CONFIG);
    const syncReady = await cloudSync.init(authManager);
    
    if (syncReady && cloudSync.isAuthenticated()) {
      // User is logged in - offer migration
      const user = cloudSync.getUser();
      console.log("User authenticated:", user.email);
    }
  }

  // Load data (from cloud if logged in, otherwise localStorage)
  if (cloudSync) {
    data = await cloudSync.loadData();
  } else {
    data = loadData(); // fallback to localStorage
  }

  // Rest of initialization...
  initializeUI();
}

initializeApp();
```

### 3. Update js/storage.js

Replace `save()` function:

```javascript
function save() {
  if (cloudSync && cloudSync.isAuthenticated()) {
    cloudSync.saveData(data);
  } else {
    // Fallback to localStorage
    const STORAGE_KEY = "alli_pot_budget_app_v5";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
```

### 4. Create Auth UI Component

Create `js/auth-ui.js` to handle login/signup modal:

```javascript
class AuthUI {
  constructor(cloudSync) {
    this.cloudSync = cloudSync;
  }

  showLoginModal() {
    // Show modal, handle form submission
    // Call this.cloudSync.login(email, password)
  }

  showSignupModal() {
    // Show modal, handle form submission
    // Call this.cloudSync.signup(email, password, name)
  }

  showMigrationPrompt() {
    // Ask user if they want to migrate local data to cloud
    // Call this.cloudSync.migrateLocalDataToCloud(data)
  }

  showSyncStatus() {
    // Display sync status indicator
    const status = this.cloudSync.getSyncStatus();
    // Update UI with: isOnline, isSyncing, queueLength
  }
}
```

### 5. Configure Supabase

1. Copy `js/config.template.js` to `js/config.js`
2. Follow [docs/SUPABASE_SETUP.md](SUPABASE_SETUP.md) to create Supabase project
3. Fill in `url` and `anonKey` in `js/config.js`

**Do NOT commit `js/config.js` with real credentials** - add to `.gitignore`:

```
js/config.js
```

### 6. Test Locally

```bash
# Open in browser
open index.html

# Test localStorage (without auth)
# - Add data, refresh page, verify it persists

# Test cloud sync (with auth)
# - Sign up, add data
# - Check Supabase table editor for data
# - Open on another device/browser with same account
# - Verify data syncs
```

## Optional: Setup GitHub Actions

Add automatic deployment to GitHub Pages with Supabase:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

## Usage

### For Users (End-User Perspective)

**Without Cloud Sync:**
- Use app locally
- Data saved in browser storage
- Works offline
- Clears if browser storage is cleared

**With Cloud Sync:**
- Sign up → data synced to cloud
- Use on any device with same account
- Works offline → syncs when back online
- Data persists even if browser storage is cleared

### For Developers

**Query changes:**
```javascript
// Queue a change for sync
cloudSync.queueChange("budget_update", {
  currentMonth: "2026-07",
  income: 5708.68
});

// Or save full data
cloudSync.saveData(data);
```

**Check sync status:**
```javascript
const status = cloudSync.getSyncStatus();
console.log(status);
// { isOnline: true, isSyncing: false, queueLength: 0, useCloud: true }
```

**Subscribe to real-time updates:**
```javascript
cloudSync.onAuthChange((user) => {
  console.log("Auth changed:", user);
});

if (cloudSync.isAuthenticated()) {
  const unsubscribe = cloudSync.subscribeToUpdates((payload) => {
    console.log("Data updated from another device:", payload);
    // Refresh UI if needed
  });
}
```

## Troubleshooting

### "Supabase client not loaded"

Add to `index.html` `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Data not syncing to cloud

1. Check if user is authenticated: `cloudSync.isAuthenticated()`
2. Check browser console for errors
3. Verify Supabase project is set up correctly
4. Check Supabase RLS policies allow inserts/updates

### Sync queue keeps growing

- Check network connection
- Look for errors in browser console
- Verify Supabase credentials in `js/config.js`

### Migration prompt not showing

- User needs to be authenticated first
- Call `cloudSync.migrateLocalDataToCloud(data)` after login

## Next Steps

1. Set up Supabase account and database
2. Create `js/config.js` with credentials
3. Add auth UI to `index.html`
4. Test login and data sync
5. Deploy to GitHub Pages
6. Test cross-device sync
