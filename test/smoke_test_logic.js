/**
 * Smoke Test Logic - Validates finalized weeks stay frozen
 * Loads core logic files and verifies that finalizing a week
 * prevents budget recalculation even when new fixed bills are added.
 */
const fs = require('fs');
const vm = require('vm');

function loadFile(path){ return fs.readFileSync(path,'utf8'); }

const files = ['js/utils.js','js/storage.js','js/budget.js','js/pot.js','js/fixedBills.js','js/weeks.js','js/categoryLearning.js'];
let src = files.map(f=>`// ----- ${f}\n`+loadFile(f)).join('\n\n');

// Add a tiny harness to run checks
src += `\n\n// Test harness\n(function(){\n  // ensure render noop (ui not loaded in test)\n  if(typeof render === 'undefined') global.render = ()=>{};\n  // ensure localStorage stub exists\n  if(typeof localStorage === 'undefined') global.localStorage = (function(){\n    let store = {};\n    return { getItem(k){ return store[k] ?? null; }, setItem(k,v){ store[k]=String(v); }, removeItem(k){ delete store[k]; } };\n  })();\n\n  // initialize data\n  global.data = loadData();\n\n  const month = data.currentMonth;\n  const week0 = data.months[month].weekStarts[0];\n  const allowanceBefore = weeklyAllowance(week0);
  const fixedBefore = monthlyFixedOn(week0);
  const weeksBefore = calcWeeks();
  // finalize week 0
  finalizeWeek(0);
  const finalizedSnap = JSON.parse(JSON.stringify(current().finalizedWeeks[0]));

  // add a big future fixed bill that would change allowance if weeks were recalculated
  data.fixedBills.push({name:'Huge Test Bill',category:'Other',amount:100000,startDate:week0,endDate:'',active:true});
  save();

  const allowanceAfter = weeklyAllowance(week0);
  const fixedAfter = monthlyFixedOn(week0);
  const weeksAfter = calcWeeks();
  const finalizedSnapAfter = JSON.parse(JSON.stringify(current().finalizedWeeks[0]));

  const result = {
    month,
    week0,
    allowanceBefore,
    fixedBefore,
    allowanceAfter,
    fixedAfter,
    finalizedSnap,
    finalizedSnapAfter,
    finalizedUnchanged: finalizedSnap.endingPot === finalizedSnapAfter.endingPot
  };
  console.log(JSON.stringify(result, null, 2));
})();`;

const script = new vm.Script(src, { filename: 'bundle.js' });
const context = vm.createContext({ console, global: {} });
script.runInContext(context);
