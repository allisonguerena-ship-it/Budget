function leftoverForWeek(allowance, used) {
  return allowance - used;
}

function endingPot(startPot, leftover) {
  return startPot + leftover;
}

function getPriorFinalizedPot(monthKey, beforeDate) {
  let bestDate = "";
  let pot = Number(data.openingPot) || 0;

  for (const [mk, month] of Object.entries(data.months)) {
    for (const [idx, finalized] of Object.entries(month.finalizedWeeks || {})) {
      const date = finalized.date || (month.weekStarts || [])[Number(idx)];
      if (date && date < beforeDate && date > bestDate) {
        bestDate = date;
        pot = Number(finalized.endingPot) || 0;
      }
    }
  }

  return pot;
}

// Get the REAL current POT balance (use most recent finalized week's endingPot)
function getCurrentPotBalance() {
  let pot = Number(data.openingPot) || 0;
  let latestDate = "";
  
  // Find the most recent finalized week
  for (const [mk, month] of Object.entries(data.months)) {
    for (const [idx, finalized] of Object.entries(month.finalizedWeeks || {})) {
      const weekDate = finalized.date || (month.weekStarts || [])[Number(idx)] || "";
      if (weekDate > latestDate) {
        latestDate = weekDate;
        pot = Number(finalized.endingPot) || 0;
      }
    }
  }
  
  return pot;
}

// For UI: show POT changes if this week was finalized
function getProjectedPotAfterWeek(weekData) {
  const currentPot = getCurrentPotBalance();
  return currentPot + weekData.leftover;
}

function calcWeeks() {
  const month = current();
  const weekArray = [];
  let runningPot = getPriorFinalizedPot(data.currentMonth, month.weekStarts[0] || data.currentMonth + "-01");

  month.weekStarts.forEach((date, index) => {
    const finalized = month.finalizedWeeks?.[index];
    if (finalized) {
      const endDate = addDays(finalized.date || date, 6);
      weekArray.push({ ...finalized, i: index, finalized: true, endDate });
      runningPot = Number(finalized.endingPot) || 0;
      return;
    }

    const allowance = weeklyAllowance(date);
    const used = spent(index);
    const leftover = leftoverForWeek(allowance, used);
    const weekEndingPot = endingPot(runningPot, leftover);
    const endDate = addDays(date, 6); // Week is 7 days: date to date+6

    weekArray.push({
      i: index,
      date,
      endDate,
      startPot: runningPot,
      allowance,
      used,
      leftover,
      endingPot: weekEndingPot,
      fixed: monthlyFixedOn(date),
      finalized: false
    });

    runningPot = weekEndingPot;
  });

  return weekArray;
}
