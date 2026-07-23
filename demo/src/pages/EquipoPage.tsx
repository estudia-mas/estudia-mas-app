import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import AntesAhoraBadge from '../components/AntesAhoraBadge'
import AdminAlumnosPanel from '../components/AdminAlumnosPanel'
import DemoShell from '../components/DemoShell'
import ExpedienteDocumentos from '../components/ExpedienteDocumentos'
import FinanzasPanel from '../components/FinanzasPanel'
import OverviewDashboard from '../components/OverviewDashboard'
import PlantillasPanel from '../components/PlantillasPanel'
import { formatMXN, tablaAmortizacion } from '../lib/amortizacion'
import { useDemoStore, type EquipoTabId } from '../store/demoStore'
import {
  ESTATUS_LABEL,
  PIPELINE_COLUMNS,
  type EstatusCliente,
  type FuentePago,
} from '../types'

const FUENTES: FuentePago[] = ['OpenPay', 'STP', 'Contpaqi']

const NAV: {
  id: EquipoTabId
  label: string
  hint: string
  group: string
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    hint: 'Socios · KPIs y proyecciones',
    group: 'Dirección',
  },
  {
    id: 'alumnos',
    label: 'Alumnos',
    hint: 'Ficha, docs, crédito',
    group: 'Operación',
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    hint: 'Kanban por etapa',
    group: 'Operación',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    hint: 'Leads y conversión',
    group: 'Operación',
  },
  {
    id: 'conciliacion',
    label: 'Conciliación',
    hint: 'OpenPay · STP · Contpaqi',
    group: 'Finanzas',
  },
  {
    id: 'cobranza',
    label: 'Cobranza',
    hint: 'Mora y recompensas',
    group: 'Finanzas',
  },
  {
    id: 'finanzas',
    label: 'TIR & amortización',
    hint: 'Auto-cálculo',
    group: 'Finanzas',
  },
  {
    id: 'plantillas',
    label: 'Plantillas',
    hint: 'Formularios y descuentos',
    group: 'Configuración',
  },
]

