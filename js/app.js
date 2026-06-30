// Initialize cloud sync
let cloudSync = null;
let data = null;

async function initializeApp() {
  try {
    console.log('🚀 Initializing app...');
    
    // Always load local data first
    data = loadData();
    console.log('✅ Data loaded:', data);
    
    // Render the app immediately with local data
    console.log('📄 Rendering page...');
    render();
    console.log('✅ Page rendered');
    
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {});
      });
    }
    
    // Then try to initialize cloud sync in the background
    try {
      const SUPABASE_CONFIG = window.SUPABASE_CONFIG;
      const FEATURES = window.FEATURES;
      
      if (FEATURES.enableCloudSync && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        console.log('☁️ Initializing cloud sync...');
        cloudSync = new CloudSync(SUPABASE_CONFIG);
        const syncReady = await cloudSync.init(authManager);
        
        if (syncReady && window.authUI) {
          console.log('✅ Cloud sync ready');
          window.authUI.updateUI();
          
          if (cloudSync.isAuthenticated()) {
            const cloudData = await cloudSync.loadData();
            if (cloudData) {
              data = cloudData;
              render();
              console.log('✅ Cloud data loaded and rendered');
            }
          }
        }
      } else {
        console.log('⚠️ Cloud sync disabled or not configured');
      }
    } catch (error) {
      console.warn('Cloud sync initialization failed:', error);
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR in initializeApp:', error);
    alert('ERROR: ' + error.message);\n  }\n}\n\ninitializeApp();
