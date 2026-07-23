import { useState } from 'react'

import DemoShell from '../components/DemoShell'
import { FLUJO_CICLO, type FlujoPaso } from '../data/flujoCiclo'
import { useDemoStore } from '../store/demoStore'

const AREA_COLOR: Record<FlujoPaso['area'], string> = {
  CRM: 'bg-navy text-white',
  Originación: 'bg-teal text-white',
  Administración: 'bg-navy/80 text-white',
  Cobranza: 'bg-lime text-white',
}

export default function FlujoCicloPage() {
  const [activo, setActivo] = useState(0)
  const setVista = useDemoStore((s) => s.setVista)
  const setEquipoTab = useDemoStore((s) => s.setEquipoTab)
  const selectCliente = useDemoStore((s) => s.selectCliente)
  const setClienteAlumno = useDemoStore((s) => s.setClienteAlumno)
  const setPendingAlumnoTab = useDemoStore((s) => s.setPendingAlumnoTab)
  const closeTutorial = useDemoStore((s) => s.closeTutorial)

  function irA(paso: FlujoPaso, index: number) {
    setActivo(index)
    closeTutorial()

    if (paso.vista === 'alumno') {
      if (paso.alumno) setClienteAlumno(paso.alumno)
      setPendingAlumnoTab(paso.tab ?? 'expediente')
      setVista('alumno')
      return
    }

    if (paso.vista === 'equipo') {
      if (paso.equipo) setEquipoTab(paso.equipo)
      selectCliente(paso.cliente ?? null)
      setVista('equipo')
      return
    }

    setVista(paso.vista)
  }

  const actual = FLUJO_CICLO[activo] ?? FLUJO_CICLO[0]

  return (
    <DemoShell title="Ciclo de vida del crédito">
      <div className="mb-5 rounded-[14px] border-2 border-teal/30 bg-white p-3 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
          Minuta · flujo general
        </p>
        <h1 className="mt-1 text-xl font-semibold text-navy sm:text-2xl">
          Del lead a la liquidación — en un solo sistema
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray">
          Recorre el ciclo de la minuta de requerimientos. Cada paso abre la
          pantalla de la demo donde se ve el quick win (sin Excel paralelo).
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(['CRM', 'Originación', 'Administración', 'Cobranza'] as const).map(
            (a) => (
              <span
                key={a}
                className={`rounded-md px-2 py-1 font-semibold ${AREA_COLOR[a]}`}
              >
                {a}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <ol className="space-y-2">
          {FLUJO_CICLO.map((paso, i) => {
            const on = i === activo
            return (
              <li key={paso.id}>
                <button
                  type="button"
                  onClick={() => setActivo(i)}
                  className={`flex w-full items-start gap-3 rounded-[12px] border px-3 py-3 text-left transition ${
                    on
                      ? 'border-teal bg-mint'
                      : 'border-navy/10 bg-white hover:border-teal/40'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      on ? 'bg-teal text-white' : 'bg-navy/10 text-navy'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy">{paso.label}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${AREA_COLOR[paso.area]}`}
                      >
                        {paso.area}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-gray">
                      {paso.detalle}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="h-fit rounded-[14px] border border-navy/10 bg-white p-4 sm:p-5 lg:sticky lg:top-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal">
            Paso {activo + 1} de {FLUJO_CICLO.length}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-navy">{actual.label}</h2>
          <p className="mt-2 text-sm text-gray">{actual.detalle}</p>
          <blockquote className="mt-4 rounded-[10px] border-l-4 border-teal bg-mint/60 px-3 py-2 text-sm font-medium text-navy">
            “{actual.habla}”
          </blockquote>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="min-h-11 rounded-[10px] bg-teal px-4 py-2.5 text-sm font-semibold text-white"
              onClick={() => irA(actual, activo)}
            >
              Abrir en la demo →
            </button>
            {activo < FLUJO_CICLO.length - 1 ? (
              <button
                type="button"
                className="min-h-11 rounded-[10px] border border-navy/15 px-4 py-2.5 text-sm font-medium text-navy"
                onClick={() => setActivo(activo + 1)}
              >
                Siguiente paso
              </button>
            ) : (
              <button
                type="button"
                className="min-h-11 rounded-[10px] bg-navy px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => irA(actual, activo)}
              >
                Ver cierre en expediente
              </button>
            )}
            {activo > 0 ? (
              <button
                type="button"
                className="min-h-11 rounded-[10px] border border-navy/15 px-3 py-2.5 text-sm text-navy"
                onClick={() => setActivo(activo - 1)}
              >
                Anterior
              </button>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-gray">
            Tip: en el header, <strong>Ciclo de vida</strong> te regresa a esta
            guía en cualquier momento.
          </p>
        </div>
      </div>
    </DemoShell>
  )
}
