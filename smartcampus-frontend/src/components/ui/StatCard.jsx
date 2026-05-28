export function StatCard({ label, value, icon: Icon, color, trend, subtitle }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  icon: 'text-indigo-400',  glow: 'shadow-[0_0_20px_rgba(99,102,241,0.12)]' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]' },
    violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  icon: 'text-violet-400',  glow: 'shadow-[0_0_20px_rgba(139,92,246,0.12)]' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: 'text-amber-400',   glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]' },
    sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     icon: 'text-sky-400',     glow: 'shadow-[0_0_20px_rgba(14,165,233,0.12)]' },
    teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    icon: 'text-teal-400',    glow: 'shadow-[0_0_20px_rgba(20,184,166,0.12)]' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className={`stat-card ${c.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label">{label}</p>
          <p className="font-display font-bold text-3xl text-white mt-1.5 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs font-body text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/05 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${trend >= 0 ? 'bg-success' : 'bg-danger'} animate-pulse-soft`} />
          <span className="text-xs font-body text-slate-500">Live data from backend</span>
        </div>
      )}
    </div>
  )
}
