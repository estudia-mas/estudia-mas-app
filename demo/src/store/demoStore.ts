import { create } from 'zustand'

import { initialClientes, initialNotificaciones } from '../data/mockData'
import { initialPlantillas } from '../data/plantillas'
import type {
  AjusteCreditoLog,
  ArchivoEnMemoria,
  Cliente,
  DocComentario,
  DocumentoEstado,
  EstatusCliente,
  Notificacion,
  Plantilla,
  SnapshotCredito,
} from '../types'
import { mensualidadFrancesa } from '../lib/amortizacion'

export type Vista = 'landing' | 'alumno' | 'equipo' | 'flujo'

export type EquipoTabId =
  | 'alumnos'
  | 'marketing'
  | 'pipeline'
  | 'conciliacion'
  | 'cobranza'
  | 'finanzas'
  | 'plantillas'

function nowDate() {
  return new Date().toISOString().slice(0, 10)
}

function newComment(
  partial: Omit<DocComentario, 'id' | 'fecha'> & { fecha?: string },
): DocComentario {
  return {
    id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: partial.fecha ?? nowDate(),
    autor: partial.autor,
    autorNombre: partial.autorNombre,
    texto: partial.texto,
    tipo: partial.tipo,
  }
}

export type EnsayoKey =
  | 'tutorial'
  | 'folio'
  | 'simulador'
  | 'conciliacion'
  | 'docsCruzados'

export type EnsayoState = Record<EnsayoKey, boolean>

type DemoState = {
  tutorialOpen: boolean
  tutorialSeen: boolean
  vista: Vista
  vistasVistas: { alumno: boolean; equipo: boolean }
  clientes: Cliente[]
  notificaciones: Notificacion[]
  clienteAlumnoId: string
  clienteSeleccionadoId: string | null
  pendingAlumnoTab: string | null
  equipoTab: EquipoTabId
  historialAjustes: AjusteCreditoLog[]
  plantillas: Plantilla[]
  toast: string | null
  ensayo: EnsayoState

  openTutorial: () => void
  closeTutorial: () => void
  finishTutorial: () => void
  setVista: (v: Vista) => void
  setEquipoTab: (t: EquipoTabId) => void
  selectCliente: (id: string | null) => void
  setClienteAlumno: (id: string) => void
  setPendingAlumnoTab: (tab: string | null) => void
  updateEstatus: (id: string, estatus: EstatusCliente) => void
  actualizarCliente: (
    id: string,
    patch: Partial<
      Pick<
        Cliente,
        | 'nombre'
        | 'email'
        | 'telefono'
        | 'universidad'
        | 'carrera'
        | 'asesor'
        | 'estatus'
        | 'enMora'
        | 'notasInternas'
      >
    > & {
      credito?: Partial<{
        plazo: number
        saldoActual: number
        tasaAnual: number
        mensualidad: number
      }>
      autorAjuste?: string
    },
  ) => void
  publicarVersionPlantilla: (
    plantillaId: string,
    contenido: string,
    nota: string,
    autor?: string,
    valorNumerico?: number,
  ) => void
  activarVersionPlantilla: (plantillaId: string, version: number) => void
  /** Mensaje del equipo → notificación en vista alumno */
  enviarMensajeAlumno: (
    clienteId: string,
    titulo: string,
    cuerpo: string,
    autorNombre?: string,
  ) => void
  setDocumentoEstado: (
    clienteId: string,
    docId: string,
    estado: DocumentoEstado,
  ) => void
  /** Alumno sube o reemplaza un archivo (contenido en memoria) */
  subirDocumento: (
    clienteId: string,
    docId: string,
    opts?: {
      notaAlumno?: string
      archivo?: ArchivoEnMemoria
    },
  ) => void
  /** Equipo deja un comentario libre */
  comentarDocumento: (
    clienteId: string,
    docId: string,
    texto: string,
    autorNombre?: string,
  ) => void
  /** Equipo pide actualizar el archivo + comentario obligatorio */
  solicitarActualizacionDocumento: (
    clienteId: string,
    docId: string,
    texto: string,
    autorNombre?: string,
  ) => void
  validarDocumento: (clienteId: string, docId: string) => void
  aplicarSimulacion: (
    clienteId: string,
    patch: { plazo?: number; abonoCapital?: number },
  ) => void
  firmarContrato: (clienteId: string) => void
  aplicarRecompensa: (clienteId: string) => void
  conciliarPago: (pagoId: string) => void
  marcarNotificacionesLeidas: (clienteId: string) => void
  showToast: (msg: string) => void
  clearToast: () => void
  markEnsayo: (key: EnsayoKey) => void
  toggleEnsayo: (key: EnsayoKey) => void
  /** Vuelve al estado inicial mock (presentador) */
  resetDemo: () => void
}

