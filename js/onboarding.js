// Onboarding module for first-time setup
console.log('✅ [onboarding.js] Script loaded');

const STORAGE_KEY = "alli_pot_budget_app_v5";
const ONBOARDING_FLAG = 'squid_onboarding_completed';

function isFirstTimeUser() {
  // Check if onboarding has been completed
  const completed = localStorage.getItem(ONBOARDING_FLAG);
  if (completed) return false;
  
  // Check if there's actually saved data
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    // Data exists, mark onboarding as completed
    localStorage.setItem(ONBOARDING_FLAG, 'true');
    return false;
  }
  
  return true;
}

function showOnboarding() {
  console.log('🎯 [onboarding.js] showOnboarding() called');
  const modal = document.getElementById('onboardingModal');
  if (!modal) {
    console.warn('⚠️ [onboarding.js] Modal not found');
    return;
  }
  
  modal.style.display = 'flex';
  
  // Focus on first input
  setTimeout(() => {
    const incomeInput = document.getElementById('onboardingIncome');
    if (incomeInput) incomeInput.focus();
  }, 100);
}

function hideOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.style.display = 'none';
}

function completeOnboarding() {
  console.log('✅ [onboarding.js] completeOnboarding() called');
  const income = parseFloat(document.getElementById('onboardingIncome').value) || 0;
  const openingPot = parseFloat(document.getElementById('onboardingPot').value) || 0;
  
  // Collect fixed bills
  const billInputs = document.querySelectorAll('.onboarding-bill-row');
  const fixedBills = [];
  
  billInputs.forEach(row => {
    const nameInput = row.querySelector('.bill-name');
    const categorySelect = row.querySelector('.bill-category');
    const amountInput = row.querySelector('.bill-amount');
    const activeCheckbox = row.querySelector('.bill-active');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const amount = amountInput ? parseFloat(amountInput.value) : 0;
    
    if (name && amount > 0) {
      fixedBills.push({
        name: name,
        category: categorySelect ? categorySelect.value : 'Other',
        amount: amount,
        active: activeCheckbox ? activeCheckbox.checked : true
      });
    }
  });
  
  // Validate
  if (income <= 0) {
    alert('Please enter a valid monthly income (must be greater than 0)');
    return;
  }
  
  // Create initial data structure
  const monthKey = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
  
  const initialData = {
    currentMonth: monthKey,
    income: income,
    openingPot: openingPot,
    learnedCategories: {},
    fixedBills: fixedBills.length > 0 ? fixedBills : [
      { name: "Placeholder", category: "Other", amount: 0, active: false }
    ],
    cash: {
      cashStart: 0,
      paycheckAmount: income / 2,
      payday1: 5,
      payday2: 20,
      rentDueDay: 30,
      rentAmount: 0,
      ccDueDay: 14,
      ccPaymentAmount: 0,
      bufferTarget: 2000,
      locked: true
    },
    plannedExpenses: [],
    months: {}
  };
  
  // Create first month with default week starts
  // For now, just create empty months - the app will populate it
  initialData.months[monthKey] = {
    weekStarts: [],
    expenses: [],
    finalizedWeeks: {}
  };
  
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    localStorage.setItem(ONBOARDING_FLAG, 'true');
    console.log('✅ [onboarding.js] Budget initialized and saved');
    
    hideOnboarding();
    
    // Reload the app with new data
    window.location.reload();
  } catch (error) {
    console.error('❌ [onboarding.js] Failed to save:', error);
    alert('Failed to save your budget. Please try again.');
  }
}

function addBillRow() {
  console.log('➕ [onboarding.js] addBillRow() called');
  const container = document.getElementById('onboardingBillsContainer');
  if (!container) {
    console.warn('⚠️ [onboarding.js] Bills container not found');
    return;
  }
  
  const billRow = document.createElement('div');
  billRow.className = 'onboarding-bill-row';
  billRow.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr 60px 30px; gap: 8px; align-items: center; margin-bottom: 8px; padding: 8px; background: #f9f6f3; border-radius: 8px;';
  
  billRow.innerHTML = '<input type="text" class="bill-name" placeholder="e.g., Rent" style="padding:6px; border:1px solid #ddd; border-radius:4px; font-size:13px;"><select class="bill-category" style="padding:6px; border:1px solid #ddd; border-radius:4px; font-size:13px;"><option value="Housing">Housing</option><option value="Car">Car</option><option value="Insurance">Insurance</option><option value="Utilities">Utilities</option><option value="Phone">Phone</option><option value="Subscription">Subscription</option><option value="Dog">Dog</option><option value="Health">Health</option><option value="Debt">Debt</option><option value="Other" selected>Other</option></select><input type="number" class="bill-amount" placeholder="Amount" step="0.01" style="padding:6px; border:1px solid #ddd; border-radius:4px; font-size:13px;"><label style="display:flex; align-items:center; gap:4px; font-size:12px;"><input type="checkbox" class="bill-active" checked> Active</label><button type="button" class="bill-delete" style="padding:4px; background:#f3c6cf; border:none; border-radius:4px; cursor:pointer; font-size:12px;">×</button>';
  
  // Add delete handler
  billRow.querySelector('.bill-delete').addEventListener('click', function() {
    billRow.remove();
  });
  
  container.appendChild(billRow);
}

function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_FLAG);
  window.location.reload();
}

console.log('✅ [onboarding.js] All functions defined');
