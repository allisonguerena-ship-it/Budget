// Initialize cloud sync
let cloudSync = null;
let data = null;

async function initializeApp() {
  try {
    // Try to load config dynamically
    const configModule = await import('./config.js');
    const { SUPABASE_CONFIG, FEATURES } = configModule;
    
    if (FEATURES.enableCloudSync && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      cloudSync = new CloudSync(SUPABASE_CONFIG);
      const syncReady = await cloudSync.init(authManager);
      
      if (syncReady) {
        window.authUI.updateUI();
        
        if (cloudSync.isAuthenticated()) {
          data = await cloudSync.loadData();
        } else {
          data = loadData();
        }
      } else {
        data = loadData();
      }
    } else {
      data = loadData();
    }
  } catch (error) {
    console.warn('Cloud sync initialization failed, using localStorage:', error);
    data = loadData();
  }
  
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
  
  render();
}

initializeApp();
