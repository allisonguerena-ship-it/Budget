function leftoverForWeek(allowance, used) {
  return allowance - used;
}

function endingStash(startStash, leftover) {
  return startStash + leftover;
}

function getPriorFinalizedStash(monthKey, beforeDate) {
  let bestDate = "";
  let stash = Number(data.openingStash) || 0;

  for (const [mk, month] of Object.entries(data.months)) {
    for (const [idx, finalized] of Object.entries(month.finalizedWeeks || {})) {
      const date = finalized.date || (month.weekStarts || [])[Number(idx)];
      if (date && date < beforeDate && date > bestDate) {
        bestDate = date;
        stash = Number(finalized.endingStash) || 0;
      }
    }
  }

  return stash;
}

// Get the REAL current Stash balance (use most recent finalized week's endingStash)
function getCurrentStashBalance() {
  let stash = Number(data.openingStash) || 0;
  let latestDate = "";
  
  // Find the most recent finalized week
  for (const [mk, month] of Object.entries(data.months)) {
    for (const [idx, finalized] of Object.entries(month.finalizedWeeks || {})) {
      const weekDate = finalized.date || (month.weekStarts || [])[Number(idx)] || "";
      if (weekDate > latestDate) {
        latestDate = weekDate;
        stash = Number(finalized.endingStash) || 0;
      }
    }
  }
  
  return stash;
}

// For UI: show Stash changes if this week was finalized
function getProjectedStashAfterWeek(weekData) {
  const currentStash = getCurrentStashBalance();
  return currentStash + weekData.leftover;
}

function calcWeeks() {
  const month = current();
  const weekArray = [];
  let runningStash = getPriorFinalizedStash(data.currentMonth, month.weekStarts[0] || data.currentMonth + "-01");

  month.weekStarts.forEach((date, index) => {
    const finalized = month.finalizedWeeks?.[index];
    if (finalized) {
      const endDate = addDays(finalized.date || date, 6);
      weekArray.push({ ...finalized, i: index, finalized: true, endDate });
      runningStash = Number(finalized.endingStash) || 0;
      return;
    }

    const allowance = weeklyAllowance(date);
    const used = spent(index);
    const leftover = leftoverForWeek(allowance, used);
    const weekEndingStash = endingStash(runningStash, leftover);
    const endDate = addDays(date, 6); // Week is 7 days: date to date+6

    weekArray.push({
      i: index,
      date,
      endDate,
      startStash: runningStash,
      allowance,
      used,
      leftover,
      endingStash: weekEndingStash,
      fixed: monthlyFixedOn(date),
      finalized: false
    });

    runningStash = weekEndingStash;
  });

  return weekArray;
}
