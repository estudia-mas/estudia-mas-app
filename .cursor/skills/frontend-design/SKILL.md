---
name: frontend-design
description: >-
  Distinctive, intentional visual design for new UI or redesigns. Avoids
  templated AI looks; guides palette, typography, layout, motion, and copy.
  Use when building pages, redesigning screens, choosing visual direction,
  or when the user mentions UI, UX, design system, look and feel, or branding.
---

# Frontend Design (Estudia+)

Act as design lead for **Estudia Más** credit-education ops. Visual identity is rose/burgundy — see `plan/BRAND.md`. Do not invent a second palette or fall back to INIT navy/teal or purple-AI defaults.

## Brand tokens (required)

| Role | Hex |
|------|-----|
| Burgundy (headers / MÁS) | `#802F42` |
| Rose (CTA / ESTUDIA) | `#CA3C60` |
| Surface | `#F3F3F1` |
| Plum (secondary) | `#6F3D47` |
| Crimson (accent) | `#C81B48` |

Logo: `demo/public/brand/logo-estudia-mas.png` / `docs/brand/logo-estudia-mas.png`.

## Before code

1. Name audience (asesor, mesa de control, cobranza, dirección, cliente final) and the screen’s **one job**.
2. Draft a compact token plan: 4–6 named colors, display + body type, layout idea, **one signature** element.
3. Reject defaults: purple-on-white gradients, cream+terracotta serif cliché, acid-green-on-black, dense broadsheet columns — unless the brief asks for them.
4. Only then implement; derive all colors/type from the token plan.

## Product constraints

- Dense ops UIs: prioritize scanability, table/form clarity, status visibility.
- Spanish MX copy: plain verbs, sentence case, actionable errors.
- Match existing MUI theme when extending the app; don’t invent a second visual language mid-feature.
- Motion: 2–3 intentional moments max; respect `prefers-reduced-motion`.

## Critique loop

Before finishing: remove one decorative accessory; check mobile; verify focus states; ensure empty/error states tell the user what to do next.

## Related

- Credit/ops flows: [../credit-ops-ux/SKILL.md](../credit-ops-ux/SKILL.md)
- Broader product craft: [../web-product-craft/SKILL.md](../web-product-craft/SKILL.md)
