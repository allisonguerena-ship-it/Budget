function activeFixedBillsOn(date) {
  return (data.fixedBills || []).filter(b => b.active !== false);
}

function monthlyFixedOn(date) {
  return activeFixedBillsOn(date).reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
}

function weeklyAllowance(date) {
  return ((Number(data.income) || 0) - monthlyFixedOn(date)) * 12 / 365 * 7;
}

function weekExpenses(i) {
  return current().expenses.filter(e => Number(e.week) === i);
}

function spent(i) {
  return weekExpenses(i).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
}
