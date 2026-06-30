/**
 * Budget Tests
 * Tests the weekly allowance formula and fixed bill calculations
 * 
 * Critical formula: (income - active fixed bills) × 12 ÷ 365 × 7
 * Fixed bills are date-based: only count if bill active on week's start date
 */

const fs = require('fs');
const vm = require('vm');

function loadFile(path) { return fs.readFileSync(path, 'utf8'); }

// Bundle all required files
const files = ['js/utils.js', 'js/budget.js'];
let src = files.map(f => `// ----- ${f}\n` + loadFile(f)).join('\n\n');

// Add test harness
src += `
(function() {
  global.data = null;
  global.render = () => {};
  
  console.log('\\n=== BUDGET FORMULA TESTS ===\\n');
  
  // TEST 1: Basic allowance with no fixed bills
  global.data = {
    income: 5000,
    fixedBills: [],
    months: {}
  };
  
  const test1 = weeklyAllowance('2026-07-01');
  const expected1 = (5000 - 0) * 12 / 365 * 7;
  const pass1 = Math.abs(test1 - expected1) < 0.01;
  console.log('Test 1: Basic allowance (no fixed bills)');
  console.log('  Income: $5000, Fixed Bills: $0');
  console.log('  Expected: $' + expected1.toFixed(2));
  console.log('  Got:      $' + test1.toFixed(2));
  console.log('  Status:   ' + (pass1 ? '✅ PASS' : '❌ FAIL'));
  console.log();
  
  // TEST 2: Allowance with active fixed bills
  global.data = {
    income: 5000,
    fixedBills: [
      { name: 'Rent', category: 'Housing', amount: 1500, startDate: '2026-07-01', endDate: '', active: true },
      { name: 'Car', category: 'Car', amount: 300, startDate: '2026-07-01', endDate: '', active: true }
    ],
    months: {}
  };
  
  const test2 = weeklyAllowance('2026-07-01');
  const expected2 = (5000 - 1800) * 12 / 365 * 7;
  const pass2 = Math.abs(test2 - expected2) < 0.01;
  console.log('Test 2: Allowance with active fixed bills');
  console.log('  Income: $5000, Fixed Bills: $1800 (Rent $1500 + Car $300)');
  console.log('  Expected: $' + expected2.toFixed(2));
  console.log('  Got:      $' + test2.toFixed(2));
  console.log('  Status:   ' + (pass2 ? '✅ PASS' : '❌ FAIL'));
  console.log();
  
  // TEST 3: Fixed bills date-based filtering
  // Bill starts 2026-07-15, so week starting 2026-07-01 should NOT include it
  global.data = {
    income: 5000,
    fixedBills: [
      { name: 'Rent', category: 'Housing', amount: 1500, startDate: '2026-07-01', endDate: '', active: true },
      { name: 'Future Bill', category: 'Other', amount: 500, startDate: '2026-07-15', endDate: '', active: true }
    ],
    months: {}
  };
  
  const fixed1 = monthlyFixedOn('2026-07-01');
  const fixed2 = monthlyFixedOn('2026-07-15');
  const pass3a = Math.abs(fixed1 - 1500) < 0.01;
  const pass3b = Math.abs(fixed2 - 2000) < 0.01;
  console.log('Test 3: Date-based fixed bill filtering');
  console.log('  Fixed bills on 2026-07-01: $' + fixed1.toFixed(2) + ' (expected $1500) - ' + (pass3a ? '✅' : '❌'));
  console.log('  Fixed bills on 2026-07-15: $' + fixed2.toFixed(2) + ' (expected $2000) - ' + (pass3b ? '✅' : '❌'));
  console.log();
  
  // TEST 4: Fixed bills with end date
  global.data = {
    income: 5000,
    fixedBills: [
      { name: 'Temp Bill', category: 'Other', amount: 300, startDate: '2026-07-01', endDate: '2026-07-14', active: true },
      { name: 'Permanent Bill', category: 'Other', amount: 200, startDate: '2026-07-01', endDate: '', active: true }
    ],
    months: {}
  };
  
  const fixed3 = monthlyFixedOn('2026-07-08');  // Within temp bill range
  const fixed4 = monthlyFixedOn('2026-07-15');  // After temp bill end
  const pass4a = Math.abs(fixed3 - 500) < 0.01;  // 300 + 200
  const pass4b = Math.abs(fixed4 - 200) < 0.01;  // only 200
  console.log('Test 4: Fixed bills with end date');
  console.log('  Fixed bills on 2026-07-08 (within range): $' + fixed3.toFixed(2) + ' (expected $500) - ' + (pass4a ? '✅' : '❌'));
  console.log('  Fixed bills on 2026-07-15 (after range): $' + fixed4.toFixed(2) + ' (expected $200) - ' + (pass4b ? '✅' : '❌'));
  console.log();
  
  // TEST 5: Inactive bills ignored
  global.data = {
    income: 5000,
    fixedBills: [
      { name: 'Active', category: 'Other', amount: 100, startDate: '2026-07-01', endDate: '', active: true },
      { name: 'Inactive', category: 'Other', amount: 200, startDate: '2026-07-01', endDate: '', active: false }
    ],
    months: {}
  };
  
  const fixed5 = monthlyFixedOn('2026-07-01');
  const pass5 = Math.abs(fixed5 - 100) < 0.01;
  console.log('Test 5: Inactive bills ignored');
  console.log('  Active: $100, Inactive: $200');
  console.log('  Total active: $' + fixed5.toFixed(2) + ' (expected $100) - ' + (pass5 ? '✅' : '❌'));
  console.log();
  
  // Summary
  const allPass = pass1 && pass2 && pass3a && pass3b && pass4a && pass4b && pass5;
  console.log('=== SUMMARY ===');
  console.log('Tests passed: ' + (allPass ? 'ALL ✅' : 'SOME FAILED ❌'));
  process.exit(allPass ? 0 : 1);
})();
`;

const script = new vm.Script(src, { filename: 'budget.test.js' });
const context = vm.createContext({ console, process, global: {} });
script.runInContext(context);
