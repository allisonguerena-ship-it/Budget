# Layout Structure

## App Architecture

Squid Budget uses a **tab-based layout** with three main sections, optimized for both desktop and mobile.

## Tab Structure

```
┌──────────────────────────────────────────────────────┐
│ Squid Budget         [Overview] [Detailed] [Weekly]   │
├──────────────────────────────────────────────────────┤
│                                                        │
│  [Content of active tab]                             │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### Tab 1: Overview

**Purpose**: High-level snapshot of finances right now

**Mobile Layout:**
```
📊 June 2026
═════════════════════════
POT:           $1,234.56
Spent unfin:   $350
Month left:    64% (13 days)

[Tap for details →]
```

**Desktop Layout:**
```
┌──────────────────┬──────────────────┐
│ 📊 June 2026     │ 💰 POT           │
│ Spent unfin: $350│ $1,234.56        │
│ Available: $1,150│                  │
│ Month: 64% left  │ CC Projection:   │
│                  │ $350             │
└──────────────────┴──────────────────┘
```

**Metrics shown:**
- Month & year
- POT balance
- Unfin alized week spending
- Available in unfin weeks
- Days/% of month remaining
- CC projection (if enabled)

**Interactions:**
- Tap "details" or "Detailed tab" to see more
- No editing here, read-only overview

---

### Tab 2: Detailed

**Purpose**: Deeper dive into settings, fixed bills, cash-flow planning

**Mobile Layout (Collapsible sections):**
```
═════════════════════════
📈 Income & Fixed Bills
  ▼ Monthly income: $4,000
    [Edit field]
  
  ▼ Fixed bills ($800/mo)
    Rent: $1,200 (1/1-12/31)
    Car: $250 (1/1-12/31)
    [+ Add bill]

════════════════════════= 
💳 Cash-Flow Settings
  ▼ Cash-flow constants
    Starting cash: $2,000
    Buffer target: $500
    [Lock/unlock]
  
  ▼ Planned expenses
    Flight (6/28): $400
    [+ Add]

═════════════════════════
📊 Cash-Flow Planner
  [Projected timeline]
  6/22 Paycheck: +$2,000
  6/28 Flight: -$400
  7/1 Paycheck: +$2,000
```

**Desktop Layout (More expanded):**
```
┌─────────────────────────┬─────────────────────────┐
│ Income & Fixed Bills    │ Cash-Flow Planning      │
│ ────────────────────    │ ──────────────────────  │
│ Income: $4,000          │ Projected timeline:     │
│ [+ Add]                 │ 6/22 +$2,000 (Paycheck)│
│                         │ 6/28 -$400 (Flight)     │
│ Fixed Bills:            │ 7/1 +$2,000 (Paycheck) │
│ Rent: $1,200 (active)   │                         │
│ Car: $250 (active)      │ Lowest projected: $1,200│
│ [+ Add bill]            │ Target: $500            │
│                         │ Status: ✅ OK           │
└─────────────────────────┴─────────────────────────┘

Cash-Flow Settings
─────────────────
Starting: $2,000 | Buffer: $500 | [Lock] [Unlock]
```

**Sections (collapsible on mobile, expanded on desktop):**
1. Income & Fixed Bills
2. Cash-Flow Settings
3. Cash-Flow Planner (visual timeline)

**Interactions:**
- Edit income, fixed bills
- Set budget buffer target
- View cash-flow projection
- No week editing here

---

### Tab 3: Weekly Budget

**Purpose**: Edit expenses, manage individual weeks

**Mobile Layout (Swipeable weeks):**
```
Week 1 | Week 2 | Week 3 | Week 4
───────────────────────────────────

📊 Week 1: 6/24 - 6/30
═════════════════════════
Allowance:  $500
Spent:      $200
✅ Left:    $300

[▼ Expenses (3 items)]
  6/24  Coffee     $5.50
  6/25  Groceries  $145.00
  6/26  Gas        $49.50
  [+ Add expense]

POT after: $1,234 (projected)

[+ Add] [Finalize Week]
```

**Desktop Layout (Multiple weeks visible):**
```
Week 1 | Week 2 | Week 3 | Week 4
───────────────────────────────────

