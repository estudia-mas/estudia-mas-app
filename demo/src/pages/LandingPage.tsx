import { useDemoStore } from '../store/demoStore'
import DemoShell from '../components/DemoShell'

const SHORTCUTS = [
  {
    href: '?vista=flujo&skip=1',
    label: 'Ciclo de vida (minuta)',
    hint: 'Lead → liquidación paso a paso',
  },
  {
    href: '?vista=equipo&equipo=alumnos&cliente=c1&skip=1',
    label: 'Admin · ficha Ana',
    hint: 'Datos, ajustes y mensajes',
  },
  {
    href: '?vista=alumno&alumno=c1&tab=simulador&skip=1',
    label: 'Ana · simulador',
    hint: 'Excel killer #1',
  },
  {
    href: '?vista=alumno&alumno=c2&tab=documentos&skip=1',
    label: 'Diego · documentos',
    hint: 'Flujo cruzado',
  },
  {
    href: '?vista=equipo&equipo=pipeline&cliente=c5&skip=1',
    label: 'Valeria · firmar',
    hint: 'Pipeline + contrato',
  },
  {
    href: '?vista=equipo&equipo=conciliacion&skip=1',
    label: 'Equipo · conciliación',
    hint: 'Excel killer #2',
  },
  {
    href: '?vista=equipo&equipo=cobranza&skip=1',
    label: 'Equipo · cobranza',
    hint: 'Mora + recompensa',
  },
]

export default function LandingPage() {
  const setVista = useDemoStore((s) => s.setVista)

  return (
    <DemoShell title="Elegir recorrido">
      <div className="mx-auto max-w-2xl px-1 text-center sm:px-0">
        <img
          src="/brand/logo-estudia-mas.png"
          alt="Estudia Más"
          width={112}
          height={112}
          className="mx-auto mb-4 h-20 w-20 object-contain sm:mb-6 sm:h-28 sm:w-28"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
          ¿Cómo quieres recorrer la demo?
        </h1>
        <p className="mt-3 text-sm text-gray sm:text-base">
          Sin login real. Un folio del lead a la liquidación — alumno y equipo.
        </p>
        <p className="mt-4 rounded-[10px] border border-teal/25 bg-mint px-3 py-2 text-left text-xs text-navy sm:text-center">
          Recomendado: <strong>Ciclo de vida</strong> (sigue la minuta), o entra
          directo como alumno / equipo. Panel <strong>Ensayo</strong> abajo a la
          derecha.
        </p>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4">
          <button
            type="button"
            onClick={() => setVista('flujo')}
            className="rounded-[12px] border-2 border-teal bg-white p-4 text-left shadow-sm transition hover:bg-mint/40 sm:p-6"
          >
            <span className="inline-block rounded-md bg-teal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Recomendado · minuta
            </span>
            <span className="mt-2 block text-sm font-medium text-teal">
              Flujo integral
            </span>
            <span className="mt-1 block text-lg font-semibold text-navy">
              Recorrer ciclo completo
            </span>
            <span className="mt-2 block text-sm text-gray">
              Captación → docs → Buró → contrato → pagos → cobranza → liquidación.
            </span>
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setVista('alumno')}
              className="rounded-[12px] border border-navy/10 bg-white p-6 text-left shadow-sm transition hover:border-teal"
            >
              <span className="text-sm font-medium text-teal">Portal</span>
              <span className="mt-1 block text-lg font-semibold text-navy">
                Entrar como alumno
              </span>
              <span className="mt-2 block text-sm text-gray">
                Expediente, documentos, crédito, simulador y avisos.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVista('equipo')}
              className="rounded-[12px] border border-navy/10 bg-white p-6 text-left shadow-sm transition hover:border-teal"
            >
              <span className="text-sm font-medium text-teal">Operación</span>
              <span className="mt-1 block text-lg font-semibold text-navy">
                Entrar como equipo Estudia+
              </span>
              <span className="mt-2 block text-sm text-gray">
                Admin alumnos, marketing, pipeline, conciliación y cobranza.
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-left">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray">
            Atajos presentador (deep-link)
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SHORTCUTS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="rounded-[10px] border border-navy/10 bg-white px-3 py-2 text-sm transition hover:border-teal"
              >
                <span className="font-semibold text-navy">{s.label}</span>
                <span className="mt-0.5 block text-xs text-gray">{s.hint}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DemoShell>
  )
}
