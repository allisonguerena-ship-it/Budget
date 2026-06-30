# POT Budget - Repository Summary for AI Reviewer

## 1. Project Purpose & Main User Goal

**POT Budget** is a personal **weekly budgeting app** designed for someone managing a specific financial model:
- Tracks weekly allowance calculated from monthly income minus fixed bills
- Monitors actual spending vs. weekly budget
- Manages "POT" (leftover money that accumulates week-to-week)
- Tracks recurring fixed bills (rent, subscriptions, etc.) with date-based effective dates
- Includes a separate cash-flow planner for projecting paydays, bill due dates, and planned expenses
- Allows users to finalize/freeze past weeks to preserve historical data

**Core user questions answered:**
- How much can I spend this week?
- How much did I spend?
- What's left over? 
- How does leftover affect my POT?
- When are future paydays and bills?

---

## 2. Folder & File Structure

```
Budget/
├── index.html                          # Single entry point (PWA manifest + all UI)
├── manifest.json                       # PWA manifest (installable app)
├── service-worker.js                   # Service worker for offline support
├── package.json                        # Dependencies (Prettier, serve, Chart.js)
│
├── css/                                # Styling
│   ├── main.css                        # Base styles
│   ├── layout.css                      # Grid/flexbox layout
│   ├── components.css                  # Reusable component styles
│   ├── cards.css                       # Card/metric styling
│   ├── forms.css                       # Input/form styling
│   ├── theme.css                       # Color tokens
│
├── js/                                 # Core business logic & UI
│   ├── app.js                          # Entry point, initialization
│   ├── ui.js                           # Main render functions (metrics, weeks, fixed bills)
│   ├── budget.js                       # Finance calculations (allowance, spending, POT)
│   ├── weeks.js                        # Week calculations & finalization
│   ├── fixedBills.js                   # Fixed bill management
│   ├── pot.js                          # POT rolling logic
│   ├── storage.js                      # localStorage load/save (v5 migration included)
│   ├── categoryLearning.js             # Auto-fill categories from history
│   ├── charts.js                       # Chart.js rendering for trends
│   ├── cashflow.js                     # Cash-flow planner (separate from weekly budget)
│   ├── plannedExpenses.js              # Future expense tracking
│   ├── utils.js                        # Helper functions (date, formatting, HTML escape)
│   │
│   ├── [CLOUD SYNC - In Progress]
│   ├── auth.js                         # Supabase auth (signup/login/logout)
│   ├── auth-ui.js                      # Auth UI modal & status display
│   ├── cloud-sync.js                   # Main cloud sync orchestration
│   ├── supabase-client.js              # Supabase database queries
│   ├── storage-adapter.js              # Abstraction layer (localStorage + cloud)
│   ├── config.template.js              # Config template (credentials needed)
│
├── design-system/                      # Documentation
│   ├── COMPONENTS.md                   # Component catalog
│   ├── STYLE_GUIDE.md                  # Design tokens & patterns
│   ├── UX_RULES.md                     # Interaction patterns & mobile rules
│   ├── TOKENS.css                      # CSS custom properties
│
├── docs/                               # Developer & user documentation
│   ├── AI_INSTRUCTIONS.md              # CRITICAL: Core rules for AI editors
│   ├── DATA_MODEL.md                   # Schema & data structure details
│   ├── CHANGELOG.md                    # Version history (v1-v5)
│   ├── TODO.md                         # Feature roadmap & known issues
│   ├── CLOUD_SYNC_IMPLEMENTATION.md    # Detailed implementation plan
│   ├── CLOUD_SYNC_INTEGRATION.md       # How to integrate cloud sync
│   ├── CLOUD_SYNC_OPTIONS.md           # Supabase vs Firebase analysis
│   ├── DEVELOPMENT_SETUP.md            # Local dev environment steps
│   ├── LOCAL_DATA_AND_STORAGE.md       # Storage behavior explained
│   ├── DEVICE_VARIANTS.md              # Mobile/desktop design notes
│   ├── LAYOUT_STRUCTURE.md             # HTML structure overview
│   ├── MOBILE_DESIGN_RULES.md          # Mobile-specific constraints
│   ├── SUPABASE_SETUP.md               # Cloud setup instructions
│   ├── UI_METRICS.md                   # UI spacing & sizing tokens
│   └── AZURE_TROUBLESHOOTING.md        # (Legacy, not currently used)
│
├── skills/                             # Domain-specific knowledge files
│   ├── budget-finance-logic.md         # Weekly allowance calculations
│   ├── cash-flow-planner.md            # Cash-flow feature rules
│   ├── category-learning.md            # Auto-fill category system
│   ├── finalized-weeks-and-pot.md      # Week freezing & POT logic
│   ├── fixed-bills-effective-dates.md  # Date-based bill behavior
│   ├── local-storage-migration.md      # Version migration patterns
│   └── ui-editing-rules.md             # UI component rules
│
├── examples/                           # Example data & markup
│   ├── cash-flow-example.md
│   ├── fixed-bill-row-example.md
│   └── weekly-card-example.md
│
├── test/                               # Testing
│   └── smoke_test_logic.js             # Basic logic validation
│
├── .github/
│   └── copilot-instructions.md         # Copilot-specific rules
│
├── README.md                           # Project overview
```

