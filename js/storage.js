const STORAGE_KEY = "alli_pot_budget_app_v5";
const OLD_KEYS = ["alli_pot_budget_app_v4", "alli_pot_budget_app_v3", "alli_pot_budget_app_v2"];

function loadData() {
  console.log('💾 [storage.js] loadData() called');
  let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (!saved) {
    for (const k of OLD_KEYS) {
      saved = JSON.parse(localStorage.getItem(k) || "null");
      if (saved) {
        console.log(`💾 [storage.js] Found old data in key: ${k}`);
        break;
      }
    }
  }

  const tk = monthKeyFromDate(new Date());

  if (!saved) {
    console.log('💾 [storage.js] No saved data found, creating defaults');
    saved = {
      currentMonth: "2026-07",
      income: 5708.68,
      openingStash: 463.71,
      learnedCategories: { "trader joes": "Groceries", "trader joes market": "Groceries" },
      fixedBills: [
        { name: "Rent", category: "Housing", amount: 2698, active: true },
        { name: "Utilities", category: "Housing", amount: 80, active: true },
        { name: "Subscriptions", category: "Subscription", amount: 42.19, active: true },
        { name: "Loans", category: "Debt", amount: 116, active: true },
        { name: "Damien fees", category: "Other", amount: 116, active: true },
        { name: "Car insurance", category: "Car", amount: 164, active: true },
        { name: "Car payment", category: "Car", amount: 305, active: true }
      ],
      cash: {
        cashStart: 0,
        paycheckAmount: 2854.34,
        payday1: 5,
        payday2: 20,
        rentDueDay: 30,
        rentAmount: 2698,
        ccDueDay: 14,
        ccPaymentAmount: 2500,
        bufferTarget: 2000,
        locked: true
      },
      plannedExpenses: [{ date: "2026-07-15", desc: "Sister bachelorette trip flights", type: "Trip/Travel", amount: 0, paid: false }],
      months: {}
    };
  }

  saved.currentMonth ||= tk;
  saved.openingStash = Number(saved.openingStash ?? saved.openingPot ?? saved.startingPot ?? 0) || 0;
  saved.income = Number(saved.income ?? 5708.68) || 0;
  saved.fixedBills ||= [{ name: "Fixed bills legacy total", category: "Other", amount: Number(saved.fixed) || 0, startDate: saved.currentMonth + "-01", endDate: "", active: true }];
  saved.cash ||= { cashStart: 0, paycheckAmount: 2854.34, payday1: 5, payday2: 20, rentDueDay: 30, rentAmount: 3098, ccDueDay: 14, ccPaymentAmount: 0, bufferTarget: 2000, locked: true };
  saved.cash.locked = saved.cash.locked !== false;
  saved.plannedExpenses ||= [];
  saved.learnedCategories ||= {};
  saved.months ||= {};

  for (const [m, obj] of Object.entries(saved.months)) {
    obj.weekStarts ||= defaultWeekStarts(m);
    
    // Migration: ensure week starts are on Mondays
    // Check if weekStarts are already Monday-aligned; if not, recalculate
    const needsMigration = obj.weekStarts.some(dateStr => {
      const d = new Date(dateStr + "T00:00:00");
      return d.getDay() !== 1; // 1 = Monday
    });
    
    if (needsMigration) {
      console.log(`💾 [storage.js] Migrating week starts for ${m} to Monday alignment`);
      obj.weekStarts = defaultWeekStarts(m);
    }
    
    obj.expenses ||= [];
    obj.finalizedWeeks ||= {};
  }

  if (!saved.months[saved.currentMonth]) {
    saved.months[saved.currentMonth] = { weekStarts: defaultWeekStarts(saved.currentMonth), expenses: [], finalizedWeeks: {} };
  }

  console.log('✅ [storage.js] loadData() returning:', {
    currentMonth: saved.currentMonth,
    income: saved.income,
    hasMonths: !!saved.months,
    monthCount: Object.keys(saved.months || {}).length
  });
  
  return saved;
}

function save() {
  // Save to cloud if authenticated, always to localStorage
  if (typeof cloudSync !== 'undefined' && cloudSync && cloudSync.isAuthenticated()) {
    cloudSync.saveData(data);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function current() {
  return data.months[data.currentMonth];
}

function ensureMonth(key) {
  if (!data.months[key]) {
    data.months[key] = { weekStarts: defaultWeekStarts(key), expenses: [], finalizedWeeks: {} };
  }
  data.months[key].finalizedWeeks ||= {};
}
