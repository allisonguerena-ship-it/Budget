// Cloud Sync Initialization
// This module sets up Supabase and cloud sync

// Import Supabase client from CDN (can also use npm package)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

class CloudSync {
  constructor(config) {
    this.config = config;
    this.supabase = null;
    this.auth = null;
    this.dataClient = null;
    this.storageAdapter = null;
    this.initialized = false;
  }

  /**
   * Initialize cloud sync with Supabase
   */
  async init(authManager) {
    if (!this.config.url || !this.config.anonKey) {
      console.warn("Cloud sync not configured - using localStorage only");
      return false;
    }

    try {
      // Initialize Supabase client
      // Assumes @supabase/supabase-js is loaded globally as `supabase`
      if (typeof window.supabase === "undefined") {
        throw new Error("Supabase client not loaded. Add script tag to HTML.");
      }

      this.supabase = window.supabase.createClient(this.config.url, this.config.anonKey);
      this.auth = authManager;
      this.dataClient = new SupabaseDataClient(this.supabase);
      this.storageAdapter = new StorageAdapter(false); // Start with localStorage only

      // Check for existing user session
      const user = await this.auth.init(this.supabase);
      if (user) {
        await this.enableCloudSync(user.id);
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize cloud sync:", error);
      return false;
    }
  }

  /**
   * Enable cloud sync after user login
   */
  async enableCloudSync(userId) {
    try {
      await this.storageAdapter.init(this.dataClient, userId);
      console.log("Cloud sync enabled for user:", userId);
      return true;
    } catch (error) {
      console.error("Failed to enable cloud sync:", error);
      return false;
    }
  }

  /**
   * Disable cloud sync on logout
   */
  disableCloudSync() {
    if (this.storageAdapter) {
      this.storageAdapter.disableCloud();
    }
  }

  /**
   * Migrate local data to cloud (call after login)
   */
  async migrateLocalDataToCloud(localData) {
    try {
      console.log("Starting migration of local data to cloud...");
      const user = this.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      await this.storageAdapter.syncFullData(localData);
      console.log("Migration complete!");
      return true;
    } catch (error) {
      console.error("Migration failed:", error);
      return false;
    }
  }

  /**
   * Get data from appropriate source (cloud or localStorage)
   */
  async loadData() {
    return this.storageAdapter.loadData();
  }

  /**
   * Save data (will sync to cloud if enabled)
   */
  async saveData(data) {
    return this.storageAdapter.save(data);
  }

  /**
   * Queue a specific change for sync
   */
  queueChange(changeType, changeData) {
    this.storageAdapter.queueChange(changeType, changeData);
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return this.storageAdapter.getSyncStatus();
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(callback) {
    if (!this.initialized || !this.auth.isAuthenticated()) {
      console.warn("Not authenticated - cannot subscribe to updates");
      return null;
    }

    const user = this.auth.getUser();
    return this.dataClient.subscribeToUpdates(user.id, callback);
  }

  /**
   * Sign up for new account
   */
  async signup(email, password, displayName = "") {
    const result = await this.auth.signup(email, password, displayName);
    if (result.success && this.auth.isAuthenticated()) {
      const user = this.auth.getUser();
      await this.enableCloudSync(user.id);
    }
    return result;
  }

  /**
   * Login with email and password
   */
  async login(email, password) {
    const result = await this.auth.login(email, password);
    if (result.success && this.auth.isAuthenticated()) {
      const user = this.auth.getUser();
      await this.enableCloudSync(user.id);
    }
    return result;
  }

  /**
   * Login with Google
   */
  async loginWithGoogle() {
    return this.auth.loginWithGoogle();
  }

  /**
   * Logout
   */
  async logout() {
    const result = await this.auth.logout();
    this.disableCloudSync();
    return result;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  /**
   * Get current user
   */
  getUser() {
    return this.auth.getUser();
  }

  /**
   * Subscribe to auth changes
   */
  onAuthChange(callback) {
    return this.auth.onChange(callback);
  }
}

// Export as global or module
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CloudSync, authManager, SupabaseDataClient, StorageAdapter };
}