---

## 3. Main App Flow (Entry Point to Key Features)

### **Initialization** (js/app.js)
1. Load config.js for Supabase credentials (if cloud sync enabled)
2. Initialize `CloudSync` (checks auth, starts listeners)
3. Load data from cloud (if authenticated) or `localStorage`
4. Register service worker for offline support
5. Call `render()` to populate UI

### **Core UI Rendering** (js/ui.js → `render()`)
1. **Render Metrics Cards** → Income, active fixed bills, weekly allowance, total spent, leftover
2. **Render Fixed Bills Table** → Collapsible table with date ranges, amounts, active toggle
3. **Render Weeks** → Tabs for each week with stats (allowance, spent, leftover, POT) + expense rows
4. **Render Charts** → Spending trend chart (Chart.js)
5. **Render Cash-Flow Planner** → Separate projection for paydays, bill due dates, planned expenses

### **Weekly Budget Flow**
1. User enters income → `saveCoreSettings()` → storage.js
2. User adds/edits fixed bills → `updateFixedBill()` → recalculates `monthlyFixedOn(date)` → recalcs `weeklyAllowance()`
3. User adds weekly costs → `addExpense()` / `updateExpense()` → budget.js calculates `spent(week)`, `leftover`
4. When week ends → `finalizeWeek()` → weeks.js freezes: allowance, spending, leftover, POT, bill amounts
5. POT updates → pot.js rolls leftover forward to next week (or deducts if overspent)

### **Category Learning** (js/categoryLearning.js)
- When user assigns category to expense → stores in `learnedCategories` map
- On future expenses with same vendor → auto-suggests category

### **Cash-Flow Planner** (js/cashflow.js)
- Separate from weekly budget
- User inputs: starting cash, paycheck amount, payday dates, rent due, CC due, buffer target
- Projects future cash balance with paydays and bills overlaid
- Cash-flow constants locked by default (user must unlock to edit)

### **Storage & Sync**
- **Offline**: `localStorage` with key `"alli_pot_budget_app_v5"`
- **Cloud (if authenticated)**: storage-adapter.js routes to supabase-client.js
- **Migration**: On load, checks `OLD_KEYS` (v2-v4) and migrates if found

---

## 4. Important Frameworks, Libraries, APIs, Backend/Frontend Setup, and Config Files

### **Frontend Tech Stack**
- **HTML/CSS/Vanilla JavaScript** (no framework)
- **Chart.js** (CDN) - spending trend charts
- **Supabase JS Client** (CDN) - cloud auth & database
- **Service Worker** - offline caching
- **LocalStorage API** - primary data persistence

### **Backend/Cloud (In Progress)**
- **Supabase** (PostgreSQL + Auth + Realtime)
  - Tables: `budgets`, `fixed_bills`, `cash_flow_settings`, `planned_expenses`, `months`
  - Auth: Email/password signup + login (session stored in localStorage)
  - Real-time subscriptions (not yet fully integrated)

### **Configuration Files**

| File | Purpose |
|------|---------|
| config.template.js | Template for Supabase credentials |
| config.js | **NOT in repo** - copy from template, fill in Supabase URL & key |
| manifest.json | PWA metadata (app name, icons, theme color) |
| package.json | Dev dependencies (Prettier, serve) |

### **Key Global Variables/Functions** (as of v5)
- `data` – Main app state object
- `cloudSync` – CloudSync instance (if enabled)
- `authManager` – AuthManager instance
- localStorage → storage.js: `loadData()`, `save()`, `current()`
- budget.js: `weeklyAllowance(date)`, `monthlyFixedOn(date)`, `spent(week)`
- weeks.js: `calcWeeks()`, `finalizeWeek(index)`, `unfinalizeWeek(index)`

