import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Spinner } from './LoadingSpinner'

export function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
      <div className="relative z-10 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-danger/15 border border-danger/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-white text-lg">{title}</h3>
            <p className="font-body text-slate-400 text-sm mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="btn-danger disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
            {loading && <Spinner size="sm" />}
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function FormModal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`glass-card rounded-2xl w-full ${maxWidth} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/08">
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/05">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </Modal>
  )
}
