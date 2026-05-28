import { useEffect, useState } from 'react'
import { ClipboardList, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const STATUS_STYLES = {
  PENDING:  { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  APPROVED: { cls: 'text-success bg-success/10 border-success/20',       icon: CheckCircle },
  REJECTED: { cls: 'text-danger bg-danger/10 border-danger/20',          icon: XCircle },
}

export default function AdminLeave() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')
  const [actionId, setActionId]   = useState(null)
  const [remarks, setRemarks]     = useState({})
  const [toast, setToast]         = useState(null)

  const showMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const res = await api.get('/leave')
    setRequests(res.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleDecision = async (id, status) => {
    setActionId(id)
    try {
      const r = remarks[id] || ''
      await api.put(`/leave/${id}/status?status=${status}${r ? `&remarks=${encodeURIComponent(r)}` : ''}`)
      showMsg(`Request ${status.toLowerCase()}`)
      await load()
    } catch { showMsg('Action failed', 'error') } finally { setActionId(null) }
  }

  const pending  = requests.filter(r => r.status === 'PENDING').length
  const approved = requests.filter(r => r.status === 'APPROVED').length
  const rejected = requests.filter(r => r.status === 'REJECTED').length

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 ${toast.type === 'error' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-success/10 text-success border-success/30'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      <div>
        <h2 className="page-title">Leave Requests</h2>
        <p className="text-sm font-body text-slate-500 mt-0.5">Review and manage student leave applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',  value: pending,  cls: 'text-amber-400' },
          { label: 'Approved', value: approved, cls: 'text-success' },
          { label: 'Rejected', value: rejected, cls: 'text-danger' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 text-center animate-slide-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <p className={`font-display font-bold text-2xl ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="glass-card rounded-2xl p-4 flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${filter === f ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="xl" /></div> : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ClipboardList className="w-10 h-10 text-slate-700" />
              <p className="font-display font-semibold text-slate-500">No requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/04">
              {filtered.map(req => {
                const style = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING
                const Icon = style.icon
                const isProcessing = actionId === req.id
                return (
                  <div key={req.id} className="p-5 hover:bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-display font-bold text-white text-sm">{req.studentName}</p>
                          <span className="text-xs text-slate-500">{req.studentEmail}</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{req.reason}</p>
                        <p className="text-xs text-slate-500">{req.fromDate} → {req.toDate}</p>
                        {req.adminRemarks && <p className="text-xs text-slate-600 mt-1 italic">Remarks: {req.adminRemarks}</p>}

                        {req.status === 'PENDING' && (
                          <div className="mt-3 flex items-center gap-2">
                            <input value={remarks[req.id] || ''} onChange={e => setRemarks(r => ({ ...r, [req.id]: e.target.value }))}
                              placeholder="Optional remarks..." className="input-field text-xs flex-1 py-1.5" />
                            <button onClick={() => handleDecision(req.id, 'APPROVED')} disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 text-xs font-display font-semibold hover:bg-success/20 transition-all disabled:opacity-50">
                              {isProcessing ? <Spinner size="sm" /> : <CheckCircle className="w-3 h-3" />}Approve
                            </button>
                            <button onClick={() => handleDecision(req.id, 'REJECTED')} disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/20 text-xs font-display font-semibold hover:bg-danger/20 transition-all disabled:opacity-50">
                              <XCircle className="w-3 h-3" />Reject
                            </button>
                          </div>
                        )}
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-display font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${style.cls}`}>
                        <Icon className="w-3 h-3" />{req.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
