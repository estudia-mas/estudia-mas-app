# Estudia+ — TODOs de la demo general

Fuente: [`Demo_Spec_EstudiaMas.md`](./Demo_Spec_EstudiaMas.md) · Marca: [`BRAND.md`](./BRAND.md) · Script: [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) · Cue: [`CUE_CARD.md`](./CUE_CARD.md) · Objeciones: [`OBJECIONES.md`](./OBJECIONES.md)

**Correr:** `cd demo && npm run dev -- --port 5174` → http://localhost:5174

---

## Conteo actual

| Estado | Cantidad |
|--------|----------|
| Hechos (desarrollo) | ~42 ítems de producto/demo |
| **Pendientes** | **1** (ensayo en voz alta / reunión) |
| Fuera de alcance demo | Auth, APIs reales, localStorage, firma real, actuarial |

### Lo que falta (tú)

1. [ ] Ensayar en voz alta el script &lt;5 min (usa [`CUE_CARD.md`](./CUE_CARD.md) + panel **Ensayo**) y confirma que alguien nombra un quick win  

Consola limpia del happy path: **hecha** (`cd demo && npm run smoke` → OK).

---

## Hecho (resumen)

- [x] Fundación Vite/Tailwind/Zustand/Recharts + marca Estudia Más  
- [x] Tutorial, landing alumno/equipo  
- [x] Vista alumno: folio hero, escenarios (Ana/Diego/Luis), expediente+perfil, docs, crédito (pagos/recompensa/mora), simulador, avisos  
- [x] Vista admin alumnos: ficha, ajustes, mensajes → avisos  
- [x] Recorrido **Ciclo de vida** alineado a la minuta  
- [x] Flujo docs cruzado alumno ↔ equipo  
- [x] Favicon símbolo (+) SVG/PNG  
- [x] Panel Ensayo auto-check del happy path  
- [x] Fix loop infinito vista alumno (selector Zustand)  
- [x] Emails backend con marca Estudia Más  
- [x] Botón Reiniciar + `vercel.json` para static  
- [x] Deep-links + atajos landing + `npm run smoke` OK  
- [x] Cue HTML (`/cue.html`) + deep-link `cliente=` (Valeria/Diego)  
- [x] Script + cue card + objeciones  
- [x] `npm run build` OK  

---

## Fuera de alcance

Auth real · integraciones reales · localStorage · firma real · contabilidad actuarial
