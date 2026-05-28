import { useEffect, useState } from 'react'
import { UserCheck, Plus, Trash2, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const STATUSES = ['PRESENT', 'ABSENT', 'LATE']
const STATUS_STYLES = {
  PRESENT: 'text-success bg-success/10 border-success/20',
  ABSENT:  'text-danger bg-danger/10 border-danger/20',
  LATE:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
}

const EMPTY_ROW = { studentId: '', studentName: '', courseId: '', courseName: '', date: new Date().toISOString().split('T')[0], status: 'PRESENT' }

export default function AdminAttendance() {
  const [records, setRecords]     = useState([])
  const [students, setStudents]   = useState([])
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_ROW)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)
  const [filterStudent, setFilterStudent] = useState('')

  const showMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const [aRes, sRes, cRes] = await Promise.allSettled([
      api.get('/attendance'), api.get('/student'), api.get('/course')
    ])
    if (aRes.status === 'fulfilled') setRecords(aRes.value.data)
    if (sRes.status === 'fulfilled') setStudents(sRes.value.data)
    if (cRes.status === 'fulfilled') setCourses(cRes.value.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.studentId || !form.courseId || !form.date) return showMsg('Fill all required fields', 'error')
    setSaving(true)
    try {
      const student = students.find(s => s.id == form.studentId)
      const course  = courses.find(c => c.id == form.courseId)
      await api.post('/attendance', { ...form, studentName: student?.name, courseName: course?.courseName })
      showMsg('Attendance marked'); setShowForm(false); setForm(EMPTY_ROW); await load()
    } catch { showMsg('Failed', 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    try { await api.delete(`/attendance/${id}`); showMsg('Deleted'); await load() }
    catch { showMsg('Delete failed', 'error') }
  }

  const filtered = filterStudent ? records.filter(r => r.studentId == filterStudent) : records

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 ${toast.type === 'error' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-success/10 text-success border-success/30'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="text-sm font-body text-slate-500 mt-0.5">Mark and manage student attendance</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all">
          <Plus className="w-4 h-4" />Mark Attendance
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-accent/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-sm">Mark Attendance</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className="input-field w-full text-sm">
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
            <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} className="input-field w-full text-sm">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field w-full" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full text-sm">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all disabled:opacity-50">
              {saving ? <Spinner size="sm" /> : null}{saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-display font-semibold text-slate-400 hover:text-white border border-white/10 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="glass-card rounded-2xl p-4">
        <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} className="input-field text-sm min-w-[200px]">
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="xl" /></div> : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/06 flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-sm">Records ({filtered.length})</h3>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <UserCheck className="w-10 h-10 text-slate-700" />
              <p className="font-display font-semibold text-slate-500">No attendance records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/06">
                    {['Student', 'Course', 'Date', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-display font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/04">
                  {[...filtered].reverse().map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-display font-medium text-white">{r.studentName}</td>
                      <td className="px-5 py-3 text-slate-400">{r.courseName}</td>
                      <td className="px-5 py-3 text-slate-400">{r.date}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-display font-semibold px-2.5 py-1 rounded-lg border ${STATUS_STYLES[r.status] || ''}`}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-danger hover:bg-danger/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
