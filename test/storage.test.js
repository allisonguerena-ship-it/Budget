/**
 * Storage Tests
 * Tests localStorage migration from v2-v5 and default structure
 * 
 * Critical behavior:
 * 1. Old data (v2-v5) should migrate correctly
 * 2. Missing defaults should be filled in
 * 3. Structure should always have: currentMonth, income, months, fixedBills, etc.
 */

const fs = require('fs');
const vm = require('vm');

function loadFile(path) { return fs.readFileSync(path, 'utf8'); }

// Bundle all required files
const files = [
  'js/utils.js',
  'js/storage.js'
];
let src = files.map(f => `// ----- ${f}\n` + loadFile(f)).join('\n\n');

// Add test harness with mock localStorage
src += `
(function() {
  global.render = () => {};
  
  // Mock localStorage for testing
  const localStorageMock = {};
  global.localStorage = {
    getItem: (key) => localStorageMock[key] ?? null,
    setItem: (key, value) => { localStorageMock[key] = String(value); },
    removeItem: (key) => { delete localStorageMock[key]; }
  };
  
  console.log('\\n=== STORAGE MIGRATION TESTS ===\\n');
  
  // TEST 1: Fresh load with no data (should create defaults)
  localStorageMock['alli_pot_budget_app_v5'] = null;
  localStorageMock['alli_pot_budget_app_v4'] = null;
  localStorageMock['alli_pot_budget_app_v3'] = null;
  localStorageMock['alli_pot_budget_app_v2'] = null;
  
  global.data = loadData();
  
  const pass1a = data.currentMonth !== null;
  const pass1b = typeof data.income === 'number';
  const pass1c = typeof data.openingPot === 'number';
  const pass1d = Array.isArray(data.fixedBills);
  const pass1e = typeof data.months === 'object';
  const pass1f = data.months[data.currentMonth] !== undefined;
  
  console.log('Test 1: Fresh load creates default structure');
  console.log('  Has currentMonth: ' + (pass1a ? '✅' : '❌'));
  console.log('  Has income (number): ' + (pass1b ? '✅' : '❌'));
  console.log('  Has openingPot (number): ' + (pass1c ? '✅' : '❌'));
  console.log('  Has fixedBills (array): ' + (pass1d ? '✅' : '❌'));
  console.log('  Has months (object): ' + (pass1e ? '✅' : '❌'));
  console.log('  Current month initialized: ' + (pass1f ? '✅' : '❌'));
  console.log();
  
  // TEST 2: Load v5 data (should load as-is with defaults applied)
  const v5Data = {
    currentMonth: '2026-06',
    income: 3000,
    openingPot: 500,
    learnedCategories: {},
    fixedBills: [
      { name: 'Rent', category: 'Housing', amount: 1500, startDate: '2026-06-01', endDate: '', active: true }
    ],
    cash: { locked: true },
    plannedExpenses: [],
    months: {
      '2026-06': {
        weekStarts: ['2026-06-01', '2026-06-08'],
        expenses: [],
        finalizedWeeks: {}
      }
    }
  };
  
  localStorageMock['alli_pot_budget_app_v5'] = JSON.stringify(v5Data);
  global.data = loadData();
  
  const pass2a = data.income === 3000;
  const pass2b = data.openingPot === 500;
  const pass2c = data.fixedBills.length === 1;
  const pass2d = data.fixedBills[0].name === 'Rent';
  
  console.log('Test 2: Load v5 data (current version)');
  console.log('  Income preserved: $' + data.income + ' (expected $3000) - ' + (pass2a ? '✅' : '❌'));
  console.log('  Opening POT preserved: $' + data.openingPot + ' (expected $500) - ' + (pass2b ? '✅' : '❌'));
  console.log('  Fixed bills count: ' + data.fixedBills.length + ' (expected 1) - ' + (pass2c ? '✅' : '❌'));
  console.log('  First bill name: ' + data.fixedBills[0].name + ' (expected Rent) - ' + (pass2d ? '✅' : '❌'));
  console.log();
  
  // TEST 3: Load v4 data (should migrate)
  const v4Data = {
    currentMonth: '2026-05',
    income: 4000,
    startingPot: 100,  // v4 calls it startingPot, v5 calls it openingPot
    learnedCategories: {},
    fixedBills: [],
    months: {
      '2026-05': {
        weekStarts: ['2026-05-01', '2026-05-08'],
        expenses: [],
        finalizedWeeks: {}
      }
    }
  };
  
  localStorageMock['alli_pot_budget_app_v5'] = null;
  localStorageMock['alli_pot_budget_app_v4'] = JSON.stringify(v4Data);
  global.data = loadData();
  
  const pass3a = data.currentMonth === '2026-05';
  const pass3b = data.income === 4000;
  const pass3c = data.openingPot === 100;  // Should convert startingPot to openingPot
  
  console.log('Test 3: Migrate v4 data to v5');
  console.log('  Current month preserved: ' + (pass3a ? '✅' : '❌'));
  console.log('  Income preserved: $' + data.income + ' (expected $4000) - ' + (pass3b ? '✅' : '❌'));
  console.log('  startingPot → openingPot: $' + data.openingPot + ' (expected $100) - ' + (pass3c ? '✅' : '❌'));
  console.log();
  
  // TEST 4: Partial data (missing optional fields, should get defaults)
  const partialData = {
    currentMonth: '2026-06',
    income: 2000
    // Missing: openingPot, fixedBills, cash, plannedExpenses, learnedCategories, months
  };
  
  localStorageMock['alli_pot_budget_app_v5'] = JSON.stringify(partialData);
  global.data = loadData();
  
  const pass4a = data.openingPot === 0;  // Should default to 0
  const pass4b = Array.isArray(data.fixedBills);
  const pass4c = typeof data.cash === 'object';
  const pass4d = Array.isArray(data.plannedExpenses);
  const pass4e = typeof data.learnedCategories === 'object';
  
  console.log('Test 4: Partial data gets default fields');
  console.log('  Missing openingPot defaults to 0: ' + (pass4a ? '✅' : '❌'));
  console.log('  Missing fixedBills becomes array: ' + (pass4b ? '✅' : '❌'));
  console.log('  Missing cash becomes object: ' + (pass4c ? '✅' : '❌'));
  console.log('  Missing plannedExpenses becomes array: ' + (pass4d ? '✅' : '❌'));
  console.log('  Missing learnedCategories becomes object: ' + (pass4e ? '✅' : '❌'));
  console.log();
  
  // TEST 5: Month with missing weekStarts (should regenerate)
  const monthMissingWeeks = {
    currentMonth: '2026-06',
    income: 3000,
    openingPot: 0,
    learnedCategories: {},
    fixedBills: [],
    cash: {},
    plannedExpenses: [],
    months: {
      '2026-06': {
        // Missing weekStarts
        expenses: [],
        finalizedWeeks: {}
      }
    }
  };
  
  localStorageMock['alli_pot_budget_app_v5'] = JSON.stringify(monthMissingWeeks);
  global.data = loadData();
  
  const pass5a = data.months['2026-06'].weekStarts !== undefined;
  const pass5b = Array.isArray(data.months['2026-06'].weekStarts);
  const pass5c = data.months['2026-06'].weekStarts.length > 0;
  
  console.log('Test 5: Month with missing weekStarts regenerates them');
  console.log('  weekStarts restored: ' + (pass5a ? '✅' : '❌'));
  console.log('  weekStarts is array: ' + (pass5b ? '✅' : '❌'));
  console.log('  weekStarts not empty: ' + (pass5c ? '✅' : '❌') + ' (' + (data.months['2026-06'].weekStarts ? data.months['2026-06'].weekStarts.length : 0) + ' weeks)');
  console.log();
  
  // Summary
  const allPass = pass1a && pass1b && pass1c && pass1d && pass1e && pass1f &&
                  pass2a && pass2b && pass2c && pass2d &&
                  pass3a && pass3b && pass3c &&
                  pass4a && pass4b && pass4c && pass4d && pass4e &&
                  pass5a && pass5b && pass5c;
  console.log('=== SUMMARY ===');
  console.log('Tests passed: ' + (allPass ? 'ALL ✅' : 'SOME FAILED ❌'));
  process.exit(allPass ? 0 : 1);
})();
`;

const script = new vm.Script(src, { filename: 'storage.test.js' });
const context = vm.createContext({ console, process, global: {} });
script.runInContext(context);
