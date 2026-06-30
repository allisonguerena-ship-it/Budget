function activeFixedBillsOn(date) {
  return (data.fixedBills || []).filter(b => {
    if (b.active === false) return false;
    const start = b.startDate || "1900-01-01";
    const end = b.endDate || "9999-12-31";
    return start <= date && date <= end;
  });
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
