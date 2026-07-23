/** Amortización francesa simplificada (ilustrativa, no actuarial). */

export type AmortRow = {
  periodo: number
  pago: number
  interes: number
  capital: number
  saldo: number
}

export function mensualidadFrancesa(
  monto: number,
  plazoMeses: number,
  tasaAnual: number,
): number {
  if (plazoMeses <= 0) return 0
  const r = tasaAnual / 12 / 100
  if (r === 0) return monto / plazoMeses
  const factor = Math.pow(1 + r, plazoMeses)
  return (monto * r * factor) / (factor - 1)
}

export function tablaAmortizacion(
  monto: number,
  plazoMeses: number,
  tasaAnual: number,
  abonoExtraCapital = 0,
): AmortRow[] {
  const pagoBase = mensualidadFrancesa(monto, plazoMeses, tasaAnual)
  const r = tasaAnual / 12 / 100
  let saldo = monto
  const rows: AmortRow[] = []

  for (let i = 1; i <= plazoMeses && saldo > 0.01; i++) {
    const interes = saldo * r
    let capital = pagoBase - interes
    if (i === 1 && abonoExtraCapital > 0) {
      capital += abonoExtraCapital
    }
    if (capital > saldo) capital = saldo
    const pago = interes + capital
    saldo = Math.max(0, saldo - capital)
    rows.push({
      periodo: i,
      pago: round2(pago),
      interes: round2(interes),
      capital: round2(capital),
      saldo: round2(saldo),
    })
  }
  return rows
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)
}

/** Intereses totales de la tabla (ilustrativo). */
export function interesesTotales(
  monto: number,
  plazoMeses: number,
  tasaAnual: number,
): number {
  return tablaAmortizacion(monto, plazoMeses, tasaAnual).reduce(
    (a, r) => a + r.interes,
    0,
  )
}

/**
 * TIR aproximada anualizada a partir de la tasa contractual (demo).
 * En producto real se calcularía con flujo de caja y comisiones.
 */
export function tirAproximada(tasaAnual: number, comisionAperturaPct = 0): number {
  return Math.round((tasaAnual + comisionAperturaPct * 0.5) * 100) / 100
}

/** CAT ilustrativo (no oficial CNBV): tasa + carga de comisión prorrateada. */
export function catIlustrativo(
  tasaAnual: number,
  comisionAperturaPct = 1.5,
  ivaPct = 16,
): number {
  const carga = comisionAperturaPct * (1 + ivaPct / 100)
  return Math.round((tasaAnual + carga) * 10) / 10
}

/** TIR “real” demo: TIR menos inflación asumida. */
export function tirReal(tirNominal: number, inflacion = 4): number {
  return Math.round((tirNominal - inflacion) * 100) / 100
}
