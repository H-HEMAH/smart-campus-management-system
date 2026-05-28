import { useEffect, useState } from 'react'
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const STATUS_STYLES = {
  PENDING:  { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock,        label: 'Pending' },
  APPROVED: { cls: 'text-success bg-success/10 border-success/20',       icon: CheckCircle,  label: 'Approved' },
  REJECTED: { cls: 'text-danger bg-danger/10 border-danger/20',          icon: XCircle,      label: 'Rejected' },
}

export default function StudentLeave() {
  const { user } = useAuth()
  const [requests, setRequests]       = useState([])
  const [studentRecord, setStudentRecord] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [toast, setToast]             = useState(null)
  const [form, setForm]               = useState({ reason: '', fromDate: '', toDate: '' })

  const showMsg = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    try {
      const sRes = await api.get('/student')
      const found = sRes.data.find(s => s.email?.toLowerCase() === user?.email?.toLowerCase())
      setStudentRecord(found || null)
      const lRes = await api.get(`/leave/student?email=${encodeURIComponent(user?.email)}`)
      setRequests(lRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  const handleSubmit = async () => {
    if (!form.reason || !form.fromDate || !form.toDate) return showMsg('Please fill all fields', 'error')
    if (new Date(form.toDate) < new Date(form.fromDate)) return showMsg('End date must be after start date', 'error')
    setSubmitting(true)
    try {
      await api.post('/leave', {
        studentId:    studentRecord?.id,
        studentName:  studentRecord?.name || user?.email,
        studentEmail: user?.email,
        reason:       form.reason,
        fromDate:     form.fromDate,
        toDate:       form.toDate,
      })
      showMsg('Leave request submitted!')
      setForm({ reason: '', fromDate: '', toDate: '' })
      setShowForm(false)
      await load()
    } catch (e) {
      showMsg('Failed to submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-success/10 text-success border-success/30'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="page-title">Leave Requests</h2>
          <p className="text-sm font-body text-slate-500 mt-0.5">Submit and track your leave applications</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all">
          <Plus className="w-4 h-4" />New Request
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-accent/20 animate-fade-in">
          <h3 className="font-display font-bold text-white text-sm mb-4">New Leave Request</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">From Date</label>
                <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))}
                  className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">To Date</label>
                <input type="date" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))}
                  className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-display font-semibold text-slate-400 mb-1.5">Reason</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={3} placeholder="Explain the reason for your leave..."
                className="input-field w-full resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all disabled:opacity-50">
                {submitting ? <Spinner size="sm" /> : null}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-display font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/06">
          <h3 className="font-display font-bold text-white text-sm">My Leave Requests</h3>
        </div>
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardList className="w-10 h-10 text-slate-700" />
            <p className="font-display font-semibold text-slate-500">No leave requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/04">
            {[...requests].reverse().map(req => {
              const style = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING
              const Icon = style.icon
              return (
                <div key={req.id} className="px-5 py-4 hover:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-display font-semibold text-white">{req.reason}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{req.fromDate} → {req.toDate}</span>
                      </div>
                      {req.adminRemarks && (
                        <p className="text-xs text-slate-400 mt-1.5 italic">Remarks: {req.adminRemarks}</p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-display font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${style.cls}`}>
                      <Icon className="w-3 h-3" />{style.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
