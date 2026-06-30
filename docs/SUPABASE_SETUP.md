# Supabase Setup Guide

## Overview

This guide walks through setting up Supabase for POT Budget's multi-device sync.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** `pot-budget` (or your choice)
   - **Database Password:** Create a strong password
   - **Region:** Choose closest to your location
5. Click "Create new project" and wait for setup (2-3 minutes)

## Step 2: Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (Supabase URL)
   - **anon public** (Public API Key)
3. Keep these safe - you'll use them for configuration

## Step 3: Create Database Schema

1. Go to **SQL Editor**
2. Create a new query and paste the SQL schema below
3. Run the query

### SQL Schema

```sql
-- Users table is managed by Supabase Auth

-- Budgets table
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

-- Fixed bills table
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

-- Cash flow settings table
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

-- Planned expenses table
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

-- Months table
CREATE TABLE months (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key TEXT,
  week_starts JSONB,
  expenses JSONB DEFAULT '[]'::jsonb,
  finalized_weeks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, month_key)
);

-- Create indexes for performance
CREATE INDEX idx_fixed_bills_user ON fixed_bills(user_id);
CREATE INDEX idx_planned_expenses_user ON planned_expenses(user_id);
CREATE INDEX idx_months_user ON months(user_id);
```

## Step 4: Set Up Row Level Security (RLS)

This ensures users can only access their own data.

1. Go to **Authentication** → **Policies**
2. For each table (budgets, fixed_bills, cash_flow_settings, planned_expenses, months), add policies:

### Example for `budgets` table:

**SELECT Policy:**
- Go to `budgets` table
- Click "New Policy"
- Name: `Users can view their own budget`
- Template: `Enable read access for authenticated users`
- Add policy expression:
  ```sql
  (auth.uid() = user_id)
  ```

**INSERT/UPDATE Policy:**
- Name: `Users can update their own budget`
- Template: `Enable write access for authenticated users`
- Add policy expression:
  ```sql
  (auth.uid() = user_id)
  ```

**DELETE Policy:**
- Name: `Users can delete their own budget`
- Template: `Enable delete access for authenticated users`
- Add policy expression:
  ```sql
  (auth.uid() = user_id)
  ```

Repeat for all other tables.

## Step 5: Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** (enabled by default)
3. Optionally enable **Google** for OAuth:
   - Click "Google"
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Paste Client ID and Secret
   - Add redirect URI: `https://[your-supabase-url].supabase.co/auth/v1/callback`

## Step 6: Configure the App

Create a file `js/config.js`:

```javascript
// Supabase Configuration
// Get these values from Supabase Project Settings > API

export const SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_ANON_PUBLIC_KEY"
};

// Feature flags
export const FEATURES = {
  enableCloudSync: true,
  enableGoogleLogin: true
};
```

## Step 7: Test the Setup

1. Start the app locally: `open index.html`
2. Look for a "Sign Up" or "Login" button
3. Test creating an account
4. Verify data syncs to Supabase by checking the **Table Editor** in Supabase
5. Test on another device/browser with the same account

## Troubleshooting

### "Error: [object Object]" on signup

Check browser console (F12) for details. Common causes:
- Weak password (must be 6+ characters)
- Email already in use
- Network error

### Data not syncing to Supabase

1. Check browser console for errors
2. Verify user is authenticated (`authManager.isAuthenticated()`)
3. Check Supabase table for data
4. Verify RLS policies allow insert/update

### "Realtime subscriptions not working"

1. Go to Supabase Project Settings > Realtime
2. Ensure tables have Realtime enabled
3. Check browser WebSocket connection

## Next Steps

- Integrate auth UI into `index.html`
- Add "Migrate Local Data" flow for existing users
- Add sync status indicator to UI
- Set up GitHub Actions for automated deployments
