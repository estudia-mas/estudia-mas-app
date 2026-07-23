---
name: interactive-demo
description: >-
  Builds clickable mock-only product demos with in-memory data, Antes/Ahora
  storytelling, and presentation flows. Use when working on Estudia+ demo/,
  mockData, demo todos, presentation scripts, or when the user asks for a
  functional demo without real backend.
---

# Interactive Demo (Estudia+)

## Non-negotiables

- **Mock-only**: no API, no auth real, no localStorage. Reset on reload is OK.
- **Clickable**: every control changes visible state.
- **Story**: every Excel-killer screen has an `AntesAhoraBadge`.
- **One folio**: same id visible in alumno and equipo views.
- Scope: `plan/Demo_Spec_EstudiaMas.md` + checklist `plan/DEMO_TODOS.md`.
- Code lives in **`demo/`**, not in `frontend/` auth scaffold.

## Build order

- Tokens + shell + logo + badge component  
- Paleta oficial: `plan/BRAND.md` (`#802F42`, `#CA3C60`, `#F3F3F1`, `#6F3D47`, `#C81B48`) — no INIT navy/teal en demo.
2. `mockData.ts` (4–5 clients, mixed statuses)  
3. Tutorial → landing role picker  
4. Alumno: expediente → docs → simulador  
5. Equipo: marketing → kanban → conciliación  
6. Cobranza / reestructuras / notificaciones  
7. Presentation script (`plan/DEMO_SCRIPT.md`)

## Patterns

- Zustand store holds `clientes`, `vista`, `tutorialOpen`, selected client id.
- Amortization: simple French-loan formula; label as illustrative.
- Kanban move updates `estatus` only — never invent a second folio.
- Simulated upload/download: flip document `estado`; download can generate a blob text file.

## Copy

Spanish MX. Badges: short, concrete (“Antes: Excel aparte · Ahora: en tiempo real”). Tutorial = sales narrative, not feature dump.

## Done when

5-minute unaided walkthrough hits: single folio, ≥2 Excel replacements, tutorial completable, one desirable quick win named aloud.
