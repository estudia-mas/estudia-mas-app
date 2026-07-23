import type { EquipoTab } from '../lib/demoUrl'
import type { Vista } from '../store/demoStore'

export type FlujoPaso = {
  id: string
  area: 'CRM' | 'Originación' | 'Administración' | 'Cobranza'
  label: string
  detalle: string
  /** Qué decir en la demo */
  habla: string
  vista: Vista
  alumno?: string
  equipo?: EquipoTab
  cliente?: string
  tab?: 'expediente' | 'documentos' | 'credito' | 'simulador' | 'avisos'
}

/** Ciclo de vida de la minuta, comprimido a beats demostrables. */
export const FLUJO_CICLO: FlujoPaso[] = [
  {
    id: 'captacion',
    area: 'CRM',
    label: 'Captación → CRM',
    detalle: 'Leads de web, Google, redes, referidos, chatbot y asesores.',
    habla: 'Aquí entra el prospecto. Ya no es un Excel de captación.',
    vista: 'equipo',
    equipo: 'marketing',
  },
  {
    id: 'asignacion',
    area: 'CRM',
    label: 'Asignación de asesor',
    detalle: 'Cada lead tiene asesor, universidad, carrera y origen.',
    habla: 'Mesa / admin asigna asesor en la ficha del alumno.',
    vista: 'equipo',
    equipo: 'alumnos',
    cliente: 'c4', // Carlos lead
  },
  {
    id: 'solicitud_docs',
    area: 'Originación',
    label: 'Solicitud → carga documental',
    detalle: 'CURP, INE, domicilio, aceptación, estudios, obligado solidario.',
    habla: 'El alumno sube; el equipo ve el mismo expediente.',
    vista: 'alumno',
    alumno: 'c2',
    tab: 'documentos',
  },
  {
    id: 'validacion',
    area: 'Originación',
    label: 'Validación (mesa de control)',
    detalle: 'Estado, fecha, responsable y observaciones por documento.',
    habla: 'El equipo comenta o pide actualización — sin WhatsApp paralelo.',
    vista: 'equipo',
    equipo: 'pipeline',
    cliente: 'c2',
  },
  {
    id: 'buro',
    area: 'Originación',
    label: 'Buró de crédito',
    detalle: 'Consulta integrada al expediente (score y riesgo).',
    habla: 'Buró dentro del folio — no en otra herramienta.',
    vista: 'equipo',
    equipo: 'pipeline',
    cliente: 'c3',
  },
  {
    id: 'aprobacion',
    area: 'Originación',
    label: 'Análisis → aprobación → propuesta',
    detalle: 'Capacidad de pago, riesgo y propuesta financiera.',
    habla: 'El folio avanza de etapa sin cambiar de número.',
    vista: 'equipo',
    equipo: 'pipeline',
    cliente: 'c5',
  },
  {
    id: 'simulacion',
    area: 'Administración',
    label: 'Simulación financiera',
    detalle: 'Mensualidad, intereses, capital; escenarios en vivo.',
    habla: 'Excel killer #1: abono, plazo o cancelación en tiempo real.',
    vista: 'alumno',
    alumno: 'c1',
    tab: 'simulador',
  },
  {
    id: 'contrato',
    area: 'Originación',
    label: 'Contrato → firmas',
    detalle: 'Flujo tipo DocuSign: estudiante, solidario, institución (simulado).',
    habla: 'Un clic Firmar cambia a crédito activo — misma ficha.',
    vista: 'equipo',
    equipo: 'pipeline',
    cliente: 'c5',
  },
  {
    id: 'activo',
    area: 'Administración',
    label: 'Crédito activo → pagos',
    detalle: 'OpenPay, SPEI, historial y amortización en el expediente.',
    habla: 'El alumno ve saldo, pagos y avisos en un solo lugar.',
    vista: 'alumno',
    alumno: 'c1',
    tab: 'credito',
  },
  {
    id: 'cobranza',
    area: 'Cobranza',
    label: 'Cobranza → reestructuras',
    detalle: 'Mora, recargos, reestructuras y recompensas por puntualidad.',
    habla: 'Excel killer de cobranza: mora visible y premio 2% automático.',
    vista: 'equipo',
    equipo: 'cobranza',
  },
  {
    id: 'conciliacion',
    area: 'Cobranza',
    label: 'Conciliación de pagos',
    detalle: 'OpenPay + STP + Contpaqi en un solo cruce.',
    habla: 'Excel killer #2: completar cruce multi-fuente.',
    vista: 'equipo',
    equipo: 'conciliacion',
  },
  {
    id: 'liquidacion',
    area: 'Administración',
    label: 'Liquidación',
    detalle: 'Cierre del ciclo: un folio del lead a liquidado.',
    habla: 'Remate: un cliente, un folio, un expediente digital.',
    vista: 'alumno',
    alumno: 'c1',
    tab: 'expediente',
  },
]