function mapDoc(
  clientes: Cliente[],
  clienteId: string,
  docId: string,
  mapper: (
    d: Cliente['documentos'][number],
    c: Cliente,
  ) => Cliente['documentos'][number],
): Cliente[] {
  return clientes.map((c) => {
    if (c.id !== clienteId) return c
    return {
      ...c,
      documentos: c.documentos.map((d) => (d.id === docId ? mapper(d, c) : d)),
    }
  })
}

const ensayoInicial: EnsayoState = {
  tutorial: false,
  folio: false,
  simulador: false,
  conciliacion: false,
  docsCruzados: false,
}

function freshClientes() {
  return structuredClone(initialClientes)
}

function freshNotificaciones() {
  return structuredClone(initialNotificaciones)
}

function freshPlantillas() {
  return structuredClone(initialPlantillas)
}

function snapCredito(c: NonNullable<Cliente['credito']>): SnapshotCredito {
  return {
    plazo: c.plazo,
    saldoActual: c.saldoActual,
    tasaAnual: c.tasaAnual,
    mensualidad: c.mensualidad,
  }
}

function formatSnap(n: number) {
  return `$${Math.round(n).toLocaleString('es-MX')}`
}

/** Historial semilla para que la ficha admin no arranque vacía. */
function seedHistorialAjustes(): AjusteCreditoLog[] {
  return [
    {
      id: 'aj-seed-1',
      clienteId: 'c1',
      fecha: '2026-05-12',
      autor: 'Mesa de control',
      resumen: 'Reestructura · plazo 48 → 42 meses',
      antes: {
        plazo: 48,
        saldoActual: 185000,
        tasaAnual: 18.5,
        mensualidad: 5200,
      },
      despues: {
        plazo: 42,
        saldoActual: 185000,
        tasaAnual: 18.5,
        mensualidad: 5680,
      },
    },
    {
      id: 'aj-seed-2',
      clienteId: 'c2',
      fecha: '2026-06-02',
      autor: 'Cobranza',
      resumen: 'Abono a capital · saldo reducido',
      antes: {
        plazo: 36,
        saldoActual: 120000,
        tasaAnual: 17,
        mensualidad: 4300,
      },
      despues: {
        plazo: 36,
        saldoActual: 110000,
        tasaAnual: 17,
        mensualidad: 3940,
      },
    },
  ]
}

