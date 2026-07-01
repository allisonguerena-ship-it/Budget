// Log script load immediately
console.log('✅ [app.js] Script loaded');

// Initialize cloud sync
let cloudSync = null;
let data = null;

async function initializeApp() {
  console.log('🚀 [app.js] initializeApp() called');
  
  try {
    // Try to load config dynamically
    console.log('⏳ [app.js] Importing config.js...');
    let SUPABASE_CONFIG, FEATURES;
    
    try {
      const configModule = await import('./config.js');
      SUPABASE_CONFIG = configModule.SUPABASE_CONFIG;
      FEATURES = configModule.FEATURES;
      console.log('✅ [app.js] Config loaded via import:', { enableCloudSync: FEATURES?.enableCloudSync });
    } catch (importError) {
      console.warn('⚠️ [app.js] Config import failed:', importError.message);
      // Use defaults if import fails
      SUPABASE_CONFIG = {};
      FEATURES = { enableCloudSync: false, enableGoogleLogin: false, enableAutoSync: true, showSyncStatus: true };
      console.log('⚠️ [app.js] Using default config:', { enableCloudSync: false });
    }
    
    console.log('✅ [app.js] Config ready:', { enableCloudSync: FEATURES?.enableCloudSync });
    
    if (FEATURES.enableCloudSync && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      console.log('☁️ [app.js] Cloud sync enabled, initializing...');
      cloudSync = new CloudSync(SUPABASE_CONFIG);
      const syncReady = await cloudSync.init(authManager);
      
      if (syncReady) {
        console.log('✅ [app.js] Cloud sync ready');
        window.authUI.updateUI();
        
        if (cloudSync.isAuthenticated()) {
          data = await cloudSync.loadData();
          console.log('✅ [app.js] Cloud data loaded');
        } else {
          data = loadData();
          console.log('✅ [app.js] Local data loaded (not authenticated)');
        }
      } else {
        data = loadData();
        console.log('✅ [app.js] Local data loaded (sync not ready)');
      }
    } else {
      console.log('⚠️ [app.js] Cloud sync disabled, using localStorage');
      data = loadData();
      console.log('✅ [app.js] Local data loaded');
    }
  } catch (error) {
    console.warn('⚠️ [app.js] Cloud sync initialization failed:', error);
    console.log('📄 [app.js] Falling back to localStorage');
    data = loadData();
    console.log('✅ [app.js] Local data loaded from fallback');
  }
  
  console.log('✅ [app.js] Data object:', data ? `${Object.keys(data).length} keys` : 'null');
  
  // Check if this is a first-time user
  const isFirstTime = isFirstTimeUser();
  console.log('🆕 [app.js] First-time user?', isFirstTime);
  
  if (isFirstTime) {
    console.log('🆕 [app.js] Showing onboarding modal');
    showOnboarding();
    return; // Don't render app yet, wait for onboarding completion
  }
  
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
  
  console.log('📄 [app.js] Calling render()...');
  render();
  console.log('✅ [app.js] render() completed');
}

// Helper function to check if first-time user
function isFirstTimeUser() {
  try {
    return window.isFirstTimeUser?.() ?? false;
  } catch (e) {
    return false;
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('⏳ [app.js] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [app.js] DOMContentLoaded fired');
    initializeApp().catch(error => {
      console.error('❌ [app.js] FATAL ERROR in initializeApp():', error);
      document.body.innerHTML = `<pre style="padding:2rem; color:red; font-family:monospace; white-space: pre-wrap; word-wrap: break-word;">
⚠️ INITIALIZATION ERROR

${error.message}

${error.stack}
      </pre>`;
    });
  });
} else {
  console.log('✅ [app.js] DOM already ready, initializing...');
  initializeApp().catch(error => {
    console.error('❌ [app.js] FATAL ERROR in initializeApp():', error);
    document.body.innerHTML = `<pre style="padding:2rem; color:red; font-family:monospace; white-space: pre-wrap; word-wrap: break-word;">
⚠️ INITIALIZATION ERROR

${error.message}

${error.stack}
    </pre>`;
  });
}

// Edit settings modal handlers
function showEditSettingsWarning() {
  const modal = document.getElementById('editSettingsWarningModal');
  if (modal) modal.style.display = 'flex';
}

function closeEditWarning() {
  const modal = document.getElementById('editSettingsWarningModal');
  if (modal) modal.style.display = 'none';
}

function editBudgetSettings() {
  // This function is called after confirming the warning
  // Scroll to the Core budget settings section
  const coreSettings = document.querySelector('.label');
  if (coreSettings && coreSettings.textContent === 'Core budget settings') {
    coreSettings.closest('.panel').scrollIntoView({ behavior: 'smooth' });
  }
}

// Update locked settings display
function updateBudgetFoundationDisplay() {
  const incomeSpan = document.getElementById('foundationIncome');
  const potSpan = document.getElementById('foundationPot');
  const billsSpan = document.getElementById('foundationBills');
  const billsList = document.getElementById('foundationBillsList');
  
  if (!incomeSpan || !data) return;
  
  // Format numbers with commas
  const formatMoney = (val) => parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  incomeSpan.textContent = formatMoney(data.income || 0);
  potSpan.textContent = formatMoney(data.openingPot || 0);
  
  const totalBills = data.fixedBills
    .filter(b => b.active !== false)
    .reduce((sum, b) => sum + b.amount, 0);
  
  billsSpan.textContent = formatMoney(totalBills);
  
  // Build bills list
  if (billsList) {
    const activeBills = data.fixedBills.filter(b => b.active !== false);
    if (activeBills.length === 0) {
      billsList.innerHTML = '<p style="font-size:12px; color:#8b7567; margin:0;">No fixed bills set up.</p>';
    } else {
      billsList.innerHTML = activeBills
        .map(b => `<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:12px;">
          <span><strong>${b.name}</strong> (${b.category})</span>
          <span>$${formatMoney(b.amount)}</span>
        </div>`)
        .join('');
    }
  }
}

// Call after render completes
window.addEventListener('budgetUpdated', updateBudgetFoundationDisplay);
