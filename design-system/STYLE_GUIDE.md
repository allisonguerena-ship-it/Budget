# POT Budget Style Guide

## Overall vibe

The app should feel:

- Soft
- Clean
- Girly but not childish
- Calm
- Organized
- Slightly Parisian/eclectic
- Warm and personal
- Not corporate
- Not overly techy
- Not cluttered

The app is a personal finance tool, but it should not feel like a bank dashboard.

## Visual direction

Use:

- Creamy background
- Soft pink accents
- Sage green accents
- Warm gold accents
- Rounded cards
- Gentle shadows
- Clear spacing
- Calm typography
- Friendly labels
- Card-based sections

Avoid:

- Harsh blues
- Neon colors
- Corporate SaaS styling
- Dense tables with no spacing
- Black-and-white spreadsheet look
- Overly clinical finance app design
- Too many charts

## Current color palette

Use these CSS variables where possible:

```css
:root {
  --bg: #fbf7f4;
  --panel: #fffaf7;
  --ink: #332821;
  --muted: #8b7567;
  --line: #eadbd2;
  --pink: #f3c6cf;
  --rose: #d9899b;
  --green: #bfd8bd;
  --sage: #6b8f71;
  --cream: #fff3df;
  --gold: #d9aa55;
  --bad: #c76b6b;
  --good: #6b8f71;
  --shadow: 0 18px 45px rgba(91, 64, 46, 0.12);
  --radius: 24px;
}
```

## Typography

Use system fonts:

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Use:

- Large bold page title
- Small uppercase labels
- Muted helper text
- Clear card headings
- Minimal jargon

## Layout principles

- Use cards for major sections.
- Separate weekly budget cards clearly.
- Keep long configuration sections collapsed.
- Keep primary numbers visible.
- Keep detailed rows available but not overwhelming.
- Make locked/finalized states obvious.
- Mobile layout should stack into one column.

## Card styling

Cards should generally use:

```css
background: rgba(255, 250, 247, 0.9);
border: 1px solid rgba(234, 219, 210, 0.95);
box-shadow: var(--shadow);
border-radius: var(--radius);
padding: 20px;
```

## Buttons

Primary buttons:

- Dark warm brown background
- White text
- Rounded corners
- Bold label

Secondary buttons:

- White background
- Border
- Dark text

Danger buttons:

- White background
- Red text
- Soft red border

## Language style

Use plain language.

Good labels:

- Weekly allowance
- Spent
- Left over
- POT after week
- Fixed bills used
- Finalize week
- Cash-flow planner
- Planned expense

Avoid labels like:

- Net liquidity allocation
- Cash deployment
- Recurring liability module
- Temporal budget differential
