import { useEffect, useState } from 'react'
import { Bell, Plus, Trash2, Edit2, Tag, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const CATEGORIES = ['GENERAL', 'EXAM', 'HOLIDAY', 'EVENT']
const CAT_STYLES = {
  GENERAL: 'text-accent bg-accent/10 border-accent/20',
  EXAM:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
  HOLIDAY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  EVENT:   'text-pink-400 bg-pink-400/10 border-pink-400/20',
}

const EMPTY = { title: '', content: '', category: 'GENERAL', postedBy: '' }

export default function AdminAnnouncements() {
  const { user } = useAuth()
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  const showMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const res = await api.get('/announcements')
    setList(res.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, postedBy: user?.name || user?.email || '' }); setShowForm(true) }
  const openEdit = (a) => { setEditing(a.id); setForm({ title: a.title, content: a.content, category: a.category || 'GENERAL', postedBy: a.postedBy || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title || !form.content) return showMsg('Title and content are required', 'error')
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/announcements/${editing}`, form)
        showMsg('Announcement updated')
      } else {
        await api.post('/announcements', form)
        showMsg('Announcement posted')
      }
      setShowForm(false); setEditing(null); setForm(EMPTY); await load()
    } catch { showMsg('Failed to save', 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try { await api.delete(`/announcements/${id}`); showMsg('Deleted'); await load() }
    catch { showMsg('Delete failed', 'error') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 ${toast.type === 'error' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-success/10 text-success border-success/30'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="page-title">Announcements</h2>
          <p className="text-sm font-body text-slate-500 mt-0.5">Post notices, exam schedules and events</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all">
          <Plus className="w-4 h-4" />New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-accent/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-sm">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
          </div>
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title" className="input-field w-full" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-field w-full text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={form.postedBy} onChange={e => setForm(f => ({ ...f, postedBy: e.target.value }))}
                placeholder="Posted by" className="input-field w-full" />
            </div>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4} placeholder="Announcement content..." className="input-field w-full resize-none" />
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all disabled:opacity-50">
                {saving ? <Spinner size="sm" /> : null}{saving ? 'Saving...' : editing ? 'Update' : 'Post'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-display font-semibold text-slate-400 hover:text-white border border-white/10 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Spinner size="xl" /></div> : (
        list.length === 0 ? (
          <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
            <Bell className="w-12 h-12 text-slate-700" />
            <p className="font-display font-semibold text-slate-500">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((ann, i) => {
              const catCls = CAT_STYLES[ann.category] || CAT_STYLES.GENERAL
              return (
                <div key={ann.id} className="glass-card rounded-2xl p-5 border border-white/06 hover:border-white/10 transition-all animate-slide-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-white text-sm">{ann.title}</h3>
                        {ann.category && <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded-md border ${catCls}`}>{ann.category}</span>}
                      </div>
                      <p className="text-sm font-body text-slate-400 leading-relaxed">{ann.content}</p>
                      <p className="text-xs text-slate-600 mt-2">{ann.postedBy ? `Posted by ${ann.postedBy}` : ''} {ann.createdAt ? `· ${new Date(ann.createdAt).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(ann)} className="p-2 rounded-lg text-slate-500 hover:text-accent hover:bg-accent/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(ann.id)} className="p-2 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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
