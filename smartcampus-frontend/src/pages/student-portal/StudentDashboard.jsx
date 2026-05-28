import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap, Clock, ArrowRight, CheckCircle, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'
import { StatCard } from '../../components/ui/StatCard'

const COURSE_COLORS = [
  { icon: 'bg-indigo-500/20 text-indigo-400', border: 'border-indigo-500/20' },
  { icon: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
  { icon: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/20' },
  { icon: 'bg-sky-500/20 text-sky-400', border: 'border-sky-500/20' },
  { icon: 'bg-pink-500/20 text-pink-400', border: 'border-pink-500/20' },
  { icon: 'bg-violet-500/20 text-violet-400', border: 'border-violet-500/20' },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [studentRecord, setStudentRecord] = useState(null)
  const [allCourses, setAllCourses]       = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [sRes, cRes] = await Promise.allSettled([
          api.get('/student'),
          api.get('/course'),
        ])
        if (cRes.status === 'fulfilled') setAllCourses(cRes.value.data)
        if (sRes.status === 'fulfilled') {
          const found = sRes.value.data.find(
            (s) => s.email?.toLowerCase() === user?.email?.toLowerCase()
          )
          setStudentRecord(found || null)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const enrolledCourseIds = new Set((studentRecord?.courses || []).map((c) => c.id ?? c))
  const enrolledCourses   = allCourses.filter((c) => enrolledCourseIds.has(c.id))
  const availableCourses  = allCourses.filter((c) => !enrolledCourseIds.has(c.id)).slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="glass-card rounded-2xl p-6 border border-accent/20 bg-gradient-to-r from-accent/5 to-violet-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-accent shrink-0">
            <span className="font-display font-bold text-white text-xl">
              {(studentRecord?.name || user?.email || 'S').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs font-body text-slate-500 uppercase tracking-widest">Welcome back</p>
            <h2 className="font-display font-bold text-white text-2xl mt-0.5">
              {studentRecord?.name || user?.email?.split('@')[0] || 'Student'}
            </h2>
            {studentRecord?.department && (
              <p className="text-sm font-body text-slate-400 mt-0.5">{studentRecord.department}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="animate-slide-in-up" style={{ animationDelay: '0s' }}>
          <StatCard label="Enrolled Courses" value={enrolledCourses.length} icon={BookOpen} color="indigo" trend={0} subtitle="Active enrollments" />
        </div>
        <div className="animate-slide-in-up" style={{ animationDelay: '0.07s' }}>
          <StatCard label="Available Courses" value={availableCourses.length + (allCourses.length - enrolledCourses.length - availableCourses.length)} icon={GraduationCap} color="emerald" subtitle="You can still enroll" />
        </div>
        <div className="animate-slide-in-up" style={{ animationDelay: '0.14s' }}>
          <StatCard label="Department" value={studentRecord?.department ? studentRecord.department.split(' ')[0] : '—'} icon={User} color="violet" subtitle={studentRecord?.department || 'Not assigned'} />
        </div>
      </div>

      {/* My enrolled courses */}
      <div className="glass-card rounded-2xl overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
          <div>
            <h2 className="font-display font-bold text-white text-base">My Enrolled Courses</h2>
            <p className="text-xs font-body text-slate-500 mt-0.5">Courses you are currently taking</p>
          </div>
          <Link to="/student/courses" className="flex items-center gap-1.5 text-xs font-display font-semibold text-accent hover:text-accent-light transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <BookOpen className="w-10 h-10 text-slate-700 mb-3" />
            <p className="font-display font-semibold text-slate-500">No enrollments yet</p>
            <p className="text-xs font-body text-slate-600 mt-1">Ask your administrator to enroll you in courses.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/04">
            {enrolledCourses.slice(0, 4).map((course, i) => {
              const color = COURSE_COLORS[i % COURSE_COLORS.length]
              return (
                <div key={course.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${color.icon} flex items-center justify-center shrink-0`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white text-sm truncate">{course.courseName}</p>
                    <p className="text-xs font-body text-slate-500 truncate">{course.trainer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-body text-slate-500 shrink-0">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </div>
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Available to explore */}
      {availableCourses.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.27s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
            <div>
              <h2 className="font-display font-bold text-white text-base">Explore More Courses</h2>
              <p className="text-xs font-body text-slate-500 mt-0.5">Available courses you haven't enrolled in yet</p>
            </div>
          </div>
          <div className="divide-y divide-white/04">
            {availableCourses.map((course, i) => {
              const color = COURSE_COLORS[(enrolledCourses.length + i) % COURSE_COLORS.length]
              return (
                <div key={course.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${color.icon} flex items-center justify-center shrink-0 opacity-60`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-slate-300 text-sm truncate">{course.courseName}</p>
                    <p className="text-xs font-body text-slate-500 truncate">{course.trainer} · {course.duration}</p>
                  </div>
                  <span className="chip border bg-slate-700/40 text-slate-400 border-slate-600/40 text-[10px] shrink-0">Not enrolled</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
