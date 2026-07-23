# Estudia+ — Demo funcional (spec para Cursor)

## Objetivo

Construir una **demo interactiva, sencilla y sin backend real**, pensada para mostrarle a Estudia+ quick wins concretos — no un sistema completo. La demo debe sentirse funcional (todo clickeable, con datos que reaccionan), pero corre 100% con datos mock en el cliente. No requiere integraciones reales con Clientify, OpenPay, STP, Contpaqi, Buró de Crédito ni WhatsApp — se simulan.

**El mensaje central de la demo:** el Excel paralelo desaparece. Cada pantalla que hoy depende de una hoja de cálculo debe tener un contraste visual explícito de "antes / ahora" para que se note el quick win a simple vista.

---

## Stack sugerido

- React + Vite
- Tailwind CSS
- Estado en memoria (`useState` / `useReducer` o Zustand) — **nada de localStorage**, los datos se reinician al recargar y eso está bien para una demo
- Sin backend, sin base de datos real — todo el "sistema" vive en un archivo `mockData.js` / `mockData.ts`
- Recharts para las gráficas simples (conversión, cartera, dashboard de asesor)

## Identidad visual

**Marca Estudia Más** (no la paleta INIT de la propuesta comercial). Detalle: [`BRAND.md`](./BRAND.md).

| Uso | Color | Hex |
|---|---|---|
| Headers / texto fuerte / MÁS | Burgundy | `#802F42` |
| CTA primario / ESTUDIA | Rose | `#CA3C60` |
| Fondo app | Surface | `#F3F3F1` |
| Texto secundario / bordes | Plum | `#6F3D47` |
| Acento vivo | Crimson | `#C81B48` |

Logo: `demo/public/brand/logo-estudia-mas.png` (símbolo C/+ + wordmark).

Tipografía sans (Inter), esquinas 8–12px, sin sombras pesadas ni gradientes — espíritu limpio; color emocional rose/burgundy.

---

## Estructura de datos mock

```ts
// mockData.ts
type Cliente = {
  id: string;            // identidad única del cliente — NO folio por etapa
  nombre: string;
  curp: string;
  universidad: string;
  carrera: string;
  asesor: string;
  folioSolicitud: string;
  folioCredito: string | null;
  estatus: 'lead' | 'en_revision' | 'aprobado' | 'contrato_pendiente' | 'activo' | 'liquidado';
  documentos: Documento[];
  credito: Credito | null;
  pagos: Pago[];
};

type Documento = {
  nombre: string;
  estado: 'pendiente' | 'cargado' | 'validado';
  fechaCarga: string | null;
};

type Credito = {
  montoTotal: number;
  plazo: number;          // meses
  tasaAnual: number;
  saldoActual: number;
  mensualidad: number;
  fechaInicio: string;
};

type Pago = {
  fecha: string;
  monto: number;
  metodo: 'OpenPay' | 'SPEI';
  aTiempo: boolean;
};
```

Precarga 4-5 clientes con distintos estatus para poblar dashboards y listas sin que se vean vacíos.

---

## Pantallas a construir

### 0. Tutorial de bienvenida (obligatorio, primera pantalla)

Un modal/stepper corto (4-5 pasos) que aparece al abrir la demo, antes de mostrar cualquier pantalla:

1. "Esta es una demo funcional del expediente único de Estudia+."
2. "Cada alumno tiene un solo folio, del lead a la liquidación — sin duplicados."
3. "Donde hoy usan Excel, aquí verás el mismo cálculo en tiempo real."
4. "Puedes navegar libremente: vista del alumno y vista interna del equipo."
5. Botón "Empezar recorrido" que lleva al dashboard principal.

Debe poder reabrirse desde un botón fijo tipo "¿Cómo funciona esto?" en la esquina, para que quien presenta la demo pueda relanzarlo si alguien se une tarde a la reunión.

### 1. Selector de vista (landing simple)

Dos botones grandes: **"Entrar como alumno"** y **"Entrar como equipo Estudia+"**. Esto reemplaza un login real — es una demo, no necesita autenticación de verdad.

### 2. Vista alumno

