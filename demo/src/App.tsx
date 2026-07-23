import { useEffect, useState } from 'react'

import EnsayoPanel from './components/EnsayoPanel'
import TutorialModal from './components/TutorialModal'
import { readDemoUrl, writeDemoUrl } from './lib/demoUrl'
import AlumnoPage from './pages/AlumnoPage'
import EquipoPage from './pages/EquipoPage'
import FlujoCicloPage from './pages/FlujoCicloPage'
import LandingPage from './pages/LandingPage'
import { useDemoStore } from './store/demoStore'

export default function App() {
  const vista = useDemoStore((s) => s.vista)
  const toast = useDemoStore((s) => s.toast)
  const clearToast = useDemoStore((s) => s.clearToast)
  const tutorialOpen = useDemoStore((s) => s.tutorialOpen)
  const closeTutorial = useDemoStore((s) => s.closeTutorial)
  const setVista = useDemoStore((s) => s.setVista)
  const setClienteAlumno = useDemoStore((s) => s.setClienteAlumno)
  const setEquipoTab = useDemoStore((s) => s.setEquipoTab)
  const selectCliente = useDemoStore((s) => s.selectCliente)
  const clienteAlumnoId = useDemoStore((s) => s.clienteAlumnoId)
  const clienteSeleccionadoId = useDemoStore((s) => s.clienteSeleccionadoId)
  const equipoTab = useDemoStore((s) => s.equipoTab)
  const pendingAlumnoTab = useDemoStore((s) => s.pendingAlumnoTab)
  const setPendingAlumnoTab = useDemoStore((s) => s.setPendingAlumnoTab)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [alumnoTabBoot, setAlumnoTabBoot] = useState<string | null>(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const q = readDemoUrl()
    if (q.skipTutorial) closeTutorial()
    if (q.alumno) setClienteAlumno(q.alumno)
    if (q.equipo) setEquipoTab(q.equipo)
    if (q.cliente) selectCliente(q.cliente)
    if (q.tab) setAlumnoTabBoot(q.tab)
    if (q.vista) setVista(q.vista)
    setBooted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!booted) return
    writeDemoUrl({
      vista,
      alumno: vista === 'alumno' ? clienteAlumnoId : null,
      equipo: vista === 'equipo' ? equipoTab : null,
      cliente: vista === 'equipo' ? clienteSeleccionadoId : null,
    })
  }, [booted, vista, clienteAlumnoId, equipoTab, clienteSeleccionadoId])

  useEffect(() => {
    if (tutorialOpen) setTutorialStep(0)
  }, [tutorialOpen])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => clearToast(), 2800)
    return () => window.clearTimeout(t)
  }, [toast, clearToast])

  const initialTab = pendingAlumnoTab ?? alumnoTabBoot

  return (
    <>
      <TutorialModal step={tutorialStep} onStep={setTutorialStep} />
      {vista === 'landing' ? <LandingPage /> : null}
      {vista === 'flujo' ? <FlujoCicloPage /> : null}
      {vista === 'alumno' ? (
        <AlumnoPage
          initialTab={initialTab}
          onInitialTabConsumed={() => {
            setAlumnoTabBoot(null)
            setPendingAlumnoTab(null)
          }}
        />
      ) : null}
      {vista === 'equipo' ? <EquipoPage /> : null}
      <EnsayoPanel />
      {toast ? (
        <div
          role="status"
          className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] left-1/2 z-50 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-[10px] bg-navy px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg sm:bottom-6"
        >
          {toast}
        </div>
      ) : null}
    </>
  )
}
