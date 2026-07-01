function render() {
  try {
    console.log('📄 [ui.js] render() called');
    console.log('📄 [ui.js] data.currentMonth:', data?.currentMonth);
    
    ensureMonth(data.currentMonth);
    console.log('✅ [ui.js] ensureMonth() succeeded');
    
    document.getElementById("income").value = data.income;
    document.getElementById("openingStash").value = data.openingStash;
    document.getElementById("fixedTotal").value = monthlyFixedOn(data.currentMonth + "-01").toFixed(2);
    console.log('✅ [ui.js] Set core inputs');

    Object.entries(data.cash).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) element.value = value;
    });
    console.log('✅ [ui.js] Set cash inputs');

    document.querySelectorAll("[data-lockable]").forEach(el => {
      el.disabled = data.cash.locked;
    });

    document.getElementById("cashLockBtn").textContent = data.cash.locked ? "Unlock cash-flow constants" : "Lock cash-flow constants";
    document.getElementById("monthTitle").textContent = monthName(data.currentMonth);
    console.log('✅ [ui.js] Set titles and lock state');

    console.log('🎨 [ui.js] Calling renderMetrics()...');
    renderMetrics();
    console.log('✅ [ui.js] renderMetrics() done');
    
    console.log('🎨 [ui.js] Calling renderFixedBills()...');
    renderFixedBills();
    console.log('✅ [ui.js] renderFixedBills() done');
    
    console.log('🎨 [ui.js] Calling renderWeeks()...');
    renderWeeks();
    console.log('✅ [ui.js] renderWeeks() done');
    
    console.log('🎨 [ui.js] Calling renderChart()...');
    renderChart();
    console.log('✅ [ui.js] renderChart() done');
    
    console.log('🎨 [ui.js] Calling renderPlanner()...');
    renderPlanner();
    console.log('✅ [ui.js] renderPlanner() done');
    
    console.log('✅ [ui.js] render() completed successfully');
  } catch (error) {
    console.error('❌ [ui.js] FATAL ERROR in render():', error);
    console.error('Stack trace:', error.stack);
    document.body.innerHTML = `<pre style="padding:2rem; color:red; font-family:monospace;">
ERROR in render():
${error.message}

${error.stack}
    </pre>`;
  }
  
  // Update locked budget foundation display
  if (typeof updateBudgetFoundationDisplay === 'function') {
    try {
      updateBudgetFoundationDisplay();
      console.log('✅ [ui.js] Budget foundation display updated');
    } catch (e) {
      console.warn('⚠️ [ui.js] Failed to update budget foundation:', e);
    }
  }
}

function switchMainTab(tabName) {
  // Hide all tabs
  document.getElementById('homeTab').classList.add('hidden');
  document.getElementById('detailedTab').classList.add('hidden');
  
  // Remove active class from all buttons
  document.getElementById('homeTabBtn').classList.remove('active');
  document.getElementById('detailedTabBtn').classList.remove('active');
  
  // Show selected tab and mark button active
  if (tabName === 'home') {
    document.getElementById('homeTab').classList.remove('hidden');
    document.getElementById('homeTabBtn').classList.add('active');
  } else if (tabName === 'detailed') {
    document.getElementById('detailedTab').classList.remove('hidden');
    document.getElementById('detailedTabBtn').classList.add('active');
  }
}

