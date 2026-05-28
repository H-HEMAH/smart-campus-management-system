import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, BookOpen, X, Clock, User2, GraduationCap, MoreVertical } from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/LoadingSpinner'
import { ToastContainer } from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'

const EMPTY_FORM = { courseName: '', trainer: '', duration: '' }

const COURSE_COLORS = [
  { bg: 'from-indigo-500/20 to-violet-600/20', border: 'border-indigo-500/20', icon: 'bg-indigo-500/20 text-indigo-400' },
  { bg: 'from-emerald-500/20 to-teal-600/20',  border: 'border-emerald-500/20', icon: 'bg-emerald-500/20 text-emerald-400' },
  { bg: 'from-amber-500/20 to-orange-600/20',  border: 'border-amber-500/20',   icon: 'bg-amber-500/20 text-amber-400' },
  { bg: 'from-sky-500/20 to-blue-600/20',      border: 'border-sky-500/20',     icon: 'bg-sky-500/20 text-sky-400' },
  { bg: 'from-pink-500/20 to-rose-600/20',     border: 'border-pink-500/20',    icon: 'bg-pink-500/20 text-pink-400' },
  { bg: 'from-violet-500/20 to-purple-600/20', border: 'border-violet-500/20',  icon: 'bg-violet-500/20 text-violet-400' },
]

function getCourseColor(id) { return COURSE_COLORS[id % COURSE_COLORS.length] }

function CourseCard({ course, onEdit, onDelete, index }) {
  const color = getCourseColor(index)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={`glass-card rounded-2xl overflow-hidden border ${color.border} hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300 animate-slide-in-up group`}
      style={{ animationDelay: `${index * 0.07}s` }}>
      <div className={`h-1.5 bg-gradient-to-r ${color.bg}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-11 h-11 rounded-xl ${color.icon} flex items-center justify-center shrink-0`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/05 transition-all opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 glass-card rounded-xl border border-white/10 overflow-hidden min-w-[130px] shadow-2xl animate-slide-down">
                  <button onClick={() => { setMenuOpen(false); onEdit(course) }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-display font-medium text-slate-300 hover:bg-accent/10 hover:text-accent transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => { setMenuOpen(false); onDelete(course) }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-display font-medium text-slate-300 hover:bg-danger/10 hover:text-danger transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h3 className="font-display font-bold text-white text-base mt-3 leading-snug">{course.courseName}</h3>

        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2 text-sm font-body text-slate-400">
            <User2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate">{course.trainer}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-body text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-body text-slate-400">
            <GraduationCap className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{course.students?.length || 0} student{course.students?.length !== 1 ? 's' : ''} enrolled</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-white/06">
          <button onClick={() => onEdit(course)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-display font-semibold text-slate-400 hover:text-accent bg-white/[0.03] hover:bg-accent/10 border border-white/08 hover:border-accent/30 transition-all duration-200">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(course)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-display font-semibold text-slate-400 hover:text-danger bg-white/[0.03] hover:bg-danger/10 border border-white/08 hover:border-danger/30 transition-all duration-200">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function CourseCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1.5 bg-navy-700" />
      <div className="p-5 space-y-3">
        <div className="w-11 h-11 rounded-xl bg-navy-700" />
        <div className="h-5 bg-navy-700 rounded-lg w-3/4 mt-3" />
        <div className="space-y-2">
          <div className="h-4 bg-navy-700 rounded-lg w-2/3" />
          <div className="h-4 bg-navy-700 rounded-lg w-1/2" />
          <div className="h-4 bg-navy-700 rounded-lg w-1/3" />
        </div>
        <div className="flex gap-2 pt-4 border-t border-white/04">
          <div className="flex-1 h-8 rounded-xl bg-navy-700" />
          <div className="flex-1 h-8 rounded-xl bg-navy-700" />
        </div>
      </div>
    </div>
  )
}

export default function Courses() {
  const { toasts, toast, removeToast } = useToast()

  const [courses, setCourses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const [search, setSearch]             = useState('')
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadCourses() {
    try {
      const res = await api.get('/course')
      setCourses(res.data)
    } catch { toast.error('Failed to load courses') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCourses() }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return courses
    const q = search.toLowerCase()
    return courses.filter(
      (c) => c.courseName?.toLowerCase().includes(q) ||
             c.trainer?.toLowerCase().includes(q) ||
             c.duration?.toLowerCase().includes(q)
    )
  }, [courses, search])

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true) }
  function openEdit(course) {
    setEditTarget(course)
    setForm({ courseName: course.courseName || '', trainer: course.trainer || '', duration: course.duration || '' })
    setFormErrors({})
    setShowForm(true)
  }

  function validate() {
    const errs = {}
    if (!form.courseName.trim()) errs.courseName = 'Course name is required'
    if (!form.trainer.trim())    errs.trainer    = 'Trainer name is required'
    if (!form.duration.trim())   errs.duration   = 'Duration is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      const payload = { courseName: form.courseName.trim(), trainer: form.trainer.trim(), duration: form.duration.trim() }
      if (editTarget) {
        await api.put(`/course/${editTarget.id}`, payload)
        toast.success('Course updated successfully!')
      } else {
        await api.post('/course', payload)
        toast.success('Course added successfully!')
      }
      setShowForm(false)
      await loadCourses()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Operation failed'
      toast.error(typeof msg === 'string' ? msg : 'Operation failed')
    } finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/course/${deleteTarget.id}`)
      toast.success('Course deleted successfully!')
      setDeleteTarget(null)
      await loadCourses()
    } catch { toast.error('Failed to delete course') }
    finally { setDeleting(false) }
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="page-title">Course Management</h2>
            <p className="text-sm font-body text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} of ${courses.length} courses`}
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input type="text" placeholder="Search courses, trainers, duration…"
              value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 pr-10" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
            <BookOpen className="w-12 h-12 text-slate-700" />
            <p className="font-display font-semibold text-slate-500">No courses found</p>
            {search ? (
              <p className="text-sm font-body text-slate-600">Try a different search term</p>
            ) : (
              <button onClick={openAdd} className="btn-primary mt-1"><Plus className="w-4 h-4" /> Add your first course</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      <FormModal isOpen={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Course' : 'Add New Course'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Course Name *</label>
            <input type="text" placeholder="e.g. Advanced Java Programming" value={form.courseName}
              onChange={(e) => setForm((f) => ({ ...f, courseName: e.target.value }))}
              className={`input-field ${formErrors.courseName ? 'border-danger/50' : ''}`} />
            {formErrors.courseName && <p className="text-xs text-danger mt-1">{formErrors.courseName}</p>}
          </div>
          <div>
            <label className="label">Trainer / Instructor *</label>
            <input type="text" placeholder="e.g. Prof. Ravi Kumar" value={form.trainer}
              onChange={(e) => setForm((f) => ({ ...f, trainer: e.target.value }))}
              className={`input-field ${formErrors.trainer ? 'border-danger/50' : ''}`} />
            {formErrors.trainer && <p className="text-xs text-danger mt-1">{formErrors.trainer}</p>}
          </div>
          <div>
            <label className="label">Duration *</label>
            <input type="text" placeholder="e.g. 3 Months / 60 Hours" value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              className={`input-field ${formErrors.duration ? 'border-danger/50' : ''}`} />
            {formErrors.duration && <p className="text-xs text-danger mt-1">{formErrors.duration}</p>}
          </div>
          <div className="flex gap-3 pt-2 justify-end border-t border-white/06">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {editTarget ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.courseName}"? All student enrollments for this course will be affected.`} />
    </>
  )
}
