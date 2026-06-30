# Device Variant Management

## Overview
Squid Budget runs on both **Desktop** and **iPhone**, with shared code but device-specific styling and UI patterns. This document outlines how to manage both versions simultaneously while avoiding conflicts.

## Shared vs Device-Specific Code

### Shared Code (Both Devices)
- `js/` - All JavaScript logic (budget calculations, auth, storage)
- `html structure` - Main content areas
- All business logic remains identical

### Device-Specific Styling
- CSS media queries in existing files (not separate files)
- **Desktop**: `@media (min-width: 769px)` 
- **iPhone**: `@media (max-width: 768px)` and `@media (max-width: 480px)`

### Device-Specific UI Patterns
- Week navigation: Swipeable tabs on mobile, fixed tabs on desktop
- Header: Condensed on mobile, expanded on desktop
- Charts: Smaller on mobile, full-size on desktop

## Naming Convention

**CSS Variables & Classes:**
```
.mobile-only       /* Hidden on desktop */
.desktop-only      /* Hidden on mobile */
.info-card--mobile /* Mobile-specific styling */
.info-card--desk   /* Desktop-specific styling */
```

**JavaScript:**
```
isMobile()         /* Utility function to detect device */
setupMobileUI()    /* Mobile-only initialization */
setupDesktopUI()   /* Desktop-only initialization */
```

## File Structure

```
css/
  main.css         (shared + mobile media queries)
  layout.css       (shared + mobile media queries)
  components.css   (shared + device queries)
  forms.css        (shared + device queries)
  theme.css        (shared colors)

js/
  ui.js            (shared, with device-specific branches)
  utils.js         (includes isMobile() utility)
```

**No separate device files** — Use media queries and runtime detection instead.

## Making Device-Specific Changes

### Desktop-Only Change
Edit CSS in existing files with:
```css
@media (min-width: 769px) {
  /* Desktop changes only */
}
```

### Mobile-Only Change
Edit CSS in existing files with:
```css
@media (max-width: 768px) {
  /* Mobile changes only */
}
```

### JavaScript Runtime Detection
```javascript
if (window.innerWidth <= 768) {
  // Mobile-only logic
} else {
  // Desktop-only logic
}
```

## Change Reconciliation Strategy

### When Changes Affect Both Devices
1. **Make the shared change first** (e.g., business logic)
2. **Test on both** (desktop browser + mobile browser/device)
3. **Device-specific adjustments**: Use media queries if needed

### Conflict Prevention
- **Don't duplicate code** — use media queries and conditionals
- **Document breaking changes** in CHANGELOG.md
- **Always test on both** before committing

### Example: Adding a New Component
```
1. Create HTML (shared for both)
2. Add base CSS (shared styling)
3. Add @media (max-width: 768px) for mobile adjustments
4. Test on iPhone Safari → Desktop Chrome
5. Commit with message: "Add X component (mobile & desktop)"
```

## Session Management for Device-Specific Work

When working on **one device only**:
1. Note in commit message: `[mobile-only]` or `[desktop-only]`
2. Test on intended device
3. Ensure other device still works after changes
4. Update this document if new patterns emerge

## Testing Checklist

**Before committing device-specific changes:**
- [ ] Works on intended device
- [ ] Doesn't break other device
- [ ] Responsive at breakpoints (768px, 480px)
- [ ] Touch interactions work on mobile
- [ ] Desktop keyboard/mouse interactions preserved
- [ ] Updated cache version in service-worker.js

## Breakpoints Used

```
Mobile (phone):  max-width: 480px
Tablet/Mobile:   max-width: 768px
Desktop:         min-width: 769px
```

## Quick Reference

| Task | How |
|------|-----|
| Hide element on mobile | `@media (max-width: 768px) { display: none; }` |
| Hide element on desktop | `@media (min-width: 769px) { display: none; }` |
| Detect device in JS | `window.innerWidth <= 768` |
| Mobile-specific class | `.mobile-only` + media query |
| Make swipeable | Add touch event listeners or CSS `overflow-x: scroll` |

## Current Mobile-Specific Work (Session)

✅ **Completed:**
1. iPhone CSS optimizations (padding, font sizes, gaps)
2. Removed "Projected POT" metric card (3 cards now instead of 4)
3. Reduced "Leftover" headline label (was "Left over in view", now just "Leftover")
4. Week navigation tabs - swipeable on mobile, clickable on desktop
   - Current week auto-selected when page loads
   - Swipe left/right on mobile to switch weeks
   - Touch threshold: 50px swipe distance
   - Single week visible at a time (better mobile UX)
5. Condensed top info cards for iPhone (reduced padding, smaller fonts)

**Implementation Details:**
- `renderWeeks()` function updated to create tab bar + show/hide weeks
- `switchWeek(index)` function handles tab switching
- `setupWeekNavigation()` sets up touch listeners for swipe
- New CSS classes: `.week-tabs`, `.week-tab`, `.week-tab.active`, `.weeks-container`, `.week.hidden`, `.week.active`
- Animation: fade-in + slide-up when switching weeks
