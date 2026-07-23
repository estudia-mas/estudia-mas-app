# Estudia+

Plataforma de crédito educativo. Prioridad comercial: **demo mock**. Producto: auth JWT + apps Django/React.

## Agente / memoria (Cursor)

- Reglas: `.cursor/rules/` (contexto siempre activo + globs frontend/backend/UI/demo)
- Skills: `.cursor/skills/` — `frontend-design`, `web-product-craft`, `credit-ops-ux`, `interactive-demo`, `project-memory`
- Memoria viva: `docs/PROJECT_MEMORY.md`
- Demo: `plan/Demo_Spec_EstudiaMas.md` · TODOs `plan/DEMO_TODOS.md` · script `plan/DEMO_SCRIPT.md`

## Demo mock (prioridad comercial)

```bash
cd demo
npm install
npm run dev -- --port 5174 --strictPort
```

App Vite + Tailwind + Zustand + Recharts. Sin backend.  
→ http://localhost:5174 · Ver `plan/DEMO_TODOS.md` · Script `plan/DEMO_SCRIPT.md`.

## Auth scaffold (producto)

Auth JWT (Init Business): access en memoria y refresh en cookie HttpOnly (`frontend/` + `backend/`).

## Arranque local (producto)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser   # opcional
python manage.py runserver
```

API en `http://127.0.0.1:8000`. Auth bajo `/api/auth/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

SPA en `http://localhost:5173`. Vite hace proxy de `/api` al backend (cookies same-origin).

## Flujos de auth

1. **Registro** → `POST /api/auth/register/` (opcional activación por email)
2. **Activación** → `/activate/:uid/:token/` → `POST /api/auth/activate/`
3. **Login** → `POST /api/auth/jwt/create/` → access JSON + cookie refresh
4. **Sesión** → al cargar, `POST /api/auth/jwt/refresh/` + `GET /api/auth/me/`
5. **Logout** → `POST /api/auth/jwt/logout/` (borra cookie)
6. **Reset** → `/recuperar-contrasena` y confirmación por enlace

Variables relevantes: `REGISTRATION_OPEN`, `REGISTRATION_REQUIRE_EMAIL_ACTIVATION`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`.

## Estructura

```
backend/api/          # CustomUser, JWT, register/activate/reset, /me
frontend/src/
  features/auth/      # Redux slice + schemas Yup
  pages/auth/         # login, registro, activate, reset
  authApi.ts / api.ts # axios (credentials + Bearer + refresh en 401)
```
