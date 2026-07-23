# Memoria del proyecto — Estudia+

Última actualización: 2026-07-23

## Identidad

- Producto: plataforma de **crédito educativo** (ops), no app de estudio personal.
- Marca: Estudia+ / Estudia Más.
- Principio: un cliente, un folio, un expediente digital único.
- Propuesta comercial (INIT): `plan/docuemntogeneral.md` (LaTeX).

## Demo funcional (prioridad actual)

- 2026-07-23: Demo = **mock-only** en `demo/` (Vite + Tailwind + Zustand + Recharts). Sin backend, sin localStorage, sin auth real.
- Demo: paleta oficial Estudia Más (`plan/BRAND.md`); logo en `demo/public/brand/`.
- Spec: `plan/Demo_Spec_EstudiaMas.md`. TODOs: `plan/DEMO_TODOS.md`. Skill: `interactive-demo`.
- Mensaje: Excel paralelo desaparece; badges Antes/Ahora en cada quick win.
- El scaffold JWT (`frontend/` + `backend/`) queda para producto real — no mezclar en la demo; misma paleta/logo en auth.

## Stack y auth (producto — hecho, no demo)

- Monorepo: `backend/` (Django 6 + DRF + SimpleJWT) + `frontend/` (React 19 + Vite + Redux + MUI).
- Auth portada de Init Business **sin** multi-organización.
- Access token en Redux; refresh en cookie HttpOnly (`refresh_token`).
- Usuario demo local JWT: `demo@estudia.local` / `Demo1234!` (solo dev producto).

## Decisiones de producto

- 2026-07-23: Demo comercial primero (quick wins), producto JWT en paralelo/después.
- Fase 1 (propuesta): captación & expediente → originación → admin/cobranza.
- Out of scope Fase 1 producto: IA avanzada, scoring predictivo, multi-sucursal nacional.
- Out of scope **demo**: integraciones reales, persistencia, firma real, contabilidad actuarial.

## Vocabulario demo (estatus cliente)

`lead` | `en_revision` | `aprobado` | `contrato_pendiente` | `activo` | `liquidado`

Pipeline kanban: Lead · Documentos · Buró · Propuesta · Contrato · Activo.

Roles en UI demo: Vale 1 (Marketing), Vale 2 (Pipeline), Gris (Conciliación), Ale (Cobranza).

## Design / UI

- **Marca oficial:** `plan/BRAND.md` — rose/burgundy Estudia Más (Coolors `802F42, CA3C60, F3F3F1, 6F3D47, C81B48`).
- Logo: `docs/brand/logo-estudia-mas.png` · demo `demo/public/brand/logo-estudia-mas.png`.
- 2026-07-23: Demo deja de usar paleta INIT (navy/teal); INIT solo en propuesta LaTeX.
- Skills: frontend-design, web-product-craft, credit-ops-ux, interactive-demo, project-memory.

## Abiertas

- [ ] Ensayar demo <5 min en http://localhost:5174 (`plan/DEMO_SCRIPT.md`) y marcar criterio de éxito (panel Ensayo).
- [ ] Deploy demo estática (`cd demo && npm run build` → hosting; hay `vercel.json`).
- [ ] Modelo de dominio Django (Expediente, Folio…) para producto real.

## Demo — estado 2026-07-23 (tarde)

- Vista alumno completa (escenarios Ana/Diego/Luis, crédito, simulador, docs cruzados).
- Vista equipo (marketing, kanban, Buró, firma, conciliación, cobranza).
- Favicon símbolo, emails backend con marca, botón Reiniciar, panel Ensayo.
- Deep-links + `/cue.html` + `npm run smoke` (consola limpia OK).
- Bugfix: loop infinito en AlumnoPage (selector Zustand inestable).
- Abierto solo: ensayo en voz alta en la reunión.

## Cómo usar esta memoria

Agentes: leer al inicio de tareas grandes; actualizar vía skill `project-memory` tras decisiones.
