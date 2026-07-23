import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import AntesAhoraBadge from '../components/AntesAhoraBadge'
import CodigoBarrasVisual from '../components/CodigoBarrasVisual'
import DemoShell from '../components/DemoShell'
import ExpedienteDocumentos from '../components/ExpedienteDocumentos'
import FormularioSolicitudAlumno from '../components/FormularioSolicitudAlumno'
import FotoAlumno from '../components/FotoAlumno'
import {
  formatMXN,
  mensualidadFrancesa,
  tablaAmortizacion,
} from '../lib/amortizacion'
import {
  archivoDesdeTexto,
  descargarArchivoMemoria,
  leerArchivoComoMemoria,
} from '../lib/archivoMemoria'
import {
  buildLineaCaptura,
  textoLineaCaptura,
} from '../lib/codigoBarras'
import { writeDemoUrl } from '../lib/demoUrl'
import { useDemoStore } from '../store/demoStore'
import { ALUMNO_TIMELINE, ESTATUS_LABEL, type EstatusCliente } from '../types'

type Tab = 'expediente' | 'documentos' | 'credito' | 'simulador' | 'avisos'
type SimMode = 'abono' | 'plazo' | 'cancelacion'

const RECOMPENSA_UMBRAL = 3

const ESCENARIOS: {
  id: string
  label: string
  blurb: string
  tab?: Tab
}[] = [
  {
    id: 'c1',
    label: 'Ana · crédito activo',
    blurb: 'Simulador + recompensa 2%',
    tab: 'simulador',
  },
  {
    id: 'c2',
    label: 'Diego · documentos',
    blurb: 'Subir / comentarios del equipo',
    tab: 'documentos',
  },
  {
    id: 'c6',
    label: 'Luis · en mora',
    blurb: 'Avisos y estado de cartera',
    tab: 'credito',
  },
]

function timelineIndex(estatus: EstatusCliente): number {
  const order: EstatusCliente[] = [
    'lead',
    'en_revision',
    'buro',
    'aprobado',
    'contrato_pendiente',
    'activo',
    'liquidado',
  ]
  return Math.max(0, order.indexOf(estatus))
}

function nextStepHint(
  estatus: EstatusCliente,
  formularioCompleto: boolean,
): { text: string; tab: Tab } {
  if (!formularioCompleto) {
    return {
      text: 'Completa tu formulario de solicitud (CURP y datos académicos).',
      tab: 'expediente',
    }
  }
  switch (estatus) {
    case 'lead':
      return { text: 'Sube tu INE y comprobante para iniciar revisión.', tab: 'documentos' }
    case 'en_revision':
      return { text: 'Completa los documentos pendientes del expediente.', tab: 'documentos' }
    case 'buro':
      return { text: 'Tu consulta de Buró está en curso. Revisa avisos.', tab: 'avisos' }
    case 'aprobado':
      return { text: 'Propuesta lista. Pronto verás el contrato.', tab: 'credito' }
    case 'contrato_pendiente':
      return { text: 'Falta firmar contrato / pagaré. Revisa documentos.', tab: 'documentos' }
    case 'activo':
      return { text: 'Simula un abono o cambio de plazo sin Excel.', tab: 'simulador' }
    case 'liquidado':
      return { text: 'Crédito liquidado. Conserva tu folio y documentos.', tab: 'documentos' }
    default:
      return { text: 'Revisa tu expediente.', tab: 'expediente' }
  }
}

