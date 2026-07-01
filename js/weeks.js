function finalizeWeek(index) {
  const week = calcWeeks().find(item => item.i === index);
  if (!week) return;
  current().finalizedWeeks[index] = {
    date: week.date,
    startStash: week.startStash,
    allowance: week.allowance,
    used: week.used,
    leftover: week.leftover,
    endingStash: week.endingStash,
    fixed: week.fixed,
    finalizedAt: todayISO()
  };
  save();
  render();
}

function unfinalizeWeek(index) {
  delete current().finalizedWeeks[index];
  save();
  render();
}

function prevMonth() {
  data.currentMonth = addMonthsToKey(data.currentMonth, -1);
  ensureMonth(data.currentMonth);
  save();
  render();
}

function nextMonth() {
  data.currentMonth = addMonthsToKey(data.currentMonth, 1);
  ensureMonth(data.currentMonth);
  save();
  render();
}

function addMonth() {
  const keys = Object.keys(data.months).sort();
  const next = addMonthsToKey(keys[keys.length - 1] || data.currentMonth, 1);
  ensureMonth(next);
  data.currentMonth = next;
  save();
  render();
}

function addWeek() {
  const month = current();
  const last = month.weekStarts[month.weekStarts.length - 1] || data.currentMonth + "-01";
  month.weekStarts.push(addDays(last, 7));
  save();
  render();
}

function saveCoreSettings() {
  data.income = Number(document.getElementById("income").value) || 0;
  data.openingStash = Number(document.getElementById("openingStash").value) || 0;
  save();
  render();
}

function updateAllowancePreview() {
  // Get current values from inputs
  const income = Number(document.getElementById("income").value) || 0;
  const fixedBills = Number(document.getElementById("fixedTotal").value) || 0;
  
  // Calculate weekly allowance using the formula:
  // weekly allowance = (monthly income - fixed bills) * 12 / 365 * 7
  const weeklyAllowance = (income - fixedBills) * 12 / 365 * 7;
  
  // Update display elements
  const allowancePreview = document.getElementById("allowancePreview");
  const calcPreview = document.getElementById("allowanceCalcPreview");
  
  if (allowancePreview) {
    allowancePreview.textContent = "$" + weeklyAllowance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  if (calcPreview) {
    const incomeFormatted = income.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const billsFormatted = fixedBills.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const resultFormatted = weeklyAllowance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    calcPreview.textContent = `($${incomeFormatted} − $${billsFormatted}) × 12 ÷ 365 × 7 = $${resultFormatted}`;
  }
}

function addExpense(week) {
  current().expenses.push({
    week,
    date: current().weekStarts[week],
    desc: "",
    category: "Other",
    amount: 0
  });
  save();
  render();
}

function updateExpense(globalIndex, field, value) {
  const expense = current().expenses[globalIndex];
  if (!expense) return;
  if (field === "amount") value = Number(value) || 0;
  expense[field] = value;

  if (field === "desc") {
    const guessed = guessCategory(value);
    if (guessed) expense.category = guessed;
  }

  if (field === "category" || field === "desc") {
    learnFromExpense(expense);
  }

  save();
  render();
}

function deleteExpense(globalIndex) {
  current().expenses.splice(globalIndex, 1);
  save();
  render();
}

// Use money from Stash
function useStashMoney(amount) {
  const currentStash = getCurrentStashBalance();
  amount = Number(amount) || 0;
  
  if (amount <= 0) {
    alert("Enter an amount greater than $0");
    return;
  }
  
  if (amount > currentStash) {
    alert(`Cannot withdraw $${amount.toFixed(2)}. Current Stash balance is only $${currentStash.toFixed(2)}.`);
    return;
  }
  
  data.stashWithdrawn = (Number(data.stashWithdrawn) || 0) + amount;
  save();
  render();
  alert(`Withdrew $${amount.toFixed(2)} from your Stash. New Stash balance: $${getCurrentStashBalance().toFixed(2)}`);
}

// Restore Stash money (reverse a withdrawal)
function restoreStashMoney(amount) {
  data.stashWithdrawn = Math.max(0, (Number(data.stashWithdrawn) || 0) - (Number(amount) || 0));
  save();
  render();
}
