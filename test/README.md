# Tests

This directory contains tests for the POT Budget app core logic.

## Test Files

### budget.test.js
Tests the weekly allowance formula and fixed bill calculations.

**Critical Formula Being Tested:**
```
Weekly allowance = (monthly income - active fixed bills) × 12 ÷ 365 × 7
```

**Tests:**
1. Basic allowance with no fixed bills
2. Allowance with active fixed bills
3. Date-based fixed bill filtering
4. Fixed bills with end dates
5. Inactive bills ignored

**What It Verifies:**
- ✅ Allowance calculation is correct
- ✅ Fixed bills are only counted if active on that week
- ✅ Fixed bills with start/end dates are respected
- ✅ Inactive bills are not counted

---

### weeks.test.js
Tests week finalization and POT rolling.

**Critical Behaviors Being Tested:**
1. Finalized weeks stay frozen unless manually unfinalized
2. Future bill changes do NOT rewrite past finalized weeks
3. POT rolls from one week to the next

**Tests:**
1. Week calculations before finalization
2. Finalize week (freeze allowance, spent, leftover, POT)
3. Finalized week unchanged after adding future bill
4. New weeks reflect updated fixed bills
5. POT rolls from week to week

**What It Verifies:**
- ✅ Weeks calculate correctly
- ✅ Finalization freezes week data
- ✅ Future changes don't affect frozen weeks
- ✅ Open weeks see current bill state
- ✅ POT accumulates/deducts correctly

---

### storage.test.js
Tests localStorage migration and default structure.

**Critical Behaviors Being Tested:**
1. Old data (v2-v5) migrates correctly
2. Missing defaults are filled in
3. Structure always has required fields

**Tests:**
1. Fresh load creates default structure
2. Load v5 data (current version)
3. Migrate v4 data to v5
4. Partial data gets default fields
5. Month with missing weekStarts regenerates them

**What It Verifies:**
- ✅ New users get proper defaults
- ✅ Existing v5 data loads unchanged
- ✅ v4 data converts to v5 schema
- ✅ Missing optional fields are created
- ✅ Week starts regenerated if missing

---

### smoke_test_logic.js
Integration test for the full budget cycle.

Tests that finalized weeks truly stay frozen when adding future bills.

---

## Running Tests

### Option 1: Run All Tests
```bash
cd /Users/alliguerena/Documents/GitHub/Budget
bash test/run-tests.sh
```

### Option 2: Run Individual Tests
```bash
cd /Users/alliguerena/Documents/GitHub/Budget
node test/budget.test.js
node test/weeks.test.js
node test/storage.test.js
node test/smoke_test_logic.js
```

### Option 3: Run with npm
```bash
npm test
```
(Requires `npm test` script in package.json - can be added)

---

## Test Exit Codes

- **0**: All tests passed ✅
- **1**: At least one test failed ❌

---

## Prerequisites

- **Node.js** v12+

### Install Node.js

**macOS:**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
sudo apt-get install nodejs npm
```

**Windows:**
Download from https://nodejs.org/

---

## What Tests Do NOT Test

These tests focus on **core logic only**. They do NOT test:
- UI/DOM rendering (uses `global.render = () => {}`)
- Browser APIs (localStorage mocked)
- Chart rendering
- Auth/Cloud sync (those are integration-layer)
- CSS/styling

---

## Adding New Tests

To add a test:

1. Create a new file: `test/myfeature.test.js`
2. Follow the pattern used in existing tests:
   - Load required modules at top
   - Create test harness
   - Set up test data
   - Run assertions
   - Report results
   - Exit with code 0 (pass) or 1 (fail)
3. Add to `test/run-tests.sh` TESTS array

Example structure:
```javascript
const fs = require('fs');
const vm = require('vm');

function loadFile(path) { return fs.readFileSync(path, 'utf8'); }

const files = ['js/utils.js', 'js/mymodule.js'];
let src = files.map(f => `// ----- ${f}\n` + loadFile(f)).join('\n\n');

src += `
(function() {
  global.data = null;
  global.render = () => {};
  
  console.log('\\n=== MY TESTS ===\\n');
  
  // TEST 1: ...
  // ... assertions ...
  
  const allPass = /* ... */;
  console.log('Tests passed: ' + (allPass ? 'ALL ✅' : 'SOME FAILED ❌'));
  process.exit(allPass ? 0 : 1);
})();
`;

const script = new vm.Script(src, { filename: 'myfeature.test.js' });
const context = vm.createContext({ console, process, global: {} });
script.runInContext(context);
```

---

## Test Philosophy

These tests are:
- **Simple** - No external test frameworks (just Node + console)
- **Self-contained** - Each test file is runnable independently
- **Fast** - All tests run in <1 second
- **Explicit** - Clear pass/fail, not buried in framework output

**NOT** unit tests in the traditional sense - they're integration tests for core logic blocks.

---

## Maintenance

When core behavior changes:
1. Update the affected test file(s)
2. Run tests: `bash test/run-tests.sh`
3. Verify all pass
4. Commit changes

If tests fail, it usually means:
- Core logic changed unintentionally
- Test expectations are out of date
- New behavior needs documentation

**Do not skip tests.** They protect the critical budget formulas.
