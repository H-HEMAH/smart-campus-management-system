import { useEffect, useState } from 'react'
import { Mail, Building2, BookOpen, GraduationCap, Pencil, Save, X, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'
import { ToastContainer } from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'

const DEPTS = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Engineering', 'Business', 'Arts', 'Law', 'Medicine',
]

const COURSE_COLORS = [
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'bg-sky-500/15 text-sky-400 border-sky-500/25',
  'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'bg-violet-500/15 text-violet-400 border-violet-500/25',
]

export default function StudentProfile() {
  const { user } = useAuth()
  const { toasts, toast, removeToast } = useToast()

  const [studentRecord, setStudentRecord] = useState(null)
  const [allCourses, setAllCourses]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [editing, setEditing]             = useState(false)
  const [saving, setSaving]               = useState(false)
  const [form, setForm]                   = useState({ name: '', department: '', email: '' })

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
          if (found) {
            setStudentRecord(found)
            setForm({ name: found.name || '', department: found.department || '', email: found.email || '' })
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const enrolledCourseIds = new Set((studentRecord?.courses || []).map((c) => c.id ?? c))
  const enrolledCourses   = allCourses.filter((c) => enrolledCourseIds.has(c.id))

  async function handleSave() {
    if (!form.name.trim() || !form.department.trim()) {
      toast.error('Name and department are required')
      return
    }
    setSaving(true)
    try {
      await api.put(`/student/${studentRecord.id}`, {
        name: form.name.trim(),
        department: form.department.trim(),
        email: form.email.trim(),
        courses: studentRecord.courses || [],
      })
      setStudentRecord((prev) => ({ ...prev, name: form.name.trim(), department: form.department.trim() }))
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile'
      toast.error(typeof msg === 'string' ? msg : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>
  }

  if (!studentRecord) {
    return (
      <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-4 text-center animate-fade-in">
        <GraduationCap className="w-14 h-14 text-slate-700" />
        <div>
          <h3 className="font-display font-bold text-white text-lg">Student record not found</h3>
          <p className="text-sm font-body text-slate-400 mt-1 max-w-xs">
            No student record is linked to <span className="text-accent">{user?.email}</span>.
            Ask an admin to create your student profile.
          </p>
        </div>
      </div>
    )
  }

  const initial = (studentRecord.name || user?.email || 'S').charAt(0).toUpperCase()

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6 animate-fade-in max-w-3xl">

        {/* Profile card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Top gradient */}
          <div className="h-24 bg-gradient-to-r from-accent/30 via-violet-600/20 to-navy-800 relative">
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar overlapping banner */}
            <div className="flex items-end justify-between -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-accent border-4 border-navy-900">
                <span className="font-display font-bold text-white text-3xl">{initial}</span>
              </div>
              <div className="mb-1">
                {editing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-2" disabled={saving}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button onClick={handleSave} className="btn-primary text-xs px-3 py-2" disabled={saving}>
                      {saving ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-3 py-2">
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Name + dept */}
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="input-field cursor-pointer">
                    <option value="">Select department</option>
                    {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-display font-bold text-white text-2xl">{studentRecord.name}</h2>
                <p className="text-sm font-body text-slate-400 mt-0.5">{studentRecord.department || 'No department'}</p>
              </div>
            )}

            {/* Meta info */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800 border border-white/06">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-display font-semibold text-slate-500 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-body text-slate-300 truncate">{studentRecord.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800 border border-white/06">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-display font-semibold text-slate-500 uppercase tracking-widest">Department</p>
                  <p className="text-sm font-body text-slate-300">{studentRecord.department || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800 border border-white/06">
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-display font-semibold text-slate-500 uppercase tracking-widest">Enrolled Courses</p>
                  <p className="text-sm font-body text-slate-300">{enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800 border border-white/06">
                <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-display font-semibold text-slate-500 uppercase tracking-widest">Student ID</p>
                  <p className="text-sm font-body text-slate-300 font-mono">#{String(studentRecord.id).padStart(4, '0')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled courses list */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/06">
            <h3 className="font-display font-bold text-white text-base">Enrolled Courses</h3>
            <p className="text-xs font-body text-slate-500 mt-0.5">All courses you are currently enrolled in</p>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <BookOpen className="w-10 h-10 text-slate-700 mb-3" />
              <p className="font-display font-semibold text-slate-500">No courses enrolled</p>
              <p className="text-xs font-body text-slate-600 mt-1">Contact your administrator to enroll in courses.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/04">
              {enrolledCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className={`chip border ${COURSE_COLORS[i % COURSE_COLORS.length]}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white text-sm truncate">{course.courseName}</p>
                    <p className="text-xs font-body text-slate-500">{course.trainer} · {course.duration}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
