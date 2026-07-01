function finalizeWeek(index) {
  const week = calcWeeks().find(item => item.i === index);
  if (!week) return;
  current().finalizedWeeks[index] = {
    date: week.date,
    startPot: week.startPot,
    allowance: week.allowance,
    used: week.used,
    leftover: week.leftover,
    endingPot: week.endingPot,
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
  data.openingPot = Number(document.getElementById("openingPot").value) || 0;
  save();
  render();
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

// Use money from POT
function usePotMoney(amount) {
  const currentPot = getCurrentPotBalance();
  amount = Number(amount) || 0;
  
  if (amount <= 0) {
    alert("Enter an amount greater than $0");
    return;
  }
  
  if (amount > currentPot) {
    alert(`Cannot withdraw $${amount.toFixed(2)}. Current POT balance is only $${currentPot.toFixed(2)}.`);
    return;
  }
  
  data.potWithdrawn = (Number(data.potWithdrawn) || 0) + amount;
  save();
  render();
  alert(`Withdrew $${amount.toFixed(2)} from POT. New POT balance: $${getCurrentPotBalance().toFixed(2)}`);
}

// Restore POT money (reverse a withdrawal)
function restorePotMoney(amount) {
  data.potWithdrawn = Math.max(0, (Number(data.potWithdrawn) || 0) - (Number(amount) || 0));
  save();
  render();
}
