import { useDemoStore } from '../store/demoStore'

const STEPS = [
  {
    title: 'Demo del expediente único',
    body: 'Demo funcional del ciclo de crédito educativo (minuta): CRM, originación, administración y cobranza. Todo clickeable; datos en memoria.',
  },
  {
    title: 'Un solo folio',
    body: 'Del lead a la liquidación: un cliente, un folio, un expediente digital — sin Excel paralelo ni folios por área.',
  },
  {
    title: 'Sigue el flujo de la minuta',
    body: 'Usa “Recorrer ciclo completo”: captación → docs → Buró → contrato → pagos → cobranza. Cada paso abre la pantalla correcta.',
  },
  {
    title: 'Alumno y equipo',
    body: 'Misma verdad en portal del alumno y operación interna (admin, pipeline, conciliación, cobranza).',
  },
  {
    title: 'Listo para presentar',
    body: 'Panel Ensayo abajo a la derecha. Header: Ciclo de vida para volver a la guía. ¿Cómo funciona esto? si alguien llega tarde.',
  },
]

type Props = {
  step: number
  onStep: (n: number) => void
}

export default function TutorialModal({ step, onStep }: Props) {
  const open = useDemoStore((s) => s.tutorialOpen)
  const finishTutorial = useDemoStore((s) => s.finishTutorial)
  const closeTutorial = useDemoStore((s) => s.closeTutorial)

  if (!open) return null

  const last = step >= STEPS.length - 1
  const current = STEPS[step] ?? STEPS[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="tutorial-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[16px] bg-white p-5 shadow-sm safe-pb sm:rounded-[12px] sm:p-6"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-navy/15 sm:hidden" />
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-teal">
          Paso {step + 1} de {STEPS.length}
        </p>
        <h2 id="tutorial-title" className="text-xl font-semibold text-navy">
          {current.title}
        </h2>
        <p className="mt-3 text-gray leading-relaxed">{current.body}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="min-h-11 py-2 text-sm text-gray underline-offset-2 hover:underline sm:min-h-0"
            onClick={closeTutorial}
          >
            Saltar
          </button>
          <div className="flex gap-2">
            {step > 0 ? (
              <button
                type="button"
                className="min-h-11 flex-1 rounded-[10px] border border-navy/15 px-4 py-2.5 text-sm font-medium text-navy sm:min-h-0 sm:flex-none"
                onClick={() => onStep(step - 1)}
              >
                Atrás
              </button>
            ) : null}
            {last ? (
              <button
                type="button"
                className="min-h-11 flex-1 rounded-[10px] bg-teal px-4 py-2.5 text-sm font-semibold text-white sm:min-h-0 sm:flex-none"
                onClick={finishTutorial}
              >
                Empezar recorrido
              </button>
            ) : (
              <button
                type="button"
                className="min-h-11 flex-1 rounded-[10px] bg-navy px-4 py-2.5 text-sm font-semibold text-white sm:min-h-0 sm:flex-none"
                onClick={() => onStep(step + 1)}
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
