function activeFixedBillsOn(date) {
  return (data.fixedBills || []).filter(b => b.active !== false);
}

function monthlyFixedOn(date) {
  return activeFixedBillsOn(date).reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
}

function weeklyAllowance(date) {
  // Weekly income = Monthly income × 12 ÷ 52
  // Weekly allowance = Weekly income - Weekly fixed bills
  // This is equivalent to: (Monthly income - Monthly fixed bills) × 12 ÷ 52
  const monthlyIncome = Number(data.income) || 0;
  const monthlyFixedBills = monthlyFixedOn(date);
  return (monthlyIncome - monthlyFixedBills) * 12 / 52;
}

function weekExpenses(i) {
  return current().expenses.filter(e => Number(e.week) === i);
}

function spent(i) {
  return weekExpenses(i).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
}
