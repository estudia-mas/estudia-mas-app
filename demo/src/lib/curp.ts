/** Parser / validación CURP (estructura oficial SEGOB) — demo ilustrativa. */

export type SexoCurp = 'H' | 'M' | 'X'

export type CurpParsed = {
  curp: string
  /** YYYY-MM-DD */
  fechaNacimiento: string
  edad: number
  sexo: SexoCurp
  sexoLabel: string
  entidadCodigo: string
  entidadNombre: string
  /** Iniciales codificadas en posiciones 1–4 (no son el nombre completo) */
  iniciales: string
}

const ENTIDADES: Record<string, string> = {
  AS: 'Aguascalientes',
  BC: 'Baja California',
  BS: 'Baja California Sur',
  CC: 'Campeche',
  CL: 'Coahuila',
  CM: 'Colima',
  CS: 'Chiapas',
  CH: 'Chihuahua',
  DF: 'Ciudad de México',
  DG: 'Durango',
  GT: 'Guanajuato',
  GR: 'Guerrero',
  HG: 'Hidalgo',
  JC: 'Jalisco',
  MC: 'México',
  MN: 'Michoacán',
  MS: 'Morelos',
  NT: 'Nayarit',
  NL: 'Nuevo León',
  OC: 'Oaxaca',
  PL: 'Puebla',
  QT: 'Querétaro',
  QR: 'Quintana Roo',
  SP: 'San Luis Potosí',
  SL: 'Sinaloa',
  SR: 'Sonora',
  TC: 'Tabasco',
  TS: 'Tamaulipas',
  TL: 'Tlaxcala',
  VZ: 'Veracruz',
  YN: 'Yucatán',
  ZS: 'Zacatecas',
  NE: 'Nacido en el extranjero',
}

const CURP_RE =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMXhmx](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/i

export function normalizarCurp(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

export function esCurpFormatoValido(curp: string): boolean {
  return CURP_RE.test(normalizarCurp(curp))
}

function resolveYear(yy: number, homoclave: string, refYear = 2026): number {
  const h = homoclave.toUpperCase()
  if (/[A-J]/.test(h)) return 2000 + yy
  if (/[0-9]/.test(h)) {
    const y1900 = 1900 + yy
    const y2000 = 2000 + yy
    const age1900 = refYear - y1900
    const age2000 = refYear - y2000
    // Crédito educativo: preferir edad típica 14–45
    if (age2000 >= 14 && age2000 <= 45) return y2000
    if (age1900 >= 14 && age1900 <= 100) return y1900
    return y2000
  }
  return yy <= refYear % 100 ? 2000 + yy : 1900 + yy
}

function calcEdad(fechaISO: string, ref = new Date('2026-07-23')): number {
  const [y, m, d] = fechaISO.split('-').map(Number)
  let age = ref.getFullYear() - (y ?? 0)
  const rm = ref.getMonth() + 1
  const rd = ref.getDate()
  if (rm < (m ?? 0) || (rm === m && rd < (d ?? 0))) age -= 1
  return Math.max(0, age)
}

export function parseCurp(raw: string): CurpParsed | null {
  const curp = normalizarCurp(raw)
  if (!esCurpFormatoValido(curp)) return null

  const yy = Number(curp.slice(4, 6))
  const mm = curp.slice(6, 8)
  const dd = curp.slice(8, 10)
  const year = resolveYear(yy, curp[16]!)
  const fechaNacimiento = `${year}-${mm}-${dd}`

  const sexoRaw = curp[10]!.toUpperCase() as SexoCurp
  const sexo: SexoCurp =
    sexoRaw === 'H' || sexoRaw === 'M' || sexoRaw === 'X' ? sexoRaw : 'X'
  const sexoLabel =
    sexo === 'H' ? 'Hombre' : sexo === 'M' ? 'Mujer' : 'No binario'

  const entidadCodigo = curp.slice(11, 13).toUpperCase()
  const entidadNombre = ENTIDADES[entidadCodigo] ?? entidadCodigo

  return {
    curp,
    fechaNacimiento,
    edad: calcEdad(fechaNacimiento),
    sexo,
    sexoLabel,
    entidadCodigo,
    entidadNombre,
    iniciales: curp.slice(0, 4),
  }
}

export function formatFechaMx(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}
