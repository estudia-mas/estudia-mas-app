import type { Vista } from '../store/demoStore'

export type AlumnoTab =
  | 'expediente'
  | 'documentos'
  | 'credito'
  | 'simulador'
  | 'avisos'

export type EquipoTab =
  | 'overview'
  | 'alumnos'
  | 'marketing'
  | 'pipeline'
  | 'conciliacion'
  | 'cobranza'
  | 'finanzas'
  | 'plantillas'

export type DemoUrlState = {
  vista: Vista | null
  alumno: string | null
  /** Cliente seleccionado en pipeline equipo */
  cliente: string | null
  equipo: EquipoTab | null
  tab: AlumnoTab | null
  skipTutorial: boolean
}

const VISTAS: Vista[] = ['landing', 'alumno', 'equipo', 'flujo']
const ALUMNO_TABS: AlumnoTab[] = [
  'expediente',
  'documentos',
  'credito',
  'simulador',
  'avisos',
]
const EQUIPO_TABS: EquipoTab[] = [
  'overview',
  'alumnos',
  'marketing',
  'pipeline',
  'conciliacion',
  'cobranza',
  'finanzas',
  'plantillas',
]

function asOne<T extends string>(value: string | null, allowed: T[]): T | null {
  if (!value) return null
  return (allowed as string[]).includes(value) ? (value as T) : null
}

export function readDemoUrl(): DemoUrlState {
  const p = new URLSearchParams(window.location.search)
  return {
    vista: asOne(p.get('vista'), VISTAS),
    alumno: p.get('alumno'),
    cliente: p.get('cliente'),
    equipo: asOne(p.get('equipo'), EQUIPO_TABS),
    tab: asOne(p.get('tab'), ALUMNO_TABS),
    skipTutorial: p.get('skip') === '1' || p.get('skipTutorial') === '1',
  }
}

export function writeDemoUrl(partial: {
  vista?: Vista
  alumno?: string | null
  cliente?: string | null
  equipo?: EquipoTab | null
  tab?: AlumnoTab | null
  skipTutorial?: boolean
}) {
  const url = new URL(window.location.href)
  const p = url.searchParams

  if (partial.vista != null) {
    if (partial.vista === 'landing') p.delete('vista')
    else p.set('vista', partial.vista)
  }
  if (partial.alumno !== undefined) {
    if (!partial.alumno) p.delete('alumno')
    else p.set('alumno', partial.alumno)
  }
  if (partial.cliente !== undefined) {
    if (!partial.cliente) p.delete('cliente')
    else p.set('cliente', partial.cliente)
  }
  if (partial.equipo !== undefined) {
    if (!partial.equipo || partial.equipo === 'overview') p.delete('equipo')
    else p.set('equipo', partial.equipo)
  }
  if (partial.tab !== undefined) {
    if (!partial.tab || partial.tab === 'expediente') p.delete('tab')
    else p.set('tab', partial.tab)
  }
  if (partial.skipTutorial !== undefined) {
    if (partial.skipTutorial) p.set('skip', '1')
    else p.delete('skip')
  }

  const next = `${url.pathname}${p.toString() ? `?${p}` : ''}${url.hash}`
  window.history.replaceState(null, '', next)
}
