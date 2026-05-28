import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error:   <XCircle className="w-5 h-5 text-danger" />,
  warning: <AlertCircle className="w-5 h-5 text-warning" />,
  info:    <Info className="w-5 h-5 text-info" />,
}
const BORDERS = {
  success: 'border-success/40',
  error:   'border-danger/40',
  warning: 'border-warning/40',
  info:    'border-info/40',
}

function Toast({ id, message, type, onRemove }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl glass-card border ${BORDERS[type]}
                     animate-slide-down min-w-[300px] max-w-[400px] shadow-2xl`}>
      <span className="mt-0.5 shrink-0">{ICONS[type]}</span>
      <p className="font-body text-sm text-slate-200 flex-1 leading-relaxed">{message}</p>
      <button onClick={() => onRemove(id)} className="mt-0.5 text-slate-500 hover:text-slate-300 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}
