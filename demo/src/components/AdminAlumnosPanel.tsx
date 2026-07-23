import { useMemo, useState } from 'react'

import AntesAhoraBadge from './AntesAhoraBadge'
import CodigoBarrasVisual from './CodigoBarrasVisual'
import ExpedienteDocumentos from './ExpedienteDocumentos'
import FotoAlumno from './FotoAlumno'
import { formatMXN } from '../lib/amortizacion'
import { formatFechaMx, normalizarCurp } from '../lib/curp'
import { useDemoStore } from '../store/demoStore'
import { ESTATUS_LABEL, type EstatusCliente } from '../types'

const ESTATUS_OPTS = Object.keys(ESTATUS_LABEL) as EstatusCliente[]

export default function AdminAlumnosPanel() {
  const clientes = useDemoStore((s) => s.clientes)
  const selectedId = useDemoStore((s) => s.clienteSeleccionadoId)
  const selectCliente = useDemoStore((s) => s.selectCliente)
  const actualizarCliente = useDemoStore((s) => s.actualizarCliente)
  const invitarAlumnoPorEmail = useDemoStore((s) => s.invitarAlumnoPorEmail)
  const enviarMensajeAlumno = useDemoStore((s) => s.enviarMensajeAlumno)
  const allNotificaciones = useDemoStore((s) => s.notificaciones)
  const historialAjustes = useDemoStore((s) => s.historialAjustes)
  const setVista = useDemoStore((s) => s.setVista)
  const setClienteAlumno = useDemoStore((s) => s.setClienteAlumno)

  const [q, setQ] = useState('')
  const [filtroEstatus, setFiltroEstatus] = useState<string>('todos')
  const [msgTitulo, setMsgTitulo] = useState('Mensaje de Estudia+')
  const [msgCuerpo, setMsgCuerpo] = useState('')
  const [autor, setAutor] = useState('Mesa de control')
  const [invEmail, setInvEmail] = useState('')
  const [invAsesor, setInvAsesor] = useState('Vale 2 — Laura')

  const selected = clientes.find((c) => c.id === selectedId) ?? null

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return clientes.filter((c) => {
      if (filtroEstatus !== 'todos' && c.estatus !== filtroEstatus) return false
      if (!term) return true
      return (
        c.nombre.toLowerCase().includes(term) ||
        c.folio.toLowerCase().includes(term) ||
        c.codigoBarras.includes(term) ||
        c.curp.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.universidad.toLowerCase().includes(term)
      )
    })
  }, [clientes, q, filtroEstatus])

  const avisosAlumno = useMemo(
    () =>
      selected
        ? allNotificaciones.filter((n) => n.clienteId === selected.id)
        : [],
    [allNotificaciones, selected],
  )

  const ajustesAlumno = useMemo(
    () =>
      selected
        ? historialAjustes.filter((a) => a.clienteId === selected.id)
        : [],
    [historialAjustes, selected],
  )

  function invitar() {
    const id = invitarAlumnoPorEmail(invEmail, { asesor: invAsesor })
    if (id) {
      setInvEmail('')
    }
  }

  return (
    <section className="space-y-4">
      <AntesAhoraBadge
        antes="equipo captura todos los datos del alumno"
        ahora="expediente nace con cuenta o invitación por correo"
      />

      <div className="rounded-[12px] border border-teal/30 bg-white p-4">
        <p className="text-sm font-semibold text-navy">
          Invitar alumno (Estudia Más)
        </p>
        <p className="mt-1 text-xs text-gray">
          El expediente se crea con el <strong>correo</strong>. El estudiante
          entra al portal y completa el formulario (CURP → identidad, universidad,
          carrera). No captures su nombre a mano.
        </p>
        <label className="mt-3 block text-xs">
          <span className="font-medium text-gray">Correo del alumno *</span>
          <input
            type="email"
            value={invEmail}
            onChange={(e) => setInvEmail(e.target.value)}
            placeholder="alumno@correo.mx"
            className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm"
          />
        </label>
        <label className="mt-2 block text-xs">
          <span className="font-medium text-gray">Asesor</span>
          <input
            value={invAsesor}
            onChange={(e) => setInvAsesor(e.target.value)}
            className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm"
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['nuevo.alumno@correo.mx', 'demo.invitado@estudiamas.mx'].map((e) => (
            <button
              key={e}
              type="button"
              className="rounded-full border border-navy/10 bg-light px-2.5 py-1 text-[11px] font-medium"
              onClick={() => setInvEmail(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!invEmail.includes('@')}
          className="mt-3 w-full rounded-[10px] bg-teal py-2.5 text-sm font-semibold text-white disabled:opacity-40 sm:w-auto sm:px-5"
          onClick={invitar}
        >
          Crear expediente e invitar
        </button>
        <p className="mt-2 text-[11px] text-gray">
          Si el alumno se registra solo (landing → crear cuenta), el expediente
          también nace al crear la cuenta y le pide el mismo formulario.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
        <div
          className={`space-y-3 ${selected ? 'hidden lg:block' : 'block'}`}
        >
          <div className="flex flex-wrap gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nombre, CURP, folio…"
              className="min-w-[12rem] flex-1 rounded-[10px] border border-navy/15 bg-white px-3 py-2 text-sm"
            />
            <select
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value)}
              className="rounded-[10px] border border-navy/15 bg-white px-2 py-2 text-sm"
            >
              <option value="todos">Todos los estatus</option>
              {ESTATUS_OPTS.map((e) => (
                <option key={e} value={e}>
                  {ESTATUS_LABEL[e]}
                </option>
              ))}
            </select>
          </div>

          <ul className="max-h-[min(36rem,70dvh)] space-y-2 overflow-y-auto overscroll-contain">
            {filtered.map((c) => {
              const unread = allNotificaciones.filter(
                (n) => n.clienteId === c.id && !n.leida,
              ).length
              const docsOk = c.documentos.filter(
                (d) => d.estado === 'validado' || d.estado === 'cargado',
              ).length
              const active = c.id === selectedId
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectCliente(c.id)}
                    className={`w-full min-h-14 rounded-[12px] border px-3 py-3 text-left transition ${
                      active
                        ? 'border-teal bg-mint'
                        : 'border-navy/10 bg-white hover:border-teal/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <FotoAlumno
                          foto={c.foto}
                          nombre={c.nombre}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-navy">{c.nombre}</p>
                          <p className="font-mono text-xs text-teal">{c.folio}</p>
                          <p className="mt-1 text-xs text-gray">
                            {ESTATUS_LABEL[c.estatus]} · {docsOk}/
                            {c.documentos.length} docs
                            {!c.formularioCompleto
                              ? ' · Formulario pendiente'
                              : ''}
                            {c.enMora ? ' · Mora' : ''}
                            {!c.foto ? ' · Sin foto' : ''}
                          </p>
                        </div>
                      </div>
                      {unread > 0 ? (
                        <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 ? (
              <li className="rounded-[12px] border border-dashed border-navy/20 bg-white px-3 py-8 text-center text-sm text-gray">
                Sin alumnos con ese filtro.
              </li>
            ) : null}
          </ul>
        </div>

        {!selected ? (
          <div className="hidden rounded-[12px] border border-dashed border-navy/20 bg-white px-4 py-16 text-center text-sm text-gray lg:block">
            Selecciona un alumno para ver documentos, ajustar crédito y enviar
            mensajes.
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              className="flex min-h-11 w-full items-center gap-2 rounded-[10px] border border-navy/15 bg-white px-3 py-2.5 text-sm font-medium text-navy lg:hidden"
              onClick={() => selectCliente(null)}
            >
              ← Volver a la lista
            </button>

            <div className="rounded-[12px] border border-navy/10 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <FotoAlumno
                    foto={selected.foto}
                    nombre={selected.nombre}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                      Ficha administrativa
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-navy">
                      {selected.nombre}
                    </h2>
                    <p className="break-all font-mono text-sm text-teal">
                      {selected.folio}
                    </p>
                    {!selected.foto ? (
                      <p className="mt-1 text-xs text-lime">
                        Sin foto de identificación — el alumno la sube en su
                        perfil.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray">
                        Foto de ID · v{selected.foto.version} ·{' '}
                        {selected.foto.subidoEn}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="min-h-10 rounded-[8px] border border-navy/15 px-3 py-2 text-xs font-medium"
                  onClick={() => {
                    const id = selected.id
                    setClienteAlumno(id)
                    setVista('alumno')
                  }}
                >
                  Ver como alumno →
                </button>
              </div>

              <div className="mt-4 rounded-[10px] border border-navy/10 bg-light p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray">
                  Código de barras del alumno
                </p>
                <CodigoBarrasVisual
                  codigo={selected.codigoBarras}
                  className="mt-2"
                />
              </div>

              <div className="mt-4 rounded-[10px] border border-teal/20 bg-mint/40 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                  Identidad desde CURP (solo lectura)
                </p>
                {!selected.formularioCompleto ? (
                  <div className="mt-2 rounded-[10px] border border-lime/30 bg-white px-3 py-3 text-sm text-navy">
                    <p className="font-semibold">Formulario pendiente del alumno</p>
                    <p className="mt-1 text-xs text-gray">
                      Origen:{' '}
                      {selected.origenAlta === 'equipo'
                        ? 'invitación Estudia Más'
                        : 'cuenta creada por el alumno'}
                      . Correo: <strong>{selected.email}</strong>. El alumno debe
                      completar CURP y datos académicos en su portal.
                    </p>
                    <button
                      type="button"
                      className="mt-2 rounded-[8px] border border-navy/15 px-3 py-1.5 text-xs font-medium"
                      onClick={() => {
                        setClienteAlumno(selected.id)
                        setVista('alumno')
                      }}
                    >
                      Ver portal del alumno →
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="mt-2 block text-xs">
                      <span className="font-medium text-gray">CURP</span>
                      <input
                        value={selected.curp}
                        onChange={(e) =>
                          actualizarCliente(selected.id, {
                            curp: normalizarCurp(e.target.value),
                          })
                        }
                        maxLength={18}
                        className="mt-1 w-full rounded-[10px] border border-navy/15 bg-white px-3 py-2.5 font-mono text-sm uppercase"
                        spellCheck={false}
                      />
                    </label>
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-xs text-gray">Nombre oficial</span>
                        <br />
                        <strong className="text-navy">{selected.nombre}</strong>
                      </p>
                      <p>
                        <span className="text-xs text-gray">Edad</span>
                        <br />
                        <strong className="text-navy">{selected.edad} años</strong>
                      </p>
                      <p>
                        <span className="text-xs text-gray">Nacimiento</span>
                        <br />
                        <strong className="text-navy">
                          {formatFechaMx(selected.fechaNacimiento)}
                        </strong>
                      </p>
                      <p>
                        <span className="text-xs text-gray">Sexo · Entidad</span>
                        <br />
                        <strong className="text-navy">
                          {selected.sexo === 'H'
                            ? 'Hombre'
                            : selected.sexo === 'M'
                              ? 'Mujer'
                              : 'No binario'}{' '}
                          · {selected.entidadNacimiento}
                        </strong>
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] text-gray">
                      Alta:{' '}
                      {selected.origenAlta === 'equipo'
                        ? 'invitación equipo'
                        : 'cuenta del alumno'}
                      . Cambiar CURP recalcula identidad.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['email', 'Email'],
                    ['telefono', 'Teléfono'],
                    ['universidad', 'Universidad'],
                    ['carrera', 'Carrera'],
                    ['asesor', 'Asesor'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-xs">
                    <span className="font-medium text-gray">{label}</span>
                    <input
                      value={selected[key]}
                      onChange={(e) =>
                        actualizarCliente(selected.id, {
                          [key]: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm text-navy"
                    />
                  </label>
                ))}

                <label className="block text-xs">
                  <span className="font-medium text-gray">Estatus</span>
                  <select
                    value={selected.estatus}
                    onChange={(e) =>
                      actualizarCliente(selected.id, {
                        estatus: e.target.value as EstatusCliente,
                      })
                    }
                    className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm text-navy"
                  >
                    {ESTATUS_OPTS.map((e) => (
                      <option key={e} value={e}>
                        {ESTATUS_LABEL[e]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-end gap-2 pb-2 text-sm text-navy">
                  <input
                    type="checkbox"
                    checked={selected.enMora}
                    onChange={(e) =>
                      actualizarCliente(selected.id, {
                        enMora: e.target.checked,
                      })
                    }
                    className="accent-teal"
                  />
                  Marcar en mora
                </label>
              </div>

              <label className="mt-3 block text-xs">
                <span className="font-medium text-gray">
                  Notas internas (solo equipo)
                </span>
                <textarea
                  value={selected.notasInternas}
                  onChange={(e) =>
                    actualizarCliente(selected.id, {
                      notasInternas: e.target.value,
                    })
                  }
                  rows={2}
                  className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm text-navy"
                />
              </label>
            </div>

            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-navy">
                  Documentos del alumno
                </p>
                <p className="text-xs text-gray">
                  Mismo expediente que ve el alumno — comenta, valida o pide
                  nueva versión.
                </p>
              </div>
              <ExpedienteDocumentos
                modo="equipo"
                clienteId={selected.id}
                folio={selected.folio}
                documentos={selected.documentos}
              />
            </div>

            {selected.credito ? (
              <div className="rounded-[12px] border border-navy/10 bg-white p-4">
                <p className="text-sm font-semibold text-navy">
                  Ajustes de crédito
                </p>
                <p className="mt-1 text-xs text-gray">
                  Mensualidad actual {formatMXN(selected.credito.mensualidad)} ·
                  se auto-calcula al cambiar saldo / plazo / tasa (ver también
                  Finanzas → TIR / amortización).
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="block text-xs">
                    <span className="font-medium text-gray">Saldo</span>
                    <input
                      type="number"
                      value={selected.credito.saldoActual}
                      onChange={(e) =>
                        actualizarCliente(selected.id, {
                          credito: { saldoActual: Number(e.target.value) },
                          autorAjuste: autor,
                        })
                      }
                      className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="font-medium text-gray">Plazo (meses)</span>
                    <input
                      type="number"
                      value={selected.credito.plazo}
                      onChange={(e) =>
                        actualizarCliente(selected.id, {
                          credito: { plazo: Number(e.target.value) },
                          autorAjuste: autor,
                        })
                      }
                      className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="font-medium text-gray">Tasa anual %</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selected.credito.tasaAnual}
                      onChange={(e) =>
                        actualizarCliente(selected.id, {
                          credito: { tasaAnual: Number(e.target.value) },
                          autorAjuste: autor,
                        })
                      }
                      className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-navy/20 bg-white px-4 py-6 text-sm text-gray">
                Sin crédito activo. Puedes avanzar el estatus cuando corresponda.
              </div>
            )}

            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <p className="text-sm font-semibold text-navy">
                Historial de ajustes de crédito ({ajustesAlumno.length})
              </p>
              <p className="mt-1 text-xs text-gray">
                Cada cambio queda registrado con autor, antes/después y
                recalculo de mensualidad.
              </p>
              <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                {ajustesAlumno.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-[10px] border border-navy/10 bg-light px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-navy">{a.resumen}</p>
                    <p className="mt-0.5 text-xs text-gray">
                      {a.fecha} · {a.autor}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-gray">
                      {a.antes.plazo}m / {formatMXN(a.antes.saldoActual)} /{' '}
                      {a.antes.tasaAnual}% → {a.despues.plazo}m /{' '}
                      {formatMXN(a.despues.saldoActual)} / {a.despues.tasaAnual}%
                    </p>
                  </li>
                ))}
                {ajustesAlumno.length === 0 ? (
                  <li className="text-xs text-gray">
                    Sin ajustes aún para este folio.
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-[12px] border border-teal/30 bg-white p-4">
              <p className="text-sm font-semibold text-navy">
                Enviar mensaje / notificación
              </p>
              <p className="mt-1 text-xs text-gray">
                Llega a la bandeja de <strong>Avisos</strong> del alumno (mismo
                folio).
              </p>
              <label className="mt-3 block text-xs">
                <span className="font-medium text-gray">De parte de</span>
                <input
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-2 block text-xs">
                <span className="font-medium text-gray">Asunto</span>
                <input
                  value={msgTitulo}
                  onChange={(e) => setMsgTitulo(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-2 block text-xs">
                <span className="font-medium text-gray">Mensaje</span>
                <textarea
                  value={msgCuerpo}
                  onChange={(e) => setMsgCuerpo(e.target.value)}
                  rows={3}
                  placeholder="Ej. Te recordamos subir el comprobante actualizado esta semana."
                  className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!msgCuerpo.trim()}
                  className="rounded-[8px] bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  onClick={() => {
                    enviarMensajeAlumno(
                      selected.id,
                      msgTitulo || 'Mensaje de Estudia+',
                      msgCuerpo,
                      autor,
                    )
                    setMsgCuerpo('')
                  }}
                >
                  Enviar al alumno
                </button>
                <button
                  type="button"
                  className="rounded-[8px] border border-navy/15 px-3 py-2 text-xs font-medium"
                  onClick={() => {
                    setMsgTitulo('Recordatorio de documentos')
                    setMsgCuerpo(
                      'Hola, te escribimos para recordarte completar los documentos pendientes de tu expediente.',
                    )
                  }}
                >
                  Plantilla docs
                </button>
                <button
                  type="button"
                  className="rounded-[8px] border border-navy/15 px-3 py-2 text-xs font-medium"
                  onClick={() => {
                    setMsgTitulo('Recordatorio de pago')
                    setMsgCuerpo(
                      'Tu próxima mensualidad se acerca. Puedes consultar saldo y simular abonos en tu portal.',
                    )
                  }}
                >
                  Plantilla pago
                </button>
              </div>
            </div>

            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <p className="text-sm font-semibold text-navy">
                Historial de avisos ({avisosAlumno.length})
              </p>
              <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                {avisosAlumno.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-[10px] border px-3 py-2 text-sm ${
                      n.tipo === 'mensaje_equipo'
                        ? 'border-teal/30 bg-mint/50'
                        : 'border-navy/10 bg-light'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-navy">{n.titulo}</span>
                      {n.tipo === 'mensaje_equipo' ? (
                        <span className="rounded bg-teal/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal">
                          Mensaje
                        </span>
                      ) : (
                        <span className="rounded bg-navy/5 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray">
                          Sistema
                        </span>
                      )}
                      {!n.leida ? (
                        <span className="text-[10px] font-bold uppercase text-lime">
                          Sin leer
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray">{n.cuerpo}</p>
                    <p className="mt-1 text-[11px] text-gray">{n.fecha}</p>
                  </li>
                ))}
                {avisosAlumno.length === 0 ? (
                  <li className="text-xs text-gray">Sin avisos aún.</li>
                ) : null}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
