import { useEffect, useState } from 'react'
import { Bell, Calendar, Tag } from 'lucide-react'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const CATEGORY_STYLES = {
  GENERAL: { label: 'General', cls: 'text-accent bg-accent/10 border-accent/20' },
  EXAM:    { label: 'Exam',    cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  HOLIDAY: { label: 'Holiday', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  EVENT:   { label: 'Event',   cls: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('ALL')

  useEffect(() => {
    api.get('/announcements')
      .then(r => setAnnouncements(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = ['ALL', 'GENERAL', 'EXAM', 'HOLIDAY', 'EVENT']
  const filtered = filter === 'ALL' ? announcements : announcements.filter(a => a.category === filter)

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">Announcements</h2>
        <p className="text-sm font-body text-slate-500 mt-0.5">Latest notices and updates from administration</p>
      </div>

      {/* Category filter */}
      <div className="glass-card rounded-2xl p-4 flex gap-2 flex-wrap">
        {categories.map(cat => {
          const style = CATEGORY_STYLES[cat] || { cls: 'text-slate-400' }
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all ${
                filter === cat ? 'bg-accent text-white border-accent/40' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}>
              {cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
          <Bell className="w-12 h-12 text-slate-700" />
          <p className="font-display font-semibold text-slate-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann, i) => {
            const catStyle = CATEGORY_STYLES[ann.category] || CATEGORY_STYLES.GENERAL
            return (
              <div key={ann.id} className="glass-card rounded-2xl p-5 border border-white/06 hover:border-accent/20 transition-all animate-slide-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white text-base">{ann.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {ann.category && (
                        <span className={`flex items-center gap-1 text-[10px] font-display font-semibold px-2 py-0.5 rounded-md border ${catStyle.cls}`}>
                          <Tag className="w-2.5 h-2.5" />{catStyle.label}
                        </span>
                      )}
                      {ann.createdAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />{formatDate(ann.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Bell className="w-5 h-5 text-accent/40 shrink-0 mt-0.5" />
                </div>
                <p className="text-sm font-body text-slate-400 leading-relaxed">{ann.content}</p>
                {ann.postedBy && (
                  <p className="text-xs text-slate-600 mt-3">Posted by: {ann.postedBy}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
