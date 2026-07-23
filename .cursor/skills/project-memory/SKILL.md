---
name: project-memory
description: >-
  Maintains durable project memory in docs/PROJECT_MEMORY.md so future sessions
  reuse decisions, vocabulary, and open questions. Use after architectural or
  product decisions, when the user says remember this, update memory, or when
  closing a substantial feature.
---

# Project Memory

## Source of truth

File: `docs/PROJECT_MEMORY.md`

Rules inject a short always-on summary; this file holds the detail that must survive chat compaction.

## When to update

Update after any of:
- Product/scope decision (in/out of Fase 1, role, folio rules)
- Stack or auth change
- Design tokens / brand decisions
- Domain vocabulary (estado names, etapas)
- Explicit user: “recuerda…”, “anota…”, “para la próxima…”

## How to update

1. Read the current file.
2. Edit **only** the relevant section; keep bullets short.
3. Put newest decisions at the top of each section.
4. Move resolved open questions out of “Abiertas”.
5. Never store secrets, tokens, or `.env` values.

## Session start (agent)

If the task depends on prior context: read `docs/PROJECT_MEMORY.md` (and `plan/` if scope is unclear) before proposing large changes.

## Template for a new decision bullet

```markdown
- YYYY-MM-DD: [decisión]. Motivo: [1 frase]. Implica: [archivos/áreas].
```
