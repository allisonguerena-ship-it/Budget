// Authentication UI module
// Handles login, signup, and auth status display

class AuthUI {
  constructor() {
    this.modal = document.getElementById('authModal');
    this.emailInput = document.getElementById('authEmail');
    this.passwordInput = document.getElementById('authPassword');
    this.messageEl = document.getElementById('authMessage');
    this.authToggleBtn = document.getElementById('authToggleBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.syncStatusEl = document.getElementById('syncStatus');
    
    // Wait for cloudSync to be available
    this.waitForCloudSync();
  }

  waitForCloudSync() {
    if (typeof cloudSync === 'undefined' || !cloudSync || !cloudSync.initialized) {
      setTimeout(() => this.waitForCloudSync(), 100);
      return;
    }
    
    this.setupAuthListeners();
    this.updateUI();
  }

  setupAuthListeners() {
    if (!cloudSync) return;
    
    // Listen for auth changes
    cloudSync.onAuthChange((user) => {
      this.updateUI();
    });
  }

  toggleAuthModal() {
    if (this.modal.style.display === 'none') {
      this.modal.style.display = 'flex';
      this.emailInput.focus();
    } else {
      this.modal.style.display = 'none';
      this.clearForm();
    }
  }

  async signup() {
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showMessage('⚠️ Email and password required', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('⚠️ Password must be at least 6 characters', 'error');
      return;
    }

    // Disable button during signup
    const signupBtn = document.getElementById('authSignupBtn');
    if (signupBtn) {
      signupBtn.disabled = true;
      signupBtn.textContent = 'Creating account...';
    }

    this.showMessage('⏳ Creating account...', 'loading');
    const result = await cloudSync.signup(email, password);

    if (result.success) {
      this.showMessage(
        `✅ Account created!\n\n📧 Check your email (${email}) for a confirmation link.\n\nOnce you click it, you can log in to sync across devices.`,
        'success'
      );
      
      // Offer to save local data anyway
      setTimeout(() => {
        if (data && Object.keys(data.months || {}).length > 0) {
          if (confirm('Save your current data to this account?\n\n(It will upload once you verify your email and log in)')) {
            localStorage.setItem('pot_account_email_' + email, JSON.stringify(data));
            alert('Data saved locally for ' + email);
          }
        }
      }, 1000);
      
      setTimeout(() => {
        this.clearForm();
        this.modal.style.display = 'none';
      }, 4000);
    } else {
      this.showMessage('❌ Error: ' + result.error, 'error');
    }

    // Re-enable button
    if (signupBtn) {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign up';
    }
  }

  async login() {
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showMessage('⚠️ Email and password required', 'error');
      return;
    }

    // Disable button during login
    const loginBtn = document.getElementById('authLoginBtn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';
    }

    this.showMessage('⏳ Logging in...', 'loading');
    const result = await cloudSync.login(email, password);

    if (result.success) {
      this.showMessage('✅ Login successful! Loading your data...', 'success');
      
      // Check if there's saved local data for this email to migrate
      const savedData = localStorage.getItem('pot_account_email_' + email);
      if (savedData && data && Object.keys(data.months || {}).length > 0) {
        if (confirm('Migrate your local data to the cloud?')) {
          try {
            const result = await cloudSync.migrateLocalDataToCloud(data);
            if (result) {
              alert('✅ Data migrated successfully!');
            }
          } catch (error) {
            console.error('Migration error:', error);
          }
        }
      }
      
      setTimeout(() => {
        this.clearForm();
        this.modal.style.display = 'none';
        this.updateUI();
        location.reload();
      }, 1500);
    } else {
      this.showMessage('❌ Login error: ' + result.error, 'error');
    }

    // Re-enable button
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log in';
    }
  }

  async logout() {
    if (confirm('Log out and clear local data?')) {
      await cloudSync.logout();
      localStorage.removeItem('alli_pot_budget_app_v5');
      this.updateUI();
      location.reload();
    }
  }

  async offerDataMigration() {
    if (confirm('Migrate your existing local data to the cloud?')) {
      try {
        const result = await cloudSync.migrateLocalDataToCloud(data);
        if (result) {
          alert('Data migrated successfully!');
          location.reload();
        } else {
          alert('Migration failed. Check console for details.');
        }
      } catch (error) {
        console.error('Migration error:', error);
        alert('Migration error: ' + error.message);
      }
    }
  }

  updateUI() {
    if (!cloudSync) return;

    const isAuthenticated = cloudSync.isAuthenticated();
    const user = cloudSync.getUser();

    if (isAuthenticated && user) {
      this.authToggleBtn.style.display = 'none';
      this.logoutBtn.style.display = 'inline-block';
      this.syncStatusEl.textContent = `✓ Synced as ${user.email}`;
      this.syncStatusEl.className = 'pill';
    } else {
      this.authToggleBtn.style.display = 'inline-block';
      this.logoutBtn.style.display = 'none';
      this.syncStatusEl.textContent = 'Saves in this browser only';
      this.syncStatusEl.className = 'pill';
    }
  }

  showMessage(msg, type = 'default') {
    this.messageEl.textContent = msg;
    this.messageEl.className = 'auth-message auth-message--' + type;
    this.messageEl.style.display = 'block';
    this.messageEl.style.padding = '12px';
    this.messageEl.style.borderRadius = '8px';
    this.messageEl.style.marginBottom = '12px';
    this.messageEl.style.fontSize = '14px';
    this.messageEl.style.lineHeight = '1.5';
    this.messageEl.style.whiteSpace = 'pre-wrap';
    
    // Color coding
    if (type === 'success') {
      this.messageEl.style.background = '#d4edda';
      this.messageEl.style.color = '#155724';
      this.messageEl.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
      this.messageEl.style.background = '#f8d7da';
      this.messageEl.style.color = '#721c24';
      this.messageEl.style.border = '1px solid #f5c6cb';
    } else if (type === 'loading') {
      this.messageEl.style.background = '#d1ecf1';
      this.messageEl.style.color = '#0c5460';
      this.messageEl.style.border = '1px solid #bee5eb';
    } else {
      this.messageEl.style.background = '#fff3cd';
      this.messageEl.style.color = '#856404';
      this.messageEl.style.border = '1px solid #ffeaa7';
    }
  }

  clearForm() {
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.messageEl.textContent = '';
  }
}

// Initialize auth UI when DOM is ready
window.authUI = new AuthUI();
