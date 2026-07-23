import { useMemo, useState } from 'react'
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
import {
  buildEstadisticasAlumnos,
  CONSULTA_FILTROS_VACIOS,
  filtrarAlumnos,
  opcionesDistinct,
  type ConsultaFiltros,
  type StatRow,
} from '../lib/estadisticasAlumnos'
import { useDemoStore } from '../store/demoStore'
import { ESTATUS_LABEL, type EstatusCliente } from '../types'

const COLORS = [
  '#802F42',
  '#CA3C60',
  '#6F3D47',
  '#C81B48',
  '#A85A6E',
  '#D47890',
  '#9B4D5E',
]

const PRESETS: { label: string; patch: Partial<ConsultaFiltros> }[] = [
  {
    label: 'Hombres 25 años',
    patch: { sexo: 'H', modoEdad: 'exacta', edadExacta: 25 },
  },
  {
    label: 'Mujeres 22–27',
    patch: { sexo: 'M', modoEdad: 'rango', edadMin: 22, edadMax: 27 },
  },
  {
    label: '18–24 cualquier sexo',
    patch: { sexo: 'todos', modoEdad: 'rango', edadMin: 18, edadMax: 24 },
  },
  {
    label: 'En mora',
    patch: { ...CONSULTA_FILTROS_VACIOS, enMora: 'si', soloFormularioCompleto: false },
  },
]

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