---

## 5. Current Bugs, Unfinished Areas, TODOs

### **High Priority (In Progress)**
- ✅ **Cloud sync architecture designed** (docs written)
- ✅ **Auth module created** (auth.js, auth-ui.js)
- ✅ **Supabase data client created** (supabase-client.js)
- ✅ **Storage adapter created** (storage-adapter.js)
- ⏳ **Integrate into existing app** 
  - [ ] Wire auth UI modal into flow
  - [ ] Add config.js with actual credentials
  - [ ] Test multi-device sync
  - [ ] Handle offline → online transitions
- ⏳ **Test finalized week behavior** after changing fixed bills (ensure past weeks don't rewrite)
- [ ] **Import from CSV backup** (export exists, import missing)
- [ ] **Clearer backup/restore controls** in UI

### **Medium Priority**
- [ ] Add recurring planned expenses
- [ ] Add paycheck-specific cash-flow view
- [ ] Add category summaries by month
- [ ] Add spending trend chart (in progress)
- [ ] Add ability to rename week labels
- [ ] Add custom first-week start date
- [ ] Archive old months

### **Known Issues / Unclear Areas**
- **Cloud sync not fully integrated** – config.js needed, real-time subscriptions not wired
- **No import mechanism** – CSV export works, but no way to restore from backup
- **Week navigation** – Tab-based switching works, but arrow key nav might be confusing on mobile
- **Fixed bill changes on past weeks** – Logic should be correct (date-based), but untested thoroughly
- **Cash-flow planner separate from POT** – May confuse users about which numbers are "real" vs. projected

---

## 6. Recent Changes & Areas Being Refactored

Based on CHANGELOG.md:

### **Most Recent (v5)**
- ✅ **Finalized/frozen weeks** – Weeks can be locked at end; past weeks stay frozen even if future bills change
- ✅ **Opening POT input** – User can manually set starting POT
- ✅ **POT not preloaded into cash-flow** – Cash-flow planner now separate from POT calculations
- ✅ **Fixed bills made collapsible** – Reduces visual clutter
- ✅ **Cash-flow constants locked by default** – Unlock button provided
- ✅ **Weekly allowance clarified** – Emphasize 7-day weeks, not 4/5 weeks per month
- ✅ **Storage migration** – Old v2-v4 localStorage keys migrated to v5

### **In-Progress Refactoring**
1. **Cloud sync integration** – New cloud-sync.js, auth.js, storage-adapter.js files created but not yet wired into main flow
2. **Week tab UI refactored** – In ui.js `renderWeeks()`, recently rewrote to use tabs + data attributes for week selection instead of separate divs
3. **Category learning cleanup** – categoryLearning.js maintained but may need deduplication logic

---

## 7. Files Most Important to Review First

### **Tier 1: Core Business Logic (Review First)**
1. **docs/AI_INSTRUCTIONS.md** – **MUST READ** – Core finance rules & preservation rules
2. **docs/DATA_MODEL.md** – Schema & field meanings
3. **js/budget.js** – Weekly allowance formula, fixed bill calculations
4. **js/weeks.js** – Week finalization & POT rolling logic
5. **js/storage.js** – Data loading, migration, save mechanism

### **Tier 2: UI & Integration**
6. **js/ui.js** – Main render functions; week rendering recently refactored
7. **js/fixedBills.js** – Fixed bill add/edit/delete
8. **js/app.js** – Initialization, cloud sync entry point
9. **index.html** – Entry point, HTML structure, auth modal markup

### **Tier 3: Cloud Sync (Still In Progress)**
10. **js/cloud-sync.js** – Orchestration layer
11. **js/storage-adapter.js** – localStorage + Supabase abstraction
12. **docs/CLOUD_SYNC_IMPLEMENTATION.md** – Full plan with DB schema

### **Tier 4: Context/Reference**
13. **docs/CHANGELOG.md** – What changed in each version
14. **docs/TODO.md** – Feature roadmap
15. **design-system/UX_RULES.md** – Interaction guidelines

---

## 8. Setup Steps to Run Locally

### **Option A: Quick Start (No Cloud Sync)**
```bash
# 1. Clone repo
cd ~/Documents/GitHub/Budget

# 2. Open in VS Code
code .

# 3. Open index.html with Live Server
#    Right-click index.html → "Open with Live Server"
#    (or use Command Palette: "Live Server: Open with Live Server")

# 4. Browser opens at http://localhost:5500/index.html
#    Data saves to localStorage automatically
```

### **Option B: With Cloud Sync (Needs Config)**
```bash
# 1-3: Same as above

# 4. Sign up for Supabase: https://supabase.com
# 5. Create new project
# 6. Copy config template:
cp js/config.template.js js/config.js

# 7. Fill in config.js with Supabase credentials:
#    - url: "https://YOUR_PROJECT_ID.supabase.co"
#    - anonKey: "YOUR_ANON_PUBLIC_KEY"
#    (from Supabase Settings > API)

# 8. Create tables (SQL in docs/CLOUD_SYNC_IMPLEMENTATION.md)
#    Run in Supabase SQL editor

# 9. Reload browser, click "Sign in" button to test auth
```

### **Optional: Use npm Serve**
```bash
npm install  # Install Prettier & serve
npm start    # Runs on http://localhost:3000
```

### **Deployment: GitHub Pages**
```bash
# 1. Push repo to GitHub
# 2. Go to Settings > Pages
# 3. Select branch & root folder
# 4. Save → app published to https://username.github.io/Budget/
```

---

## 9. Architectural & Design Concerns

### **Strengths**
✅ **Simple architecture** – Single HTML file + modular JS, no build step, fast to iterate
✅ **Finance logic isolated** – Core math in budget.js, not mixed with UI
✅ **Storage abstraction** – storage-adapter.js enables offline + cloud support
✅ **Data preservation** – Finalized weeks, migration logic protect historical data
✅ **Mobile-friendly** – PWA-capable, collapsible sections, responsive layout

### **Concerns & Risks**

| Concern | Impact | Recommendation |
|---------|--------|-----------------|
| **Cloud sync not integrated** | Users can't sync across devices (main TODO) | Wire auth + storage-adapter into app.js; test thoroughly |
| **No database backups** | If user clears localStorage or loses auth session, data could be lost | Implement JSON import/export UI immediately |
| **Date-based fixed bills untested** | Past weeks might still rewrite if bill logic has bugs | Add test suite; create unit tests for `monthlyFixedOn()`, `weeklyAllowance()` |
| **No conflict resolution strategy** | If user edits same data on 2 devices simultaneously, unclear which wins | Document last-write-wins or add merge strategy to storage-adapter |
| **Fixed bills amount can't be edited after finalization** | If bill amount changes mid-month, past weeks won't rewrite (correct), but unclear if this is intentional | Clearly document & test this behavior |
| **Config.js needs manual creation** | Easy to forget to copy config.template.js; cloud sync won't work without it | Add CLI setup script or validation check in app.js |
| **No error handling for localStorage quota exceeded** | App could crash if data too large | Add warning in UI; suggest archive old months |
| **Weekly tabs might confuse mobile users** | Lots of tabs could be hard to scroll/select on small screens | Consider: swipe gestures, or collapse to dropdown on mobile |

### **Code Organization Issues**
- **js/ui.js is large** (400+ lines) – Consider splitting into: renderMetrics.js, renderWeeks.js, renderFixedBills.js
- **No component system** – Rendering is procedural; consider templating library if app grows
- **Global `data` variable** – Works, but creates implicit coupling; could add getter/setter layer
- **No state machine** – Week state (open/finalized) is just a flag; could be explicit enum or state machine

---

## 10. Recommended Next Changes to Improve Organization, Maintainability, and User Experience

### **Phase 1: Cloud Sync Integration (BLOCKING)**
**Priority: CRITICAL** – This is the main in-progress work.

```
1. Create js/config.js with actual Supabase credentials
   - Have user set up Supabase project
   - Run migration SQL from CLOUD_SYNC_IMPLEMENTATION.md
   
2. Fix app.js initialization
   - Currently waits for cloudSync, but auth UI modal may not render
   - Test auth modal appears before data loads
   - Add error handling if Supabase unavailable
   
3. Wire storage-adapter into full save/load cycle
   - Test: save to localStorage → sync to cloud when online
   - Test: offline changes queued, sync on reconnect
   
4. Add multi-device sync test
   - Open app in 2 browsers with same login
   - Add expense in browser A
   - Refresh browser B → should see new expense
   
5. Document cloud sync setup for end users
   - Add UI helper explaining "Saves to cloud when signed in"
```

### **Phase 2: Data Portability & Backup**
**Priority: HIGH** – Users need backup/restore mechanism.

```
1. Add JSON import/export
   - New buttons: "Export JSON backup" + "Import JSON backup"
   - Allow users to save/restore full data
   
2. Add CSV import (complement existing export)
   - Parse CSV back into expense rows
   
3. Add data migration confirmation UI
   - When user logs in, show: "Migrate X weeks of local data to cloud?"
   - Provide download backup before migrating
```

### **Phase 3: Testing & Validation**
**Priority: HIGH** – Cloud sync + finalized weeks need verification.

```
1. Add unit tests (test/):
   - monthlyFixedOn(date) with various bill date ranges
   - weeklyAllowance() calculation
   - finalizeWeek() freezes correct fields
   - Storage migration v4 → v5
   
2. Add integration tests:
   - Multi-device sync scenario
   - Offline → online transition
   - Bill change doesn't rewrite finalized weeks
   
3. Add smoke tests for UI:
   - Week tab switching
   - Fixed bill add/edit/delete
   - Expense add/edit/delete
   - Category learning on expense save
```

### **Phase 4: UI Polish & Accessibility**
**Priority: MEDIUM** – After cloud sync works.

```
1. Split js/ui.js into smaller modules
   - renderMetrics.js, renderWeeks.js, renderFixedBills.js
   - Easier to maintain & test
   
2. Add keyboard navigation
   - Tab through week tabs
   - Arrow keys to switch weeks
   - Enter to save, Escape to cancel
   
3. Improve mobile UX
   - Test on actual mobile devices
   - Consider: swipe between weeks instead of tabs
   - Test cash-flow planner scrolling on small screens
   
4. Add accessibility
   - ARIA labels for inputs
   - Color contrast checks
   - Screen reader testing
```

### **Phase 5: Feature Completeness**
**Priority: MEDIUM-LOW** – Nice-to-have improvements.

```
1. Add recurring planned expenses
   - Let user specify monthly/quarterly expenses
   - Auto-populate in cash-flow planner
   
2. Add spending trend charts
   - Month-over-month comparison
   - Category breakdowns
   
3. Add category summaries
   - Show total by category for selected month
   
4. Add "safe to spend" calculator
   - Recommend max spend based on paycheck timing & bills
```

### **Architectural Improvements**
```
1. Add Zod or similar for data validation
   - Validate shape of loaded data
   - Catch corruption early
   
2. Add event system or observer pattern
   - Decouple storage, UI, calculations
   - Example: "on-data-changed" event → all consumers react
   
3. Add logging/debugging mode
   - CONFIG.DEBUG flag for verbose logs
   - Help diagnose sync issues
   
4. Document the 7-day weekly formula clearly
   - Add inline comment to budget.js with math explanation
   - Link to DATA_MODEL.md
```

---

## Summary for Next Reviewer

### What This App Does
A personal weekly budget tracker with finalized weeks, fixed bills with date ranges, POT rolling, category learning, and a separate cash-flow planner. Designed for someone with specific monthly income, recurring bills, and unpredictable weekly spending.

### Current State
- **v5 stable** – Core logic complete, UI polished, finalized weeks working
- **Cloud sync in progress** – Architecture & auth modules ready, integration pending
- **Data safe** – localStorage migration working, finalized weeks freeze past data

### What's Broken / In Progress
- Cloud sync not wired into app (needs config.js + testing)
- No JSON import/export UI
- No unit tests for finance logic
- Cloud conflict resolution strategy not defined

### Most Important Rules (From AI_INSTRUCTIONS.md)
1. **Weekly allowance = (income - active fixed bills) × 12 ÷ 365 × 7** (never divide by 4/5 weeks)
2. **Fixed bills date-based** – Only count if bill's date range includes that week
3. **Finalized weeks frozen** – Cannot rewrite past weeks; user must unfinalize manually
4. **Cash-flow separate** – Projections don't preload POT
5. **Keep UI simple** – No clutter, collapsible sections, clear labels

### What to Review First
1. docs/AI_INSTRUCTIONS.md – Core rules
2. js/budget.js – Finance math
3. js/weeks.js – Finalization logic
4. js/storage.js – Data persistence

---

Generated: 2026-06-30 | Version: 5 | Cloud Sync Status: In Progress
