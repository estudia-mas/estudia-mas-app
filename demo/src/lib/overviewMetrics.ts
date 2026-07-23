import type { Cliente } from '../types'
import { ESTATUS_LABEL, PIPELINE_COLUMNS } from '../types'

export type OverviewMetrics = {
  totalExpedientes: number
  leads: number
  enOriginacion: number
  activos: number
  liquidados: number
  enMora: number
  tasaMoraPct: number
  conversionLeadActivoPct: number
  carteraSaldo: number
  carteraMensualidad: number
  montoOriginado: number
  pagosMes: number
  pagosConciliados: number
  pagosPendientesCruce: number
  docsPendientes: number
  docsPorActualizar: number
  pipeline: { etapa: string; key: string; count: number }[]
  carteraPorEstatus: { name: string; saldo: number; count: number }[]
  cobranzaReciente: { mes: string; cobrado: number; esperado: number }[]
  proyeccion: {
    mes: string
    cartera: number
    cobranza: number
    originacion: number
  }[]
  alertas: string[]
}

const ORIGINACION: Cliente['estatus'][] = [
  'lead',
  'en_revision',
  'buro',
  'aprobado',
  'contrato_pendiente',
]

function monthLabel(offsetFromNow: number, base = new Date('2026-07-01')) {
  const d = new Date(base)
  d.setMonth(d.getMonth() + offsetFromNow)
  return d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
}

export function buildOverviewMetrics(clientes: Cliente[]): OverviewMetrics {
  const totalExpedientes = clientes.length
  const leads = clientes.filter((c) => c.estatus === 'lead').length
  const enOriginacion = clientes.filter((c) =>
    ORIGINACION.includes(c.estatus),
  ).length
  const activos = clientes.filter((c) => c.estatus === 'activo').length
  const liquidados = clientes.filter((c) => c.estatus === 'liquidado').length
  const enMora = clientes.filter((c) => c.enMora).length
  const conCredito = clientes.filter((c) => c.credito)
  const tasaMoraPct =
    conCredito.length === 0
      ? 0
      : Math.round((enMora / conCredito.length) * 1000) / 10

  const cerrados = activos + liquidados
  const conversionLeadActivoPct =
    totalExpedientes === 0
      ? 0
      : Math.round((cerrados / totalExpedientes) * 1000) / 10

  const carteraSaldo = conCredito.reduce(
    (a, c) => a + (c.credito?.saldoActual ?? 0),
    0,
  )
  const carteraMensualidad = conCredito
    .filter((c) => c.estatus === 'activo')
    .reduce((a, c) => a + (c.credito?.mensualidad ?? 0), 0)
  const montoOriginado = conCredito.reduce(
    (a, c) => a + (c.credito?.montoTotal ?? 0),
    0,
  )

  const todosPagos = clientes.flatMap((c) => c.pagos)
  const pagosMes = todosPagos.reduce((a, p) => a + p.monto, 0)
  const pagosConciliados = todosPagos.filter((p) => p.conciliado).length
  const pagosPendientesCruce = todosPagos.filter((p) => !p.conciliado).length

  let docsPendientes = 0
  let docsPorActualizar = 0
  for (const c of clientes) {
    for (const d of c.documentos) {
      if (d.estado === 'pendiente') docsPendientes++
      if (d.estado === 'requiere_actualizacion') docsPorActualizar++
    }
  }

  const pipeline = PIPELINE_COLUMNS.map((col) => ({
    etapa: col.label,
    key: col.key,
    count: clientes.filter((c) => c.estatus === col.key).length,
  }))

  const carteraPorEstatus = (
    ['activo', 'contrato_pendiente', 'buro', 'aprobado'] as const
  )
    .map((key) => {
      const subset = clientes.filter((c) => c.estatus === key && c.credito)
      return {
        name: ESTATUS_LABEL[key].split('/')[0]!.trim(),
        saldo: subset.reduce((a, c) => a + (c.credito?.saldoActual ?? 0), 0),
        count: subset.length,
      }
    })
    .filter((r) => r.count > 0 || r.saldo > 0)

  // Cobranza ilustrativa últimos 6 meses (mezcla real + proyección suave)
  const baseEsperado = Math.max(carteraMensualidad, 1)
  const cobranzaReciente = [-5, -4, -3, -2, -1, 0].map((off, i) => {
    const factor = 0.82 + i * 0.03
    const cobradoReal =
      off === 0
        ? pagosMes || Math.round(baseEsperado * 0.92)
        : Math.round(baseEsperado * factor * (0.95 + (i % 3) * 0.02))
    return {
      mes: monthLabel(off),
      cobrado: cobradoReal,
      esperado: Math.round(baseEsperado * (0.9 + i * 0.02)),
    }
  })

  // Proyección 6 meses: crecimiento de originación + cartera
  const proyeccion = [1, 2, 3, 4, 5, 6].map((m) => {
    const growth = 1 + m * 0.04
    const moraDrag = 1 - tasaMoraPct / 400
    return {
      mes: monthLabel(m),
      cartera: Math.round(carteraSaldo * growth * moraDrag),
      cobranza: Math.round(carteraMensualidad * growth * 0.97),
      originacion: Math.round(
        Math.max(2, Math.round(leads * 0.35 + m * 1.2)) * 45000,
      ),
    }
  })

  const alertas: string[] = []
  if (enMora > 0) {
    alertas.push(
      `${enMora} crédito${enMora === 1 ? '' : 's'} en mora (${tasaMoraPct}% de cartera con crédito).`,
    )
  }
  if (pagosPendientesCruce > 0) {
    alertas.push(
      `${pagosPendientesCruce} pago${pagosPendientesCruce === 1 ? '' : 's'} sin cruce completo OpenPay/STP/Contpaqi.`,
    )
  }
  if (docsPorActualizar > 0) {
    alertas.push(
      `${docsPorActualizar} documento${docsPorActualizar === 1 ? '' : 's'} requieren actualización del alumno.`,
    )
  }
  if (docsPendientes > 8) {
    alertas.push(
      `Backlog alto de documentos pendientes (${docsPendientes}).`,
    )
  }
  if (alertas.length === 0) {
    alertas.push('Sin alertas críticas · operación dentro de umbrales demo.')
  }

  return {
    totalExpedientes,
    leads,
    enOriginacion,
    activos,
    liquidados,
    enMora,
    tasaMoraPct,
    conversionLeadActivoPct,
    carteraSaldo,
    carteraMensualidad,
    montoOriginado,
    pagosMes,
    pagosConciliados,
    pagosPendientesCruce,
    docsPendientes,
    docsPorActualizar,
    pipeline,
    carteraPorEstatus,
    cobranzaReciente,
    proyeccion,
    alertas,
  }
}