export const useDemoStore = create<DemoState>((set) => ({
  tutorialOpen: true,
  tutorialSeen: false,
  vista: 'landing',
  vistasVistas: { alumno: false, equipo: false },
  clientes: freshClientes(),
  notificaciones: freshNotificaciones(),
  clienteAlumnoId: 'c1',
  clienteSeleccionadoId: null,
  pendingAlumnoTab: null,
  equipoTab: 'alumnos',
  historialAjustes: seedHistorialAjustes(),
  plantillas: freshPlantillas(),
  toast: null,
  ensayo: { ...ensayoInicial },

  openTutorial: () => set({ tutorialOpen: true }),
  closeTutorial: () =>
    set((s) => ({
      tutorialOpen: false,
      tutorialSeen: true,
      ensayo: { ...s.ensayo, tutorial: true },
    })),
  finishTutorial: () =>
    set((s) => ({
      tutorialOpen: false,
      tutorialSeen: true,
      vista: 'flujo',
      ensayo: { ...s.ensayo, tutorial: true },
    })),
  setVista: (vista) =>
    set((s) => {
      const vistasVistas = {
        alumno: s.vistasVistas.alumno || vista === 'alumno',
        equipo: s.vistasVistas.equipo || vista === 'equipo',
      }
      const folio =
        s.ensayo.folio || (vistasVistas.alumno && vistasVistas.equipo)
      return {
        vista,
        vistasVistas,
        ensayo: folio ? { ...s.ensayo, folio: true } : s.ensayo,
      }
    }),
  setEquipoTab: (equipoTab) => set({ equipoTab }),
  selectCliente: (clienteSeleccionadoId) => set({ clienteSeleccionadoId }),
  setClienteAlumno: (clienteAlumnoId) => set({ clienteAlumnoId }),
  setPendingAlumnoTab: (pendingAlumnoTab) => set({ pendingAlumnoTab }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  markEnsayo: (key) =>
    set((s) => ({ ensayo: { ...s.ensayo, [key]: true } })),
  toggleEnsayo: (key) =>
    set((s) => ({ ensayo: { ...s.ensayo, [key]: !s.ensayo[key] } })),
  resetDemo: () =>
    set({
      tutorialOpen: true,
      tutorialSeen: false,
      vista: 'landing',
      vistasVistas: { alumno: false, equipo: false },
      clientes: freshClientes(),
      notificaciones: freshNotificaciones(),
      clienteAlumnoId: 'c1',
      clienteSeleccionadoId: null,
      pendingAlumnoTab: null,
      equipoTab: 'alumnos',
      historialAjustes: seedHistorialAjustes(),
      plantillas: freshPlantillas(),
      toast: 'Demo reiniciada',
      ensayo: { ...ensayoInicial },
    }),

  updateEstatus: (id, estatus) =>
    set((s) => ({
      clientes: s.clientes.map((c) => (c.id === id ? { ...c, estatus } : c)),
    })),

  actualizarCliente: (id, patch) =>
    set((s) => {
      const { credito: creditoPatch, autorAjuste, ...rest } = patch
      const prev = s.clientes.find((c) => c.id === id)
      let log: AjusteCreditoLog | null = null

      const clientes = s.clientes.map((c) => {
        if (c.id !== id) return c
        let credito = c.credito
        if (credito && creditoPatch) {
          const antes = snapCredito(credito)
          const next = { ...credito, ...creditoPatch }
          if (
            creditoPatch.plazo != null ||
            creditoPatch.saldoActual != null ||
            creditoPatch.tasaAnual != null
          ) {
            next.mensualidad =
              creditoPatch.mensualidad ??
              Math.round(
                mensualidadFrancesa(
                  next.saldoActual,
                  next.plazo,
                  next.tasaAnual,
                ),
              )
            next.mensualidadBase = next.mensualidad
            next.recompensaAplicada = false
          }
          credito = next
          const despues = snapCredito(credito)
          if (
            antes.plazo !== despues.plazo ||
            antes.saldoActual !== despues.saldoActual ||
            antes.tasaAnual !== despues.tasaAnual ||
            antes.mensualidad !== despues.mensualidad
          ) {
            log = {
              id: `aj-${Date.now()}`,
              clienteId: id,
              fecha: nowDate(),
              autor: autorAjuste ?? 'Mesa de control',
              resumen: `Ajuste · mensualidad ${formatSnap(antes.mensualidad)} → ${formatSnap(despues.mensualidad)}`,
              antes,
              despues,
            }
          }
        }
        return { ...c, ...rest, credito }
      })

      return {
        clientes,
        historialAjustes: log
          ? [log, ...s.historialAjustes]
          : s.historialAjustes,
        toast: creditoPatch
          ? 'Crédito ajustado · amortización/TIR recalculados'
          : prev
            ? 'Datos del alumno actualizados'
            : 'Sin cambios',
      }
    }),

  publicarVersionPlantilla: (
    plantillaId,
    contenido,
    nota,
    autor = 'Operaciones',
    valorNumerico,
  ) =>
    set((s) => ({
      plantillas: s.plantillas.map((p) => {
        if (p.id !== plantillaId) return p
        const version = Math.max(...p.versiones.map((v) => v.version), 0) + 1
        return {
          ...p,
          activaVersion: version,
          versiones: [
            ...p.versiones,
            {
              version,
              fecha: nowDate(),
              autor,
              nota: nota.trim() || `Versión ${version}`,
              contenido,
              valorNumerico,
            },
          ],
        }
      }),
      toast: 'Nueva versión de plantilla publicada',
    })),

  activarVersionPlantilla: (plantillaId, version) =>
    set((s) => ({
      plantillas: s.plantillas.map((p) =>
        p.id === plantillaId ? { ...p, activaVersion: version } : p,
      ),
      toast: `Plantilla activada en v${version}`,
    })),

  enviarMensajeAlumno: (
    clienteId,
    titulo,
    cuerpo,
    autorNombre = 'Equipo Estudia+',
  ) =>
    set((s) => {
      if (!titulo.trim() || !cuerpo.trim()) return s
      return {
        notificaciones: [
          {
            id: `n-msg-${Date.now()}`,
            clienteId,
            titulo: titulo.trim(),
            cuerpo: `${autorNombre}: ${cuerpo.trim()}`,
            fecha: nowDate(),
            leida: false,
            tipo: 'mensaje_equipo' as const,
          },
          ...s.notificaciones,
        ],
        toast: 'Mensaje enviado · el alumno lo ve en Avisos',
      }
    }),

  setDocumentoEstado: (clienteId, docId, estado) =>
    set((s) => ({
      clientes: mapDoc(s.clientes, clienteId, docId, (d) => ({
        ...d,
        estado,
        fechaCarga:
          estado === 'pendiente' ? null : (d.fechaCarga ?? nowDate()),
      })),
    })),

  subirDocumento: (clienteId, docId, opts) =>
    set((s) => {
      const notaAlumno = opts?.notaAlumno
      const archivoIn = opts?.archivo
      const cliente = s.clientes.find((c) => c.id === clienteId)
      const doc = cliente?.documentos.find((d) => d.id === docId)
      const comments = [...(doc?.comentarios ?? [])]
      const nextVersion = (doc?.archivo?.version ?? 0) + 1

      const archivo: ArchivoEnMemoria =
        archivoIn ??
        ({
          nombreArchivo: `${(doc?.nombre ?? 'documento').replace(/\s+/g, '_')}_v${nextVersion}.txt`,
          mimeType: 'text/plain',
          size: 0,
          dataBase64: '',
          version: nextVersion,
          subidoEn: nowDate(),
        } satisfies ArchivoEnMemoria)

      // Si vino sin size (ejemplo vacío), rellenar texto demo
      let archivoFinal = archivo
      if (!archivoFinal.dataBase64) {
        const texto = [
          `Documento: ${doc?.nombre ?? 'archivo'}`,
          `Folio: ${cliente?.folio ?? ''}`,
          `Versión: ${nextVersion}`,
          `Alumno: ${cliente?.nombre ?? ''}`,
          `Fecha: ${nowDate()}`,
          '',
          'Archivo de ejemplo guardado en memoria de la sesión Estudia Más.',
          'Puedes descargarlo y reemplazarlo desde el expediente.',
          notaAlumno ? `Nota del alumno: ${notaAlumno}` : '',
        ]
          .filter(Boolean)
          .join('\n')
        const bytes = new TextEncoder().encode(texto)
        let binary = ''
        for (let i = 0; i < bytes.length; i++)
          binary += String.fromCharCode(bytes[i]!)
        archivoFinal = {
          ...archivoFinal,
          size: bytes.length,
          dataBase64: btoa(binary),
          version: nextVersion,
          subidoEn: nowDate(),
        }
      } else {
        archivoFinal = { ...archivoFinal, version: nextVersion, subidoEn: nowDate() }
      }

      if (notaAlumno?.trim()) {
        comments.push(
          newComment({
            autor: 'alumno',
            autorNombre: cliente?.nombre ?? 'Alumno',
            texto: notaAlumno.trim(),
            tipo: 'comentario',
          }),
        )
      } else if (doc?.estado === 'requiere_actualizacion') {
        comments.push(
          newComment({
            autor: 'alumno',
            autorNombre: cliente?.nombre ?? 'Alumno',
            texto: `Archivo actualizado (v${nextVersion}): ${archivoFinal.nombreArchivo}`,
            tipo: 'comentario',
          }),
        )
      } else if (doc?.archivo) {
        comments.push(
          newComment({
            autor: 'alumno',
            autorNombre: cliente?.nombre ?? 'Alumno',
            texto: `Reemplazó el archivo por v${nextVersion}: ${archivoFinal.nombreArchivo}`,
            tipo: 'comentario',
          }),
        )
      }

      const eraActualizacion = doc?.estado === 'requiere_actualizacion'
      return {
        clientes: mapDoc(s.clientes, clienteId, docId, (d) => ({
          ...d,
          estado: 'cargado' as const,
          fechaCarga: nowDate(),
          archivo: archivoFinal,
          comentarios: comments.length ? comments : d.comentarios,
        })),
        notificaciones: [
          {
            id: `n-up-${Date.now()}`,
            clienteId,
            titulo: 'Documento cargado',
            cuerpo: `Se cargó “${doc?.nombre ?? 'documento'}” (${archivoFinal.nombreArchivo}) en el folio ${cliente?.folio ?? ''}. Ya se puede descargar desde Estudia Más.`,
            fecha: nowDate(),
            leida: false,
            tipo: 'sistema' as const,
          },
          ...s.notificaciones,
        ],
        toast: `Archivo en memoria · v${nextVersion} · listo para descargar`,
        ensayo: eraActualizacion
          ? { ...s.ensayo, docsCruzados: true }
          : s.ensayo,
      }
    }),

  comentarDocumento: (clienteId, docId, texto, autorNombre = 'Mesa de control') =>
    set((s) => {
      if (!texto.trim()) return s
      const cliente = s.clientes.find((c) => c.id === clienteId)
      const doc = cliente?.documentos.find((d) => d.id === docId)
      return {
        clientes: mapDoc(s.clientes, clienteId, docId, (d) => ({
          ...d,
          comentarios: [
            ...d.comentarios,
            newComment({
              autor: 'equipo',
              autorNombre,
              texto: texto.trim(),
              tipo: 'comentario',
            }),
          ],
        })),
        notificaciones: [
          {
            id: `n-cm-${Date.now()}`,
            clienteId,
            titulo: 'Nuevo comentario del equipo',
            cuerpo: `${autorNombre} comentó en “${doc?.nombre ?? 'documento'}”: ${texto.trim()}`,
            fecha: nowDate(),
            leida: false,
          tipo: 'sistema' as const,
          },
          ...s.notificaciones,
        ],
        toast: 'Comentario enviado al alumno',
        ensayo: { ...s.ensayo, docsCruzados: true },
      }
    }),

  solicitarActualizacionDocumento: (
    clienteId,
    docId,
    texto,
    autorNombre = 'Mesa de control',
  ) =>
    set((s) => {
      if (!texto.trim()) return s
      const cliente = s.clientes.find((c) => c.id === clienteId)
      const doc = cliente?.documentos.find((d) => d.id === docId)
      return {
        clientes: mapDoc(s.clientes, clienteId, docId, (d) => ({
          ...d,
          estado: 'requiere_actualizacion' as const,
          comentarios: [
            ...d.comentarios,
            newComment({
              autor: 'equipo',
              autorNombre,
              texto: texto.trim(),
              tipo: 'solicitud_cambio',
            }),
          ],
        })),
        notificaciones: [
          {
            id: `n-req-${Date.now()}`,
            clienteId,
            titulo: 'Te pidieron actualizar un documento',
            cuerpo: `“${doc?.nombre ?? 'Documento'}”: ${texto.trim()}`,
            fecha: nowDate(),
            leida: false,
          tipo: 'sistema' as const,
          },
          ...s.notificaciones,
        ],
        toast: 'Solicitud de actualización enviada al alumno',
        ensayo: { ...s.ensayo, docsCruzados: true },
      }
    }),

  validarDocumento: (clienteId, docId) =>
    set((s) => {
      const cliente = s.clientes.find((c) => c.id === clienteId)
      const doc = cliente?.documentos.find((d) => d.id === docId)
      return {
        clientes: mapDoc(s.clientes, clienteId, docId, (d) => ({
          ...d,
          estado: 'validado' as const,
          fechaCarga: d.fechaCarga ?? nowDate(),
          comentarios: [
            ...d.comentarios,
            newComment({
              autor: 'equipo',
              autorNombre: 'Mesa de control',
              texto: 'Documento validado.',
              tipo: 'comentario',
            }),
          ],
        })),
        notificaciones: [
          {
            id: `n-ok-${Date.now()}`,
            clienteId,
            titulo: 'Documento validado',
            cuerpo: `“${doc?.nombre ?? 'Documento'}” quedó validado en tu expediente.`,
            fecha: nowDate(),
            leida: false,
          tipo: 'sistema' as const,
          },
          ...s.notificaciones,
        ],
        toast: 'Documento validado',
      }
    }),

  aplicarSimulacion: (clienteId, patch) =>
    set((s) => {
      const prev = s.clientes.find((c) => c.id === clienteId)
      if (!prev?.credito) return s
      const antes = snapCredito(prev.credito)
      const plazo = patch.plazo ?? prev.credito.plazo
      let saldo = prev.credito.saldoActual
      if (patch.abonoCapital && patch.abonoCapital > 0) {
        saldo = Math.max(0, saldo - patch.abonoCapital)
      }
      const mensualidad = Math.round(
        mensualidadFrancesa(saldo, plazo, prev.credito.tasaAnual),
      )
      const despues: SnapshotCredito = {
        plazo,
        saldoActual: saldo,
        tasaAnual: prev.credito.tasaAnual,
        mensualidad,
      }
      const log: AjusteCreditoLog = {
        id: `aj-${Date.now()}`,
        clienteId,
        fecha: nowDate(),
        autor: 'Simulador / reestructura',
        resumen: patch.abonoCapital
          ? `Abono capital ${formatSnap(patch.abonoCapital)} · mensualidad ${formatSnap(antes.mensualidad)} → ${formatSnap(despues.mensualidad)}`
          : `Plazo ${antes.plazo} → ${despues.plazo} m · mensualidad ${formatSnap(antes.mensualidad)} → ${formatSnap(despues.mensualidad)}`,
        antes,
        despues,
      }
      return {
        clientes: s.clientes.map((c) => {
          if (c.id !== clienteId || !c.credito) return c
          return {
            ...c,
            credito: {
              ...c.credito,
              plazo,
              saldoActual: saldo,
              mensualidad,
              mensualidadBase: mensualidad,
              recompensaAplicada: false,
            },
          }
        }),
        historialAjustes: [log, ...s.historialAjustes],
        toast: 'Simulación aplicada · historial y amortización actualizados',
        ensayo: { ...s.ensayo, simulador: true },
      }
    }),

  firmarContrato: (clienteId) =>
    set((s) => ({
      clientes: s.clientes.map((c) => {
        if (c.id !== clienteId) return c
        return {
          ...c,
          estatus: 'activo' as const,
          documentos: c.documentos.map((d) =>
            d.nombre.toLowerCase().includes('contrato')
              ? {
                  ...d,
                  estado: 'validado' as const,
                  fechaCarga: nowDate(),
                }
              : d,
          ),
        }
      }),
      toast: 'Contrato firmado · folio activo',
    })),

  aplicarRecompensa: (clienteId) =>
    set((s) => ({
      clientes: s.clientes.map((c) => {
        if (c.id !== clienteId || !c.credito) return c
        if (c.credito.recompensaAplicada) return c
        if (c.pagosPuntualesConsecutivos < 3) return c
        const base = c.credito.mensualidadBase
        const conDesc = Math.round(base * 0.98)
        return {
          ...c,
          credito: {
            ...c.credito,
            mensualidad: conDesc,
            recompensaAplicada: true,
          },
        }
      }),
      toast: 'Recompensa 2% aplicada a la mensualidad',
    })),

  conciliarPago: (pagoId) =>
    set((s) => ({
      clientes: s.clientes.map((c) => ({
        ...c,
        pagos: c.pagos.map((p) =>
          p.id === pagoId
            ? {
                ...p,
                conciliado: true,
                fuentes: ['OpenPay', 'STP', 'Contpaqi'] as const,
              }
            : p,
        ),
      })),
      toast: 'Cruce completo: OpenPay + STP + Contpaqi',
      ensayo: { ...s.ensayo, conciliacion: true },
    })),

  marcarNotificacionesLeidas: (clienteId) =>
    set((s) => ({
      notificaciones: s.notificaciones.map((n) =>
        n.clienteId === clienteId ? { ...n, leida: true } : n,
      ),
    })),
}))
