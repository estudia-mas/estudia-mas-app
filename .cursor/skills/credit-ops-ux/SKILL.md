---
name: credit-ops-ux
description: >-
  UX patterns for Estudia+ credit-education operations: expediente único,
  captación, originación, mesa de control, cobranza, conciliaciones, and
  role-based dashboards. Use when designing credit workflows, folios,
  documents, amortización, or operator/admin screens.
---

# Credit Ops UX (Estudia+)

## North star

**Un cliente · un folio · un expediente.** Every screen should reinforce a single source of truth across Marketing → Comercial → Mesa de Control → Dispersión/Cobranza/Contabilidad.

## Role lenses

| Rol | Necesita ver primero |
|-----|----------------------|
| Captación / Marketing | Leads, conversión, tiempos de respuesta |
| Originación / Mesa | Expediente incompleto, docs, Buró, pendiente de decisión |
| Cobranza / Contabilidad | Cartera, mora, conciliaciones, estados de cuenta |
| Dirección | KPIs accionables + drill-down al expediente |

## Expediente pattern

- Header sticky: folio, cliente, etapa, estado, dueño actual
- Timeline / historial inmutable (quién, cuándo, qué)
- Documentos con versión y estado (faltante / en revisión / vigente)
- Obligado solidario **ligado** al mismo folio — nunca un expediente paralelo
- Acciones primarias contextuales a la etapa (no un menú de 20 botones)

## Tables & money

- Montos alineados a la derecha; moneda MXN consistente
- Fechas locales (`America/Mexico_City`)
- Estados de crédito con vocabulario de negocio fijo (definir en memoria del proyecto)
- Simuladores (reestructura/abono) muestran supuestos y resultado lado a lado

## Integrations UX

Surface external systems (Clientify, Salvador, Buró, OpenPay, STP, Contpaqi, WhatsApp) as **status chips** on the expediente (“sincronizado / pendiente / error”) with retry — don’t make operators leave the expediente to “check another tool”.

## Demo / Fase 1 focus

Prioritize: folio único, trazabilidad entre áreas, menos Excel, dashboards de conversión y cartera. Defer IA scoring UIs until data is clean.
