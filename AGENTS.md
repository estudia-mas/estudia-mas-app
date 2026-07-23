# AGENTS.md — Estudia+

## Antes de construir

1. Leer `.cursor/rules/` (sobre todo `estudia-mas-core`) y `docs/PROJECT_MEMORY.md`.
2. **Demo comercial (prioridad):** `plan/Demo_Spec_EstudiaMas.md` + `plan/DEMO_TODOS.md` + skill `interactive-demo` → código en `demo/`.
3. UI/flujo producto: skills `frontend-design`, `web-product-craft`, `credit-ops-ux`.
4. Decisiones durables → `docs/PROJECT_MEMORY.md` (skill `project-memory`).

## Mapa rápido

| Área | Dónde |
|------|--------|
| **Demo mock** | `demo/` · TODOs `plan/DEMO_TODOS.md` |
| Auth API (producto) | `backend/api/` |
| Auth UI (producto) | `frontend/src/pages/auth/`, `features/auth/` |
| Propuesta / alcance | `plan/docuemntogeneral.md` |
| Memoria viva | `docs/PROJECT_MEMORY.md` |

## No hacer

- No mezclar demo mock con auth JWT del producto.
- No asumir que es una app de estudio para alumnos.
- No reintroducir multi-org de Init Business sin decisión explícita.
- No guardar secretos en reglas, skills ni memoria.
