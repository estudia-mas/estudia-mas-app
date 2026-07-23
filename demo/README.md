# Demo comercial — Estudia Más

App **mock-only** (sin backend, sin login, sin localStorage) para la reunión comercial.

## Arranque local

```bash
cd demo
npm install
npm run dev -- --port 5174 --strictPort
```

→ http://localhost:5174

## Deploy en Vercel

La demo está lista para Vercel (SPA Vite estática).

### Opción A — Dashboard (recomendada)

1. [vercel.com/new](https://vercel.com/new) → Importa este repo.
2. Framework del proyecto: **Services** (si Vercel lo pide).
3. El `vercel.json` de la raíz ya apunta solo al servicio **`demo`**
   (no uses `frontend` + `backend` para esta demo comercial).
4. Deploy.

Si el dashboard te sugiere algo como:

```json
"services": { "frontend": { "root": "frontend" }, "backend": { "root": "backend" } }
```

ignóralo / sobrescribe con el `vercel.json` del repo (servicio `demo`).

### Opción B — CLI

```bash
# Desde la raíz del repo (usa vercel.json de la raíz)
npx vercel

# Producción
npx vercel --prod
```

O solo la carpeta demo:

```bash
cd demo
npx vercel --prod
```

Deep-links útiles post-deploy (añade `?skip=1` para saltar tutorial):

- `/?vista=flujo&skip=1`
- `/?vista=alumno&alumno=c1&tab=simulador&skip=1`
- `/?vista=equipo&equipo=alumnos&cliente=c1&skip=1`
- `/cue.html` — cue card presentador

## Preview de build local

```bash
cd demo
npm run build
npm run preview -- --port 5174
```

## Recorrido

1. Tutorial
2. **Alumno**: folio, docs, crédito, simulador
3. **Equipo**: alumnos, pipeline, conciliación, cobranza, TIR, plantillas

Script: [`../plan/DEMO_SCRIPT.md`](../plan/DEMO_SCRIPT.md)

## Presentador

- Panel **Ensayo** (abajo): auto-marca el happy path
- **Reiniciar** en el header
- Atajos deep-link en landing
- Cue card: [`../plan/CUE_CARD.md`](../plan/CUE_CARD.md) · `/cue.html`
- Smoke: con el server arriba → `npm run smoke`

## Stack

Vite · React 19 · TypeScript · Tailwind 4 · Zustand · Recharts
