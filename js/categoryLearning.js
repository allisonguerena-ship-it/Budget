function learnFromExpense(expense) {
  const key = normalizeDesc(expense.desc);
  if (key && expense.category) {
    data.learnedCategories[key] = expense.category;
  }
}

function guessCategory(desc) {
  const typed = normalizeDesc(desc);
  if (!typed) return null;

  let best = null;
  for (const [key, category] of Object.entries(data.learnedCategories || {})) {
    const normalized = normalizeDesc(key);
    if (typed.includes(normalized) || normalized.includes(typed)) {
      if (!best || normalized.length > best.k.length) {
        best = { k: normalized, v: category };
      }
    }
  }

  return best?.v || null;
}
