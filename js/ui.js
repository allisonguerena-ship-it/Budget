function render() {
  ensureMonth(data.currentMonth);
  document.getElementById("income").value = data.income;
  document.getElementById("openingPot").value = data.openingPot;
  document.getElementById("fixedTotal").value = monthlyFixedOn(data.currentMonth + "-01").toFixed(2);

  Object.entries(data.cash).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element) element.value = value;
  });

  document.querySelectorAll("[data-lockable]").forEach(el => {
    el.disabled = data.cash.locked;
  });

  document.getElementById("cashLockBtn").textContent = data.cash.locked ? "Unlock cash-flow constants" : "Lock cash-flow constants";
  document.getElementById("monthTitle").textContent = monthName(data.currentMonth);

  renderMetrics();
  renderFixedBills();
  renderWeeks();
  renderChart();
  renderPlanner();
}

function renderMetrics() {
  const weeks = calcWeeks();
  const activeFixed = monthlyFixedOn(data.currentMonth + "-01");
  const activeAllowance = weeklyAllowance(data.currentMonth + "-01");
  const totalSpent = weeks.reduce((sum, week) => sum + (Number(week.used) || 0), 0);
  const totalLeft = weeks.reduce((sum, week) => sum + (Number(week.leftover) || 0), 0);
  const finalPot = weeks[weeks.length - 1]?.endingPot ?? data.openingPot;

  document.getElementById("metricCards").innerHTML = `
    <div class="panel metric">
      <div class="label">Current weekly allowance</div>
      <div class="value">${fmt.format(activeAllowance)}</div>
      <div class="small">${fmt.format(activeFixed)} fixed bills active</div>
    </div>
    <div class="panel metric spent">
      <div class="label">Spent in view</div>
      <div class="value">${fmt.format(totalSpent)}</div>
      <div class="small">Entered weekly costs</div>
    </div>
    <div class="panel metric leftover">
      <div class="label">Left over in view</div>
      <div class="value">${fmt.format(totalLeft)}</div>
      <div class="small">Allowance minus spent</div>
    </div>
    <div class="panel metric pot">
      <div class="label">Projected POT</div>
      <div class="value">${fmt.format(finalPot)}</div>
      <div class="small">Finalized weeks stay frozen</div>
    </div>`;
}

function renderFixedBills() {
  const rows = (data.fixedBills || []).map((bill, index) => `
    <tr>
      <td><input class="nameinput" value="${escapeHtml(bill.name || "")}" placeholder="ex: Car payment" onchange="updateFixedBill(${index}, 'name', this.value)"></td>
      <td><select onchange="updateFixedBill(${index}, 'category', this.value)">${billCats.map(category => `<option ${bill.category === category ? 'selected' : ''}>${category}</option>`).join("")}</select></td>
      <td><input type="number" step="0.01" value="${Number(bill.amount) || 0}" onchange="updateFixedBill(${index}, 'amount', this.value)"></td>
      <td><input type="date" value="${bill.startDate || todayISO()}" onchange="updateFixedBill(${index}, 'startDate', this.value)"></td>
      <td><input type="date" value="${bill.endDate || ''}" onchange="updateFixedBill(${index}, 'endDate', this.value)"></td>
      <td><input type="checkbox" ${bill.active !== false ? 'checked' : ''} onchange="updateFixedBill(${index}, 'active', this.checked)"></td>
      <td><button class="danger tiny" onclick="deleteFixedBill(${index})">×</button></td>
    </tr>`).join("");

  document.getElementById("fixedBillRows").innerHTML = rows || `<tr><td colspan="7" class="small">No fixed bills yet.</td></tr>`;
}

