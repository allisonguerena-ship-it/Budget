// Initialize cloud sync
let cloudSync = null;
let data = null;

async function initializeApp() {
  // Always load local data first
  data = loadData();
  
  // Render the app immediately with local data
  render();
  
  // Then try to initialize cloud sync in the background
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
  
  try {
    const SUPABASE_CONFIG = window.SUPABASE_CONFIG;
    const FEATURES = window.FEATURES;
    
    if (FEATURES.enableCloudSync && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      cloudSync = new CloudSync(SUPABASE_CONFIG);
      const syncReady = await cloudSync.init(authManager);
      
      if (syncReady && window.authUI) {
        window.authUI.updateUI();
        
        if (cloudSync.isAuthenticated()) {
          const cloudData = await cloudSync.loadData();
          if (cloudData) {
            data = cloudData;
            render();
          }
        }
      }
    }
  } catch (error) {
    console.warn('Cloud sync initialization failed, will use localStorage:', error);
  }
}

initializeApp();
