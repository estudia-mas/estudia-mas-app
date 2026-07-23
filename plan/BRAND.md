# Identidad visual — Estudia Más

Fuente de logo: `docs/brand/logo-estudia-mas.png` · demo: `demo/public/brand/logo-estudia-mas.png`

## Paleta oficial (Coolors)

| Token | Hex | Uso |
|-------|-----|-----|
| `burgundy` | `#802F42` | Headers, texto fuerte, palabra **MÁS**, barra vertical del + |
| `rose` | `#CA3C60` | Primario CTA, **ESTUDIA**, acentos, links activos |
| `surface` | `#F3F3F1` | Fondo de app / cards neutras |
| `plum` | `#6F3D47` | Texto secundario, bordes suaves, labels |
| `crimson` | `#C81B48` | Acento vivo (badges urgentes, highlights) |

Coolors widget id: `015307767859125132` — `["802F42","CA3C60","F3F3F1","6F3D47","C81B48"]`

## Logo

- Símbolo: “C” / bracket abierto + signo **+** (rose + burgundy)
- Wordmark: **ESTUDIA** (`#CA3C60`) + **MÁS** (`#802F42`), sans bold caps
- En header demo: logo sobre fondo `burgundy`
- Favicon actual: SVG del símbolo (`demo/public/favicon.svg`) + PNG 64px; apple-touch 180px

## Reglas de UI

1. **CTAs primarios** → `rose` (`#CA3C60`), texto blanco
2. **CTAs secundarios / headers** → `burgundy` (`#802F42`)
3. **Fondos** → `surface` (`#F3F3F1`); cards blancas `#FFFFFF` sobre surface
4. **Éxito / “Ahora”** → plum/rose sobre fondo `#F7E8EC` (tinte rose), no verde INIT
5. **Antes/Ahora badge** → borde rose/plum, fondo tinte rose
6. **No usar** paleta INIT (navy/teal/lime) en la demo ni en producto Estudia Más — esa paleta es solo de la propuesta comercial INIT en `plan/docuemntogeneral.md`

## Tipografía

Inter (o system sans). Esquinas 8–12px. Sin sombras pesadas ni gradientes llamativos.

## Checklist de adopción

- [x] Tokens en `demo/src/index.css`
- [x] Logo en shell + landing de la demo
- [x] Tema MUI `frontend/` auth + logo en AuthCard
- [x] Favicon demo (símbolo + / C)
- [x] Recorte de favicon solo del símbolo (+)
- [x] Emails transaccionales backend con logo + colores
