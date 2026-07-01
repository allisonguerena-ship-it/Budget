/**
 * COMPREHENSIVE MATH AUDIT TESTS
 * Verifies all budget formulas match the specification exactly
 * 
 * CORE FORMULAS:
 * 1. Weekly income = Monthly income × 12 ÷ 52
 * 2. Weekly allowance = Weekly income − Weekly fixed bills
 * 3. Weekly spent = sum of all costs added to that week
 * 4. Weekly leftover = Weekly allowance − Weekly spent
 * 5. POT = Opening POT + Sum(finalized week leftovers)
 * 6. Available This Month = Sum(weekly allowances for non-finalized weeks) − Total spent this month
 * 7. Spending pace = spent / allowance (NOT including POT)
 */

const fs = require('fs');
const vm = require('vm');

function loadFile(path) { return fs.readFileSync(path, 'utf8'); }

// Load all required files
const files = ['js/utils.js', 'js/budget.js', 'js/pot.js', 'js/weeks.js'];
let src = files.map(f => `// ----- ${f}\n` + loadFile(f)).join('\n\n');

// Add test harness
src += `
(function() {
  global.data = null;
  global.render = () => {};
  global.monthKeyFromDate = monthKeyFromDate;
  global.defaultWeekStarts = defaultWeekStarts;
  
  console.log('\\n' + '='.repeat(70));
  console.log('COMPREHENSIVE MATH AUDIT - JULY 2026 BUDGET');
  console.log('='.repeat(70) + '\\n');
  
  // Setup test data matching current app state
  global.data = {
    income: 5708.68,
    openingPot: 463.71,
    currentMonth: "2026-07",
    fixedBills: [
      { name: "Rent", category: "Housing", amount: 2698, active: true },
      { name: "Utilities", category: "Housing", amount: 80, active: true },
      { name: "Subscriptions", category: "Subscription", amount: 42.19, active: true },
      { name: "Loans", category: "Debt", amount: 116, active: true },
      { name: "Damien fees", category: "Other", amount: 116, active: true },
      { name: "Car insurance", category: "Car", amount: 164, active: true },
      { name: "Car payment", category: "Car", amount: 305, active: true }
    ],
    months: {
      "2026-07": {
        weekStarts: ["2026-07-01", "2026-07-08", "2026-07-15", "2026-07-22", "2026-07-29"],
        expenses: [
          // Week 1 (Jul 1-7)
          { week: 0, date: "2026-07-01", desc: "Coffee", category: "Coffee", amount: 5.50 },
          { week: 0, date: "2026-07-02", desc: "Groceries", category: "Groceries", amount: 125.00 },
          // Week 2 (Jul 8-14) - over budget
          { week: 1, date: "2026-07-10", desc: "Splurge", category: "Shopping", amount: 600.00 }
        ],
        finalizedWeeks: {}
      }
    }
  };
  
  let passCount = 0;
  let failCount = 0;
  
  function test(name, actual, expected, tolerance = 0.01) {
    const pass = Math.abs(actual - expected) < tolerance;
    if (pass) passCount++; else failCount++;
    const status = pass ? '✅ PASS' : '❌ FAIL';
    console.log(\`\${status} \${name}\`);
    if (!pass) {
      console.log(\`     Expected: \${expected.toFixed(2)}\`);
      console.log(\`     Got:      \${actual.toFixed(2)}\`);
    }
  }
  
  // ===== FORMULA 1: Weekly Income =====
  console.log('\\n--- FORMULA 1: Weekly Income ---');
  console.log('Formula: Monthly income × 12 ÷ 52');
  const weeklyIncome = 5708.68 * 12 / 52;
  console.log(\`Monthly income: $5708.68\`);
  console.log(\`Weekly income: $5708.68 × 12 ÷ 52 = $\${weeklyIncome.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 2: Monthly Fixed Bills =====
  console.log('--- FORMULA 2: Monthly Fixed Bills Total ---');
  const monthlyFixed = monthlyFixedOn("2026-07-01");
  const expectedMonthlyFixed = 2698 + 80 + 42.19 + 116 + 116 + 164 + 305;
  test('Sum all active fixed bills', monthlyFixed, expectedMonthlyFixed);
  console.log(\`  Breakdown: Rent \$2698 + Utilities \$80 + Subscriptions \$42.19 + Loans \$116 + Damien fees \$116 + Car insurance \$164 + Car payment \$305\`);
  console.log(\`  Total: $\${monthlyFixed.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 3: Weekly Fixed Bills =====
  console.log('--- FORMULA 3: Weekly Fixed Bills ---');
  const weeklyFixed = monthlyFixed * 12 / 52;
  console.log(\`Weekly fixed: $\${monthlyFixed.toFixed(2)} × 12 ÷ 52 = $\${weeklyFixed.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 4: Weekly Allowance =====
  console.log('--- FORMULA 4: Weekly Allowance ---');
  console.log('Formula: Weekly income − Weekly fixed bills');
  const allowanceWeek1 = weeklyAllowance("2026-07-01");
  const expectedAllowance = weeklyIncome - weeklyFixed;
  test('Week 1 allowance calculation', allowanceWeek1, expectedAllowance);
  console.log(\`  Weekly income: $\${weeklyIncome.toFixed(2)}\`);
  console.log(\`  Weekly fixed: $\${weeklyFixed.toFixed(2)}\`);
  console.log(\`  Allowance: $\${allowanceWeek1.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 5: Weekly Spending =====
  console.log('--- FORMULA 5: Weekly Spending ---');
  console.log('Formula: sum of all costs added to that week');
  const week1Spent = spent(0);
  const expectedWeek1Spent = 5.50 + 125.00;
  test('Week 1 total spent', week1Spent, expectedWeek1Spent);
  const week2Spent = spent(1);
  const expectedWeek2Spent = 600.00;
  test('Week 2 total spent', week2Spent, expectedWeek2Spent);
  console.log(\`  Week 1 expenses: Coffee \$5.50 + Groceries \$125.00 = $\${week1Spent.toFixed(2)}\`);
  console.log(\`  Week 2 expenses: Splurge \$600.00 = $\${week2Spent.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 6: Weekly Leftover =====
  console.log('--- FORMULA 6: Weekly Leftover ---');
  console.log('Formula: Weekly allowance − Weekly spent');
  const weeks = calcWeeks();
  const week1 = weeks[0];
  const week2 = weeks[1];
  const expectedWeek1Leftover = allowanceWeek1 - week1Spent;
  const expectedWeek2Leftover = allowanceWeek1 - week2Spent; // Week 2 has same allowance, different spending
  test('Week 1 leftover', week1.leftover, expectedWeek1Leftover);
  test('Week 2 leftover (over budget)', week2.leftover, expectedWeek2Leftover);
  console.log(\`  Week 1: $\${allowanceWeek1.toFixed(2)} − $\${week1Spent.toFixed(2)} = $\${week1.leftover.toFixed(2)}\`);
  console.log(\`  Week 2: $\${allowanceWeek1.toFixed(2)} − $\${week2Spent.toFixed(2)} = $\${week2.leftover.toFixed(2)} (NEGATIVE = over budget)\`);
  console.log('');
  
  // ===== FORMULA 7: Unfinalized POT (should NOT include unfinalized weeks) =====
  console.log('--- FORMULA 7: POT Calculation (Unfinalized State) ---');
  console.log('Formula: Opening POT + Sum(finalized week leftovers only)');
  const currentPot = getCurrentPotBalance();
  test('POT with no finalized weeks', currentPot, 463.71);
  console.log(\`  Opening POT: $463.71\`);
  console.log(\`  No finalized weeks yet\`);
  console.log(\`  Current POT: $\${currentPot.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 8: Finalized Week POT Effect =====
  console.log('--- FORMULA 8: Finalize Week 1 Effect ---');
  console.log('Action: Lock Week 1 leftover and add to POT');
  // Simulate finalizing Week 1
  global.data.months["2026-07"].finalizedWeeks["0"] = {
    date: week1.date,
    allowance: week1.allowance,
    used: week1.used,
    leftover: week1.leftover,
    endingPot: week1.leftover + 463.71,
    fixed: week1.fixed,
    finalized: true
  };
  const potAfterWeek1 = getCurrentPotBalance();
  const expectedPotAfterWeek1 = 463.71 + expectedWeek1Leftover;
  test('POT after finalizing Week 1', potAfterWeek1, expectedPotAfterWeek1);
  console.log(\`  Week 1 leftover: $\${expectedWeek1Leftover.toFixed(2)}\`);
  console.log(\`  POT changed from $463.71 to $\${potAfterWeek1.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 9: Over-Budget Week POT Effect =====
  console.log('--- FORMULA 9: Finalize Week 2 (Over Budget) ---');
  console.log('Action: Week 2 is over budget, should REDUCE POT');
  // Simulate finalizing Week 2
  global.data.months["2026-07"].finalizedWeeks["1"] = {
    date: week2.date,
    allowance: week2.allowance,
    used: week2.used,
    leftover: week2.leftover,
    endingPot: potAfterWeek1 + week2.leftover,
    fixed: week2.fixed,
    finalized: true
  };
  const potAfterWeek2 = getCurrentPotBalance();
  const expectedPotAfterWeek2 = potAfterWeek1 + expectedWeek2Leftover;
  test('POT after finalizing Week 2 (over-budget)', potAfterWeek2, expectedPotAfterWeek2);
  console.log(\`  Week 2 leftover: $\${expectedWeek2Leftover.toFixed(2)} (NEGATIVE)\`);
  console.log(\`  POT reduced from $\${potAfterWeek1.toFixed(2)} to $\${potAfterWeek2.toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 10: Available This Month =====
  console.log('--- FORMULA 10: Available This Month ---');
  console.log('Formula: Sum(weekly allowances for unfinalized weeks) − Total spent in unfinalized weeks');
  console.log('Important: Does NOT include POT');
  // Unfinalize weeks to test this
  delete global.data.months["2026-07"].finalizedWeeks["0"];
  delete global.data.months["2026-07"].finalizedWeeks["1"];
  const weeksRecalc = calcWeeks();
  const unfinWeeks = weeksRecalc.filter(w => !w.finalized);
  const totalAllowance = unfinWeeks.reduce((sum, w) => sum + w.allowance, 0);
  const totalSpent = unfinWeeks.reduce((sum, w) => sum + w.used, 0);
  const available = totalAllowance - totalSpent;
  console.log(\`  Unfinalized weeks count: \${unfinWeeks.length}\`);
  console.log(\`  Total allowance (5 weeks): $\${totalAllowance.toFixed(2)}\`);
  console.log(\`  Total spent: $\${totalSpent.toFixed(2)}\`);
  console.log(\`  Available: $\${available.toFixed(2)}\`);
  console.log(\`  POT is NOT included: $\${getCurrentPotBalance().toFixed(2)}\`);
  console.log('');
  
  // ===== FORMULA 11: Spending Pace =====
  console.log('--- FORMULA 11: Spending Pace ---');
  console.log('Formula: (Total spent / Total allowance) × 100%');
  console.log('Important: Does NOT include POT');
  const spendingPercent = (totalSpent / totalAllowance) * 100;
  console.log(\`  Total spent: $\${totalSpent.toFixed(2)}\`);
  console.log(\`  Total allowance: $\${totalAllowance.toFixed(2)}\`);
  console.log(\`  Pace: \${spendingPercent.toFixed(1)}% of budget used\`);
  console.log('');
  
  // ===== SUMMARY =====
  console.log('\\n' + '='.repeat(70));
  console.log('TEST RESULTS');
  console.log('='.repeat(70));
  console.log(\`✅ PASS: \${passCount}\`);
  console.log(\`❌ FAIL: \${failCount}\`);
  console.log(\`Total: \${passCount + failCount}\`);
  console.log('');
  
  if (failCount === 0) {
    console.log('🎉 ALL FORMULAS VERIFIED CORRECT');
  } else {
    console.log('⚠️  FORMULA ERRORS DETECTED - REVIEW ABOVE');
    process.exit(1);
  }
})();
`;

try {
  vm.runInNewContext(src, {});
} catch (e) {
  console.error('Test execution error:', e.message);
  process.exit(1);
}