function ConsultaFetch({ clientes }: { clientes: ReturnType<typeof useDemoStore.getState>['clientes'] }) {
  const [filtros, setFiltros] = useState<ConsultaFiltros>({
    ...CONSULTA_FILTROS_VACIOS,
  })
  const selectCliente = useDemoStore((s) => s.selectCliente)
  const setEquipoTab = useDemoStore((s) => s.setEquipoTab)

  const unis = useMemo(
    () => opcionesDistinct(clientes, 'universidad'),
    [clientes],
  )
  const carreras = useMemo(
    () => opcionesDistinct(clientes, 'carrera'),
    [clientes],
  )
  const entidades = useMemo(
    () => opcionesDistinct(clientes, 'entidadNacimiento'),
    [clientes],
  )

  const resultado = useMemo(
    () => filtrarAlumnos(clientes, filtros),
    [clientes, filtros],
  )

  function patch(p: Partial<ConsultaFiltros>) {
    setFiltros((f) => ({ ...f, ...p }))
  }

  const inputCls =
    'mt-1 w-full rounded-[10px] border border-navy/15 bg-white px-3 py-2 text-sm text-navy'

  return (
    <div className="rounded-[12px] border-2 border-teal/30 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
            Consulta con filtros (fetch)
          </p>
          <h3 className="text-base font-semibold text-navy">
            ¿Cuántos cumplen…?
          </h3>
          <p className="mt-1 text-xs text-gray">
            Combina sexo, edad exacta o rango, universidad, carrera, etc. El
            conteo se actualiza al instante.
          </p>
        </div>
        <button
          type="button"
          className="rounded-[8px] border border-navy/15 px-3 py-1.5 text-xs font-medium"
          onClick={() => setFiltros({ ...CONSULTA_FILTROS_VACIOS })}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="rounded-full border border-navy/10 bg-light px-2.5 py-1 text-[11px] font-medium text-navy"
            onClick={() =>
              setFiltros({ ...CONSULTA_FILTROS_VACIOS, ...p.patch })
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs">
          <span className="font-medium text-gray">Sexo</span>
          <select
            value={filtros.sexo}
            onChange={(e) =>
              patch({ sexo: e.target.value as ConsultaFiltros['sexo'] })
            }
            className={inputCls}
          >
            <option value="todos">Todos</option>
            <option value="H">Hombre</option>
            <option value="M">Mujer</option>
            <option value="X">No binario / otro</option>
          </select>
        </label>

        <label className="block text-xs">
          <span className="font-medium text-gray">Modo edad</span>
          <select
            value={filtros.modoEdad}
            onChange={(e) =>
              patch({
                modoEdad: e.target.value as ConsultaFiltros['modoEdad'],
              })
            }
            className={inputCls}
          >
            <option value="cualquiera">Cualquiera</option>
            <option value="exacta">Edad exacta</option>
            <option value="rango">Rango de edad</option>
          </select>
        </label>

        {filtros.modoEdad === 'exacta' ? (
          <label className="block text-xs">
            <span className="font-medium text-gray">Edad (años)</span>
            <input
              type="number"
              min={14}
              max={80}
              value={filtros.edadExacta}
              onChange={(e) =>
                patch({
                  edadExacta:
                    e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              placeholder="Ej. 25"
              className={inputCls}
            />
          </label>
        ) : null}

        {filtros.modoEdad === 'rango' ? (
          <>
            <label className="block text-xs">
              <span className="font-medium text-gray">Edad mínima</span>
              <input
                type="number"
                min={14}
                max={80}
                value={filtros.edadMin}
                onChange={(e) =>
                  patch({
                    edadMin:
                      e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="Ej. 22"
                className={inputCls}
              />
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray">Edad máxima</span>
              <input
                type="number"
                min={14}
                max={80}
                value={filtros.edadMax}
                onChange={(e) =>
                  patch({
                    edadMax:
                      e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="Ej. 27"
                className={inputCls}
              />
            </label>
          </>
        ) : null}

        <label className="block text-xs">
          <span className="font-medium text-gray">Universidad</span>
          <select
            value={filtros.universidad}
            onChange={(e) => patch({ universidad: e.target.value })}
            className={inputCls}
          >
            <option value="">Todas</option>
            {unis.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs">
          <span className="font-medium text-gray">Carrera</span>
          <select
            value={filtros.carrera}
            onChange={(e) => patch({ carrera: e.target.value })}
            className={inputCls}
          >
            <option value="">Todas</option>
            {carreras.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs">
          <span className="font-medium text-gray">Entidad nacimiento</span>
          <select
            value={filtros.entidad}
            onChange={(e) => patch({ entidad: e.target.value })}
            className={inputCls}
          >
            <option value="">Todas</option>
            {entidades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs">
          <span className="font-medium text-gray">Estatus</span>
          <select
            value={filtros.estatus}
            onChange={(e) =>
              patch({
                estatus: e.target.value as ConsultaFiltros['estatus'],
              })
            }
            className={inputCls}
          >
            <option value="todos">Todos</option>
            {(Object.keys(ESTATUS_LABEL) as EstatusCliente[]).map((k) => (
              <option key={k} value={k}>
                {ESTATUS_LABEL[k]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs">
          <span className="font-medium text-gray">Origen de alta</span>
          <select
            value={filtros.origenAlta}
            onChange={(e) =>
              patch({
                origenAlta: e.target.value as ConsultaFiltros['origenAlta'],
              })
            }
            className={inputCls}
          >
            <option value="todos">Todos</option>
            <option value="alumno">Cuenta del alumno</option>
            <option value="equipo">Invitación equipo</option>
          </select>
        </label>

        <label className="block text-xs">
          <span className="font-medium text-gray">Mora</span>
          <select
            value={filtros.enMora}
            onChange={(e) =>
              patch({ enMora: e.target.value as ConsultaFiltros['enMora'] })
            }
            className={inputCls}
          >
            <option value="todos">Todos</option>
            <option value="si">En mora</option>
            <option value="no">Al corriente</option>
          </select>
        </label>

        <label className="flex items-end gap-2 pb-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={filtros.soloFormularioCompleto}
            onChange={(e) =>
              patch({ soloFormularioCompleto: e.target.checked })
            }
            className="accent-teal"
          />
          Solo con formulario completo
        </label>
      </div>

      <div className="mt-4 rounded-[12px] border border-teal/25 bg-mint/50 p-4">
        <p className="text-xs text-gray">{resultado.resumen}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-navy">
          {resultado.coincidencias}
          <span className="ml-2 text-base font-medium text-gray">
            de {resultado.totalUniverso} ({resultado.pct}%)
          </span>
        </p>
      </div>

      {resultado.alumnos.length > 0 ? (
        <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
          {resultado.alumnos.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-[10px] border border-navy/10 bg-light px-3 py-2 text-left text-sm hover:border-teal/40"
                onClick={() => {
                  selectCliente(c.id)
                  setEquipoTab('alumnos')
                }}
              >
                <span>
                  <span className="font-medium text-navy">{c.nombre}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-teal">
                    {c.folio}
                  </span>
                </span>
                <span className="text-xs text-gray">
                  {c.formularioCompleto
                    ? `${c.sexo === 'H' ? 'H' : c.sexo === 'M' ? 'M' : 'X'} · ${c.edad} años · ${c.universidad || '—'}`
                    : 'Formulario pendiente'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-center text-sm text-gray">
          Ningún alumno coincide con esos filtros.
        </p>
      )}
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
            Desglose del padrón y consulta filtrada (sexo, edad exacta o rango,
            universidad, carrera…).
          </p>
        </div>
        <AntesAhoraBadge
          className="max-w-sm shrink-0"
          antes="conteos en Excel"
          ahora="consulta filtrada en vivo"
        />
      </div>

      <ConsultaFetch clientes={clientes} />

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
