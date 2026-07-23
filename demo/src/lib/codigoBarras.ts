/** Código de barras único por alumno (derivado del folio). */

export function codigoBarrasDesdeFolio(folio: string): string {
  const digits = folio.replace(/\D/g, '') || '0'
  const body = `77${digits}`.replace(/\D/g, '').padEnd(12, '0').slice(0, 12)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const n = Number(body[i] ?? 0)
    sum += i % 2 === 0 ? n : n * 3
  }
  const check = (10 - (sum % 10)) % 10
  return `${body}${check}`
}

/** Patrón de barras (Code 11-ish visual) a partir del código numérico. */
export function patronBarras(codigo: string): number[] {
  const widths: number[] = [2, 1, 1]
  for (const ch of codigo) {
    const d = Number(ch)
    if (Number.isNaN(d)) continue
    widths.push(d % 2 === 0 ? 1 : 2, d % 3 === 0 ? 3 : 1, 1)
  }
  widths.push(1, 2, 1)
  return widths
}

export type LineaCaptura = {
  referencia: string
  convenio: string
  monto: number
  concepto: string
  vence: string
  codigoBarras: string
  folio: string
  nombre: string
}

export function buildLineaCaptura(opts: {
  folio: string
  codigoBarras: string
  nombre: string
  monto: number
}): LineaCaptura {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  const vence = d.toISOString().slice(0, 10)
  return {
    referencia: `8461${opts.codigoBarras}`,
    convenio: '1428756',
    monto: opts.monto,
    concepto: `Mensualidad crédito educativo ${opts.folio}`,
    vence,
    codigoBarras: opts.codigoBarras,
    folio: opts.folio,
    nombre: opts.nombre,
  }
}

export function textoLineaCaptura(l: LineaCaptura): string {
  return [
    'ESTUDIA MÁS — LÍNEA DE CAPTURA (DEMO)',
    '=====================================',
    '',
    `Alumno:     ${l.nombre}`,
    `Folio:      ${l.folio}`,
    `Código CB:  ${l.codigoBarras}`,
    '',
    `Convenio:   ${l.convenio}`,
    `Referencia: ${l.referencia}`,
    `Monto:      $${l.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
    `Vence:      ${l.vence}`,
    `Concepto:   ${l.concepto}`,
    '',
    'Instrucciones (mock):',
    '1. Paga en ventanilla bancaria o banca en línea con la referencia.',
    '2. O usa “Pagar en línea” en tu perfil Estudia Más (OpenPay demo).',
    '',
    'Este archivo es solo para la demo — no genera un cobro real.',
  ].join('\n')
}
