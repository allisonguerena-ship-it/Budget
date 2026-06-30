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
    if (typeof cloudSync === 'undefined' || !cloudSync) {
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
      this.showMessage('Email and password required');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters');
      return;
    }

    this.showMessage('Signing up...');
    const result = await cloudSync.signup(email, password);

    if (result.success) {
      this.showMessage('Account created! Check your email to confirm.');
      setTimeout(() => {
        this.clearForm();
        this.modal.style.display = 'none';
        
        // Offer to migrate existing local data
        if (data && Object.keys(data.months || {}).length > 0) {
          setTimeout(() => this.offerDataMigration(), 500);
        }
      }, 2000);
    } else {
      this.showMessage('Error: ' + result.error);
    }
  }

  async login() {
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showMessage('Email and password required');
      return;
    }

    this.showMessage('Logging in...');
    const result = await cloudSync.login(email, password);

    if (result.success) {
      this.showMessage('Login successful!');
      setTimeout(() => {
        this.clearForm();
        this.modal.style.display = 'none';
        this.updateUI();
        
        // Reload data from cloud
        location.reload();
      }, 1000);
    } else {
      this.showMessage('Error: ' + result.error);
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

  showMessage(msg) {
    this.messageEl.textContent = msg;
  }

  clearForm() {
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.messageEl.textContent = '';
  }
}

// Initialize auth UI when DOM is ready
window.authUI = new AuthUI();
