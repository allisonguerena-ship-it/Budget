// Authentication module for Supabase
// Handles login, signup, logout, and session management

class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.listeners = [];
  }

  /**
   * Initialize auth from stored session
   */
  async init(supabaseClient) {
    this.supabase = supabaseClient;
    
    // Check for existing session
    const stored = localStorage.getItem("pot_auth_session");
    if (stored) {
      try {
        this.session = JSON.parse(stored);
        this.user = this.session.user;
      } catch (e) {
        console.warn("Failed to restore session:", e);
        this.clearSession();
      }
    }
    
    return this.user;
  }

  /**
   * Sign up with email and password
   */
  async signup(email, password, displayName = "") {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName }
        }
      });

      if (error) throw error;

      // Auto-login after signup
      if (data?.user) {
        this.user = data.user;
        // Note: session may be null until email is confirmed
        this.notifyListeners();
      }

      return { success: true, user: data?.user, message: "Check your email to confirm signup" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log in with email and password
   */
  async login(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.session) {
        this.session = data.session;
        this.user = data.user;
        localStorage.setItem("pot_auth_session", JSON.stringify(this.session));
        this.notifyListeners();
      }

      return { success: true, user: this.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log in with Google OAuth
   */
  async loginWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.supabase.auth.signOut();
      this.clearSession();
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear locally anyway
      this.clearSession();
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.user = null;
    this.session = null;
    localStorage.removeItem("pot_auth_session");
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user && !!this.session;
  }

  /**
   * Subscribe to auth changes
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of auth changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user));
  }

  /**
   * Get authorization header for API calls
   */
  getAuthHeader() {
    if (!this.session?.access_token) {
      return null;
    }
    return {
      Authorization: `Bearer ${this.session.access_token}`
    };
  }
}

// Export singleton instance
const authManager = new AuthManager();
