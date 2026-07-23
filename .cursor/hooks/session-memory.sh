#!/usr/bin/env bash
# Best-effort memory injection (sessionStart). Reliable memory lives in
# .cursor/rules/estudia-mas-core.mdc + docs/PROJECT_MEMORY.md.
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
python3 - <<'PY'
import json
from pathlib import Path
mem = Path("docs/PROJECT_MEMORY.md")
body = mem.read_text(encoding="utf-8")[:2200] if mem.exists() else ""
print(json.dumps({
  "additional_context": (
    "Estudia+ memory snapshot. Canonical: docs/PROJECT_MEMORY.md. "
    "Update after decisions (skill project-memory).\n\n" + body
  )
}))
PY
