import { useMemo, useState } from 'react'

import { useDemoStore } from '../store/demoStore'

const ITEMS = [
  {
    key: 'tutorial' as const,
    label: 'Tutorial recorrido sin atascos',
    hint: 'Completa o cierra el stepper',
  },
  {
    key: 'folio' as const,
    label: 'Folio único visto en alumno y equipo',
    hint: 'Entra a ambas vistas (mismo número)',
  },
  {
    key: 'simulador' as const,
    label: 'Excel #1: simulador / reestructura',
    hint: 'Aplica una simulación o reestructura',
  },
  {
    key: 'conciliacion' as const,
    label: 'Excel #2: completar cruce',
    hint: 'En Conciliación → Completar cruce',
  },
  {
    key: 'docsCruzados' as const,
    label: 'Docs cruzados alumno ↔ equipo',
    hint: 'Pedir actualización o re-subir',
  },
]

export default function EnsayoPanel() {
  const [open, setOpen] = useState(false)
  const ensayo = useDemoStore((s) => s.ensayo)
  const toggleEnsayo = useDemoStore((s) => s.toggleEnsayo)

  const done = useMemo(
    () => ITEMS.filter((i) => ensayo[i.key]).length,
    [ensayo],
  )

  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-40 sm:left-auto sm:right-4 sm:w-[min(100%-2rem,20rem)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex min-h-11 w-full items-center justify-between gap-2 rounded-[10px] border border-navy/15 bg-white px-3 py-2.5 text-sm font-semibold text-navy shadow-md sm:w-auto sm:justify-start"
      >
        <span>
          Ensayo {done}/{ITEMS.length}
        </span>
        <span className="text-xs font-medium text-teal">
          {open ? 'Ocultar' : 'Ver'}
        </span>
      </button>

      {open ? (
        <div className="mt-2 max-h-[min(50dvh,22rem)] overflow-y-auto rounded-[12px] border border-navy/10 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wide text-teal">
            Checklist &lt;5 min
          </p>
          <p className="mt-1 text-xs text-gray">
            Se marca solo al usar la demo. También puedes tachar a mano.
          </p>
          <ul className="mt-3 space-y-2">
            {ITEMS.map((item) => (
              <li key={item.key}>
                <label className="flex cursor-pointer gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-teal"
                    checked={ensayo[item.key]}
                    onChange={() => toggleEnsayo(item.key)}
                  />
                  <span>
                    <span
                      className={
                        ensayo[item.key]
                          ? 'font-medium text-navy line-through opacity-70'
                          : 'font-medium text-navy'
                      }
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray">
                      {item.hint}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {done === ITEMS.length ? (
            <p className="mt-3 rounded-[8px] bg-mint px-2 py-1.5 text-xs font-semibold text-navy">
              Listo para la reunión. Remate: “¿Cuál Excel duele más?”
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
