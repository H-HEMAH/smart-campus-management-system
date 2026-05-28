import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, User2 } from 'lucide-react'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

const DAY_COLORS = {
  MONDAY:    'border-indigo-500/20 text-indigo-400',
  TUESDAY:   'border-emerald-500/20 text-emerald-400',
  WEDNESDAY: 'border-amber-500/20 text-amber-400',
  THURSDAY:  'border-sky-500/20 text-sky-400',
  FRIDAY:    'border-pink-500/20 text-pink-400',
  SATURDAY:  'border-violet-500/20 text-violet-400',
}

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading]     = useState(true)
  const [semester, setSemester]   = useState('')
  const [section, setSection]     = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (semester) params.append('semester', semester)
      if (section)  params.append('section', section)
      const url = params.toString() ? `/timetable/filter?${params}` : '/timetable'
      const res = await api.get(url)
      setTimetable(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.dayOfWeek === day)
    return acc
  }, {})

  const semesters = [...new Set(timetable.map(t => t.semester).filter(Boolean))]
  const sections  = [...new Set(timetable.map(t => t.section).filter(Boolean))]

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">Timetable</h2>
        <p className="text-sm font-body text-slate-500 mt-0.5">Your weekly class schedule</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-display font-semibold text-slate-400 mb-1">Semester</label>
          <select value={semester} onChange={e => setSemester(e.target.value)}
            className="input-field text-sm min-w-[140px]">
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-display font-semibold text-slate-400 mb-1">Section</label>
          <select value={section} onChange={e => setSection(e.target.value)}
            className="input-field text-sm min-w-[120px]">
            <option value="">All Sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={load}
          className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-display font-semibold hover:bg-accent/90 transition-all">
          Apply
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]"><Spinner size="xl" /></div>
      ) : timetable.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
          <Calendar className="w-12 h-12 text-slate-700" />
          <p className="font-display font-semibold text-slate-500">No timetable entries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.filter(day => grouped[day].length > 0).map(day => (
            <div key={day} className={`glass-card rounded-2xl overflow-hidden border ${DAY_COLORS[day].split(' ')[0]} ${today === day ? 'ring-1 ring-accent/30' : ''}`}>
              <div className={`px-5 py-3 border-b border-white/06 flex items-center justify-between`}>
                <h3 className={`font-display font-bold text-sm ${DAY_COLORS[day].split(' ')[1]}`}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </h3>
                {today === day && (
                  <span className="text-[10px] font-display font-semibold px-2 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/30">Today</span>
                )}
              </div>
              <div className="divide-y divide-white/04">
                {grouped[day].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
                    <div className="text-center shrink-0 w-16">
                      <p className="text-xs font-display font-bold text-white">{entry.startTime}</p>
                      <p className="text-[10px] text-slate-500">{entry.endTime}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold text-white truncate">{entry.courseName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {entry.instructor && <span className="flex items-center gap-1"><User2 className="w-3 h-3" />{entry.instructor}</span>}
                        {entry.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.room}</span>}
                        {entry.semester && <span className="text-slate-600">Sem {entry.semester}</span>}
                        {entry.section && <span className="text-slate-600">Sec {entry.section}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
