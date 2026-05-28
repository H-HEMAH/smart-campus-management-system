import { useEffect, useState } from 'react'
import { FileText, Plus, Trash2, Edit2, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const EMPTY = { title: '', description: '', courseId: '', courseName: '', deadline: '', createdBy: '' }

export default function AdminAssignments() {
  const { user } = useAuth()
  const [list, setList]         = useState([])
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  const showMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const [aRes, cRes] = await Promise.allSettled([api.get('/assignments'), api.get('/course')])
    if (aRes.status === 'fulfilled') setList(aRes.value.data)
    if (cRes.status === 'fulfilled') setCourses(cRes.value.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew  = () => { setEditing(null); setForm({ ...EMPTY, createdBy: user?.name || user?.email || '' }); setShowForm(true) }
  const openEdit = (a) => { setEditing(a.id); setForm({ title: a.title, description: a.description || '', courseId: a.courseId || '', courseName: a.courseName || '', deadline: a.deadline || '', createdBy: a.createdBy || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title) return showMsg('Title is required', 'error')
    setSaving(true)
    try {
      const course = courses.find(c => c.id == form.courseId)
      const payload = { ...form, courseName: course?.courseName || form.courseName, courseId: form.courseId ? Number(form.courseId) : null }
      if (editing) { await api.put(`/assignments/${editing}`, payload); showMsg('Updated') }
      else { await api.post('/assignments', payload); showMsg('Assignment created') }
      setShowForm(false); setEditing(null); setForm(EMPTY); await load()
    } catch { showMsg('Failed to save', 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return
    try { await api.delete(`/assignments/${id}`); showMsg('Deleted'); await load() }
    catch { showMsg('Delete failed', 'error') }
  }

  const getDaysLeft = (dl) => { if (!dl) return null; return Math.ceil((new Date(dl) - new Date()) / 86400000) }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 ${toast.type === 'error' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-success/10 text-success border-success/30'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="page-title">Assignments</h2>
          <p className="text-sm font-body text-slate-500 mt-0.5">Create and manage student assignments</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all">
          <Plus className="w-4 h-4" />New Assignment
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-accent/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-sm">{editing ? 'Edit Assignment' : 'New Assignment'}</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
          </div>
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Assignment title" className="input-field w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} className="input-field w-full text-sm">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
              </select>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field w-full" />
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Description (optional)" className="input-field w-full resize-none" />
            <input value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))} placeholder="Created by" className="input-field w-full" />
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 disabled:opacity-50">
                {saving ? <Spinner size="sm" /> : null}{saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-display font-semibold text-slate-400 hover:text-white border border-white/10 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Spinner size="xl" /></div> : (
        list.length === 0 ? (
          <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
            <FileText className="w-12 h-12 text-slate-700" />
            <p className="font-display font-semibold text-slate-500">No assignments yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((a, i) => {
              const dl = getDaysLeft(a.deadline)
              const isOverdue = dl !== null && dl <= 0
              return (
                <div key={a.id} className="glass-card rounded-2xl p-5 border border-white/06 hover:border-white/10 transition-all animate-slide-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-500 hover:text-accent hover:bg-accent/10 transition-all"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-white text-sm mb-1">{a.title}</h3>
                  {a.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{a.description}</p>}
                  <div className="space-y-1 text-xs text-slate-500">
                    {a.courseName && <p>Course: {a.courseName}</p>}
                    {a.deadline && <p className={isOverdue ? 'text-danger' : ''}>Deadline: {a.deadline}{dl !== null ? ` (${isOverdue ? `${Math.abs(dl)}d overdue` : `${dl}d left`})` : ''}</p>}
                    {a.createdBy && <p>By: {a.createdBy}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
