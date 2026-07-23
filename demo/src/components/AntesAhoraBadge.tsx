type Props = {
  antes: string
  ahora: string
  className?: string
}

/** Badge comercial Antes / Ahora — argumento central de la demo. */
export default function AntesAhoraBadge({ antes, ahora, className = '' }: Props) {
  return (
    <div
      className={`flex w-full max-w-xl flex-col gap-1 overflow-hidden rounded-[12px] border-2 border-teal/40 bg-white shadow-sm sm:flex-row sm:items-stretch ${className}`}
      role="note"
    >
      <div className="flex-1 bg-navy/[0.04] px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray">
          Antes
        </p>
        <p className="text-sm font-medium text-navy/80 line-through decoration-navy/30">
          {antes}
        </p>
      </div>
      <div className="flex items-center justify-center bg-teal px-2 py-1 text-xs font-bold text-white sm:px-3">
        →
      </div>
      <div className="flex-1 bg-mint px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal">
          Ahora
        </p>
        <p className="text-sm font-semibold text-navy">{ahora}</p>
      </div>
    </div>
  )
}
