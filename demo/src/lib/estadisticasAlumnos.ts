import type { Cliente } from '../types'
import { ESTATUS_LABEL } from '../types'

export type StatRow = {
  label: string
  count: number
  pct: number
}

function countBy(
  items: string[],
  total: number,
): StatRow[] {
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
        c.formularioCompleto ? c.universidad || 'Sin dato' : 'Pendiente formulario',
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
