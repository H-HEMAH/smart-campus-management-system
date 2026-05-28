export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-[3px]',
    xl: 'w-14 h-14 border-4',
  }
  return (
    <div className={`${sizes[size]} rounded-full border-accent/20 border-t-accent animate-spin ${className}`} />
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="font-display text-slate-400 text-sm tracking-widest uppercase">Loading…</p>
      </div>
    </div>
  )
}

export function TableLoader({ cols = 5, rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-navy-700 rounded-lg" style={{ width: `${60 + ((i + j) % 4) * 10}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
