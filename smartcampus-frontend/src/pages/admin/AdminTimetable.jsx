import { useEffect, useState } from 'react'
import { Calendar, Plus, Trash2, Edit2, AlertCircle, CheckCircle, X } from 'lucide-react'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const EMPTY = { courseName: '', instructor: '', dayOfWeek: 'MONDAY', startTime: '', endTime: '', room: '', semester: '', section: '' }

export default function AdminTimetable() {
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)
  const [viewDay, setViewDay]   = useState('ALL')

  const showMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const res = await api.get('/timetable')
    setList(res.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew  = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (t) => { setEditing(t.id); setForm({ courseName: t.courseName, instructor: t.instructor || '', dayOfWeek: t.dayOfWeek, startTime: t.startTime || '', endTime: t.endTime || '', room: t.room || '', semester: t.semester || '', section: t.section || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.courseName || !form.dayOfWeek) return showMsg('Course name and day are required', 'error')
    setSaving(true)
    try {
      if (editing) { await api.put(`/timetable/${editing}`, form); showMsg('Updated') }
      else { await api.post('/timetable', form); showMsg('Entry created') }
      setShowForm(false); setEditing(null); setForm(EMPTY); await load()
    } catch { showMsg('Failed to save', 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return
    try { await api.delete(`/timetable/${id}`); showMsg('Deleted'); await load() }
    catch { showMsg('Delete failed', 'error') }
  }

  const filtered = viewDay === 'ALL' ? list : list.filter(t => t.dayOfWeek === viewDay)

  const DAY_COLORS = {
    MONDAY: 'text-indigo-400', TUESDAY: 'text-emerald-400', WEDNESDAY: 'text-amber-400',
    THURSDAY: 'text-sky-400', FRIDAY: 'text-pink-400', SATURDAY: 'text-violet-400',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 ${toast.type === 'error' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-success/10 text-success border-success/30'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="page-title">Timetable</h2>
          <p className="text-sm font-body text-slate-500 mt-0.5">Manage the weekly class schedule</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all">
          <Plus className="w-4 h-4" />Add Entry
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-accent/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-sm">{editing ? 'Edit Entry' : 'New Timetable Entry'}</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} placeholder="Course name *" className="input-field w-full" />
            <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} placeholder="Instructor" className="input-field w-full" />
            <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))} className="input-field w-full text-sm">
              {DAYS.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
            </select>
            <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} placeholder="Start time" className="input-field w-full" />
            <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} placeholder="End time" className="input-field w-full" />
            <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="Room / Location" className="input-field w-full" />
            <input value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} placeholder="Semester (e.g. 3)" className="input-field w-full" />
            <input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="Section (e.g. A)" className="input-field w-full" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 disabled:opacity-50">
              {saving ? <Spinner size="sm" /> : null}{saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-display font-semibold text-slate-400 hover:text-white border border-white/10 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Day filter */}
      <div className="glass-card rounded-2xl p-4 flex gap-2 flex-wrap">
        {['ALL', ...DAYS].map(d => (
          <button key={d} onClick={() => setViewDay(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${viewDay === d ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {d === 'ALL' ? 'All Days' : d.charAt(0) + d.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="xl" /></div> : (
        filtered.length === 0 ? (
          <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
            <Calendar className="w-12 h-12 text-slate-700" />
            <p className="font-display font-semibold text-slate-500">No timetable entries</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/06">
                    {['Day', 'Course', 'Instructor', 'Time', 'Room', 'Sem / Sec', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-display font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/04">
                  {filtered.sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || (a.startTime || '').localeCompare(b.startTime || '')).map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className={`px-5 py-3 font-display font-bold text-xs ${DAY_COLORS[t.dayOfWeek] || 'text-slate-400'}`}>
                        {t.dayOfWeek?.charAt(0) + (t.dayOfWeek?.slice(1) || '').toLowerCase()}
                      </td>
                      <td className="px-5 py-3 font-display font-medium text-white whitespace-nowrap">{t.courseName}</td>
                      <td className="px-5 py-3 text-slate-400">{t.instructor || '—'}</td>
                      <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{t.startTime} {t.endTime ? `– ${t.endTime}` : ''}</td>
                      <td className="px-5 py-3 text-slate-400">{t.room || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{[t.semester, t.section].filter(Boolean).join(' / ') || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-slate-500 hover:text-accent hover:bg-accent/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}