export default function AlumnoPage({
  initialTab,
  onInitialTabConsumed,
}: {
  initialTab?: string | null
  onInitialTabConsumed?: () => void
} = {}) {
  const bootTab = (['expediente', 'documentos', 'credito', 'simulador', 'avisos'] as const).includes(
    initialTab as Tab,
  )
    ? (initialTab as Tab)
    : 'expediente'

  const [tab, setTab] = useState<Tab>(bootTab)
  const [simMode, setSimMode] = useState<SimMode>('abono')
  const [pagoModal, setPagoModal] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const pendingTabRef = useRef<Tab | null>(null)
  const seenClienteRef = useRef<string | null>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)
  const clienteId = useDemoStore((s) => s.clienteAlumnoId)
  const clientes = useDemoStore((s) => s.clientes)
  const setClienteAlumno = useDemoStore((s) => s.setClienteAlumno)
  const allNotificaciones = useDemoStore((s) => s.notificaciones)
  const aplicarSimulacion = useDemoStore((s) => s.aplicarSimulacion)
  const marcarNotificacionesLeidas = useDemoStore((s) => s.marcarNotificacionesLeidas)
  const subirFotoAlumno = useDemoStore((s) => s.subirFotoAlumno)
  const pagarEnLineaMock = useDemoStore((s) => s.pagarEnLineaMock)

  const cliente = clientes.find((c) => c.id === clienteId) ?? clientes[0]
  const notificaciones = useMemo(
    () => allNotificaciones.filter((n) => n.clienteId === cliente.id),
    [allNotificaciones, cliente.id],
  )

  const [abono, setAbono] = useState(5000)
  const [plazoSim, setPlazoSim] = useState(cliente.credito?.plazo ?? 36)

  useEffect(() => {
    if (initialTab && bootTab === initialTab) onInitialTabConsumed?.()
  }, [initialTab, bootTab, onInitialTabConsumed])

  useEffect(() => {
    setPlazoSim(cliente.credito?.plazo ?? 36)
    setAbono(cliente.credito ? 5000 : 0)
    setSimMode('abono')

    const first = seenClienteRef.current === null
    const changed = seenClienteRef.current !== null && seenClienteRef.current !== cliente.id
    seenClienteRef.current = cliente.id

    if (pendingTabRef.current) {
      setTab(pendingTabRef.current)
      pendingTabRef.current = null
    } else if (changed) {
      setTab('expediente')
    } else if (first) {
      // conserva bootTab / deep-link
    }
  }, [cliente.id])

  useEffect(() => {
    setPlazoSim(cliente.credito?.plazo ?? 36)
  }, [cliente.credito?.plazo, cliente.credito?.saldoActual])

  useEffect(() => {
    writeDemoUrl({ tab })
  }, [tab])

  useEffect(() => {
    if (simMode === 'abono') {
      setAbono(5000)
      setPlazoSim(cliente.credito?.plazo ?? 36)
    } else if (simMode === 'plazo') {
      setAbono(0)
      setPlazoSim(Math.max(12, (cliente.credito?.plazo ?? 36) - 12))
    } else {
      setAbono(Math.round((cliente.credito?.saldoActual ?? 0) * 0.35))
      setPlazoSim(12)
    }
  }, [simMode, cliente.id, cliente.credito?.plazo, cliente.credito?.saldoActual])

  const docsPendientes = cliente.documentos.filter((d) => d.estado === 'pendiente').length
  const docsPorActualizar = cliente.documentos.filter(
    (d) => d.estado === 'requiere_actualizacion',
  ).length
  const docsValidados = cliente.documentos.filter((d) => d.estado === 'validado').length
  const avisosSinLeer = notificaciones.filter((n) => !n.leida).length
  const idx = timelineIndex(cliente.estatus)
  const progreso = Math.round(((idx + 1) / ALUMNO_TIMELINE.length) * 100)
  const hint = nextStepHint(cliente.estatus, cliente.formularioCompleto)

  const previewMensualidad = useMemo(() => {
    if (!cliente.credito) return null
    const saldo = Math.max(0, cliente.credito.saldoActual - abono)
    return Math.round(mensualidadFrancesa(saldo, plazoSim, cliente.credito.tasaAnual))
  }, [cliente.credito, abono, plazoSim])

  const deltaMensual = useMemo(() => {
    if (!cliente.credito || previewMensualidad == null) return 0
    return previewMensualidad - cliente.credito.mensualidad
  }, [cliente.credito, previewMensualidad])

  const tabla = useMemo(() => {
    if (!cliente.credito) return []
    return tablaAmortizacion(
      cliente.credito.saldoActual,
      plazoSim,
      cliente.credito.tasaAnual,
      abono,
    )
  }, [cliente.credito, plazoSim, abono])

  const pagosChart = useMemo(
    () =>
      [...cliente.pagos]
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map((p) => ({
          fecha: p.fecha.slice(5),
          monto: p.monto,
          aTiempo: p.aTiempo ? 1 : 0,
        })),
    [cliente.pagos],
  )

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'expediente', label: 'Mi expediente' },
    {
      id: 'documentos',
      label: 'Mis documentos',
      badge: docsPendientes + docsPorActualizar || undefined,
    },
    { id: 'credito', label: 'Mi crédito' },
    { id: 'simulador', label: 'Simulador' },
    {
      id: 'avisos',
      label: 'Avisos',
      badge: avisosSinLeer || undefined,
    },
  ]

  function pickEscenario(id: string, nextTab?: Tab) {
    if (id === cliente.id && nextTab) {
      setTab(nextTab)
      return
    }
    pendingTabRef.current = nextTab ?? 'expediente'
    setClienteAlumno(id)
  }

  return (
    <DemoShell folio={cliente.folio} title="Vista alumno">
      <div className="mb-4 rounded-[14px] border-2 border-teal/30 bg-white p-3 sm:mb-5 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <FotoAlumno
              foto={cliente.foto}
              nombre={cliente.nombre}
              size="md"
              className="mt-0.5 hidden sm:block"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                Folio único · del lead a la liquidación
              </p>
              <p className="mt-1 break-all font-mono text-xl font-bold tracking-tight text-navy sm:text-3xl">
                {cliente.folio}
              </p>
              <p className="mt-1 text-sm text-gray">
                {cliente.formularioCompleto
                  ? `Hola, ${cliente.nombre.split(' ')[0]} · ${cliente.universidad} · ${cliente.carrera}`
                  : `Cuenta ${cliente.email} · completa tu solicitud para continuar`}
              </p>
            </div>
          </div>
          <AntesAhoraBadge
            className="max-w-md"
            antes="folios por etapa / área"
            ahora="un solo folio siempre"
          />
        </div>
        {cliente.enMora ? (
          <div className="mt-3 rounded-[10px] border border-lime/40 bg-mint px-3 py-2 text-sm text-navy">
            Tu crédito aparece <strong>en mora</strong>. Revisa avisos y contacta a tu
            asesor ({cliente.asesor}).
          </div>
        ) : null}
      </div>

      {!cliente.formularioCompleto ? (
        <div className="mb-5">
          <FormularioSolicitudAlumno
            clienteId={cliente.id}
            email={cliente.email}
            origenAlta={cliente.origenAlta}
          />
        </div>
      ) : null}

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray">
          Escenarios demo (presentador)
        </p>
        <div className="scroll-x-touch -mx-1 flex gap-2 px-1 pb-1 sm:flex-wrap">
          {ESCENARIOS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => pickEscenario(e.id, e.tab)}
              className={`min-w-[11.5rem] shrink-0 rounded-[10px] border px-3 py-2.5 text-left transition sm:min-w-0 ${
                cliente.id === e.id
                  ? 'border-teal bg-mint'
                  : 'border-navy/10 bg-white hover:border-teal/40'
              }`}
            >
              <span className="block text-sm font-semibold text-navy">{e.label}</span>
              <span className="block text-xs text-gray">{e.blurb}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {docsPorActualizar > 0 ? (
          <button
            type="button"
            onClick={() => setTab('documentos')}
            className="rounded-[12px] border border-lime/40 bg-mint px-3 py-3 text-left"
          >
            <p className="text-xs font-bold uppercase text-lime">Acción requerida</p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {docsPorActualizar} documento
              {docsPorActualizar === 1 ? '' : 's'} por actualizar
            </p>
            <p className="mt-0.5 text-xs text-gray">El equipo dejó comentarios →</p>
          </button>
        ) : null}
        {docsPendientes > 0 ? (
          <button
            type="button"
            onClick={() => setTab('documentos')}
            className="rounded-[12px] border border-navy/10 bg-white px-3 py-3 text-left"
          >
            <p className="text-xs font-bold uppercase text-gray">Pendiente</p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {docsPendientes} archivo{docsPendientes === 1 ? '' : 's'} por subir
            </p>
          </button>
        ) : null}
        {avisosSinLeer > 0 ? (
          <button
            type="button"
            onClick={() => setTab('avisos')}
            className="rounded-[12px] border border-teal/30 bg-white px-3 py-3 text-left"
          >
            <p className="text-xs font-bold uppercase text-teal">Avisos</p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {avisosSinLeer} sin leer
            </p>
          </button>
        ) : null}
        {cliente.credito ? (
          <button
            type="button"
            onClick={() => setTab('credito')}
            className="rounded-[12px] border border-navy/10 bg-white px-3 py-3 text-left"
          >
            <p className="text-xs font-bold uppercase text-gray">Próxima mensualidad</p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {formatMXN(cliente.credito.mensualidad)}
            </p>
            <p className="mt-0.5 text-xs text-gray">
              Saldo {formatMXN(cliente.credito.saldoActual)}
            </p>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setTab('documentos')}
            className="rounded-[12px] border border-navy/10 bg-white px-3 py-3 text-left"
          >
            <p className="text-xs font-bold uppercase text-gray">Crédito</p>
            <p className="mt-1 text-sm font-semibold text-navy">Aún en trámite</p>
            <p className="mt-0.5 text-xs text-gray">Completa documentos para avanzar</p>
          </button>
        )}
        {cliente.credito && !cliente.enMora ? (
          <button
            type="button"
            onClick={() => setTab('credito')}
            className="rounded-[12px] border border-navy/10 bg-white px-3 py-3 text-left"
          >
            <p className="text-xs font-bold uppercase text-gray">Recompensa puntualidad</p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {cliente.credito.recompensaAplicada
                ? '−2% aplicado'
                : `${cliente.pagosPuntualesConsecutivos}/${RECOMPENSA_UMBRAL} pagos`}
            </p>
            <p className="mt-0.5 text-xs text-gray">
              {cliente.credito.recompensaAplicada
                ? 'Descuento activo en mensualidad'
                : 'Al llegar al umbral, baja la mensualidad'}
            </p>
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="w-full space-y-1 sm:w-auto">
          <label className="block text-xs font-medium uppercase tracking-wide text-gray">
            Ver como alumno
          </label>
          <select
            value={cliente.id}
            onChange={(e) => {
              pendingTabRef.current = 'expediente'
              setClienteAlumno(e.target.value)
            }}
            className="w-full rounded-[10px] border border-navy/15 bg-white px-3 py-2.5 text-sm font-medium text-navy sm:min-w-[16rem]"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} · {c.folio} · {ESTATUS_LABEL[c.estatus]}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray">
          Asesor: <strong className="text-navy">{cliente.asesor}</strong>
        </p>
      </div>

      <div className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-20 -mx-3 mb-4 border-b border-navy/10 bg-light/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 md:static md:z-0 md:mx-0 md:mb-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="scroll-x-touch flex gap-2 pb-0.5 md:flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap md:rounded-[8px] md:py-1.5 md:font-medium ${
                tab === t.id
                  ? 'bg-navy text-white'
                  : 'border border-navy/10 bg-white text-navy'
              }`}
            >
              {t.label}
              {t.badge ? (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal px-1 text-[10px] font-bold text-white">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-20 md:pb-0">
      {tab === 'expediente' ? (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[12px] border border-navy/10 bg-white p-5">
            <h2 className="font-semibold text-navy">¿Dónde voy en mi crédito?</h2>
            <p className="mt-1 text-sm text-gray">
              Etapa actual:{' '}
              <strong className="text-teal">{ALUMNO_TIMELINE[idx]?.label}</strong>
              <span className="text-gray"> · {progreso}% del recorrido</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10">
              <div
                className="h-full rounded-full bg-teal transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <ol className="relative mt-6">
              {ALUMNO_TIMELINE.map((step, i) => {
                const done = i < idx
                const current = i === idx
                const last = i === ALUMNO_TIMELINE.length - 1
                return (
                  <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last ? (
                      <span
                        className={`absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-0.5 ${
                          done || current ? 'bg-teal/50' : 'bg-navy/10'
                        }`}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                        current
                          ? 'bg-teal text-white'
                          : done
                            ? 'bg-green text-white'
                            : 'bg-light text-gray'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <div className="-mt-0.5">
                      <p
                        className={`font-medium ${
                          current ? 'text-teal' : done ? 'text-navy' : 'text-gray'
                        }`}
                      >
                        {step.label}
                        {current ? ' · ahora' : ''}
                      </p>
                      {current ? (
                        <button
                          type="button"
                          className="mt-1 text-xs font-semibold text-teal underline"
                          onClick={() => setTab(hint.tab)}
                        >
                          {hint.text} →
                        </button>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="space-y-3">
            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <p className="text-xs font-bold uppercase text-gray">Mi perfil</p>

              <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <FotoAlumno
                  foto={cliente.foto}
                  nombre={cliente.nombre}
                  size="lg"
                />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold text-navy">
                    Foto de identificación
                  </p>
                  <p className="mt-1 text-xs text-gray">
                    El equipo te identifica visualmente con esta foto. JPG o PNG,
                    máx. 2 MB (demo).
                  </p>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (!file) return
                      setSubiendoFoto(true)
                      try {
                        const archivo = await leerArchivoComoMemoria(
                          file,
                          (cliente.foto?.version ?? 0) + 1,
                        )
                        subirFotoAlumno(cliente.id, archivo)
                      } catch (err) {
                        useDemoStore
                          .getState()
                          .showToast(
                            err instanceof Error
                              ? err.message
                              : 'No se pudo subir la foto',
                          )
                      } finally {
                        setSubiendoFoto(false)
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={subiendoFoto}
                    className="mt-2 rounded-[8px] bg-teal px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    onClick={() => fotoInputRef.current?.click()}
                  >
                    {subiendoFoto
                      ? 'Subiendo…'
                      : cliente.foto
                        ? 'Cambiar foto'
                        : 'Subir foto'}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-[10px] border border-navy/10 bg-light p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray">
                  Código de barras (único)
                </p>
                <CodigoBarrasVisual
                  codigo={cliente.codigoBarras}
                  className="mt-2"
                />
                <p className="mt-1 text-center text-[11px] text-gray">
                  Folio {cliente.folio} · úsalo en ventanilla o línea de captura
                </p>
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Nombre (CURP)</dt>
                  <dd className="text-right font-medium text-navy">
                    {cliente.nombre}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">CURP</dt>
                  <dd className="font-mono text-xs text-navy">{cliente.curp}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Edad / nacimiento</dt>
                  <dd className="text-right font-medium text-navy">
                    {cliente.edad} años · {cliente.fechaNacimiento}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Sexo / entidad</dt>
                  <dd className="text-right font-medium text-navy">
                    {cliente.sexo === 'H'
                      ? 'Hombre'
                      : cliente.sexo === 'M'
                        ? 'Mujer'
                        : '—'}{' '}
                    · {cliente.entidadNacimiento}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Universidad</dt>
                  <dd className="text-right font-medium text-navy">
                    {cliente.universidad || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Carrera</dt>
                  <dd className="text-right font-medium text-navy">
                    {cliente.carrera || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Asesor</dt>
                  <dd className="text-right font-medium text-navy">{cliente.asesor}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Email</dt>
                  <dd className="text-right text-sm text-navy">
                    {cliente.email || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray">Teléfono</dt>
                  <dd className="text-right font-medium text-navy">
                    {cliente.telefono || '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <p className="text-xs font-bold uppercase text-gray">Documentos</p>
              <p className="mt-2 text-sm text-navy">
                <strong>{docsValidados}</strong> validados ·{' '}
                <strong>{docsPendientes}</strong> pendientes
                {docsPorActualizar > 0 ? (
                  <>
                    {' '}
                    · <strong className="text-lime">{docsPorActualizar}</strong> por
                    actualizar
                  </>
                ) : null}
              </p>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-teal underline"
                onClick={() => setTab('documentos')}
              >
                Ir a mis documentos →
              </button>
            </div>

            <div className="rounded-[12px] border border-teal/30 bg-mint p-4">
              <p className="text-xs font-bold uppercase text-teal">Próximo paso</p>
              <p className="mt-1 text-sm font-medium text-navy">{hint.text}</p>
              <button
                type="button"
                className="mt-3 rounded-[8px] bg-teal px-3 py-2 text-xs font-semibold text-white"
                onClick={() => setTab(hint.tab)}
              >
                Continuar
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'documentos' ? (
        <section className="space-y-4">
          <AntesAhoraBadge
            antes="subir y no poder bajar / WhatsApp"
            ahora="subir a memoria, descargar y reemplazar en el folio"
          />
          <p className="text-sm text-gray">
            Tip: escenario <strong>Diego</strong> → sube → cambia a equipo → pide
            actualización → vuelve aquí.
          </p>
          <ExpedienteDocumentos
            modo="alumno"
            clienteId={cliente.id}
            folio={cliente.folio}
            documentos={cliente.documentos}
          />
        </section>
      ) : null}

      {tab === 'credito' ? (
        <section className="space-y-4">
          {!cliente.credito ? (
            <EmptyState text="Sin crédito activo. Prueba Ana Sofía o Luis (mora)." />
          ) : (
            <>
              <AntesAhoraBadge
                antes="tabla en Excel aparte"
                ahora="amortización + pagos en el expediente"
              />

              {cliente.enMora ? (
                <div className="rounded-[12px] border border-lime/40 bg-mint p-4 text-sm text-navy">
                  <strong>Alerta de mora.</strong> Hay pagos fuera de tiempo. Tu asesor
                  puede ofrecerte una reestructura desde la vista equipo.
                </div>
              ) : null}

              <div className="rounded-[12px] border-2 border-teal/30 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                  Pagar mensualidad
                </p>
                <h3 className="mt-1 text-base font-semibold text-navy">
                  Línea de captura o pago en línea
                </h3>
                <p className="mt-1 text-xs text-gray">
                  Descarga la referencia bancaria (mock) o simula un cobro OpenPay.
                  Tu código de barras único va en la línea de captura.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-[8px] border border-navy/15 bg-light px-3 py-2.5 text-xs font-semibold text-navy"
                    onClick={() => {
                      const linea = buildLineaCaptura({
                        folio: cliente.folio,
                        codigoBarras: cliente.codigoBarras,
                        nombre: cliente.nombre,
                        monto: cliente.credito!.mensualidad,
                      })
                      const archivo = archivoDesdeTexto(
                        textoLineaCaptura(linea),
                        `linea_captura_${cliente.folio}.txt`,
                        'text/plain',
                        1,
                      )
                      descargarArchivoMemoria(archivo, cliente.folio)
                      useDemoStore
                        .getState()
                        .showToast(
                          `Línea de captura · ref. ${linea.referencia}`,
                        )
                    }}
                  >
                    Descargar línea de captura
                  </button>
                  <button
                    type="button"
                    className="rounded-[8px] bg-teal px-3 py-2.5 text-xs font-semibold text-white"
                    onClick={() => setPagoModal(true)}
                  >
                    Pagar en línea (demo)
                  </button>
                </div>
                <div className="mt-3 rounded-[10px] border border-navy/10 bg-light p-3">
                  <CodigoBarrasVisual codigo={cliente.codigoBarras} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Saldo actual', formatMXN(cliente.credito.saldoActual)],
                  ['Mensualidad', formatMXN(cliente.credito.mensualidad)],
                  ['Plazo', `${cliente.credito.plazo} meses`],
                  ['Tasa anual', `${cliente.credito.tasaAnual}%`],
                  ['Monto original', formatMXN(cliente.credito.montoTotal)],
                  ['Inicio', cliente.credito.fechaInicio],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-[12px] border border-navy/10 bg-white p-4"
                  >
                    <p className="text-xs text-gray">{k}</p>
                    <p className="mt-1 text-lg font-semibold text-navy">{v}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[12px] border border-navy/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      Recompensa por puntualidad
                    </p>
                    <p className="text-xs text-gray">
                      {RECOMPENSA_UMBRAL} pagos a tiempo consecutivos → −2% en
                      mensualidad
                    </p>
                  </div>
                  {cliente.credito.recompensaAplicada ? (
                    <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-green">
                      −2% aplicado
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-navy">
                      {cliente.pagosPuntualesConsecutivos}/{RECOMPENSA_UMBRAL}
                    </span>
                  )}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{
                      width: `${Math.min(
                        100,
                        (cliente.pagosPuntualesConsecutivos / RECOMPENSA_UMBRAL) * 100,
                      )}%`,
                    }}
                  />
                </div>
                {cliente.pagosPuntualesConsecutivos >= RECOMPENSA_UMBRAL &&
                !cliente.credito.recompensaAplicada ? (
                  <p className="mt-2 text-xs text-teal">
                    Ya alcanzaste el umbral — en vista equipo (Cobranza) se aplica el
                    descuento.
                  </p>
                ) : null}
              </div>

              {pagosChart.length > 0 ? (
                <div className="rounded-[12px] border border-navy/10 bg-white p-4">
                  <p className="mb-2 text-sm font-semibold text-navy">
                    Historial de pagos
                  </p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pagosChart}>
                        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} width={48} />
                        <Tooltip
                          formatter={(v) => formatMXN(Number(v))}
                          labelFormatter={(l) => `Fecha …${l}`}
                        />
                        <Bar dataKey="monto" fill="#CA3C60" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-3 divide-y divide-navy/5">
                    {[...cliente.pagos]
                      .sort((a, b) => b.fecha.localeCompare(a.fecha))
                      .map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                        >
                          <span className="text-navy">
                            {p.fecha} · {p.metodo}
                          </span>
                          <span className="font-medium text-navy">
                            {formatMXN(p.monto)}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              p.aTiempo
                                ? 'bg-mint text-green'
                                : 'bg-lime/10 text-lime'
                            }`}
                          >
                            {p.aTiempo ? 'A tiempo' : 'Tarde'}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <EmptyState text="Aún no hay pagos registrados en este folio." />
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-[8px] bg-teal px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => setTab('simulador')}
                >
                  Abrir simulador →
                </button>
              </div>

              <AmortTable
                rows={tablaAmortizacion(
                  cliente.credito.saldoActual,
                  cliente.credito.plazo,
                  cliente.credito.tasaAnual,
                )}
              />
            </>
          )}
        </section>
      ) : null}

      {tab === 'simulador' ? (
        <section className="space-y-4">
          <AntesAhoraBadge antes="Excel aparte" ahora="en tiempo real" />
          {!cliente.credito ? (
            <EmptyState text="Elige un alumno con crédito (Ana o Luis)." />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['abono', 'Simular abono a capital'],
                    ['plazo', 'Simular cambio de plazo'],
                    ['cancelacion', 'Simular cancelación'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSimMode(id)}
                    className={`rounded-[8px] px-3 py-2 text-sm font-semibold ${
                      simMode === id
                        ? 'bg-teal text-white'
                        : 'border border-navy/15 bg-white text-navy'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Mensualidad actual"
                  value={formatMXN(cliente.credito.mensualidad)}
                />
                <Metric
                  label="Mensualidad simulada"
                  value={formatMXN(previewMensualidad ?? 0)}
                  highlight
                  hint={
                    deltaMensual === 0
                      ? 'Sin cambio'
                      : deltaMensual < 0
                        ? `↓ ${formatMXN(Math.abs(deltaMensual))} menos`
                        : `↑ ${formatMXN(deltaMensual)} más`
                  }
                />
                <Metric
                  label="Saldo tras abono"
                  value={formatMXN(
                    Math.max(0, cliente.credito.saldoActual - abono),
                  )}
                  hint={`${cliente.credito.plazo} → ${plazoSim} meses`}
                />
              </div>

              <div className="space-y-4 rounded-[12px] border border-navy/10 bg-white p-5">
                <label className="block text-sm">
                  <span className="font-medium text-navy">
                    Abono a capital: {formatMXN(abono)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(10000, Math.round(cliente.credito.saldoActual * 0.5))}
                    step={1000}
                    value={abono}
                    onChange={(e) => setAbono(Number(e.target.value))}
                    className="mt-2 w-full accent-teal"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-navy">
                    Plazo simulado: {plazoSim} meses
                  </span>
                  <input
                    type="range"
                    min={12}
                    max={60}
                    step={6}
                    value={plazoSim}
                    onChange={(e) => setPlazoSim(Number(e.target.value))}
                    className="mt-2 w-full accent-teal"
                  />
                </label>
                <button
                  type="button"
                  className="rounded-[8px] bg-teal px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() =>
                    aplicarSimulacion(cliente.id, {
                      abonoCapital: abono,
                      plazo: plazoSim,
                    })
                  }
                >
                  Aplicar al expediente
                </button>
              </div>
              <AmortTable rows={tabla} />
            </>
          )}
        </section>
      ) : null}

      {tab === 'avisos' ? (
        <section className="space-y-4">
          <AntesAhoraBadge
            antes="WhatsApp / llamadas manuales"
            ahora="avisos del sistema + mensajes del equipo"
          />
          {notificaciones.length === 0 ? (
            <EmptyState text="Sin avisos para este alumno." />
          ) : (
            <>
              <button
                type="button"
                className="text-sm text-teal underline"
                onClick={() => marcarNotificacionesLeidas(cliente.id)}
              >
                Marcar todas como leídas
              </button>
              <ul className="space-y-2">
                {notificaciones.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-[12px] border bg-white p-4 ${
                      n.leida
                        ? 'border-navy/10 opacity-70'
                        : n.tipo === 'mensaje_equipo'
                          ? 'border-teal/50 bg-mint/30'
                          : 'border-teal/30'
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap gap-1.5">
                      {!n.leida ? (
                        <span className="inline-block rounded bg-teal/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal">
                          Nuevo
                        </span>
                      ) : null}
                      {n.tipo === 'mensaje_equipo' ? (
                        <span className="inline-block rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          Mensaje del equipo
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-navy/5 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray">
                          Aviso del sistema
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-navy">{n.titulo}</p>
                    <p className="mt-1 text-sm text-gray">{n.cuerpo}</p>
                    <p className="mt-2 text-xs text-gray">{n.fecha}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : null}
      </div>

      {pagoModal && cliente.credito ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pago-mock-title"
        >
          <div className="w-full max-w-md rounded-[14px] border border-navy/10 bg-white p-5 shadow-lg">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
              OpenPay · checkout demo
            </p>
            <h3
              id="pago-mock-title"
              className="mt-1 text-lg font-semibold text-navy"
            >
              Pagar en línea
            </h3>
            <p className="mt-2 text-sm text-gray">
              Simulación de cobro con tarjeta. No se procesa un pago real.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-gray">Alumno</dt>
                <dd className="font-medium text-navy">{cliente.nombre}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray">Código de barras</dt>
                <dd className="font-mono text-xs text-navy">
                  {cliente.codigoBarras}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray">Mensualidad</dt>
                <dd className="text-lg font-semibold text-navy">
                  {formatMXN(cliente.credito.mensualidad)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-[10px] border border-dashed border-navy/20 bg-light px-3 py-3 text-xs text-gray">
              Tarjeta mock · **** 4242 · Vence 12/28 · CVV •••
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="flex-1 rounded-[8px] border border-navy/15 px-3 py-2.5 text-sm font-medium"
                onClick={() => setPagoModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 rounded-[8px] bg-teal px-3 py-2.5 text-sm font-semibold text-white"
                onClick={() => {
                  pagarEnLineaMock(cliente.id)
                  setPagoModal(false)
                }}
              >
                Confirmar pago mock
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DemoShell>
  )
}

function Metric({
  label,
  value,
  highlight,
  hint,
}: {
  label: string
  value: string
  highlight?: boolean
  hint?: string
}) {
  return (
    <div
      className={`rounded-[12px] border p-4 ${
        highlight ? 'border-teal/40 bg-mint' : 'border-navy/10 bg-white'
      }`}
    >
      <p className="text-xs text-gray">{label}</p>
      <p className="mt-1 text-lg font-semibold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-teal">{hint}</p> : null}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-navy/20 bg-white px-4 py-8 text-center text-sm text-gray">
      {text}
    </div>
  )
}

function AmortTable({
  rows,
}: {
  rows: {
    periodo: number
    pago: number
    interes: number
    capital: number
    saldo: number
  }[]
}) {
  const totalInteres = rows.reduce((a, r) => a + r.interes, 0)
  return (
    <div className="overflow-x-auto rounded-[12px] border border-navy/10 bg-white">
      <div className="flex flex-wrap justify-between gap-2 border-b border-navy/5 bg-mint/60 px-3 py-2 text-xs">
        <span className="font-medium text-navy">{rows.length} periodos</span>
        <span className="text-teal">
          Intereses totales (ilustrativo): {formatMXN(totalInteres)}
        </span>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-light text-xs uppercase text-gray">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2 text-right">Pago</th>
            <th className="px-3 py-2 text-right">Interés</th>
            <th className="px-3 py-2 text-right">Capital</th>
            <th className="px-3 py-2 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 12).map((r) => (
            <tr key={r.periodo} className="border-t border-navy/5">
              <td className="px-3 py-2">{r.periodo}</td>
              <td className="px-3 py-2 text-right">{formatMXN(r.pago)}</td>
              <td className="px-3 py-2 text-right">{formatMXN(r.interes)}</td>
              <td className="px-3 py-2 text-right">{formatMXN(r.capital)}</td>
              <td className="px-3 py-2 text-right font-medium">
                {formatMXN(r.saldo)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 12 ? (
        <p className="border-t border-navy/5 px-3 py-2 text-xs text-gray">
          Mostrando 12 de {rows.length} periodos.
        </p>
      ) : null}
    </div>
  )
}
