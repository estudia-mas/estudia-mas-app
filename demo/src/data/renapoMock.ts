import { normalizarCurp, parseCurp, type CurpParsed, type SexoCurp } from '../lib/curp'

/**
 * Consulta de identidad por CURP (simulada).
 * En producción: RENAPO — el nombre oficial solo sale de la consulta con la CURP.
 * Fecha, edad, sexo y entidad salen 100% de la estructura de la CURP.
 */

const NOMBRES_OFICIALES: Record<string, string> = {
  RASA010215MDFMRN09: 'ANA SOFIA RAMIREZ SANCHEZ',
  HECD990830HDFRRG05: 'DIEGO HERNANDEZ CRUZ',
  LOVM020511MDFPGR08: 'MARIANA LOPEZ VEGA',
  MERC980201HDFNDL02: 'CARLOS MENDOZA RUIZ',
  SONV000714MDFTVL04: 'VALERIA SOTO NAVA',
  OEDL970920HDFRLS01: 'LUIS ORTEGA DIAZ',
  GARC050312HDFRRL09: 'ROBERTO GARCIA LARA',
  PEMJ030825MDFRRN07: 'JULIA PEREZ MARTINEZ',
}

/** CURPs de ejemplo para el presentador (alta en vivo). */
export const CURP_EJEMPLOS_ALTA = [
  { curp: 'GARC050312HDFRRL09', hint: 'Alta demo · Roberto' },
  { curp: 'PEMJ030825MDFRRN07', hint: 'Alta demo · Julia' },
  { curp: 'RASA010215MDFMRN09', hint: 'Ya existe · Ana' },
] as const

const APELLIDOS = [
  'GARCIA',
  'HERNANDEZ',
  'LOPEZ',
  'MARTINEZ',
  'RAMIREZ',
  'SANCHEZ',
  'PEREZ',
  'GONZALEZ',
  'RODRIGUEZ',
  'TORRES',
  'FLORES',
  'RIVERA',
  'MORALES',
  'CRUZ',
  'ORTIZ',
]

const NOMBRES_H = [
  'JUAN',
  'CARLOS',
  'LUIS',
  'MIGUEL',
  'DIEGO',
  'ANDRES',
  'ROBERTO',
  'FERNANDO',
  'JOSE',
  'ALEJANDRO',
]

const NOMBRES_M = [
  'MARIA',
  'ANA',
  'SOFIA',
  'VALERIA',
  'MARIANA',
  'JULIA',
  'PAULA',
  'DANIELA',
  'CAMILA',
  'LAURA',
]

export type IdentidadCurp = CurpParsed & {
  nombreOficial: string
  nombre: string
  fuente: 'renapo_simulado'
}

function titleCaseNombre(oficial: string): string {
  return oficial
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function hashCurp(curp: string): number {
  let h = 0
  for (let i = 0; i < curp.length; i++) h = (h * 31 + curp.charCodeAt(i)) >>> 0
  return h
}

/** Nombre oficial determinístico para CURPs válidas fuera del padrón fijo (demo). */
function nombreDesdeCurp(curp: string, sexo: SexoCurp): string {
  const h = hashCurp(curp)
  const ap1 = APELLIDOS[h % APELLIDOS.length]!
  const ap2 = APELLIDOS[(h >>> 8) % APELLIDOS.length]!
  const pool = sexo === 'M' ? NOMBRES_M : NOMBRES_H
  const nom = pool[(h >>> 16) % pool.length]!
  return `${nom} ${ap1} ${ap2}`
}

/**
 * Identidad 100% a partir del CURP:
 * - Fecha, edad, sexo, entidad → estructura CURP
 * - Nombre oficial → consulta RENAPO simulada (clave = CURP)
 */
export function consultarIdentidadPorCurp(raw: string): IdentidadCurp | null {
  const parsed = parseCurp(raw)
  if (!parsed) return null

  const key = normalizarCurp(raw)
  const oficial =
    NOMBRES_OFICIALES[key] ?? nombreDesdeCurp(key, parsed.sexo)

  return {
    ...parsed,
    nombreOficial: oficial,
    nombre: titleCaseNombre(oficial),
    fuente: 'renapo_simulado',
  }
}
