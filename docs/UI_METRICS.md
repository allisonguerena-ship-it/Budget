# UI Metrics & Calculations

## Overview: How Numbers Are Calculated

This document explains the metrics displayed in each section of Squid Budget and how they're calculated to avoid double-counting and confusion.

## Core Concepts

### POT (Personal Opportunity Tank)
The POT is a **separate accumulating balance** that grows when weeks are finalized with leftover money.

**POT Flow:**
```
Starting POT: $500 (user-set)
Week 1 finalizes with $100 leftover → POT becomes $600
Week 2 finalizes with -$50 overspend → POT becomes $550
Week 3 finalizes with $75 leftover → POT becomes $625
```

**Key rule**: Once money is in POT (from finalized weeks), it's NOT counted in "current month spending" or "month remaining".

### Allowance (Weekly)
Calculated fresh each week based on:
```
Weekly Allowance = (Monthly Income - Fixed Bills Active That Week) × 12 ÷ 365 × 7
```

**Example:**
- Monthly income: $4,000
- Fixed bills active this week: $800
- Calculation: (4,000 - 800) × 12 ÷ 365 × 7 = $689.86 per week

### Spending Categories

**Finalized Weeks:**
- Week spending is locked
- Leftover moves into POT
- No longer counted in "current month" metrics

**Unfinal ized Weeks:**
- Expenses can still be added/edited
- Spending counts toward "month to date"
- Leftover is projected (not yet in POT)

## Metrics by Section

### Overview Tab

#### 1. POT Balance
```
Display: Current POT value
Calculation: Starting POT + all finalized week leftovers (negative or positive)
Example: $1,234.56

Purpose: Show accumulated buffer available if needed
```

#### 2. Spent (Current Month, Unfin alized)
```
Display: $350
Calculation: Sum of spending in weeks that are NOT finalized yet
EXCLUDE: Finalized weeks (their spending is in the past, POT-managed)

Example:
- Week 1 (finalized): $250 spent → EXCLUDED
- Week 2 (unfin): $200 spent → INCLUDED
- Week 3 (unfin): $150 spent → INCLUDED
Total Spent: $350
```

#### 3. Month Remaining
```
Display: Days left in month, percentage complete
Calculation: 
  Days left = Last day of month - Today
  % complete = (Today - 1st of month) / Days in month × 100
  
Example (June 30 = last day):
  Today: June 19
  Days left: 11
  % complete: 19 ÷ 30 = 63%
```

#### 4. Available in Unfin alized Weeks
```
Display: $1,250
Calculation: Sum of (weekly allowance - weekly spending) for unfin weeks only

Example:
- Week 2: $500 allowance - $200 spent = $300 left
- Week 3: $500 allowance - $150 spent = $350 left
- Week 4: $500 allowance - $0 spent = $500 left
Total Available: $1,150
```

**Why separate from POT?**
- POT is locked (past money)
- Available is current/future (can still be spent or saved)
- Prevents confusion: "Do I have $2,000 or $500?"

#### 5. Credit Card Statement Projection (Optional)
```
Display: What your credit card statement would show if settled today
Calculation:
  = Unfin alized weeks spending + POT usage (if any)
  
Example:
  Unfin week spending: $350
  POT used this month: $0
  CC Statement: $350 (if you only used card, not POT/cash)
```

**Note**: This assumes credit card is your primary payment method. If user pays in cash/POT directly, this doesn't apply.

### Weekly Budget Tab

#### Weekly Metrics (Per Week)

```
Allowance:     $500      (calculated fresh each week)
Fixed Bills:   $150      (from active fixed bills)
Spent:         $200      (sum of expenses entered)
Leftover:      $300      ($500 - $150 - $200)
POT After:     $1,534    (previous POT + this week's leftover, if finalized)
```

**When finalizing:**
- "POT After" locks in
- Leftover is added to POT
- Week becomes read-only

**When unfinalized:**
- "POT After" is a projection
- No actual change to POT yet
- Can still edit spending

### Detailed Tab

Shows deeper breakdown of:
- Current weekly allowance (with formula shown)
- Fixed bills active this month
- Cash-flow constants
- Planned expenses (timelined view)

---

## Smart Counting Rules (Anti-Double-Count)

### Rule 1: Finalized Weeks Don't Count Twice
```
❌ WRONG:
  Spent = $250 (finalized week) + $200 (unfin week)
  Result: $450 — but $250 is already in POT!

✅ CORRECT:
  Spent = $200 (unfin weeks only)
  POT = $1,200 (includes finalized week's $250)
  Result: Accurate separation
```

### Rule 2: POT Doesn't Count as "Available"
```
❌ WRONG:
  Available = $500 (unfin allowance left) + $1,200 (POT)
  Result: User thinks they have $1,700 to spend in current week
  
✅ CORRECT:
  Available in Week = $500
  POT (separate) = $1,200 (accessible if emergency)
  Result: Clear distinction between weekly budget and buffer
```

### Rule 3: Overspend Week Reduces POT
```
Week 3: $500 allowance, spent $600 = -$100 overspend
Result: POT = Previous - $100

Example:
  POT before week: $1,200
  Week overspends by: $100
  POT after: $1,100 (if week finalized)
```

---

## Display Logic by Context

### Mobile (Overview Tab)
```
Show highest-level only:
  POT: $1,200
  Spent unfin: $350
  Month left: 64% (13 days)
```

### Desktop (Overview Tab)
```
Show slightly more detail:
  POT: $1,200
  Spent unfin: $350
  Available unfin: $1,150
  Month left: 64% (13 days)
  CC Projection: $350 (if enabled)
```

### Any Device (Weekly Tab)
```
Show per-week detail:
  Allowance, Fixed, Spent, Left, POT After
```

---

## Edge Cases

### What if week goes negative?
```
Week allowance: $500
Week spending: $600
Leftover: -$100

When finalized:
  POT = Previous POT - $100
  Week shows as "OVERSPENT" badge
```

### What if POT goes negative?
```
Indicate warning (red): "POT is negative!"
User should review fixed bills or increase income
```

### What if month isn't complete yet?
```
Don't project forward
Show only actual spending to date
Week 5 doesn't exist yet, so don't count it
```

---

## Future Enhancements

- [ ] Credit card statement projection (more detailed)
- [ ] Cash vs. card split (if user tracks both)
- [ ] Recurring expense forecasting
- [ ] Budget variance alerts ("You're 20% over average")
