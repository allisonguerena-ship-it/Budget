# POT Budget Design System and Skills

Add this folder structure to the repo so AI coding tools understand both:

1. How the app should look.
2. How the app should behave financially.

Recommended repo structure:

```txt
BUDGET/
├─ index.html
├─ manifest.json
├─ service-worker.js
├─ icon.svg
├─ README.md
├─ docs/
│  ├─ AI_INSTRUCTIONS.md
│  ├─ DATA_MODEL.md
│  └─ ...
├─ design-system/
│  ├─ STYLE_GUIDE.md
│  ├─ COMPONENTS.md
│  ├─ TOKENS.css
│  └─ UX_RULES.md
├─ skills/
│  ├─ budget-finance-logic.md
│  ├─ fixed-bills-effective-dates.md
│  ├─ finalized-weeks-and-pot.md
│  ├─ cash-flow-planner.md
│  ├─ category-learning.md
│  ├─ local-storage-migration.md
│  └─ ui-editing-rules.md
└─ examples/
   ├─ weekly-card-example.md
   ├─ fixed-bill-row-example.md
   └─ cash-flow-example.md
```

## How AI tools should use this

When using Cursor, Copilot, Claude Code, or another AI tool, prompt:

```txt
Before editing, read docs/AI_INSTRUCTIONS.md, docs/DATA_MODEL.md, design-system/STYLE_GUIDE.md, design-system/COMPONENTS.md, and all files in skills/.
```

The `skills/` files are behavior-specific rules. The `design-system/` files are visual/UI rules.
