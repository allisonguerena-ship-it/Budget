function showView(view) {
  document.getElementById("budgetView").classList.toggle("hidden", view !== "budget");
  document.getElementById("cashView").classList.toggle("hidden", view !== "cash");
  document.getElementById("budgetTab").classList.toggle("active", view === "budget");
  document.getElementById("cashTab").classList.toggle("active", view === "cash");
}

function toggleCashLock() {
  data.cash.locked = !data.cash.locked;
  save();
  render();
}

function saveCashSettings() {
  ["cashStart", "paycheckAmount", "payday1", "payday2", "rentDueDay", "rentAmount", "ccDueDay", "ccPaymentAmount", "bufferTarget"].forEach(id => {
    data.cash[id] = Number(document.getElementById(id).value) || 0;
  });
  save();
  render();
}

function cashEvents() {
  const c = data.cash;
  const events = [];

  events.push({ date: dateForDay(data.currentMonth, c.payday1), desc: "Paycheck", type: "pay", amount: Number(c.paycheckAmount) || 0 });
  events.push({ date: dateForDay(data.currentMonth, c.payday2), desc: "Paycheck", type: "pay", amount: Number(c.paycheckAmount) || 0 });
  events.push({ date: dateForDay(data.currentMonth, c.rentDueDay), desc: "Rent due", type: "bill", amount: -(Number(c.rentAmount) || 0) });
  events.push({ date: dateForDay(data.currentMonth, c.ccDueDay), desc: "Credit card due", type: "bill", amount: -(Number(c.ccPaymentAmount) || 0) });

  monthPlanned().filter(p => !p.paid).forEach(p => {
    events.push({ date: p.date, desc: p.desc || "Planned expense", type: "plan", amount: -(Number(p.amount) || 0) });
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function cashProjection() {
  let balance = Number(data.cash.cashStart) || 0;
  let low = balance;
  const events = cashEvents().map(event => {
    balance += event.amount;
    low = Math.min(low, balance);
    return { ...event, balance };
  });
  return { events, ending: balance, low };
}