export default function EquipoPage() {
  const tab = useDemoStore((s) => s.equipoTab)
  const setEquipoTab = useDemoStore((s) => s.setEquipoTab)
  const clientes = useDemoStore((s) => s.clientes)
  const selectedId = useDemoStore((s) => s.clienteSeleccionadoId)
  const selectCliente = useDemoStore((s) => s.selectCliente)
  const updateEstatus = useDemoStore((s) => s.updateEstatus)
  const aplicarSimulacion = useDemoStore((s) => s.aplicarSimulacion)
  const firmarContrato = useDemoStore((s) => s.firmarContrato)
  const aplicarRecompensa = useDemoStore((s) => s.aplicarRecompensa)
  const conciliarPago = useDemoStore((s) => s.conciliarPago)

  const [asesorFilter, setAsesorFilter] = useState<string>('todos')
  const [dragId, setDragId] = useState<string | null>(null)

  const asesores = useMemo(() => {
    const set = new Set(clientes.map((c) => c.asesor))
    return Array.from(set).sort()
  }, [clientes])

  const filtered = useMemo(() => {
    if (asesorFilter === 'todos') return clientes
    return clientes.filter((c) => c.asesor === asesorFilter)
  }, [clientes, asesorFilter])

  const selected = clientes.find((c) => c.id === selectedId) ?? null

  const leadsPorAsesor = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of clientes) {
      const short = c.asesor.includes('Laura')
        ? 'Laura'
        : c.asesor.includes('Marco')
          ? 'Marco'
          : 'Otro'
      map.set(short, (map.get(short) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([asesor, leads]) => ({
      asesor,
      leads,
      conversion: asesor === 'Laura' ? 28 : asesor === 'Marco' ? 22 : 18,
    }))
  }, [clientes])

  const pagos = filtered.flatMap((c) =>
    c.pagos.map((p) => ({ ...p, folio: c.folio, nombre: c.nombre })),
  )

  function dropOnColumn(estatus: EstatusCliente) {
    if (!dragId) return
    updateEstatus(dragId, estatus)
    setDragId(null)
  }

  const reestructuraTabla =
    selected?.credito != null
      ? tablaAmortizacion(
          selected.credito.saldoActual,
          selected.credito.plazo,
          selected.credito.tasaAnual,
        )
      : []

  const groups = useMemo(() => {
    const order = ['Dirección', 'Operación', 'Finanzas', 'Configuración']
    return order.map((g) => ({
      name: g,
      items: NAV.filter((n) => n.group === g),
    }))
  }, [])

  const currentLabel = NAV.find((n) => n.id === tab)?.label ?? 'Equipo'

  function goTab(id: EquipoTabId) {
    setEquipoTab(id)
    if (id !== 'pipeline' && id !== 'alumnos') selectCliente(null)
  }

  return (
    <DemoShell title="Equipo Estudia+" folio={selected?.folio ?? undefined} flush>
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-[calc(100dvh-4.5rem)] md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-navy/10 bg-white md:flex lg:w-60">
          <div className="border-b border-navy/5 px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
              Consola equipo
            </p>
            <p className="mt-0.5 text-sm font-semibold text-navy">
              Estudia Más Ops
            </p>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
            {groups.map((g) => (
              <div key={g.name}>
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-gray">
                  {g.name}
                </p>
                <ul className="space-y-0.5">
                  {g.items.map((item) => {
                    const active = tab === item.id
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => goTab(item.id)}
                          className={`w-full rounded-[10px] px-3 py-2.5 text-left transition ${
                            active
                              ? 'bg-navy text-white'
                              : 'text-navy hover:bg-light'
                          }`}
                        >
                          <span className="block text-sm font-medium">
                            {item.label}
                          </span>
                          <span
                            className={`block text-[11px] ${
                              active ? 'text-white/70' : 'text-gray'
                            }`}
                          >
                            {item.hint}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-navy/5 p-3">
            <label className="block text-[11px] font-medium text-gray">
              Filtrar por asesor
              <select
                value={asesorFilter}
                onChange={(e) => setAsesorFilter(e.target.value)}
                className="mt-1 w-full rounded-[8px] border border-navy/15 bg-white px-2 py-1.5 text-sm text-navy"
              >
                <option value="todos">Todos</option>
                {asesores.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3 pb-24 pt-3 sm:px-6 sm:pb-8 sm:pt-5 md:pb-8">
          {/* Mobile: chips horizontales + filtro */}
          <div className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-20 -mx-3 mb-4 border-b border-navy/10 bg-light/95 px-3 pb-3 pt-1 backdrop-blur md:hidden">
            <div className="scroll-x-touch flex gap-2 pb-1">
              {NAV.map((n) => {
                const active = tab === n.id
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => goTab(n.id)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap ${
                      active
                        ? 'bg-navy text-white'
                        : 'border border-navy/10 bg-white text-navy'
                    }`}
                  >
                    {n.label}
                  </button>
                )
              })}
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-gray">
              <span className="shrink-0 font-medium">Asesor</span>
              <select
                value={asesorFilter}
                onChange={(e) => setAsesorFilter(e.target.value)}
                className="min-w-0 flex-1 rounded-[10px] border border-navy/15 bg-white px-2 py-2 text-sm text-navy"
              >
                <option value="todos">Todos</option>
                {asesores.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-4 hidden items-center justify-between gap-3 md:flex">
            <h1 className="text-lg font-semibold text-navy">{currentLabel}</h1>
          </div>
          <h1 className="mb-3 text-base font-semibold text-navy md:hidden">
            {currentLabel}
          </h1>

          {tab === 'overview' ? <OverviewDashboard /> : null}
          {tab === 'alumnos' ? <AdminAlumnosPanel /> : null}
          {tab === 'finanzas' ? <FinanzasPanel /> : null}
          {tab === 'plantillas' ? <PlantillasPanel /> : null}

          {tab === 'marketing' ? (
            <section className="space-y-4">
              <AntesAhoraBadge
                antes="reporte manual en Excel"
                ahora="automático"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Leads en demo', String(clientes.length)],
                  ['Conversión (ilustr.)', '27%'],
                  ['Tiempo resp. prom.', '2.4 h'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-[12px] border border-navy/10 bg-white p-4"
                  >
                    <p className="text-xs text-gray">{k}</p>
                    <p className="mt-1 text-2xl font-semibold text-navy">{v}</p>
                  </div>
                ))}
              </div>
              <div className="h-52 rounded-[12px] border border-navy/10 bg-white p-4">
                <p className="mb-2 text-sm font-medium text-navy">
                  Conversión por asesor
                </p>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={leadsPorAsesor}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="asesor"
                      tick={{ fill: '#6F3D47', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#6F3D47', fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="conversion"
                      fill="#CA3C60"
                      name="%"
                      radius={6}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto rounded-[12px] border border-navy/10 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-light text-xs uppercase text-gray">
                    <tr>
                      <th className="px-3 py-2 text-left">Asesor</th>
                      <th className="px-3 py-2 text-right">Leads (demo)</th>
                      <th className="px-3 py-2 text-right">Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsPorAsesor.map((r) => (
                      <tr key={r.asesor} className="border-t border-navy/5">
                        <td className="px-3 py-2">{r.asesor}</td>
                        <td className="px-3 py-2 text-right">{r.leads}</td>
                        <td className="px-3 py-2 text-right">
                          {r.conversion}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {tab === 'pipeline' ? (
            <section className="space-y-4">
              <AntesAhoraBadge
                antes="Excel de seguimiento por área"
                ahora="mismo folio en todo el kanban"
              />
              <p className="text-xs text-gray">
                Arrastra tarjetas entre columnas — el folio no cambia.
              </p>
              <p className="text-xs text-teal md:hidden">
                Desliza columnas → · en móvil toca una tarjeta y usa el selector
                de etapa abajo.
              </p>
              <div className="scroll-x-touch flex snap-x snap-mandatory gap-3 pb-2">
                {PIPELINE_COLUMNS.map((col) => {
                  const cards = filtered.filter((c) => c.estatus === col.key)
                  return (
                    <div
                      key={col.key}
                      className={`w-[78vw] max-w-64 shrink-0 snap-start rounded-[12px] border bg-white sm:w-52 sm:max-w-none ${
                        dragId ? 'border-teal/40' : 'border-navy/10'
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => dropOnColumn(col.key)}
                    >
                      <div className="border-b border-navy/5 px-3 py-2 text-sm font-semibold text-navy">
                        {col.label}{' '}
                        <span className="font-normal text-gray">
                          ({cards.length})
                        </span>
                      </div>
                      <div className="min-h-[100px] space-y-2 p-2">
                        {cards.length === 0 ? (
                          <p className="px-1 py-6 text-center text-xs text-gray">
                            Vacío
                          </p>
                        ) : (
                          cards.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              draggable
                              onDragStart={() => setDragId(c.id)}
                              onDragEnd={() => setDragId(null)}
                              onClick={() => selectCliente(c.id)}
                              className={`w-full cursor-grab rounded-[8px] border p-2 text-left text-sm active:cursor-grabbing ${
                                selectedId === c.id
                                  ? 'border-teal bg-mint'
                                  : 'border-navy/10 bg-light'
                              }`}
                            >
                              <p className="font-medium text-navy">
                                {c.nombre}
                              </p>
                              <p className="font-mono text-[11px] text-teal">
                                {c.folio}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selected ? (
                <div className="space-y-4 rounded-[12px] border border-navy/10 bg-white p-4 sm:p-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                      Folio del expediente
                    </p>
                    <h3 className="text-lg font-semibold text-navy">
                      {selected.nombre}
                    </h3>
                    <p className="break-all font-mono text-lg font-bold text-navy sm:text-xl">
                      {selected.folio}
                    </p>
                    <p className="mt-1 text-sm text-gray">
                      {selected.universidad} · {selected.asesor} ·{' '}
                      {ESTATUS_LABEL[selected.estatus]}
                    </p>
                    <label className="mt-3 block text-xs font-medium text-gray md:hidden">
                      Mover a etapa
                      <select
                        value={selected.estatus}
                        onChange={(e) =>
                          updateEstatus(
                            selected.id,
                            e.target.value as EstatusCliente,
                          )
                        }
                        className="mt-1 w-full rounded-[10px] border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy"
                      >
                        {PIPELINE_COLUMNS.map((col) => (
                          <option key={col.key} value={col.key}>
                            {col.label}
                          </option>
                        ))}
                        <option value="liquidado">Liquidado</option>
                      </select>
                    </label>
                  </div>

                  <div className="rounded-[10px] bg-light p-4">
                    <p className="text-sm font-semibold text-navy">
                      Consulta Buró (integrada)
                    </p>
                    {selected.buro ? (
                      <p className="mt-2 text-sm text-gray">
                        Score{' '}
                        <span className="font-semibold text-navy">
                          {selected.buro.score}
                        </span>
                        {' · '}
                        Riesgo{' '}
                        <span className="capitalize text-navy">
                          {selected.buro.nivelRiesgo}
                        </span>
                        {' · '}
                        {selected.buro.fechaConsulta}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-gray">
                        Aún sin consulta en este folio.
                      </p>
                    )}
                  </div>

                  {selected.estatus === 'contrato_pendiente' ? (
                    <button
                      type="button"
                      className="rounded-[8px] bg-teal px-4 py-2.5 text-sm font-semibold text-white"
                      onClick={() => firmarContrato(selected.id)}
                    >
                      Firmar contrato (simulado)
                    </button>
                  ) : null}

                  <div>
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Documentos del expediente
                        </p>
                        <p className="text-xs text-gray">
                          Consulta lo que subió el alumno, comenta o pide una
                          nueva versión.
                        </p>
                      </div>
                      <AntesAhoraBadge
                        className="max-w-sm"
                        antes="archivos en WhatsApp"
                        ahora="revisión en el folio"
                      />
                    </div>
                    <ExpedienteDocumentos
                      modo="equipo"
                      clienteId={selected.id}
                      folio={selected.folio}
                      documentos={selected.documentos}
                    />
                  </div>

                  {selected.credito ? (
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        Reestructura
                      </p>
                      <p className="mt-1 text-sm text-gray">
                        Mensualidad {formatMXN(selected.credito.mensualidad)} ·
                        Plazo {selected.credito.plazo} m · Saldo{' '}
                        {formatMXN(selected.credito.saldoActual)}
                      </p>
                      <button
                        type="button"
                        className="mt-2 rounded-[8px] bg-navy px-3 py-2 text-sm font-semibold text-white"
                        onClick={() =>
                          aplicarSimulacion(selected.id, {
                            plazo: Math.max(12, selected.credito!.plazo - 6),
                          })
                        }
                      >
                        Acortar plazo −6 meses y recalcular tabla
                      </button>
                      <div className="mt-3 max-h-56 overflow-auto rounded-[10px] border border-navy/10">
                        <table className="min-w-full text-left text-xs">
                          <thead className="sticky top-0 bg-light text-gray">
                            <tr>
                              <th className="px-2 py-1">#</th>
                              <th className="px-2 py-1 text-right">Pago</th>
                              <th className="px-2 py-1 text-right">Saldo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reestructuraTabla.slice(0, 8).map((r) => (
                              <tr
                                key={r.periodo}
                                className="border-t border-navy/5"
                              >
                                <td className="px-2 py-1">{r.periodo}</td>
                                <td className="px-2 py-1 text-right">
                                  {formatMXN(r.pago)}
                                </td>
                                <td className="px-2 py-1 text-right">
                                  {formatMXN(r.saldo)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-gray">
                  Selecciona una tarjeta (p. ej. Valeria para firmar).
                </p>
              )}
            </section>
          ) : null}

          {tab === 'conciliacion' ? (
            <section className="space-y-4">
              <AntesAhoraBadge
                antes="solo lo que reporta OpenPay"
                ahora="OpenPay + STP + Contpaqi en un solo cruce"
              />
              <p className="text-sm text-gray">
                Cada pago muestra qué fuentes ya lo vieron. Completa el cruce
                con un clic.
              </p>
              {pagos.length === 0 ? (
                <Empty text="Sin pagos en este filtro. Elige Todos o Laura." />
              ) : (
                <>
                  {/* Mobile cards */}
                  <ul className="space-y-3 md:hidden">
                    {pagos.map((p) => {
                      const completo = FUENTES.every((f) =>
                        p.fuentes.includes(f),
                      )
                      return (
                        <li
                          key={p.id}
                          className="rounded-[12px] border border-navy/10 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-navy">{p.nombre}</p>
                              <p className="truncate font-mono text-xs text-teal">
                                {p.folio}
                              </p>
                              <p className="mt-1 text-xs text-gray">{p.fecha}</p>
                            </div>
                            <p className="shrink-0 text-base font-semibold text-navy">
                              {formatMXN(p.monto)}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {FUENTES.map((f) => (
                              <span
                                key={f}
                                className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                                  p.fuentes.includes(f)
                                    ? 'bg-green/15 text-green'
                                    : 'bg-navy/5 text-gray'
                                }`}
                              >
                                {f} {p.fuentes.includes(f) ? '✓' : '—'}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3">
                            {completo ? (
                              <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-green">
                                Conciliado
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="w-full rounded-[10px] bg-teal py-2.5 text-sm font-semibold text-white"
                                onClick={() => conciliarPago(p.id)}
                              >
                                Completar cruce
                              </button>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="hidden overflow-x-auto rounded-[12px] border border-navy/10 bg-white md:block">
                    <table className="min-w-full text-sm">
                      <thead className="bg-light text-xs uppercase text-gray">
                        <tr>
                          <th className="px-3 py-2 text-left">Fecha</th>
                          <th className="px-3 py-2 text-left">Folio</th>
                          <th className="px-3 py-2 text-left">Cliente</th>
                          <th className="px-3 py-2 text-right">Monto</th>
                          {FUENTES.map((f) => (
                            <th key={f} className="px-2 py-2 text-center">
                              {f}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-left">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagos.map((p) => {
                          const completo = FUENTES.every((f) =>
                            p.fuentes.includes(f),
                          )
                          return (
                            <tr key={p.id} className="border-t border-navy/5">
                              <td className="px-3 py-2">{p.fecha}</td>
                              <td className="px-3 py-2 font-mono text-xs text-teal">
                                {p.folio}
                              </td>
                              <td className="px-3 py-2">{p.nombre}</td>
                              <td className="px-3 py-2 text-right">
                                {formatMXN(p.monto)}
                              </td>
                              {FUENTES.map((f) => (
                                <td key={f} className="px-2 py-2 text-center">
                                  {p.fuentes.includes(f) ? (
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green/15 text-xs font-bold text-green">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/5 text-xs text-gray">
                                      —
                                    </span>
                                  )}
                                </td>
                              ))}
                              <td className="px-3 py-2">
                                {completo ? (
                                  <span className="rounded-md bg-mint px-2 py-0.5 text-xs font-semibold text-green">
                                    Conciliado
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="rounded-[8px] bg-teal px-2.5 py-1 text-xs font-semibold text-white"
                                    onClick={() => conciliarPago(p.id)}
                                  >
                                    Completar cruce
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          ) : null}

          {tab === 'cobranza' ? (
            <section className="space-y-4">
              <AntesAhoraBadge
                antes="Excel celda por celda"
                ahora="recompensas automáticas"
              />
              <ul className="space-y-2">
                {filtered
                  .filter((c) => c.credito)
                  .map((c) => {
                    const umbral = 3
                    const listo =
                      c.pagosPuntualesConsecutivos >= umbral &&
                      !c.credito!.recompensaAplicada
                    return (
                      <li
                        key={c.id}
                        className={`rounded-[12px] border bg-white p-4 ${
                          c.enMora ? 'border-lime/50' : 'border-navy/10'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-navy">{c.nombre}</p>
                            <p className="font-mono text-xs text-teal">
                              {c.folio}
                            </p>
                            <p className="mt-1 text-sm text-gray">
                              Saldo {formatMXN(c.credito!.saldoActual)} ·
                              Mensualidad{' '}
                              <strong className="text-navy">
                                {formatMXN(c.credito!.mensualidad)}
                              </strong>
                              {c.credito!.recompensaAplicada ? (
                                <span className="ml-1 text-xs text-green">
                                  (base{' '}
                                  {formatMXN(c.credito!.mensualidadBase)})
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 text-xs font-semibold">
                              {c.enMora ? (
                                <span className="text-lime">En mora</span>
                              ) : (
                                <span className="text-green">Al corriente</span>
                              )}
                              {' · '}
                              Puntuales: {c.pagosPuntualesConsecutivos}/{umbral}
                            </p>
                          </div>
                          <div className="text-right">
                            {c.credito!.recompensaAplicada ? (
                              <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-green">
                                −2% aplicado
                              </span>
                            ) : listo ? (
                              <button
                                type="button"
                                className="rounded-[8px] bg-teal px-3 py-2 text-xs font-semibold text-white"
                                onClick={() => aplicarRecompensa(c.id)}
                              >
                                Aplicar recompensa 2%
                              </button>
                            ) : (
                              <p className="text-xs text-gray">Sin umbral aún</p>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </DemoShell>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-navy/20 bg-white px-4 py-10 text-center text-sm text-gray">
      {text}
    </div>
  )
}
