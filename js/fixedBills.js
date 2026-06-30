function addFixedBill() {
  data.fixedBills.push({
    name: "",
    category: "Subscription",
    amount: 0,
    startDate: todayISO(),
    endDate: "",
    active: true
  });
  save();
  render();
}

function updateFixedBill(index, field, value) {
  const bill = data.fixedBills[index];
  if (!bill) return;
  if (field === "amount") value = Number(value) || 0;
  if (field === "active") value = !!value;
  bill[field] = value;
  save();
  render();
}

function deleteFixedBill(index) {
  data.fixedBills.splice(index, 1);
  save();
  render();
}
