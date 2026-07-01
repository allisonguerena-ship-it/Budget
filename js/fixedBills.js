function addFixedBill() {
  data.fixedBills.push({
    name: "",
    category: "Subscription",
    amount: 0,
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
  // debug: log updated fixed bills and current monthly fixed total
  try { console.debug('updateFixedBill:', index, field, value, 'monthlyFixedOn(currentMonth+"-01")=', monthlyFixedOn(data.currentMonth+"-01")); } catch (e) { console.debug('updateFixedBill debug error', e); }
  save();
  render();
}

function deleteFixedBill(index) {
  data.fixedBills.splice(index, 1);
  save();
  render();
}
