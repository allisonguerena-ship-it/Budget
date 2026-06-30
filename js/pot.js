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

function calcWeeks() {
  const month = current();
  const weekArray = [];
  let runningPot = getPriorFinalizedPot(data.currentMonth, month.weekStarts[0] || data.currentMonth + "-01");

  month.weekStarts.forEach((date, index) => {
    const finalized = month.finalizedWeeks?.[index];
    if (finalized) {
      weekArray.push({ ...finalized, i: index, finalized: true });
      runningPot = Number(finalized.endingPot) || 0;
      return;
    }

    const allowance = weeklyAllowance(date);
    const used = spent(index);
    const leftover = leftoverForWeek(allowance, used);
    const weekEndingPot = endingPot(runningPot, leftover);

    weekArray.push({
      i: index,
      date,
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
