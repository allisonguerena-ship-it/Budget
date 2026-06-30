// Storage adapter - abstracts localStorage and Supabase
// Allows the app to work offline with localStorage and sync to cloud

class StorageAdapter {
  constructor(useCloud = false) {
    this.useCloud = useCloud;
    this.cloudClient = null;
    this.userId = null;
    this.syncQueue = []; // Queue for offline changes
    this.isSyncing = false;
    this.isOnline = navigator.onLine;
    
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  /**
   * Initialize with Supabase client and user ID
   */
  async init(cloudClient, userId) {
    this.cloudClient = cloudClient;
    this.userId = userId;
    this.useCloud = true;
  }

  /**
   * Load all data - from cloud if available, otherwise localStorage
   */
  async loadData() {
    if (this.useCloud && this.isOnline && this.cloudClient) {
      try {
        const cloudData = await this.cloudClient.getAllUserData(this.userId);
        return this.cloudDataToLocalFormat(cloudData);
      } catch (error) {
        console.warn("Failed to load from cloud, falling back to localStorage:", error);
        return this.loadFromLocalStorage();
      }
    } else {
      return this.loadFromLocalStorage();
    }
  }

  /**
   * Load from localStorage only
   * IMPORTANT: Calls loadData() to apply v2-v5 migration and defaults
   * Never return raw localStorage data without migration
   */
  loadFromLocalStorage() {
    // loadData() handles:
    // - Migration from old keys (v2-v5)
    // - Default values for all fields
    // - Structure validation (months, weeks, etc.)
    if (typeof loadData === 'function') {
      return loadData();
    }
    
    // Fallback if loadData not available (should not happen in normal operation)
    const STORAGE_KEY = "alli_pot_budget_app_v5";
    const OLD_KEYS = ["alli_pot_budget_app_v4", "alli_pot_budget_app_v3", "alli_pot_budget_app_v2"];
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) {
      for (const k of OLD_KEYS) {
        saved = JSON.parse(localStorage.getItem(k) || "null");
        if (saved) break;
      }
    }
    return saved;
  }

  /**
   * Save data - to cloud if authenticated and online, always to localStorage
   */
  async save(data) {
    // Always save locally first
    this.saveToLocalStorage(data);

    // Queue for cloud sync if cloud-enabled
    if (this.useCloud && this.cloudClient && this.userId) {
      this.syncQueue.push({ type: "full_sync", data, timestamp: Date.now() });
      
      if (this.isOnline) {
        await this.processSyncQueue();
      }
    }
  }

  /**
   * Save to localStorage only
   */
  saveToLocalStorage(data) {
    const STORAGE_KEY = "alli_pot_budget_app_v5";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Queue a specific data change (more granular than full sync)
   */
  queueChange(changeType, changeData) {
    if (!this.useCloud) return;

    this.syncQueue.push({
      type: changeType,
      data: changeData,
      timestamp: Date.now()
    });

    if (this.isOnline && !this.isSyncing) {
      this.processSyncQueue();
    }
  }

  /**
   * Process queued sync operations
   */
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0 || !this.isOnline) {
      return;
    }

    this.isSyncing = true;

    while (this.syncQueue.length > 0 && this.isOnline) {
      const change = this.syncQueue.shift();

      try {
        switch (change.type) {
          case "full_sync":
            await this.syncFullData(change.data);
            break;
          case "budget_update":
            await this.cloudClient.upsertBudget(this.userId, change.data);
            break;
          case "fixed_bill_update":
            await this.cloudClient.upsertFixedBill(this.userId, change.data);
            break;
          case "fixed_bill_delete":
            await this.cloudClient.deleteFixedBill(change.data.id);
            break;
          case "cashflow_update":
            await this.cloudClient.upsertCashFlowSettings(this.userId, change.data);
            break;
          case "planned_expense_update":
            await this.cloudClient.upsertPlannedExpense(this.userId, change.data);
            break;
          case "planned_expense_delete":
            await this.cloudClient.deletePlannedExpense(change.data.id);
            break;
          case "month_update":
            await this.cloudClient.upsertMonth(this.userId, change.data.monthKey, change.data.monthData);
            break;
        }
      } catch (error) {
        console.error("Sync error, requeueing:", error);
        // Put it back in queue to retry
        this.syncQueue.unshift(change);
        break;
      }
    }

