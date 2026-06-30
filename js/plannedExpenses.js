function monthPlanned() {
  return data.plannedExpenses.filter(p => String(p.date || "").slice(0, 7) === data.currentMonth);
}

function addPlannedExpense() {
  data.plannedExpenses.push({
    date: data.currentMonth + "-15",
    desc: "",
    type: "Trip/Travel",
    amount: 0,
    paid: false
  });
  save();
  render();
}

function updatePlanned(index, field, value) {
  const planned = data.plannedExpenses[index];
  if (!planned) return;
  if (field === "amount") value = Number(value) || 0;
  if (field === "paid") value = !!value;
  planned[field] = value;
  save();
  render();
}

function deletePlanned(index) {
  data.plannedExpenses.splice(index, 1);
  save();
  render();
}
