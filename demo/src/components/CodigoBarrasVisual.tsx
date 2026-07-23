import { useMemo } from 'react'

import { patronBarras } from '../lib/codigoBarras'

/** Barras visuales mock (no Code128 real) — únicas por código del alumno. */
export default function CodigoBarrasVisual({
  codigo,
  className = '',
}: {
  codigo: string
  className?: string
}) {
  const widths = useMemo(() => patronBarras(codigo), [codigo])

  return (
    <div className={className}>
      <div
        className="flex h-14 items-stretch justify-center gap-px overflow-hidden rounded bg-white px-2 py-1"
        aria-hidden
      >
        {widths.map((w, i) => (
          <span
            key={i}
            className="shrink-0 bg-navy"
            style={{ width: w, opacity: i % 5 === 0 ? 1 : 0.92 }}
          />
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-xs tracking-[0.2em] text-navy">
        {codigo}
      </p>
    </div>
  )
}
