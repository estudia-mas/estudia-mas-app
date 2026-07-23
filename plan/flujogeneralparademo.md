# Flujo general para demo

**Estado:** alineado a la minuta de levantamiento  
**App:** `demo/` → http://localhost:5174

| Doc | Rol |
|-----|-----|
| [`minuta_levantamiento.tex`](./minuta_levantamiento.tex) | Requerimientos (fuente) |
| [`FLUJO_CICLO_VIDA.md`](./FLUJO_CICLO_VIDA.md) | Mapa minuta ↔ pantallas demo |
| [`Demo_Spec_EstudiaMas.md`](./Demo_Spec_EstudiaMas.md) | Spec de la demo mock |
| [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) | Guion ~5 min |
| [`CUE_CARD.md`](./CUE_CARD.md) | Tarjeta presentador |

## Arranque

```bash
cd demo && npm run dev -- --port 5174 --strictPort
```

## Recorrido fácil (recomendado)

1. Tutorial → **Empezar** abre el **Ciclo de vida**  
2. Ve paso a paso: Captación → … → Liquidación  
3. En cada paso: **Abrir en la demo**  
4. Header **Ciclo de vida** para volver a la guía  

Alternativa: alumno / equipo directo desde el landing.

Auth JWT (`frontend/` + `backend/`) **no** forma parte de esta demo.