    this.isSyncing = false;
    
    // Notify UI of sync completion if desired
    window.dispatchEvent(new CustomEvent("sync-complete"));
  }

  /**
   * Full data sync to cloud (used on initial login)
   */
  async syncFullData(data) {
    try {
      await this.cloudClient.upsertBudget(this.userId, {
        currentMonth: data.currentMonth,
        income: data.income,
        openingPot: data.openingPot,
        learnedCategories: data.learnedCategories
      });

      // Sync fixed bills
      for (const bill of data.fixedBills) {
        await this.cloudClient.upsertFixedBill(this.userId, bill);
      }

      // Sync cash flow
      if (data.cash) {
        await this.cloudClient.upsertCashFlowSettings(this.userId, data.cash);
      }

      // Sync planned expenses
      for (const expense of data.plannedExpenses) {
        await this.cloudClient.upsertPlannedExpense(this.userId, expense);
      }

      // Sync months
      for (const [monthKey, monthData] of Object.entries(data.months)) {
        await this.cloudClient.upsertMonth(this.userId, monthKey, monthData);
      }
    } catch (error) {
      console.error("Full data sync failed:", error);
      throw error;
    }
  }

  /**
   * Convert cloud data format to local app format
   */
  cloudDataToLocalFormat(cloudData) {
    const result = {
      currentMonth: cloudData.budget?.current_month || "",
      income: cloudData.budget?.income || 0,
      openingPot: cloudData.budget?.opening_pot || 0,
      learnedCategories: cloudData.budget?.learned_categories || {},
      fixedBills: cloudData.fixedBills.map(bill => ({
        id: bill.id,
        name: bill.name,
        category: bill.category,
        amount: bill.amount,
        startDate: bill.start_date,
        endDate: bill.end_date || "",
        active: bill.active
      })) || [],
      cash: cloudData.cashFlow ? {
        cashStart: cloudData.cashFlow.cash_start,
        paycheckAmount: cloudData.cashFlow.paycheck_amount,
        payday1: cloudData.cashFlow.payday_1,
        payday2: cloudData.cashFlow.payday_2,
        rentDueDay: cloudData.cashFlow.rent_due_day,
        rentAmount: cloudData.cashFlow.rent_amount,
        ccDueDay: cloudData.cashFlow.cc_due_day,
        ccPaymentAmount: cloudData.cashFlow.cc_payment_amount,
        bufferTarget: cloudData.cashFlow.buffer_target,
        locked: cloudData.cashFlow.locked
      } : {},
      plannedExpenses: cloudData.plannedExpenses.map(exp => ({
        id: exp.id,
        date: exp.date,
        desc: exp.description,
        type: exp.type,
        amount: exp.amount,
        paid: exp.paid
      })) || [],
      months: {}
    };

    // Convert months
    for (const month of cloudData.months) {
      result.months[month.month_key] = {
        weekStarts: month.week_starts,
        expenses: month.expenses,
        finalizedWeeks: month.finalized_weeks
      };
    }

    return result;
  }

  /**
   * Handle coming online
   */
  async handleOnline() {
    this.isOnline = true;
    console.log("Back online - syncing queued changes");
    if (this.useCloud) {
      await this.processSyncQueue();
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    this.isOnline = false;
    console.log("Offline - future changes will sync when back online");
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      useCloud: this.useCloud && this.cloudClient && this.userId
    };
  }

  /**
   * Disable cloud sync (logout)
   */
  disableCloud() {
    this.useCloud = false;
    this.cloudClient = null;
    this.userId = null;
    this.syncQueue = [];
  }
}

// Export class