┌──────────────────┬──────────────────┐
│ Week 1: 6/24-30  │ Week 2: 7/1-7    │
│ ─────────────    │ ──────────────   │
│ Allowance: $500  │ Allowance: $500  │
│ Spent: $200      │ Spent: $0        │
│ Left: $300 ✅    │ Left: $500 ✅    │
│ POT: $1,234      │ POT: $1,234      │
│                  │                  │
│ [Expenses]       │ [Expenses]       │
│ 6/24 Coffee $5   │ (none yet)       │
│ 6/25 Groc $145   │ [+ Add]          │
│                  │                  │
│ [Finalize]       │ [+ Add] [Final]  │
└──────────────────┴──────────────────┘
```

**Week Card Content:**
```
Header:
  Week N: Start date - End date
  [Finalized badge] or [status]

Stats:
  Allowance (weekly calculated)
  Fixed bills used (locked, from settings)
  Spent (sum of expenses)
  Leftover (allowance - fixed - spent)
  POT after (if finalized)

Expenses Table (collapsible):
  Date | Description | Category | Amount
  [Expense rows]
  [+ Add expense]

Actions:
  [+ Add expense] [Finalize week] (if unfin)
  OR
  [Unfinalize week] (if already fin)
```

**Interactions:**
- Add/edit/delete expenses
- Finalize week (lock spending, move leftover to POT)
- Unfinalize week (unlock, reclaim from POT)
- Swipe left/right on mobile to switch weeks
- Click tabs on desktop to switch weeks
- Collapse expenses table on mobile (default collapsed after finalize)

---

## Responsive Behavior

### Mobile (< 480px)
```
Full-width single column
Collapsible sections by default
Swipe navigation
Large touch targets (44px)
Compact typography (12-14px)
Tabs smaller, stacked
```

### Tablet (481px - 768px)
```
Single or 2-column depending on content
More padding than phone
Sections mostly expanded
```

### Desktop (> 768px)
```
2+ column layouts where appropriate
Full typography size (14-15px)
More whitespace
Sections expanded by default
Hover states visible
```

---

## Navigation Flow

**From Overview:**
- Tap month/numbers → scroll to Weekly tab, jump to current week
- Tap "Detailed" tab link → go to Detailed
- Swipe left/right (if on mobile) → doesn't work, use tabs instead

**From Detailed:**
- Tap "Weekly" tab → jump to Weekly tab
- Edit income/bills → saves immediately
- No swipe from here

**From Weekly:**
- Swipe left/right → go to previous/next week (mobile only)
- Click week tabs → go to that week
- Finalize → opens confirmation, moves leftover to POT
- "← Overview" button → jump back to Overview tab

---

## Component Library

| Component | Mobile | Desktop | Notes |
|-----------|--------|---------|-------|
| Tab bar | Sticky, 12px font | Sticky, 14px font | Always visible |
| Card/Panel | Full-width, 12px pad | 20px pad, can 2-col | Consistent styling |
| Button | 44px height min | 36px height | Larger on mobile |
| Input | Full-width, 12px pad | Inline, normal pad | Font size 14px+ |
| Collapsible | Details/summary tags | Div (expanded) | Semantic HTML |
| Table | Horizontal scroll if needed | Full width | Simplified on mobile |
| Badge | Inline, compact | Inline | Status indicator |

---

## Styling Pattern

```css
/* Shared base styles */
.tab { padding: 12px; }
.card { border-radius: 12px; }
.button { cursor: pointer; }

/* Mobile overrides */
@media (max-width: 768px) {
  .tab { font-size: 12px; padding: 8px; }
  .card { padding: 12px; }
  .button { min-height: 44px; }
}

/* Desktop enhancements */
@media (min-width: 769px) {
  .tab { font-size: 14px; padding: 12px; }
  .card { padding: 20px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## Future Layout Enhancements

- [ ] Customizable tab order
- [ ] Favorites/quick-access shortcuts
- [ ] Budget alerts banner (if over threshold)
- [ ] Month selector dropdown
- [ ] Export/download views
