/**
 * Weeks Tests
 * Tests week finalization and POT rolling
 * 
 * Critical behavior:
 * 1. Finalized weeks stay frozen unless manually unfinalized
 * 2. Future bill changes should NOT rewrite past finalized weeks
 * 3. POT rolls from one week to the next
 */

const fs = require('fs');
const vm = require('vm');

function loadFile(path) { return fs.readFileSync(path, 'utf8'); }

// Bundle all required files
const files = [
  'js/utils.js',
  'js/budget.js',
  'js/pot.js',
  'js/weeks.js'
];
let src = files.map(f => `// ----- ${f}\n` + loadFile(f)).join('\n\n');

// Add test harness
src += `
(function() {
  global.data = null;
  global.render = () => {};
  
  console.log('\\n=== WEEKS & FINALIZATION TESTS ===\\n');
  
  // Setup: Create a basic month with 4 weeks
  const monthKey = '2026-07';
  global.data = {
    currentMonth: monthKey,
    income: 5000,
    openingPot: 0,
    learnedCategories: {},
    fixedBills: [
      { name: 'Rent', category: 'Housing', amount: 3000, startDate: monthKey + '-01', endDate: '', active: true }
    ],
    cash: { locked: true },
    plannedExpenses: [],
    months: {
      [monthKey]: {
        weekStarts: ['2026-07-01', '2026-07-08', '2026-07-15', '2026-07-22'],
        expenses: [
          // Week 0
          { week: 0, date: '2026-07-03', desc: 'Groceries', category: 'Food', amount: 50 },
          { week: 0, date: '2026-07-05', desc: 'Coffee', category: 'Coffee', amount: 15 }
        ],
        finalizedWeeks: {}
      }
    }
  };
  
  // TEST 1: Week calculations before finalization
  function current() { return data.months[data.currentMonth]; }
  const weeks1 = calcWeeks();
  const week0 = weeks1[0];
  const allowance0 = (5000 - 3000) * 12 / 365 * 7;
  const spent0 = 50 + 15;
  const leftover0 = allowance0 - spent0;
  
  const pass1a = Math.abs(week0.allowance - allowance0) < 0.01;
  const pass1b = Math.abs(week0.used - spent0) < 0.01;
  const pass1c = Math.abs(week0.leftover - leftover0) < 0.01;
  
  console.log('Test 1: Week 0 calculations (before finalization)');
  console.log('  Allowance: $' + week0.allowance.toFixed(2) + ' (expected $' + allowance0.toFixed(2) + ') - ' + (pass1a ? '✅' : '❌'));
  console.log('  Spent: $' + week0.used.toFixed(2) + ' (expected $' + spent0.toFixed(2) + ') - ' + (pass1b ? '✅' : '❌'));
  console.log('  Leftover: $' + week0.leftover.toFixed(2) + ' (expected $' + leftover0.toFixed(2) + ') - ' + (pass1c ? '✅' : '❌'));
  console.log();
  
  // TEST 2: Finalize week 0
  finalizeWeek(0);
  const finalizedSnap = JSON.parse(JSON.stringify(current().finalizedWeeks[0]));
  
  const pass2a = finalizedSnap !== undefined;
  const pass2b = Math.abs(finalizedSnap.allowance - allowance0) < 0.01;
  const pass2c = Math.abs(finalizedSnap.used - spent0) < 0.01;
  const pass2d = Math.abs(finalizedSnap.leftover - leftover0) < 0.01;
  
  console.log('Test 2: Finalize week 0');
  console.log('  Week 0 frozen: ' + (pass2a ? '✅' : '❌'));
  console.log('  Frozen allowance: $' + finalizedSnap.allowance.toFixed(2) + ' - ' + (pass2b ? '✅' : '❌'));
  console.log('  Frozen spent: $' + finalizedSnap.used.toFixed(2) + ' - ' + (pass2c ? '✅' : '❌'));
  console.log('  Frozen leftover: $' + finalizedSnap.leftover.toFixed(2) + ' - ' + (pass2d ? '✅' : '❌'));
  console.log();
  
  // TEST 3: Add a huge future bill and verify finalized week does NOT rewrite
  data.fixedBills.push({
    name: 'New Expensive Bill',
    category: 'Other',
    amount: 2000,
    startDate: '2026-07-08',  // Starts week 1, should not affect week 0
    endDate: '',
    active: true
  });
  
  const finalizedSnapAfter = JSON.parse(JSON.stringify(current().finalizedWeeks[0]));
  
  const pass3a = Math.abs(finalizedSnapAfter.allowance - finalizedSnap.allowance) < 0.01;
  const pass3b = Math.abs(finalizedSnapAfter.leftover - finalizedSnap.leftover) < 0.01;
  
  console.log('Test 3: Finalized week unchanged after adding future bill');
  console.log('  Added: $2000 bill starting 2026-07-08');
  console.log('  Frozen allowance before: $' + finalizedSnap.allowance.toFixed(2));
  console.log('  Frozen allowance after:  $' + finalizedSnapAfter.allowance.toFixed(2));
  console.log('  Status: ' + (pass3a && pass3b ? '✅ FROZEN (unchanged)' : '❌ REWRITTEN'));
  console.log();
  
  // TEST 4: New weeks should reflect the new bill
  const weeks4 = calcWeeks();
  const week1 = weeks4[1];
  const allowance1 = (5000 - 3000 - 2000) * 12 / 365 * 7;  // New bill starts
  const pass4 = Math.abs(week1.allowance - allowance1) < 0.01;
  
  console.log('Test 4: New weeks reflect updated fixed bills');
  console.log('  Week 1 allowance: $' + week1.allowance.toFixed(2) + ' (expected $' + allowance1.toFixed(2) + ') - ' + (pass4 ? '✅' : '❌'));
  console.log();
  
  // TEST 5: POT rolling
  // Week 0 leftover: $leftover0, should become starting POT for week 1
  const week1StartPot = week1.startingPot;
  const pass5 = Math.abs(week1StartPot - leftover0) < 0.01;
  
  console.log('Test 5: POT rolls from week to week');
  console.log('  Week 0 leftover: $' + leftover0.toFixed(2));
  console.log('  Week 1 starting POT: $' + week1StartPot.toFixed(2));
  console.log('  Status: ' + (pass5 ? '✅ POT rolled' : '❌ POT not rolled'));
  console.log();
  
  // Summary
  const allPass = pass1a && pass1b && pass1c && pass2a && pass2b && pass2c && pass2d && 
                  pass3a && pass3b && pass4 && pass5;
  console.log('=== SUMMARY ===');
  console.log('Tests passed: ' + (allPass ? 'ALL ✅' : 'SOME FAILED ❌'));
  process.exit(allPass ? 0 : 1);
})();
`;

const script = new vm.Script(src, { filename: 'weeks.test.js' });
const context = vm.createContext({ console, process, global: {} });
script.runInContext(context);
