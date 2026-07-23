import type { Cliente, EstatusCliente } from '../types'
import { ESTATUS_LABEL } from '../types'

export type StatRow = {
  label: string
  count: number
  pct: number
}

function countBy(items: string[], total: number): StatRow[] {
  const map = new Map<string, number>()
  for (const k of items) {
    const key = k.trim() || 'Sin dato'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({
      label,
      count,
      pct: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
}

function edadBucket(edad: number): string {
  if (!edad || edad <= 0) return 'Sin dato'
  if (edad < 18) return '< 18'
  if (edad <= 21) return '18–21'
  if (edad <= 24) return '22–24'
  if (edad <= 27) return '25–27'
  if (edad <= 30) return '28–30'
  return '31+'
}

export type EstadisticasAlumnos = {
  total: number
  conFormulario: number
  pendientesFormulario: number
  porSexo: StatRow[]
  porEdad: StatRow[]
  porUniversidad: StatRow[]
  porCarrera: StatRow[]
  porEntidad: StatRow[]
  porEstatus: StatRow[]
  porOrigenAlta: StatRow[]
  edadPromedio: number | null
}

/** Filtros de consulta tipo “fetch” sobre el padrón. */
export type ConsultaFiltros = {
  sexo: 'todos' | 'H' | 'M' | 'X'
  modoEdad: 'cualquiera' | 'exacta' | 'rango'
  edadExacta: number | ''
  edadMin: number | ''
  edadMax: number | ''
  universidad: string
  carrera: string
  entidad: string
  estatus: 'todos' | EstatusCliente
  origenAlta: 'todos' | 'alumno' | 'equipo'
  soloFormularioCompleto: boolean
  enMora: 'todos' | 'si' | 'no'
}

export const CONSULTA_FILTROS_VACIOS: ConsultaFiltros = {
  sexo: 'todos',
  modoEdad: 'cualquiera',
  edadExacta: '',
  edadMin: '',
  edadMax: '',
  universidad: '',
  carrera: '',
  entidad: '',
  estatus: 'todos',
  origenAlta: 'todos',
  soloFormularioCompleto: true,
  enMora: 'todos',
}

export type ConsultaResultado = {
  totalUniverso: number
  coincidencias: number
  pct: number
  resumen: string
  alumnos: Cliente[]
}

export function opcionesDistinct(
  clientes: Cliente[],
  key: 'universidad' | 'carrera' | 'entidadNacimiento',
): string[] {
  const set = new Set<string>()
  for (const c of clientes) {
    if (!c.formularioCompleto) continue
    const v = c[key]?.trim()
    if (v) set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
}

export function filtrarAlumnos(
  clientes: Cliente[],
  f: ConsultaFiltros,
): ConsultaResultado {
  const totalUniverso = clientes.length
  const alumnos = clientes.filter((c) => {
    if (f.soloFormularioCompleto && !c.formularioCompleto) return false

    if (f.sexo !== 'todos') {
      if (!c.formularioCompleto || c.sexo !== f.sexo) return false
    }

    if (f.modoEdad === 'exacta' && f.edadExacta !== '') {
      if (!c.formularioCompleto || c.edad !== Number(f.edadExacta)) return false
    }
    if (f.modoEdad === 'rango') {
      if (!c.formularioCompleto || c.edad <= 0) return false
      if (f.edadMin !== '' && c.edad < Number(f.edadMin)) return false
      if (f.edadMax !== '' && c.edad > Number(f.edadMax)) return false
    }

    if (f.universidad) {
      if (
        !c.formularioCompleto ||
        c.universidad.toLowerCase() !== f.universidad.toLowerCase()
      )
        return false
    }
    if (f.carrera) {
      if (
        !c.formularioCompleto ||
        c.carrera.toLowerCase() !== f.carrera.toLowerCase()
      )
        return false
    }
    if (f.entidad) {
      if (
        !c.formularioCompleto ||
        c.entidadNacimiento.toLowerCase() !== f.entidad.toLowerCase()
      )
        return false
    }

    if (f.estatus !== 'todos' && c.estatus !== f.estatus) return false
    if (f.origenAlta !== 'todos' && c.origenAlta !== f.origenAlta) return false
    if (f.enMora === 'si' && !c.enMora) return false
    if (f.enMora === 'no' && c.enMora) return false

    return true
  })

  const coincidencias = alumnos.length
  const pct =
    totalUniverso === 0
      ? 0
      : Math.round((coincidencias / totalUniverso) * 1000) / 10

  const partes: string[] = []
  if (f.sexo !== 'todos') {
    partes.push(
      f.sexo === 'H' ? 'hombres' : f.sexo === 'M' ? 'mujeres' : 'otro sexo',
    )
  }
  if (f.modoEdad === 'exacta' && f.edadExacta !== '') {
    partes.push(`de ${f.edadExacta} años`)
  }
  if (f.modoEdad === 'rango') {
    const min = f.edadMin === '' ? '…' : f.edadMin
    const max = f.edadMax === '' ? '…' : f.edadMax
    partes.push(`entre ${min} y ${max} años`)
  }
  if (f.universidad) partes.push(`en ${f.universidad}`)
  if (f.carrera) partes.push(`carrera ${f.carrera}`)
  if (f.entidad) partes.push(`nacidos en ${f.entidad}`)
  if (f.estatus !== 'todos') partes.push(`estatus ${ESTATUS_LABEL[f.estatus]}`)
  if (f.origenAlta !== 'todos') {
    partes.push(
      f.origenAlta === 'equipo' ? 'invitados por equipo' : 'cuenta propia',
    )
  }
  if (f.enMora === 'si') partes.push('en mora')
  if (f.enMora === 'no') partes.push('al corriente')

  const resumen =
    partes.length === 0
      ? `Todos los alumnos${f.soloFormularioCompleto ? ' con formulario completo' : ''}`
      : `Alumnos ${partes.join(', ')}`

  return { totalUniverso, coincidencias, pct, resumen, alumnos }
}

export function buildEstadisticasAlumnos(
  clientes: Cliente[],
): EstadisticasAlumnos {
  const total = clientes.length
  const conFormulario = clientes.filter((c) => c.formularioCompleto).length
  const pendientesFormulario = total - conFormulario

  const conEdad = clientes.filter((c) => c.formularioCompleto && c.edad > 0)
  const edadPromedio =
    conEdad.length === 0
      ? null
      : Math.round(
          (conEdad.reduce((a, c) => a + c.edad, 0) / conEdad.length) * 10,
        ) / 10

  return {
    total,
    conFormulario,
    pendientesFormulario,
    porSexo: countBy(
      clientes.map((c) =>
        !c.formularioCompleto
          ? 'Pendiente formulario'
          : c.sexo === 'H'
            ? 'Hombre'
            : c.sexo === 'M'
              ? 'Mujer'
              : 'No binario / otro',
      ),
      total,
    ),
    porEdad: countBy(
      clientes.map((c) =>
        c.formularioCompleto ? edadBucket(c.edad) : 'Sin dato',
      ),
      total,
    ),
    porUniversidad: countBy(
      clientes.map((c) =>
        c.formularioCompleto
          ? c.universidad || 'Sin dato'
          : 'Pendiente formulario',
      ),
      total,
    ),
    porCarrera: countBy(
      clientes.map((c) =>
        c.formularioCompleto ? c.carrera || 'Sin dato' : 'Pendiente formulario',
      ),
      total,
    ),
    porEntidad: countBy(
      clientes.map((c) =>
        c.formularioCompleto
          ? c.entidadNacimiento || 'Sin dato'
          : 'Pendiente formulario',
      ),
      total,
    ),
    porEstatus: countBy(
      clientes.map((c) => ESTATUS_LABEL[c.estatus]),
      total,
    ),
    porOrigenAlta: countBy(
      clientes.map((c) =>
        c.origenAlta === 'equipo' ? 'Invitación equipo' : 'Cuenta del alumno',
      ),
      total,
    ),
    edadPromedio,
  }
}