function renderWeeks() {
  const weeks = calcWeeks();
  document.getElementById("weeks").innerHTML = weeks.map(week => {
    const frozen = week.finalized;
    const rows = weekExpenses(week.i).map(expense => {
      const idx = current().expenses.indexOf(expense);
      return `
      <tr>
        <td><input type="date" value="${expense.date || week.date}" ${frozen ? 'disabled' : ''} onchange="updateExpense(${idx}, 'date', this.value)"></td>
        <td><input value="${escapeHtml(expense.desc || "")}" placeholder="ex: Trader Joe's" ${frozen ? 'disabled' : ''} onchange="updateExpense(${idx}, 'desc', this.value)" onblur="updateExpense(${idx}, 'desc', this.value)"></td>
        <td><select ${frozen ? 'disabled' : ''} onchange="updateExpense(${idx}, 'category', this.value)">${cats.map(category => `<option ${expense.category === category ? 'selected' : ''}>${category}</option>`).join("")}</select></td>
        <td><input type="number" step="0.01" value="${Number(expense.amount) || 0}" ${frozen ? 'disabled' : ''} onchange="updateExpense(${idx}, 'amount', this.value)"></td>
        <td>${frozen ? '<span class="small">locked</span>' : `<button class="danger tiny" onclick="deleteExpense(${idx})">×</button>`}</td>
      </tr>`;
    }).join("");

    const ok = week.leftover >= 0;
    return `
      <div class="week ${frozen ? 'finalized' : ''}">
        <div class="week-head">
          <div>
            <div class="week-title">Week ${week.i + 1}: ${shortDate(week.date)} – ${shortDate(addDays(week.date, 6))}</div>
            <div class="small">${frozen ? 'Finalized/frozen. Past math will not rewrite.' : 'Finalize at week end to lock allowance, spending, left over, and POT.'}</div>
          </div>
          <div class="badge ${frozen ? 'warn' : (ok ? 'good' : 'bad')}">${frozen ? 'Finalized' : (ok ? `${fmt.format(week.leftover)} left` : `${fmt.format(Math.abs(week.leftover))} over`)}</div>
        </div>
        <div class="week-stats">
          <div class="stat"><div class="label">Fixed bills used</div><div class="num">${fmt.format(week.fixed)}</div></div>
          <div class="stat"><div class="label">Allowance</div><div class="num">${fmt.format(week.allowance)}</div></div>
          <div class="stat"><div class="label">Spent</div><div class="num">${fmt.format(week.used)}</div></div>
          <div class="stat"><div class="label">Left over</div><div class="num">${fmt.format(week.leftover)}</div></div>
          <div class="stat potmini"><div class="label">POT after week</div><div class="num">${fmt.format(week.endingPot)}</div></div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Cost / Purchase</th><th>Category</th><th>Amount</th><th></th></tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="5" class="small" style="padding:16px">No costs entered yet.</td></tr>`}</tbody>
          </table>
        </div>
        <div class="expense-actions">
          <div>${frozen ? `<button class="secondary" onclick="unfinalizeWeek(${week.i})">Unfinalize week</button>` : `<button class="secondary" onclick="addExpense(${week.i})">+ Add cost</button> <button onclick="finalizeWeek(${week.i})">Finalize week</button>`}</div>
          <span class="small">${frozen ? `Frozen on ${week.finalizedAt || 'saved date'}` : 'Finalizing adds/removes this week’s leftover from POT.'}</span>
        </div>
      </div>`;
  }).join("");
}

function renderPlanner() {
  document.getElementById("plannedRows").innerHTML = (data.plannedExpenses || []).map((plan, index) => `
    <tr>
      <td><input type="date" value="${plan.date || data.currentMonth + '-15'}" onchange="updatePlanned(${index}, 'date', this.value)"></td>
      <td><input value="${escapeHtml(plan.desc || "")}" placeholder="ex: Bachelorette flights" onchange="updatePlanned(${index}, 'desc', this.value)"></td>
      <td><select onchange="updatePlanned(${index}, 'type', this.value)">${planTypes.map(type => `<option ${plan.type === type ? 'selected' : ''}>${type}</option>`).join("")}</select></td>
      <td><input type="number" step="0.01" value="${Number(plan.amount) || 0}" onchange="updatePlanned(${index}, 'amount', this.value)"></td>
      <td><input type="checkbox" ${plan.paid ? 'checked' : ''} onchange="updatePlanned(${index}, 'paid', this.checked)"></td>
      <td><button class="danger tiny" onclick="deletePlanned(${index})">×</button></td>
    </tr>`).join("") || `<tr><td colspan="6" class="small">No planned expenses yet.</td></tr>`;

  const projection = cashProjection();
  const buffer = Number(data.cash.bufferTarget) || 0;
  document.getElementById("cashInsight").innerHTML = Number(data.cash.cashStart) === 0
    ? `<b>Manual starting cash is $0.</b> Enter the amount of cash you want the cash-flow planner to start from, otherwise the timeline will look wrong.`
    : (projection.low < buffer ? `<b>Heads up:</b> lowest projected cash is ${fmt.format(projection.low)}, below your ${fmt.format(buffer)} buffer.` : `<b>Looks okay:</b> lowest projected cash is ${fmt.format(projection.low)}, above your ${fmt.format(buffer)} buffer.`);

  document.getElementById("timeline").innerHTML = projection.events.map(event => `
    <div class="event ${event.type}">
      <div class="date">${shortDate(event.date)}</div>
      <div><b>${escapeHtml(event.desc)}</b><br><span class="small">Projected balance after: ${fmt.format(event.balance)}</span></div>
      <div class="impact ${event.amount >= 0 ? 'positive' : 'negative'}">${event.amount >= 0 ? '+' : '-'}${fmt.format(Math.abs(event.amount))}</div>
    </div>`).join("");
}

function downloadCSV() {
  const rows = [["Month","Section","Week","Week Starting","Date","Description","Category/Type","Amount","Status"]];

  Object.entries(data.months).forEach(([monthKey, month]) => {
    (month.expenses || []).forEach(expense => {
      rows.push([
        monthKey,
        "Weekly",
        Number(expense.week) + 1,
        month.weekStarts[Number(expense.week)],
        expense.date,
        expense.desc,
        expense.category,
        expense.amount,
        month.finalizedWeeks?.[expense.week] ? "Finalized" : "Open"
      ]);
    });
  });

  (data.fixedBills || []).forEach(bill => {
    rows.push(["", "Fixed Bill", "", "", bill.startDate, bill.name, bill.category, bill.amount, bill.endDate ? ("Ends " + bill.endDate) : "Active"]);
  });

  (data.plannedExpenses || []).forEach(plan => {
    rows.push([String(plan.date).slice(0, 7), "Planned", "", "", plan.date, plan.desc, plan.type, plan.amount, plan.paid ? "Paid" : "Outstanding"]);
  });

  const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pot-budget-export.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function resetData() {
  if (confirm("Reset everything? Export CSV first if you want a backup.")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}
