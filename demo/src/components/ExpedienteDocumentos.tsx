import { useEffect, useRef, useState } from 'react'

import {
  archivoDesdeTexto,
  descargarArchivoMemoria,
  formatBytes,
  leerArchivoComoMemoria,
} from '../lib/archivoMemoria'
import type { Documento, DocumentoEstado } from '../types'
import { useDemoStore } from '../store/demoStore'

const ESTADO_LABEL: Record<DocumentoEstado, string> = {
  pendiente: 'Pendiente',
  cargado: 'Cargado',
  validado: 'Validado',
  requiere_actualizacion: 'Requiere actualización',
}

type Props = {
  clienteId: string
  folio: string
  documentos: Documento[]
  modo: 'alumno' | 'equipo'
}

export default function ExpedienteDocumentos({
  clienteId,
  folio,
  documentos,
  modo,
}: Props) {
  const subirDocumento = useDemoStore((s) => s.subirDocumento)
  const comentarDocumento = useDemoStore((s) => s.comentarDocumento)
  const solicitarActualizacionDocumento = useDemoStore(
    (s) => s.solicitarActualizacionDocumento,
  )
  const validarDocumento = useDemoStore((s) => s.validarDocumento)
  const showToast = useDemoStore((s) => s.showToast)
  const clienteNombre =
    useDemoStore((s) => s.clientes.find((c) => c.id === clienteId)?.nombre) ??
    'Alumno'

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const docsKey = documentos.map((d) => `${d.id}:${d.estado}:${d.archivo?.version ?? 0}`).join('|')
  useEffect(() => {
    const priority =
      documentos.find((d) => d.estado === 'requiere_actualizacion') ??
      documentos.find((d) => d.estado === 'cargado') ??
      documentos.find((d) => d.estado === 'pendiente') ??
      documentos[0]
    setOpenId(priority?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, docsKey])

  function setDraft(docId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [docId]: value }))
  }

  function downloadDoc(doc: Documento) {
    if (!doc.archivo) {
      showToast('Aún no hay archivo en memoria para este documento')
      return
    }
    descargarArchivoMemoria(doc.archivo, folio)
    showToast(`Descargado: ${doc.archivo.nombreArchivo} (memoria de sesión)`)
  }

  async function onFileChosen(doc: Documento, file: File | null) {
    if (!file) return
    setBusyId(doc.id)
    try {
      const archivo = await leerArchivoComoMemoria(
        file,
        (doc.archivo?.version ?? 0) + 1,
      )
      subirDocumento(clienteId, doc.id, {
        notaAlumno: drafts[doc.id] || undefined,
        archivo,
      })
      setDraft(doc.id, '')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo subir')
    } finally {
      setBusyId(null)
      const input = fileRefs.current[doc.id]
      if (input) input.value = ''
    }
  }

  function subirEjemplo(doc: Documento) {
    const version = (doc.archivo?.version ?? 0) + 1
    const nota = drafts[doc.id]
    const texto = [
      `Documento: ${doc.nombre}`,
      `Folio: ${folio}`,
      `Alumno: ${clienteNombre}`,
      `Versión: ${version}`,
      `Generado: ${new Date().toISOString()}`,
      '',
      'Este archivo vive en la memoria de la demo (Zustand).',
      'Descárgalo desde Estudia Más; el equipo ve el mismo contenido.',
      nota ? `Nota: ${nota}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const archivo = archivoDesdeTexto(
      texto,
      `${doc.nombre.replace(/\s+/g, '_')}_v${version}.txt`,
      'text/plain',
      version,
    )
    subirDocumento(clienteId, doc.id, {
      notaAlumno: nota || undefined,
      archivo,
    })
    setDraft(doc.id, '')
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray">
        Los archivos se guardan en <strong>memoria de sesión</strong> (no en
        disco ni localStorage). Sube un archivo real o un ejemplo; luego
        descárgalo desde Estudia Más. El alumno puede reemplazar versiones.
      </p>
      {documentos.map((doc) => {
        const open = openId === doc.id
        const draft = drafts[doc.id] ?? ''
        const canDownload = Boolean(doc.archivo)
        const alumnoPuedeSubir = modo === 'alumno'
        return (
          <div
            key={doc.id}
            className={`rounded-[12px] border bg-white ${
              doc.estado === 'requiere_actualizacion'
                ? 'border-lime/50'
                : 'border-navy/10'
            }`}
          >
            <button
              type="button"
              className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
              onClick={() => setOpenId(open ? null : doc.id)}
            >
              <div>
                <p className="font-medium text-navy">{doc.nombre}</p>
                <p className="text-xs text-gray">
                  {ESTADO_LABEL[doc.estado]}
                  {doc.fechaCarga ? ` · ${doc.fechaCarga}` : ''}
                  {doc.archivo
                    ? ` · v${doc.archivo.version} · ${doc.archivo.nombreArchivo}`
                    : ' · sin archivo'}
                  {doc.comentarios.length
                    ? ` · ${doc.comentarios.length} comentario${doc.comentarios.length === 1 ? '' : 's'}`
                    : ''}
                </p>
              </div>
              <span className="text-xs text-teal">{open ? 'Ocultar' : 'Ver'}</span>
            </button>

            {open ? (
              <div className="space-y-3 border-t border-navy/5 px-4 py-3">
                {doc.archivo ? (
                  <div className="rounded-[10px] bg-light px-3 py-2 text-xs text-gray">
                    <p>
                      En memoria:{' '}
                      <strong className="text-navy">
                        {doc.archivo.nombreArchivo}
                      </strong>
                    </p>
                    <p>
                      {formatBytes(doc.archivo.size)} · {doc.archivo.mimeType} ·
                      v{doc.archivo.version} · {doc.archivo.subidoEn}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray">
                    Todavía no hay archivo en memoria. Súbelo para poder
                    descargarlo.
                  </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {canDownload ? (
                    <button
                      type="button"
                      className="min-h-11 rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm font-medium sm:min-h-0 sm:rounded-[8px] sm:py-1.5 sm:text-xs"
                      onClick={() => downloadDoc(doc)}
                    >
                      Descargar desde Estudia Más
                    </button>
                  ) : null}

                  {alumnoPuedeSubir ? (
                    <>
                      <input
                        ref={(el) => {
                          fileRefs.current[doc.id] = el
                        }}
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx,image/*,application/pdf,text/plain"
                        onChange={(e) =>
                          onFileChosen(doc, e.target.files?.[0] ?? null)
                        }
                      />
                      <button
                        type="button"
                        disabled={busyId === doc.id}
                        className="min-h-11 rounded-[10px] bg-teal px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40 sm:min-h-0 sm:rounded-[8px] sm:py-1.5 sm:text-xs"
                        onClick={() => fileRefs.current[doc.id]?.click()}
                      >
                        {busyId === doc.id
                          ? 'Subiendo…'
                          : doc.archivo
                            ? 'Cambiar / reemplazar archivo'
                            : 'Subir archivo'}
                      </button>
                      <button
                        type="button"
                        className="min-h-11 rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm font-medium sm:min-h-0 sm:rounded-[8px] sm:py-1.5 sm:text-xs"
                        onClick={() => subirEjemplo(doc)}
                      >
                        {doc.archivo
                          ? 'Reemplazar con ejemplo (memoria)'
                          : 'Subir ejemplo (memoria)'}
                      </button>
                    </>
                  ) : null}

                  {modo === 'equipo' &&
                  (doc.estado === 'cargado' ||
                    doc.estado === 'requiere_actualizacion') ? (
                    <button
                      type="button"
                      className="min-h-11 rounded-[10px] bg-green px-3 py-2.5 text-sm font-semibold text-white sm:min-h-0 sm:rounded-[8px] sm:py-1.5 sm:text-xs"
                      onClick={() => validarDocumento(clienteId, doc.id)}
                    >
                      Validar
                    </button>
                  ) : null}
                </div>

                {doc.comentarios.length > 0 ? (
                  <ul className="space-y-2 rounded-[10px] bg-light p-3">
                    {doc.comentarios.map((c) => (
                      <li key={c.id} className="text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-navy">
                            {c.autorNombre}
                          </span>
                          {c.tipo === 'solicitud_cambio' ? (
                            <span className="rounded bg-lime/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-lime">
                              Pedir cambio
                            </span>
                          ) : (
                            <span className="rounded bg-navy/5 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray">
                              {c.autor === 'equipo' ? 'Equipo' : 'Alumno'}
                            </span>
                          )}
                          <span className="text-xs text-gray">{c.fecha}</span>
                        </div>
                        <p className="mt-0.5 text-gray">{c.texto}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray">Sin comentarios todavía.</p>
                )}

                {modo === 'equipo' && canDownload ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-navy">
                      Escribe un comentario o pide un cambio
                    </label>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(doc.id, e.target.value)}
                      rows={2}
                      placeholder="Ej. La INE está borrosa; sube una foto más nítida del frente y reverso."
                      className="w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm text-navy"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!draft.trim()}
                        className="rounded-[8px] border border-navy/15 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                        onClick={() => {
                          comentarDocumento(clienteId, doc.id, draft)
                          setDraft(doc.id, '')
                        }}
                      >
                        Solo comentar
                      </button>
                      <button
                        type="button"
                        disabled={!draft.trim()}
                        className="rounded-[8px] bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                        onClick={() => {
                          solicitarActualizacionDocumento(
                            clienteId,
                            doc.id,
                            draft,
                          )
                          setDraft(doc.id, '')
                        }}
                      >
                        Pedir actualización al alumno
                      </button>
                    </div>
                  </div>
                ) : null}

                {modo === 'alumno' ? (
                  <div className="space-y-2 rounded-[10px] border border-navy/10 bg-mint/30 p-3">
                    <p className="text-xs font-semibold text-navy">
                      {doc.estado === 'requiere_actualizacion'
                        ? 'El equipo pidió una nueva versión. Opcional: nota al reemplazar.'
                        : 'Nota opcional al subir o cambiar el archivo'}
                    </p>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(doc.id, e.target.value)}
                      rows={2}
                      placeholder="Ej. Subí el reverso más nítido."
                      className="w-full rounded-[10px] border border-navy/15 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
