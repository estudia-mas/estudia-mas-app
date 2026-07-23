export type EstatusCliente =
  | 'lead'
  | 'en_revision'
  | 'buro'
  | 'aprobado'
  | 'contrato_pendiente'
  | 'activo'
  | 'liquidado'

export type DocumentoEstado =
  | 'pendiente'
  | 'cargado'
  | 'validado'
  | 'requiere_actualizacion'

export type DocComentario = {
  id: string
  autor: 'equipo' | 'alumno'
  autorNombre: string
  texto: string
  fecha: string
  /** solicitud_cambio = el equipo pide reemplazar el archivo */
  tipo: 'comentario' | 'solicitud_cambio'
}

export type ArchivoEnMemoria = {
  nombreArchivo: string
  mimeType: string
  size: number
  /** Contenido en base64 (sin prefijo data:) — vive en el store, no en disco */
  dataBase64: string
  version: number
  subidoEn: string
}

export type Documento = {
  id: string
  nombre: string
  estado: DocumentoEstado
  fechaCarga: string | null
  comentarios: DocComentario[]
  /** Archivo real en memoria de la sesión (subir → descargar el mismo) */
  archivo: ArchivoEnMemoria | null
}

export type Credito = {
  montoTotal: number
  plazo: number
  tasaAnual: number
  saldoActual: number
  mensualidad: number
  fechaInicio: string
  /** Descuento recompensa ya aplicado sobre mensualidad */
  recompensaAplicada: boolean
  mensualidadBase: number
}

export type FuentePago = 'OpenPay' | 'STP' | 'Contpaqi'

export type Pago = {
  id: string
  fecha: string
  monto: number
  metodo: 'OpenPay' | 'SPEI'
  aTiempo: boolean
  conciliado: boolean
  /** Fuentes que ya “vieron” el pago en el cruce simulado */
  fuentes: FuentePago[]
}

export type BuroResumen = {
  score: number
  nivelRiesgo: 'bajo' | 'medio' | 'alto'
  fechaConsulta: string
}

export type Cliente = {
  id: string
  nombre: string
  curp: string
  /** Derivados 100% del CURP / consulta RENAPO por CURP (vacíos hasta completar formulario) */
  fechaNacimiento: string
  edad: number
  sexo: 'H' | 'M' | 'X'
  entidadNacimiento: string
  universidad: string
  carrera: string
  asesor: string
  email: string
  telefono: string
  /** Folio único — no cambia por etapa */
  folio: string
  estatus: EstatusCliente
  documentos: Documento[]
  credito: Credito | null
  pagos: Pago[]
  buro: BuroResumen | null
  pagosPuntualesConsecutivos: number
  enMora: boolean
  /** Notas internas del equipo (no las ve el alumno) */
  notasInternas: string
  /** Quién abrió el expediente */
  origenAlta: 'alumno' | 'equipo'
  /** false = el alumno debe completar la solicitud */
  formularioCompleto: boolean
}

export type Notificacion = {
  id: string
  clienteId: string
  titulo: string
  cuerpo: string
  fecha: string
  leida: boolean
  /** mensaje_equipo = enviado desde administración */
  tipo: 'sistema' | 'mensaje_equipo'
}

export type SnapshotCredito = {
  plazo: number
  saldoActual: number
  tasaAnual: number
  mensualidad: number
}

export type AjusteCreditoLog = {
  id: string
  clienteId: string
  fecha: string
  autor: string
  resumen: string
  antes: SnapshotCredito
  despues: SnapshotCredito
}

export type PlantillaTipo = 'formulario' | 'descuento'

export type PlantillaVersion = {
  version: number
  fecha: string
  autor: string
  nota: string
  /** Cuerpo editable (markdown / texto de plantilla) */
  contenido: string
  /** Para descuentos: porcentaje */
  valorNumerico?: number
}

export type Plantilla = {
  id: string
  tipo: PlantillaTipo
  nombre: string
  descripcion: string
  activaVersion: number
  versiones: PlantillaVersion[]
}

export const PIPELINE_COLUMNS: { key: EstatusCliente; label: string }[] = [
  { key: 'lead', label: 'Captación' },
  { key: 'en_revision', label: 'Documentos' },
  { key: 'buro', label: 'Buró' },
  { key: 'aprobado', label: 'Propuesta' },
  { key: 'contrato_pendiente', label: 'Contrato' },
  { key: 'activo', label: 'Activo' },
]

export const ESTATUS_LABEL: Record<EstatusCliente, string> = {
  lead: 'Captación / Lead',
  en_revision: 'Documentos',
  buro: 'Buró',
  aprobado: 'Aprobado / Propuesta',
  contrato_pendiente: 'Contrato / Firmas',
  activo: 'Crédito activo',
  liquidado: 'Liquidado',
}

/** Timeline alumno alineado al flujo de la minuta. */
export const ALUMNO_TIMELINE: { key: EstatusCliente; label: string }[] = [
  { key: 'lead', label: 'Captación' },
  { key: 'en_revision', label: 'Documentos' },
  { key: 'buro', label: 'Buró' },
  { key: 'aprobado', label: 'Aprobación' },
  { key: 'contrato_pendiente', label: 'Contrato' },
  { key: 'activo', label: 'Crédito activo' },
  { key: 'liquidado', label: 'Liquidación' },
]
