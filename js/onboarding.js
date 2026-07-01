// Onboarding module with smart income calculation
console.log('✅ [onboarding.js] Script loaded');

// STORAGE_KEY and ONBOARDING_FLAG are defined in storage.js, reuse them
const ONBOARDING_FLAG = 'squid_onboarding_completed';
let onboardingCalculatedIncome = 0;
let onboardingPaycheckFrequency = null; // 1=monthly, 2=twice/month, 26=biweekly, 52=weekly

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
  goToOnboardingStep(1);
}

function hideOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.style.display = 'none';
}

function goToOnboardingStep(step) {
  console.log(`📍 [onboarding.js] Going to step ${step}`);
  
  // Hide all steps
  const stepElements = [
    'onboardingStep1',
    'onboardingStep2', 
    'onboardingStep3Annual',
    'onboardingStep3Paycheck',
    'onboardingStep3PaycheckAmount',
    'onboardingStep3Monthly',
    'onboardingStep4Confirm',
    'onboardingStep5'
  ];
  
  stepElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  // Show the requested step
  const stepIdMap = {
    1: 'onboardingStep1',
    2: 'onboardingStep2',
    3: 'onboardingStep3Annual', // default, will be overridden
    4: 'onboardingStep4Confirm',
    5: 'onboardingStep5'
  };
  
  if (stepIdMap[step]) {
    const el = document.getElementById(stepIdMap[step]);
    if (el) {
      el.style.display = 'block';
    }
  }
}

function goToOnboardingIncomeMethod(method) {
  console.log(`💰 [onboarding.js] Selected income method: ${method}`);
  
  if (method === 'annual') {
    document.getElementById('onboardingStep3Annual').style.display = 'block';
    document.getElementById('onboardingStep2').style.display = 'none';
    // Focus input
    setTimeout(() => document.getElementById('onboardingAnnualSalary')?.focus(), 100);
  } else if (method === 'paycheck') {
    document.getElementById('onboardingStep3Paycheck').style.display = 'block';
    document.getElementById('onboardingStep2').style.display = 'none';
  } else if (method === 'monthly') {
    document.getElementById('onboardingStep3Monthly').style.display = 'block';
    document.getElementById('onboardingStep2').style.display = 'none';
    setTimeout(() => document.getElementById('onboardingMonthlyIncome')?.focus(), 100);
  }
}

function goToOnboardingPaycheckFrequency(frequencyCode) {
  console.log(`📅 [onboarding.js] Selected paycheck frequency: ${frequencyCode}`);
  onboardingPaycheckFrequency = parseInt(frequencyCode);
  document.getElementById('onboardingStep3PaycheckAmount').style.display = 'block';
  document.getElementById('onboardingStep3Paycheck').style.display = 'none';
  setTimeout(() => document.getElementById('onboardingPaycheckAmount')?.focus(), 100);
}

function confirmOnboardingAnnualSalary() {
  const annualSalary = parseFloat(document.getElementById('onboardingAnnualSalary').value) || 0;
  
  if (annualSalary <= 0) {
    alert('Please enter a valid annual salary');
    return;
  }
  
  onboardingCalculatedIncome = Math.round((annualSalary / 12) * 100) / 100;
  console.log(`✅ [onboarding.js] Calculated monthly income from annual: $${onboardingCalculatedIncome}`);
  
  // Show confirmation
  document.getElementById('onboardingConfirmIncome').textContent = `$${onboardingCalculatedIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('onboardingStep4Confirm').style.display = 'block';
  document.getElementById('onboardingStep3Annual').style.display = 'none';
}

function confirmOnboardingPaycheck() {
  const paycheckAmount = parseFloat(document.getElementById('onboardingPaycheckAmount').value) || 0;
  
  if (paycheckAmount <= 0) {
    alert('Please enter a valid paycheck amount');
    return;
  }
  
  if (!onboardingPaycheckFrequency) {
    alert('Please select paycheck frequency');
    return;
  }
  
  // Calculate monthly based on frequency
  // 1 = monthly, 2 = twice a month, 26 = biweekly, 52 = weekly
  const monthlyMultiplier = {
    1: 1,
    2: 2,
    26: 26 / 12, // biweekly = ~26 times per year
    52: 52 / 12  // weekly = ~52 times per year
  };
  
  onboardingCalculatedIncome = Math.round((paycheckAmount * monthlyMultiplier[onboardingPaycheckFrequency]) * 100) / 100;
  console.log(`✅ [onboarding.js] Calculated monthly income from paycheck: $${onboardingCalculatedIncome}`);
  
  // Show confirmation
  document.getElementById('onboardingConfirmIncome').textContent = `$${onboardingCalculatedIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('onboardingStep4Confirm').style.display = 'block';
  document.getElementById('onboardingStep3PaycheckAmount').style.display = 'none';
}

function confirmOnboardingMonthly() {
  const monthlyIncome = parseFloat(document.getElementById('onboardingMonthlyIncome').value) || 0;
  
  if (monthlyIncome <= 0) {
    alert('Please enter a valid monthly income');
    return;
  }
  
  onboardingCalculatedIncome = Math.round(monthlyIncome * 100) / 100;
  console.log(`✅ [onboarding.js] Set monthly income: $${onboardingCalculatedIncome}`);
  
  // Show confirmation
  document.getElementById('onboardingConfirmIncome').textContent = `$${onboardingCalculatedIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('onboardingStep4Confirm').style.display = 'block';
  document.getElementById('onboardingStep3Monthly').style.display = 'none';
}

function completeOnboarding() {
  console.log('✅ [onboarding.js] completeOnboarding() called');
  
  if (!onboardingCalculatedIncome || onboardingCalculatedIncome <= 0) {
    alert('Please enter a valid income');
    return;
  }
  
  const income = onboardingCalculatedIncome;
  
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
        active: activeCheckbox ? activeCheckbox.checked : true,
        startDate: new Date().toISOString().split('T')[0], // Today's date
        endDate: null // No end date for open-ended bills
      });
    }
  });
  
  // Create initial data structure
  const monthKey = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
  
  const initialData = {
    currentMonth: monthKey,
    income: income,
    openingStash: 0, // No starting stash in new flow
    learnedCategories: {},
    fixedBills: fixedBills.length > 0 ? fixedBills : [
      { name: "Placeholder", category: "Other", amount: 0, active: false, startDate: new Date().toISOString().split('T')[0], endDate: null }
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
