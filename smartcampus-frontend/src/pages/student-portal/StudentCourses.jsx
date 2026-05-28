import { useEffect, useState, useMemo } from 'react'
import { BookOpen, Search, X, Clock, User2, CheckCircle, GraduationCap, Plus, Minus, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

const COURSE_COLORS = [
  { bg: 'from-indigo-500/20 to-violet-600/20', border: 'border-indigo-500/20', icon: 'bg-indigo-500/20 text-indigo-400' },
  { bg: 'from-emerald-500/20 to-teal-600/20',  border: 'border-emerald-500/20', icon: 'bg-emerald-500/20 text-emerald-400' },
  { bg: 'from-amber-500/20 to-orange-600/20',  border: 'border-amber-500/20',   icon: 'bg-amber-500/20 text-amber-400' },
  { bg: 'from-sky-500/20 to-blue-600/20',      border: 'border-sky-500/20',     icon: 'bg-sky-500/20 text-sky-400' },
  { bg: 'from-pink-500/20 to-rose-600/20',     border: 'border-pink-500/20',    icon: 'bg-pink-500/20 text-pink-400' },
  { bg: 'from-violet-500/20 to-purple-600/20', border: 'border-violet-500/20',  icon: 'bg-violet-500/20 text-violet-400' },
]

function CourseCard({ course, enrolled, index, onEnroll, onUnenroll, actionLoading }) {
  const color = COURSE_COLORS[index % COURSE_COLORS.length]
  const isLoading = actionLoading === course.id
  return (
    <div className={`glass-card rounded-2xl overflow-hidden border ${color.border} transition-all duration-300 animate-slide-in-up`}
      style={{ animationDelay: `${index * 0.06}s` }}>
      <div className={`h-1.5 bg-gradient-to-r ${color.bg}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`w-10 h-10 rounded-xl ${color.icon} flex items-center justify-center shrink-0`}>
            <BookOpen className="w-5 h-5" />
          </div>
          {enrolled
            ? <span className="chip border bg-success/15 text-success border-success/30 flex items-center gap-1 text-[10px]">
                <CheckCircle className="w-3 h-3" />Enrolled
              </span>
            : <span className="chip border bg-slate-700/40 text-slate-400 border-slate-600/40 text-[10px]">Not enrolled</span>
          }
        </div>

        <h3 className="font-display font-bold text-white text-sm leading-snug mb-3">{course.courseName}</h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs font-body text-slate-400">
            <User2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate">{course.trainer}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-body text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-body text-slate-400">
            <GraduationCap className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{course.students?.length || 0} student{course.students?.length !== 1 ? 's' : ''} enrolled</span>
          </div>
        </div>

        {enrolled ? (
          <button
            onClick={() => onUnenroll(course.id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-display font-semibold
                       bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all disabled:opacity-50"
          >
            {isLoading ? <Spinner size="sm" /> : <Minus className="w-3.5 h-3.5" />}
            {isLoading ? 'Processing...' : 'Unenroll'}
          </button>
        ) : (
          <button
            onClick={() => onEnroll(course.id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-display font-semibold
                       bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all disabled:opacity-50"
          >
            {isLoading ? <Spinner size="sm" /> : <Plus className="w-3.5 h-3.5" />}
            {isLoading ? 'Processing...' : 'Enroll'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function StudentCourses() {
  const { user } = useAuth()
  const [studentRecord, setStudentRecord] = useState(null)
  const [allCourses, setAllCourses]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [tab, setTab]                     = useState('enrolled')
  const [search, setSearch]               = useState('')
  const [toast, setToast]                 = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadData() {
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

  useEffect(() => { loadData() }, [user])

  const handleEnroll = async (courseId) => {
    if (!studentRecord) return showToast('Student record not found. Contact admin.', 'error')
    setActionLoading(courseId)
    try {
      await api.post(`/enrollment/enroll?studentId=${studentRecord.id}&courseId=${courseId}`)
      showToast('Successfully enrolled!')
      await loadData()
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data || 'Enrollment failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnenroll = async (courseId) => {
    if (!studentRecord) return
    setActionLoading(courseId)
    try {
      await api.delete(`/enrollment/unenroll?studentId=${studentRecord.id}&courseId=${courseId}`)
      showToast('Unenrolled successfully')
      await loadData()
    } catch (err) {
      showToast('Unenroll failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const enrolledCourseIds = new Set((studentRecord?.courses || []).map((c) => c.id ?? c))
  const enrolledCourses   = allCourses.filter((c) => enrolledCourseIds.has(c.id))

  const displayList = useMemo(() => {
    const base = tab === 'enrolled' ? enrolledCourses : allCourses
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return base.filter(
      (c) => c.courseName?.toLowerCase().includes(q) || c.trainer?.toLowerCase().includes(q)
    )
  }, [tab, enrolledCourses, allCourses, search])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-display font-semibold shadow-lg border flex items-center gap-2 animate-fade-in ${
          toast.type === 'error'
            ? 'bg-danger/10 text-danger border-danger/30'
            : 'bg-success/10 text-success border-success/30'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="page-title">My Courses</h2>
        <p className="text-sm font-body text-slate-500 mt-0.5">
          Enrolled in {enrolledCourses.length} of {allCourses.length} available courses
        </p>
      </div>

      {/* No student record warning */}
      {!studentRecord && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm font-body text-amber-300">
            No student record found for your account. Ask your admin to create a student record with your email address.
          </p>
        </div>
      )}

      {/* Tabs + search */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-navy-800 border border-white/06 self-start shrink-0">
          {[
            { id: 'enrolled', label: `My Courses (${enrolledCourses.length})` },
            { id: 'all',      label: `All Courses (${allCourses.length})` },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                tab === t.id ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="text" placeholder="Search courses or trainers…"
            value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 pr-10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {displayList.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
          <BookOpen className="w-12 h-12 text-slate-700" />
          <p className="font-display font-semibold text-slate-500">
            {tab === 'enrolled' ? 'You are not enrolled in any courses yet' : 'No courses found'}
          </p>
          {tab === 'enrolled' && (
            <p className="text-sm font-body text-slate-600 max-w-xs">
              Switch to "All Courses" tab to browse and enroll.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayList.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={enrolledCourseIds.has(course.id)}
              index={i}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
