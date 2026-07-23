import type { ArchivoEnMemoria } from '../types'
import { archivoDataUrl } from '../lib/archivoMemoria'

export default function FotoAlumno({
  foto,
  nombre,
  size = 'md',
  className = '',
}: {
  foto: ArchivoEnMemoria | null
  nombre: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dim =
    size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-28 w-28' : 'h-16 w-16'
  const initials = nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  if (foto?.dataBase64) {
    return (
      <img
        src={archivoDataUrl(foto)}
        alt={`Foto de ${nombre}`}
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-navy/10 ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy ring-2 ring-navy/10 ${className}`}
      aria-label="Sin foto"
    >
      {initials || '?'}
    </div>
  )
}
