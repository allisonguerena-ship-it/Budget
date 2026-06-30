// Cloud Sync Configuration Template
// Rename to config.js and fill in your Supabase credentials

export const SUPABASE_CONFIG = {
  // Get these from Supabase Project Settings > API
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_ANON_PUBLIC_KEY"
};

// Feature flags
export const FEATURES = {
  enableCloudSync: true,
  enableGoogleLogin: false, // Set to true after configuring Google OAuth
  enableAutoSync: true,
  showSyncStatus: true
};

// Optional: Logging
export const DEBUG = {
  logSync: true,
  logAuth: true,
  logStorage: false
};
