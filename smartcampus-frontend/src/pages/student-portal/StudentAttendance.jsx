import { useEffect, useState } from 'react'
import { UserCheck, Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const STATUS_STYLES = {
  PRESENT: { label: 'Present', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle },
  ABSENT:  { label: 'Absent',  cls: 'text-danger bg-danger/10 border-danger/20',    icon: XCircle },
  LATE:    { label: 'Late',    cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
}

export default function StudentAttendance() {
  const { user } = useAuth()
  const [records, setRecords]       = useState([])
  const [studentRecord, setStudentRecord] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [filterCourse, setFilterCourse] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const sRes = await api.get('/student')
        const found = sRes.data.find(s => s.email?.toLowerCase() === user?.email?.toLowerCase())
        setStudentRecord(found || null)
        if (found) {
          const aRes = await api.get(`/attendance/student/${found.id}`)
          setRecords(aRes.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const courses = [...new Set(records.map(r => r.courseName).filter(Boolean))]
  const filtered = filterCourse === 'all' ? records : records.filter(r => r.courseName === filterCourse)

  const total   = filtered.length
  const present = filtered.filter(r => r.status === 'PRESENT').length
  const absent  = filtered.filter(r => r.status === 'ABSENT').length
  const late    = filtered.filter(r => r.status === 'LATE').length
  const percent = total > 0 ? Math.round((present / total) * 100) : 0

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">My Attendance</h2>
        <p className="text-sm font-body text-slate-500 mt-0.5">Track your attendance across all courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Attendance %', value: `${percent}%`, color: percent >= 75 ? 'text-success' : 'text-danger', sub: 'Overall' },
          { label: 'Present',  value: present, color: 'text-success', sub: 'Classes' },
          { label: 'Absent',   value: absent,  color: 'text-danger',  sub: 'Classes' },
          { label: 'Late',     value: late,    color: 'text-amber-400', sub: 'Classes' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 animate-slide-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <p className="text-xs font-body text-slate-500 mb-1">{stat.label}</p>
            <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Attendance bar */}
      {total > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-semibold text-white">Overall Attendance</span>
            <span className={`text-sm font-bold ${percent >= 75 ? 'text-success' : 'text-danger'}`}>{percent}%</span>
          </div>
          <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${percent >= 75 ? 'bg-success' : 'bg-danger'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {percent < 75 && (
            <p className="text-xs text-danger mt-2">⚠️ Attendance below 75% threshold</p>
          )}
        </div>
      )}

      {/* Filter */}
      {courses.length > 0 && (
        <div className="glass-card rounded-2xl p-4 flex gap-2 flex-wrap">
          <button onClick={() => setFilterCourse('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${filterCourse === 'all' ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            All Courses
          </button>
          {courses.map(c => (
            <button key={c} onClick={() => setFilterCourse(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${filterCourse === c ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Records */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/06">
          <h3 className="font-display font-bold text-white text-sm">Attendance History</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <UserCheck className="w-10 h-10 text-slate-700" />
            <p className="font-display font-semibold text-slate-500">No attendance records yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/04">
            {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => {
              const s = STATUS_STYLES[rec.status] || STATUS_STYLES.PRESENT
              const Icon = s.icon
              return (
                <div key={rec.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                  <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-white truncate">{rec.courseName || 'Unknown Course'}</p>
                    <p className="text-xs text-slate-500">{rec.date}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-display font-semibold px-2.5 py-1 rounded-lg border ${s.cls}`}>
                    <Icon className="w-3 h-3" />{s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
