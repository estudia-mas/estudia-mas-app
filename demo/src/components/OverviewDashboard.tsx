import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import AntesAhoraBadge from './AntesAhoraBadge'
import { formatMXN } from '../lib/amortizacion'
import { buildOverviewMetrics } from '../lib/overviewMetrics'
import { useDemoStore } from '../store/demoStore'

const COLORS = ['#802F42', '#CA3C60', '#6F3D47', '#C81B48', '#A85A6E', '#D47890']

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-[12px] border p-3 sm:p-4 ${
        accent ? 'border-teal/35 bg-mint/50' : 'border-navy/10 bg-white'
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-navy sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-gray">{hint}</p> : null}
    </div>
  )
}

export default function OverviewDashboard() {
  const clientes = useDemoStore((s) => s.clientes)
  const m = useMemo(() => buildOverviewMetrics(clientes), [clientes])

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
            Vista socios / dirección
          </p>
          <h2 className="text-lg font-semibold text-navy sm:text-xl">
            Overview del negocio
          </h2>
          <p className="mt-1 max-w-xl text-sm text-gray">
            Cartera, originación, cobranza y proyección a 6 meses — números vivos
            de la demo (mismo folio, sin Excel paralelo).
          </p>
        </div>
        <AntesAhoraBadge
          className="max-w-sm shrink-0"
          antes="reportes en hojas sueltas"
          ahora="un tablero al día"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Kpi
          label="Cartera (saldo)"
          value={formatMXN(m.carteraSaldo)}
          hint="Saldo vigente en expedientes"
          accent
        />
        <Kpi
          label="Cobranza mensual est."
          value={formatMXN(m.carteraMensualidad)}
          hint="Suma de mensualidades activas"
        />
        <Kpi
          label="Originado acumulado"
          value={formatMXN(m.montoOriginado)}
          hint="Monto total de créditos"
        />
        <Kpi
          label="Tasa de mora"
          value={`${m.tasaMoraPct}%`}
          hint={`${m.enMora} en mora · ${m.activos} activos`}
        />
        <Kpi
          label="Expedientes"
          value={String(m.totalExpedientes)}
          hint={`${m.enOriginacion} en originación`}
        />
        <Kpi
          label="Conversión lead→cierre"
          value={`${m.conversionLeadActivoPct}%`}
          hint="Activos + liquidados / total"
        />
        <Kpi
          label="Pagos en demo"
          value={formatMXN(m.pagosMes)}
          hint={`${m.pagosConciliados} conciliados · ${m.pagosPendientesCruce} pendientes`}
        />
        <Kpi
          label="Docs pendientes"
          value={String(m.docsPendientes + m.docsPorActualizar)}
          hint={`${m.docsPorActualizar} por actualizar`}
        />
      </div>

      <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
        <p className="text-sm font-semibold text-navy">Alertas operativas</p>
        <ul className="mt-2 space-y-1.5">
          {m.alertas.map((a) => (
            <li
              key={a}
              className="flex gap-2 text-sm text-gray before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-teal before:content-['']"
            >
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
          <p className="mb-1 text-sm font-semibold text-navy">
            Embudo de originación
          </p>
          <p className="mb-3 text-xs text-gray">
            Expedientes por etapa del ciclo (kanban).
          </p>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.pipeline} margin={{ left: -8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0E2" />
                <XAxis
                  dataKey="etapa"
                  tick={{ fill: '#6F3D47', fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#6F3D47', fontSize: 11 }}
                  width={28}
                />
                <Tooltip />
                <Bar dataKey="count" name="Expedientes" fill="#CA3C60" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
          <p className="mb-1 text-sm font-semibold text-navy">
            Saldo por etapa con crédito
          </p>
          <p className="mb-3 text-xs text-gray">
            Distribución de cartera (MXN).
          </p>
          <div className="h-56 sm:h-64">
            {m.carteraPorEstatus.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray">
                Sin cartera con saldo aún.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={m.carteraPorEstatus}
                    dataKey="saldo"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {m.carteraPorEstatus.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) =>
                      formatMXN(typeof v === 'number' ? v : Number(v) || 0)
                    }
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => (
                      <span className="text-gray">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
        <p className="mb-1 text-sm font-semibold text-navy">
          Cobranza vs esperado (6 meses)
        </p>
        <p className="mb-3 text-xs text-gray">
          Histórico ilustrativo + mes actual con pagos de la demo.
        </p>
        <div className="h-60 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m.cobranzaReciente}>
              <defs>
                <linearGradient id="cobFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CA3C60" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#CA3C60" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0E2" />
              <XAxis dataKey="mes" tick={{ fill: '#6F3D47', fontSize: 11 }} />
              <YAxis
                tick={{ fill: '#6F3D47', fontSize: 11 }}
                width={52}
                tickFormatter={(v) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(v) =>
                  formatMXN(typeof v === 'number' ? v : Number(v) || 0)
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="cobrado"
                name="Cobrado"
                stroke="#CA3C60"
                fill="url(#cobFill)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="esperado"
                name="Esperado"
                stroke="#802F42"
                strokeDasharray="5 4"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
        <p className="mb-1 text-sm font-semibold text-navy">
          Proyección 6 meses (socios)
        </p>
        <p className="mb-3 text-xs text-gray">
          Escenario base: +4% cartera/mes, cobranza ~97% de mensualidad
          proyectada, originación creciendo con el embudo actual. Ilustrativo —
          no es compromiso financiero.
        </p>
        <div className="h-60 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={m.proyeccion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0E2" />
              <XAxis dataKey="mes" tick={{ fill: '#6F3D47', fontSize: 11 }} />
              <YAxis
                tick={{ fill: '#6F3D47', fontSize: 11 }}
                width={52}
                tickFormatter={(v) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(v) =>
                  formatMXN(typeof v === 'number' ? v : Number(v) || 0)
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="cartera"
                name="Cartera (saldo)"
                stroke="#802F42"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cobranza"
                name="Cobranza est."
                stroke="#CA3C60"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="originacion"
                name="Originación est."
                stroke="#6F3D47"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            [
              'Cartera a 6 m',
              formatMXN(m.proyeccion[5]?.cartera ?? 0),
            ],
            [
              'Cobranza mes 6',
              formatMXN(m.proyeccion[5]?.cobranza ?? 0),
            ],
            [
              'Originación mes 6',
              formatMXN(m.proyeccion[5]?.originacion ?? 0),
            ],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-[10px] bg-light px-3 py-2 text-center"
            >
              <p className="text-[11px] text-gray">{k}</p>
              <p className="text-sm font-semibold text-navy">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-navy/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-gray">Leads</p>
          <p className="mt-1 text-2xl font-semibold text-navy">{m.leads}</p>
          <p className="mt-1 text-xs text-gray">Captación abierta</p>
        </div>
        <div className="rounded-[12px] border border-navy/10 bg-white p-4">
          <p className="text-xs font-bold uppercase text-gray">Créditos activos</p>
          <p className="mt-1 text-2xl font-semibold text-navy">{m.activos}</p>
          <p className="mt-1 text-xs text-gray">Generando mensualidad</p>
        </div>
        <div className="rounded-[12px] border border-navy/10 bg-white p-4">
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.pipeline.slice(0, 4)}>
                <Bar dataKey="count" fill="#802F42" radius={4} />
                <XAxis dataKey="etapa" hide />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray">Snapshot embudo</p>
        </div>
      </div>
    </section>
  )
}