function scrollToCurrentWeek() {
  const activeWeek = document.querySelector('.week.active');
  if (activeWeek) {
    activeWeek.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

let cardIndex = 0; // For swipe navigation

function renderMetrics() {
  const weeks = calcWeeks();
  const currentMonth = data.currentMonth;
  cardIndex = 0; // Reset to first card
  
  // Get the REAL Stash balance (finalized weeks only)
  const currentStash = getCurrentStashBalance();
  
  // Calculate this month's spending and allowance (ALL weeks in current month)
  // Available This Month = sum of all weeks' allowance - total spent across all weeks
  // This does NOT include Stash
  const totalSpentThisMonth = weeks.reduce((sum, week) => sum + (Number(week.used) || 0), 0);
  const totalAllowanceThisMonth = weeks.reduce((sum, week) => sum + (Number(week.allowance) || 0), 0);
  const availableThisMonth = totalAllowanceThisMonth - totalSpentThisMonth;
  
  // Calculate if spending pace matches days passed
  const today = new Date();
  const daysInMonth = new Date(currentMonth.split('-')[0], currentMonth.split('-')[1], 0).getDate();
  const dayOfMonth = today.getDate();
  const daysCompletePercent = (dayOfMonth / daysInMonth);
  const spendingPercent = totalSpentThisMonth / Math.max(1, totalAllowanceThisMonth);
  const paceStatus = Math.abs(daysCompletePercent - spendingPercent) < 0.15 
    ? '✓ On pace' 
    : (spendingPercent > daysCompletePercent 
      ? '⚠ Ahead of pace' 
      : '✓ Behind pace');

  document.getElementById("metricCards").innerHTML = `
    <div class="panel metric leftover">
      <div class="label">✅ Available This Month</div>
      <div class="value">${fmt.format(availableThisMonth)}</div>
      <div class="small">(Monthly budget left to spend)</div>
    </div>
    <div class="panel metric spent">
      <div class="label">💸 Total Spent This Month</div>
      <div class="value">${fmt.format(totalSpentThisMonth)}</div>
      <div class="small">(Sum of all costs)</div>
    </div>
    <div class="panel metric">
      <div class="label">📈 Spending Pace</div>
      <div class="value">${paceStatus}</div>
      <div class="small">${Math.round(spendingPercent * 100)}% of budget used</div>
    </div>
    <div class="panel metric">
      <div class="label">💰 Current Stash</div>
      <div class="value">${fmt.format(currentStash)}</div>
      <div class="small">Money you've saved from completed weeks</div>
    </div>`;
  
  // Add swipe gesture support for cards on mobile
  setupCardSwipe();
}

function setupCardSwipe() {
  const container = document.getElementById("metricCards");
  if (!container) return;
  
  let startX = 0;
  let startY = 0;
  
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, false);
  
  container.addEventListener('touchend', (e) => {
    if (!startX) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Must be more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const cards = container.querySelectorAll('.panel.metric');
      if (diffX > 0) {
        // Swiped left - next card
        cardIndex = (cardIndex + 1) % cards.length;
      } else {
        // Swiped right - previous card
        cardIndex = (cardIndex - 1 + cards.length) % cards.length;
      }
      
      // Scroll to card with animation
      cards[cardIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    startX = 0;
    startY = 0;
  }, false);
}

function renderFixedBills() {
  const rows = (data.fixedBills || []).map((bill, index) => `
    <tr>
      <td><input class="nameinput" value="${escapeHtml(bill.name || "")}" placeholder="ex: Car payment" onchange="updateFixedBill(${index}, 'name', this.value)"></td>
      <td><select onchange="updateFixedBill(${index}, 'category', this.value)">${billCats.map(category => `<option ${bill.category === category ? 'selected' : ''}>${category}</option>`).join("")}</select></td>
      <td><input type="number" step="0.01" value="${Number(bill.amount) || 0}" onchange="updateFixedBill(${index}, 'amount', this.value)"></td>
      <td><input type="checkbox" ${bill.active !== false ? 'checked' : ''} onchange="updateFixedBill(${index}, 'active', this.checked)"></td>
      <td><button class="danger tiny" onclick="deleteFixedBill(${index})">×</button></td>
    </tr>`).join("");

  document.getElementById("fixedBillRows").innerHTML = rows || `<tr><td colspan="5" class="small">No fixed bills yet.</td></tr>`;
}

function renderWeeks() {
  const weeks = calcWeeks();
  const currentWeekIndex = Math.max(0, weeks.findIndex(w => !w.finalized));
  
  // Build tabs
  const tabs = weeks.map((week, i) => `
    <button class="week-tab ${i === currentWeekIndex ? 'active' : ''}" onclick="switchWeek(${i})">
      Week ${i + 1}
    </button>
  `).join("");

  // Build week cards with data attributes for tab selection
  const weekCards = weeks.map((week, i) => {
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
      <div class="week ${frozen ? 'finalized' : ''} ${i === currentWeekIndex ? 'active' : 'hidden'}" data-week-index="${i}">
        <div class="week-head">
          <div>
            <div class="week-title">Week ${week.i + 1}: ${shortDate(week.date)} – ${shortDate(addDays(week.date, 6))}</div>
            <div class="small">${frozen ? 'Finalized/frozen. Past math will not rewrite.' : 'Finalize at week end to lock allowance, spending, left over, and Stash.'}</div>
          </div>
          <div class="badge ${frozen ? 'warn' : (ok ? 'good' : 'bad')}">${frozen ? 'Finalized' : (ok ? `${fmt.format(week.leftover)} left` : `${fmt.format(Math.abs(week.leftover))} over`)}</div>
        </div>
        <div class="week-stats">
          <div class="stat"><div class="label">Allowance</div><div class="num">${fmt.format(week.allowance)}</div></div>
          <div class="stat"><div class="label">Spent</div><div class="num">${fmt.format(week.used)}</div></div>
          <div class="stat"><div class="label">Left over</div><div class="num">${fmt.format(week.leftover)}</div></div>
        </div>
        <details class="expense-details ${frozen ? 'open' : ''}">
          <summary style="cursor:pointer; padding:8px; font-weight:600; color:var(--muted);">
            ▼ Expenses (${rows ? rows.split('<tr>').length - 1 : 0})
          </summary>
          <div class="table-wrap" style="padding-top:8px;">
            <table>
              <thead>
                <tr><th>Date</th><th>Cost / Purchase</th><th>Category</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>${rows || `<tr><td colspan="5" class="small" style="padding:16px">No costs entered yet.</td></tr>`}</tbody>
            </table>
          </div>
        </details>
        <div class="expense-actions">
          <div>${frozen ? `<button class="secondary" onclick="unfinalizeWeek(${week.i})">Unfinalize week</button>` : `<button class="secondary" onclick="addExpense(${week.i})">+ Add cost</button> <button onclick="finalizeWeek(${week.i})">Finalize week</button>`}</div>
          <span class="small">${frozen ? `Frozen on ${week.finalizedAt || 'saved date'}` : `Finalizing moves this week's leftover to your Stash.`}</span>
        </div>
      </div>`;
  }).join("");

  document.getElementById("weeks").innerHTML = `
    <div class="week-tabs">${tabs}</div>
    <div class="weeks-container">${weekCards}</div>
  `;
  
  setupWeekNavigation();
}

function switchWeek(index) {
  const allWeeks = document.querySelectorAll('[data-week-index]');
  const allTabs = document.querySelectorAll('.week-tab');
  
  allWeeks.forEach(week => {
    week.classList.remove('active');
    week.classList.add('hidden');
  });
  
  allTabs.forEach(tab => tab.classList.remove('active'));
  
  const selectedWeek = document.querySelector(`[data-week-index="${index}"]`);
  const selectedTab = document.querySelectorAll('.week-tab')[index];
  
  if (selectedWeek) {
    selectedWeek.classList.remove('hidden');
    selectedWeek.classList.add('active');
  }
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
}

function setupWeekNavigation() {
  const container = document.querySelector('.weeks-container');
  if (!container) return;
  
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });
  
  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });
  
  container.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    
    const diff = startX - currentX;
    const threshold = 50;
    
    const allTabs = document.querySelectorAll('.week-tab');
    const activeTab = Array.from(allTabs).findIndex(t => t.classList.contains('active'));
    
    if (diff > threshold && activeTab < allTabs.length - 1) {
      switchWeek(activeTab + 1);
    } else if (diff < -threshold && activeTab > 0) {
      switchWeek(activeTab - 1);
    }
  });
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
  document.getElementById("cashInsight").innerHTML = projection.low < buffer 
    ? `<b>Heads up:</b> lowest projected cash is ${fmt.format(projection.low)}, below your ${fmt.format(buffer)} buffer.` 
    : `<b>Looks okay:</b> lowest projected cash is ${fmt.format(projection.low)}, above your ${fmt.format(buffer)} buffer.`;

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
    rows.push(["", "Fixed Bill", "", "", bill.name, bill.category, bill.amount, bill.active !== false ? "Active" : "Inactive"]);
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

// JSON Backup/Restore handlers
function downloadJSONBackupHandler() {
  const result = downloadJSONBackup(data);
  alert(result.message);
}

function importJSONBackupHandler(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  importJSONBackupFromFile(
    file,
    (message) => {
      alert(message);
    },
    (error) => {
      alert(error);
    }
  );

  // Reset file input
  event.target.value = "";
}
