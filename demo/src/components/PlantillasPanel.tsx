import { useMemo, useState } from 'react'

import AntesAhoraBadge from './AntesAhoraBadge'
import { useDemoStore } from '../store/demoStore'
import type { Plantilla } from '../types'

export default function PlantillasPanel() {
  const plantillas = useDemoStore((s) => s.plantillas)
  const publicar = useDemoStore((s) => s.publicarVersionPlantilla)
  const activar = useDemoStore((s) => s.activarVersionPlantilla)

  const [selectedId, setSelectedId] = useState('')
  const selected = plantillas.find((p) => p.id === selectedId) ?? null

  const activa = useMemo(() => {
    if (!selected) return null
    return (
      selected.versiones.find((v) => v.version === selected.activaVersion) ??
      selected.versiones[selected.versiones.length - 1] ??
      null
    )
  }, [selected])

  const [draft, setDraft] = useState(activa?.contenido ?? '')
  const [nota, setNota] = useState('')
  const [autor, setAutor] = useState('Operaciones')
  const [valorNum, setValorNum] = useState<string>(
    activa?.valorNumerico != null ? String(activa.valorNumerico) : '',
  )

  function selectPlantilla(p: Plantilla) {
    setSelectedId(p.id)
    const v =
      p.versiones.find((x) => x.version === p.activaVersion) ??
      p.versiones[p.versiones.length - 1]
    setDraft(v?.contenido ?? '')
    setValorNum(v?.valorNumerico != null ? String(v.valorNumerico) : '')
    setNota('')
  }

  function loadVersion(version: number) {
    if (!selected) return
    const v = selected.versiones.find((x) => x.version === version)
    if (!v) return
    setDraft(v.contenido)
    setValorNum(v.valorNumerico != null ? String(v.valorNumerico) : '')
  }

  const formularios = plantillas.filter((p) => p.tipo === 'formulario')
  const descuentos = plantillas.filter((p) => p.tipo === 'descuento')

  return (
    <section className="space-y-4">
      <AntesAhoraBadge
        antes="Word / Excel sin control de cambios"
        ahora="plantillas versionadas y activas"
      />

      <p className="text-sm text-gray">
        Edita formularios de captación y políticas de descuento. Cada
        publicación crea una versión; puedes reactivar una anterior.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        <div
          className={`space-y-4 ${selectedId ? 'hidden lg:block' : 'block'}`}
        >
          <Group
            title="Formularios"
            items={formularios}
            selectedId={selectedId}
            onSelect={selectPlantilla}
          />
          <Group
            title="Descuentos / recompensas"
            items={descuentos}
            selectedId={selectedId}
            onSelect={selectPlantilla}
          />
        </div>

        {!selected || !activa ? (
          <div className="hidden rounded-[12px] border border-dashed border-navy/20 bg-white px-4 py-16 text-center text-sm text-gray lg:flex lg:items-center lg:justify-center">
            Elige una plantilla a la izquierda.
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              className="flex min-h-11 w-full items-center gap-2 rounded-[10px] border border-navy/15 bg-white px-3 py-2.5 text-sm font-medium text-navy lg:hidden"
              onClick={() => setSelectedId('')}
            >
              ← Volver a plantillas
            </button>
            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
                    {selected.tipo === 'formulario' ? 'Formulario' : 'Descuento'}
                  </p>
                  <h2 className="text-lg font-semibold text-navy">
                    {selected.nombre}
                  </h2>
                  <p className="text-xs text-gray">{selected.descripcion}</p>
                </div>
                <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-green">
                  Activa v{selected.activaVersion}
                </span>
              </div>

              <label className="mt-4 block text-xs">
                <span className="font-medium text-gray">Contenido (borrador)</span>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 font-mono text-sm text-navy"
                />
              </label>

              {selected.tipo === 'descuento' ? (
                <label className="mt-2 block text-xs">
                  <span className="font-medium text-gray">Valor % </span>
                  <input
                    type="number"
                    step="0.1"
                    value={valorNum}
                    onChange={(e) => setValorNum(e.target.value)}
                    className="mt-1 w-full max-w-[8rem] rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                  />
                </label>
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="block text-xs">
                  <span className="font-medium text-gray">Autor</span>
                  <input
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-medium text-gray">Nota de versión</span>
                  <input
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Qué cambió…"
                    className="mt-1 w-full rounded-[10px] border border-navy/15 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <button
                type="button"
                className="mt-3 rounded-[8px] bg-teal px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  const num =
                    selected.tipo === 'descuento' && valorNum !== ''
                      ? Number(valorNum)
                      : undefined
                  publicar(selected.id, draft, nota, autor, num)
                  setNota('')
                }}
              >
                Publicar nueva versión
              </button>
            </div>

            <div className="rounded-[12px] border border-navy/10 bg-white p-4">
              <p className="text-sm font-semibold text-navy">
                Historial de versiones
              </p>
              <ul className="mt-3 space-y-2">
                {[...selected.versiones].reverse().map((v) => {
                  const isActive = v.version === selected.activaVersion
                  return (
                    <li
                      key={v.version}
                      className={`rounded-[10px] border px-3 py-2 ${
                        isActive
                          ? 'border-teal/40 bg-mint/50'
                          : 'border-navy/10 bg-light'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-navy">
                            v{v.version}
                            {isActive ? ' · activa' : ''}
                            {v.valorNumerico != null
                              ? ` · ${v.valorNumerico}%`
                              : ''}
                          </p>
                          <p className="text-xs text-gray">
                            {v.fecha} · {v.autor} — {v.nota}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="rounded-[6px] border border-navy/15 px-2 py-1 text-[11px] font-medium"
                            onClick={() => loadVersion(v.version)}
                          >
                            Ver / editar
                          </button>
                          {!isActive ? (
                            <button
                              type="button"
                              className="rounded-[6px] bg-navy px-2 py-1 text-[11px] font-semibold text-white"
                              onClick={() => activar(selected.id, v.version)}
                            >
                              Activar
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray">
                        {v.contenido}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Group({
  title,
  items,
  selectedId,
  onSelect,
}: {
  title: string
  items: Plantilla[]
  selectedId: string
  onSelect: (p: Plantilla) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className={`w-full rounded-[12px] border px-3 py-3 text-left ${
                selectedId === p.id
                  ? 'border-teal bg-mint'
                  : 'border-navy/10 bg-white hover:border-teal/40'
              }`}
            >
              <p className="font-medium text-navy">{p.nombre}</p>
              <p className="mt-0.5 text-xs text-gray">
                v{p.activaVersion} activa · {p.versiones.length} versiones
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
