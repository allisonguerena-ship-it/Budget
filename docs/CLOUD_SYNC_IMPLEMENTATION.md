# Cloud Sync Implementation Plan

## Overview

Implement multi-device sync using Supabase as the backend.

- **Auth:** Supabase Auth (email/password, Google OAuth)
- **Database:** PostgreSQL via Supabase
- **Real-time:** Supabase Realtime subscriptions
- **Fallback:** localStorage continues to work offline

## Architecture

### Storage Strategy

1. **Primary:** Cloud (Supabase) when authenticated and online
2. **Fallback:** localStorage for offline mode
3. **Sync:** Auto-sync to cloud when online; queue changes offline; sync on reconnect

### Authentication

- Email/password sign-up and login
- Optional: Google OAuth
- Session persisted in localStorage (secure, httpOnly flag not available in browser)
- Logout clears session and local budget data

### Database Schema

#### Users Table (Supabase Auth handles this)

```sql
-- Supabase manages this automatically
-- User ID from auth.users
```

#### budgets table

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_month TEXT,
  income DECIMAL(10, 2),
  opening_pot DECIMAL(10, 2),
  learned_categories JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);
```

#### fixed_bills table

```sql
CREATE TABLE fixed_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  amount DECIMAL(10, 2),
  start_date TEXT,
  end_date TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### cash_flow_settings table

```sql
CREATE TABLE cash_flow_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cash_start DECIMAL(10, 2),
  paycheck_amount DECIMAL(10, 2),
  payday_1 INTEGER,
  payday_2 INTEGER,
  rent_due_day INTEGER,
  rent_amount DECIMAL(10, 2),
  cc_due_day INTEGER,
  cc_payment_amount DECIMAL(10, 2),
  buffer_target DECIMAL(10, 2),
  locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);
```

#### planned_expenses table

```sql
CREATE TABLE planned_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT,
  description TEXT,
  type TEXT,
  amount DECIMAL(10, 2),
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### months table

```sql
CREATE TABLE months (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key TEXT, -- "2026-07"
  week_starts JSONB, -- array of week start dates
  expenses JSONB DEFAULT '[]'::jsonb,
  finalized_weeks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, month_key)
);
```

## Implementation Phases

### Phase 1: Setup & Auth
1. Create Supabase project
2. Add auth UI (login/signup/logout)
3. Create authentication module (`js/auth.js`)
4. Create Supabase client module (`js/supabase-client.js`)

### Phase 2: Storage Abstraction
1. Create storage adapter layer that supports both localStorage and Supabase
2. Update `js/storage.js` to use adapter
3. Add sync logic: queue changes, sync on reconnect

### Phase 3: Data Migration
1. Create migration UI for existing localStorage → Supabase
2. Add schema setup endpoint
3. Test data integrity after migration

### Phase 4: Real-time Sync
1. Add Supabase Realtime subscriptions
2. Handle conflict resolution (last-write-wins or merge strategy)
3. Add sync status indicator in UI

## Implementation Files

- **js/auth.js** – Authentication (login, signup, logout, session)
- **js/supabase-client.js** – Supabase client and queries
- **js/storage-adapter.js** – Abstraction layer for localStorage/Supabase
- **js/sync.js** – Sync logic (offline queue, conflict resolution)
- **docs/SUPABASE_SETUP.md** – Setup instructions for developers
- **index.html** – Add auth UI (modal or page)

## Configuration

Environment variables needed:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

For now, can be hardcoded in `.env` or config file (not committed to repo).

## Offline Mode

- All changes write to localStorage immediately
- Queue API calls when offline
- Sync queue when connection returns
- Show connection status indicator

## Security Notes

- User can only see/modify their own data (Supabase RLS policies)
- No encryption at rest needed for this use case (Supabase is hosted)
- Consider encrypting sensitive fields client-side if desired
- Budget data should not include full account numbers, just references

## Backwards Compatibility

- Existing localStorage data continues to work without auth
- New users can choose to log in or stay local-only
- Logging in prompts migration of local data to cloud
