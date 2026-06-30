# Mobile Design Rules for iPhone

## Overview

Squid Budget supports both desktop and iPhone with shared code but device-optimized layouts. This document defines design patterns specific to mobile (iPhone) while maintaining consistent UX principles.

## Core Principles

1. **Show less, do more** — Prioritize single-task focus over feature overload
2. **Tap-friendly** — Buttons/inputs: minimum 44x44px touch targets
3. **Scroll vertically, not horizontally** — Content flows down, not sideways (except swipe navigation)
4. **Collapse by default** — Hide complexity until needed
5. **Progressive disclosure** — Show key info first, details on demand

## Typography & Spacing

| Element | Mobile | Desktop |
|---------|--------|---------|
| H1 (App title) | 24px | 34px |
| H2 (Section) | 18px | 22px |
| Body text | 14px | 15px |
| Padding (cards) | 12px | 20px |
| Margin (sections) | 12px | 18px |
| Gap (flex/grid) | 8px | 12px-18px |

## Navigation Patterns

### Tab Navigation (Always Visible)
```
[Overview] [Detailed] [Weekly]
─────────────────────────────
 Active tab: pink background
 Inactive tabs: bordered, transparent
```

- Use on both mobile & desktop
- Tabs sticky at top when scrolling
- Mobile: smaller font (12px), compact padding (8px)
- Desktop: larger font (14px), normal padding (12px)

### Swipe Navigation (Mobile Only)
- Week tabs: swipe left/right to switch (50px threshold)
- Desktop: click tabs instead

## Components

### Collapsible Sections
- **Mobile**: Collapse by default after finalized
- **Desktop**: Show expanded by default (more screen space)

```html
<!-- Mobile: collapsed -->
<details>
  <summary>💰 Expenses (3 items)</summary>
  <table>...</table>
</details>

<!-- Desktop: always open -->
<div class="expenses-section">
  <table>...</table>
</div>
```

### Cards & Panels
- **Mobile**: Full-width, minimal padding
- **Desktop**: Can use 2-column grids

```css
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }
  .panel { padding: 12px; }
}

@media (min-width: 769px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .panel { padding: 20px; }
}
```

### Input Fields
- Mobile: Full-width, large padding (12px vertical)
- Desktop: Can be inline or grouped

## Color & Visual Feedback

### Message Boxes
```
Success: Green (#d4edda), border #c3e6cb
Error:   Red (#f8d7da), border #f5c6cb
Loading: Blue (#d1ecf1), border #bee5eb
Warning: Yellow (#fff3cd), border #ffeaa7
```

Mobile: Messages use larger text (14px), visible padding (12px)
Desktop: Can be slightly smaller (13px)

### Button States
```
Default:  border + transparent background
Hover:    pink border, ink text
Active:   pink background, white text
Disabled: opacity 0.5, cursor not-allowed
Loading:  "..." animation, disabled=true
```

Touch target: 44px minimum on mobile

## Breakpoints

```
Mobile (phone):   max-width 480px
Tablet/Large:     max-width 768px
Desktop:          min-width 769px
```

## Touch Interactions

- **Tap**: Primary action (add, finalize, navigate)
- **Swipe left/right**: Week navigation (mobile only, 50px threshold)
- **Long press**: Future — context menus (not implemented yet)
- **Drag**: Not recommended — confuses users on mobile

## Performance on Mobile

1. Lazy-load images/charts (not critical for initial render)
2. Minimize animations (fade-in is OK, complex transforms not)
3. Avoid heavy JavaScript on first load
4. Use CSS media queries for layout, not JavaScript

## Accessibility

- Minimum color contrast: 4.5:1 (WCAG AA)
- Labels on all inputs
- Focus indicators on buttons
- Error messages linked to inputs

## Examples by Section

### Overview Tab (Mobile)
```
📊 June 2026
═════════════════════════════
POT Balance:    $1,234.56
Spent (unfin.): $350
Month left:     64% (13 days)

[→ See details]
```

Simple, large numbers, no clutter.

### Weekly Budget (Mobile)
```
Week 1 | Week 2 | Week 3
───────────────────────
📊 Allowance: $500
💸 Spent: $150
✅ Left: $350

[▼ Expenses (collapse)]
  Date   Item        Amount
  6/24   Coffee      $5.50
  6/25   Groceries   $145.00

[+ Add] [Finalize]
```

Expenses hidden by default, expand on demand.

### Detailed Tab (Mobile)
```
Income: $4,000
Fixed Bills: $800/mo
Cash-flow settings...
Cash-flow planner...
```

Scroll vertical, sections collapsible.

---

## Desktop Differences

- More whitespace
- 2-column layouts possible
- Larger text
- More info visible simultaneously
- No swipe needed (click tabs)
- Expand sections by default
- Hover states more visible
