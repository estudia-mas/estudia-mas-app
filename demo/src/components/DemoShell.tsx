import { useEffect, useRef, useState, type ReactNode } from 'react'

import { useDemoStore } from '../store/demoStore'

type Props = {
  children: ReactNode
  folio?: string | null
  title?: string
  /** Layout más ancho (menú lateral equipo) */
  wide?: boolean
  /** Sin padding/max en main — el hijo controla el layout */
  flush?: boolean
}

export default function DemoShell({
  children,
  folio,
  title,
  wide = false,
  flush = false,
}: Props) {
  const openTutorial = useDemoStore((s) => s.openTutorial)
  const setVista = useDemoStore((s) => s.setVista)
  const vista = useDemoStore((s) => s.vista)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointer(e: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function confirmReset() {
    if (
      window.confirm(
        '¿Reiniciar la demo? Se pierden cambios de esta sesión.',
      )
    ) {
      resetDemo()
      setMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen min-h-dvh bg-light">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy text-white safe-pt">
        <div
          className={`mx-auto flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 ${
            wide || flush ? 'max-w-none' : 'max-w-6xl'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex min-h-11 min-w-0 items-center gap-2 text-left sm:gap-3"
              onClick={() => setVista('landing')}
              aria-label="Estudia Más — ir al inicio"
            >
              <img
                src="/brand/logo-estudia-mas.png"
                alt="Estudia Más"
                width={40}
                height={40}
                className="h-9 w-9 shrink-0 rounded-md bg-white object-contain p-0.5 sm:h-11 sm:w-11"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight">
                  Estudia Más
                </span>
                <span className="hidden text-xs text-white/70 sm:block">
                  Demo expediente único
                  {title ? ` · ${title}` : ''}
                </span>
                {title ? (
                  <span className="block truncate text-[11px] text-white/70 sm:hidden">
                    {title}
                  </span>
                ) : null}
              </span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {folio ? (
              <span className="max-w-[7.5rem] truncate rounded-md bg-white/15 px-2 py-1.5 font-mono text-[10px] text-white sm:max-w-none sm:px-2.5 sm:text-xs">
                {folio}
              </span>
            ) : null}

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 md:flex">
              {vista !== 'landing' && vista !== 'flujo' ? (
                <button
                  type="button"
                  className="rounded-[8px] bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
                  onClick={() => setVista('landing')}
                >
                  Cambiar vista
                </button>
              ) : null}
              {vista !== 'flujo' ? (
                <button
                  type="button"
                  className="rounded-[8px] bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
                  onClick={() => setVista('flujo')}
                >
                  Ciclo de vida
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-[8px] bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
                onClick={confirmReset}
              >
                Reiniciar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-teal px-3 py-1.5 text-xs font-semibold text-white"
                onClick={openTutorial}
              >
                ¿Cómo funciona esto?
              </button>
            </div>

            {/* Mobile: ayuda + menú */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-teal text-lg font-bold text-white md:hidden"
              onClick={openTutorial}
              aria-label="Cómo funciona la demo"
            >
              ?
            </button>
            <div className="relative md:hidden" ref={menuRef}>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white/10 text-lg font-bold"
                aria-expanded={menuOpen}
                aria-label="Más opciones"
                onClick={() => setMenuOpen((v) => !v)}
              >
                ⋮
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-full z-40 mt-1.5 w-52 overflow-hidden rounded-[12px] border border-navy/10 bg-white py-1 text-navy shadow-lg">
                  {vista !== 'landing' && vista !== 'flujo' ? (
                    <button
                      type="button"
                      className="block w-full px-4 py-3 text-left text-sm font-medium active:bg-light"
                      onClick={() => {
                        setVista('landing')
                        setMenuOpen(false)
                      }}
                    >
                      Cambiar vista
                    </button>
                  ) : null}
                  {vista !== 'flujo' ? (
                    <button
                      type="button"
                      className="block w-full px-4 py-3 text-left text-sm font-medium active:bg-light"
                      onClick={() => {
                        setVista('flujo')
                        setMenuOpen(false)
                      }}
                    >
                      Ciclo de vida
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="block w-full px-4 py-3 text-left text-sm font-medium active:bg-light"
                    onClick={confirmReset}
                  >
                    Reiniciar demo
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-3 text-left text-sm font-medium text-teal active:bg-light"
                    onClick={() => {
                      openTutorial()
                      setMenuOpen(false)
                    }}
                  >
                    Tutorial
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <main
        className={
          flush
            ? 'w-full safe-pb'
            : `mx-auto px-3 py-4 safe-pb sm:px-4 sm:py-6 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`
        }
      >
        {children}
      </main>
    </div>
  )
}