- **Mi expediente:** timeline vertical del estatus (Lead → Documentos → Buró → Aprobado → Contrato → Activo → Liquidado), con el folio único visible arriba en todo momento — este es el quick win más visual: "un solo número, siempre el mismo".
- **Mis documentos:** lista de documentos requeridos con estado (pendiente / cargado / validado). Botón "subir" simulado (no requiere archivo real, solo cambia el estado) y botón "descargar" habilitado — contraste directo con el pain point real ("hoy se sube y no se puede descargar").
- **Mi crédito:** saldo actual, próxima mensualidad, tabla de amortización completa, recalculada en vivo.
- **Simulador (el "Excel killer"):** tres botones — *Simular abono a capital*, *Simular cambio de plazo*, *Simular cancelación*. Al mover un slider de monto o plazo, la tabla de amortización y el saldo se recalculan al instante. Encabezar esta pantalla con un badge: **"Antes: Excel aparte · Ahora: en tiempo real"**.
- **Notificaciones:** bandeja simple con 3-4 mensajes automáticos de ejemplo (documento validado, promoción activa, recordatorio de pago en 3 días).

### 3. Vista equipo Estudia+ (interna)

- **Dashboard de marketing (Vale 1):** tarjetas con leads totales, tasa de conversión, tiempo de respuesta promedio, y una tabla simple de leads por asesor. Badge: **"Antes: reporte manual · Ahora: automático"**.
- **Pipeline comercial (Vale 2):** tablero tipo kanban con las etapas del flujo (Lead, Documentos, Buró, Propuesta, Contrato, Activo) y los clientes mock distribuidos en cada columna — mostrando que el folio no cambia al moverse de columna.
- **Buró de crédito integrado:** al abrir un expediente, mostrar una sección "Consulta Buró" con datos mock ya integrados (score, nivel de riesgo) — sin tener que salir del expediente.
- **Conciliación automática (Gris):** tabla con pagos recibidos vía OpenPay y SPEI, marcados como conciliados automáticamente, con badge **"Antes: solo lo que reporta OpenPay · Ahora: OpenPay + STP + Contpaqi en un solo cruce"**.
- **Cobranza y recompensas (Ale):** vista de cartera con estatus de mora, y un contador de "pagos puntuales consecutivos" por cliente que aplica el descuento de recompensa automáticamente al llegar al umbral — badge **"Antes: Excel celda por celda · Ahora: automático"**.
- **Reestructuras:** botón para simular una reestructura (cambio de plazo o mensualidad) sobre un crédito activo, mostrando el recálculo inmediato de la tabla de amortización.

---

## Quick wins que la demo debe hacer innegables

Cada uno de estos debe tener su propio badge visual "Antes / Ahora" en la pantalla correspondiente — es el argumento comercial central:

1. Un solo folio por alumno, visible en ambas vistas (alumno e interna).
2. Documentos que se pueden subir **y descargar**.
3. Simulador de pagos en tiempo real (reemplaza el Excel de simulaciones).
4. Tabla de amortización que se recalcula sola (reemplaza el Excel de amortización).
5. Conciliación multi-fuente automática (reemplaza el Excel de conciliación).
6. Recompensas por puntualidad aplicadas automáticamente (reemplaza el Excel celda por celda).
7. Notificaciones automáticas de estatus (reemplaza el seguimiento manual por WhatsApp/llamada).

---

## Fuera de alcance de la demo (no construir)

- Autenticación real / manejo de sesiones
- Integraciones reales con Clientify, OpenPay, STP, Contpaqi, Buró de Crédito o WhatsApp Business
- Persistencia de datos entre sesiones (nada de localStorage)
- Firma electrónica real (solo un botón "Firmar" que cambia el estatus)
- Lógica financiera con precisión contable de producción (los cálculos de amortización pueden ser una fórmula estándar simplificada, no requieren validación actuarial)

---

## Criterio de éxito de la demo

Alguien de Estudia+ que nunca vio el proyecto debe poder, en menos de 5 minutos y sin ayuda:

1. Entender que hay un solo folio por alumno.
2. Ver al menos dos Excels de los suyos "reemplazados" en vivo (simulador y conciliación son los más contundentes).
3. Recorrer el tutorial inicial sin quedarse atorado.
4. Identificar al menos un quick win que hoy no tienen y que quisieran tener ya.
