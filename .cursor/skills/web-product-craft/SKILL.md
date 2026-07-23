---
name: web-product-craft
description: >-
  Builds better web product surfaces: information architecture, interaction
  design, states, forms, and progressive delivery. Use when designing flows,
  dashboards, multi-step wizards, empty states, navigation, or improving UX
  quality of web features.
---

# Web Product Craft

## Default workflow

1. **Job story**: When [situation], I want [action], so I can [outcome].
2. **Happy path** in ≤7 steps; list error/empty/loading for each step.
3. **IA**: one primary nav mental model; don’t duplicate the same task in two places.
4. **Build** the smallest vertical slice that is usable end-to-end.
5. **Polish** focus, keyboard, copy, and feedback — not extra chrome.

## UI patterns (prefer)

| Need | Prefer |
|------|--------|
| Many records | Filterable table + row actions; avoid card grids for ops |
| Multi-step process | Wizard with saved progress + clear current step |
| Status | Consistent badges/colors mapped to domain states |
| Dangerous action | Confirm with consequence text; undo when cheap |
| Forms | Group by task; validate on blur/submit; show field-level errors |

## Anti-patterns

- Dashboard wallpaper (stats with no next action)
- Modal hell for primary workflows
- Hidden critical filters
- Success toasts that don’t say what changed
- Mixing English system jargon in Spanish UI

## Delivery bar

Ship only when: primary path works, errors are recoverable, empty state invites the next action, and mobile doesn’t break critical tasks.
