import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import AntesAhoraBadge from './AntesAhoraBadge'
import { buildEstadisticasAlumnos, type StatRow } from '../lib/estadisticasAlumnos'
import { useDemoStore } from '../store/demoStore'

const COLORS = ['#802F42', '#CA3C60', '#6F3D47', '#C81B48', '#A85A6E', '#D47890', '#9B4D5E']

function StatTable({ title, rows }: { title: string; rows: StatRow[] }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-navy/10 bg-white">
      <div className="border-b border-navy/5 px-3 py-2.5">
        <p className="text-sm font-semibold text-navy">{title}</p>
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-light text-xs uppercase text-gray">
            <tr>
              <th className="px-3 py-2 text-left">Categoría</th>
              <th className="px-3 py-2 text-right">N</th>
              <th className="px-3 py-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-gray">
                  Sin datos
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.label} className="border-t border-navy/5">
                  <td className="px-3 py-2 text-navy">{r.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-navy">
                    {r.count}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray">
                    {r.pct}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChartBar({
  title,
  hint,
  data,
}: {
  title: string
  hint: string
  data: StatRow[]
}) {
  const chartData = data.slice(0, 8).map((r) => ({
    name: r.label.length > 14 ? `${r.label.slice(0, 12)}…` : r.label,
    full: r.label,
    count: r.count,
  }))

  return (
    <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
      <p className="text-sm font-semibold text-navy">{title}</p>
      <p className="mb-3 text-xs text-gray">{hint}</p>
      <div className="h-52 sm:h-56">
        {chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-gray">
            Sin datos
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -8, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0E2" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6F3D47', fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={52}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#6F3D47', fontSize: 11 }}
                width={28}
              />
              <Tooltip
                formatter={(v) => [v ?? 0, 'Alumnos']}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as { full?: string } | undefined
                  return p?.full ?? ''
                }}
              />
              <Bar dataKey="count" fill="#CA3C60" radius={6} name="Alumnos" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default function EstadisticasAlumnosPanel() {
  const clientes = useDemoStore((s) => s.clientes)
  const stats = useMemo(() => buildEstadisticasAlumnos(clientes), [clientes])

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
            Consulta estadística
          </p>
          <h2 className="text-lg font-semibold text-navy sm:text-xl">
            Datos demográficos de estudiantes
          </h2>
          <p className="mt-1 max-w-xl text-sm text-gray">
            Desglose vivo del padrón: sexo, edad, universidad, carrera, entidad
            de nacimiento y estatus. Se actualiza al dar de alta o completar
            formularios.
          </p>
        </div>
        <AntesAhoraBadge
          className="max-w-sm shrink-0"
          antes="conteos en Excel"
          ahora="consulta en el expediente único"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {[
          ['Total alumnos', String(stats.total)],
          ['Con formulario', String(stats.conFormulario)],
          ['Formulario pendiente', String(stats.pendientesFormulario)],
          [
            'Edad promedio',
            stats.edadPromedio != null ? `${stats.edadPromedio} años` : '—',
          ],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray">
              {k}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-navy sm:text-2xl">
              {v}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-navy/10 bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-navy">Por sexo</p>
          <p className="mb-3 text-xs text-gray">
            Derivado del CURP al completar la solicitud.
          </p>
          <div className="h-52 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.porSexo}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {stats.porSexo.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      stroke="#fff"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ChartBar
          title="Por rango de edad"
          hint="Buckets a partir de la fecha de nacimiento en CURP."
          data={stats.porEdad}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBar
          title="Por universidad"
          hint="Top universidades del padrón."
          data={stats.porUniversidad}
        />
        <ChartBar
          title="Por carrera"
          hint="Top carreras declaradas en la solicitud."
          data={stats.porCarrera}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBar
          title="Por entidad de nacimiento"
          hint="Código de entidad en la CURP."
          data={stats.porEntidad}
        />
        <ChartBar
          title="Por estatus del expediente"
          hint="Distribución en el ciclo de crédito."
          data={stats.porEstatus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatTable title="Detalle · sexo" rows={stats.porSexo} />
        <StatTable title="Detalle · edad" rows={stats.porEdad} />
        <StatTable title="Detalle · universidad" rows={stats.porUniversidad} />
        <StatTable title="Detalle · carrera" rows={stats.porCarrera} />
        <StatTable title="Detalle · entidad" rows={stats.porEntidad} />
        <StatTable title="Detalle · origen de alta" rows={stats.porOrigenAlta} />
      </div>
    </section>
  )
}
