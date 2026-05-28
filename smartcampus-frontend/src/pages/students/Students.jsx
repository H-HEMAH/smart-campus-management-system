import { useEffect, useState, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, GraduationCap, X,
  ChevronLeft, ChevronRight, Mail, BookOpen, CheckCircle, ListPlus
} from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { Spinner, TableLoader } from '../../components/ui/LoadingSpinner'
import { ToastContainer } from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'

const DEPTS = [
  'Computer Science','Mathematics','Physics','Chemistry',
  'Biology','Engineering','Business','Arts','Law','Medicine',
]
const EMPTY_FORM = { name: '', department: '', email: '' }

function DeptBadge({ dept }) {
  const map = {
    'Computer Science':'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    'Mathematics':'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    'Physics':'bg-violet-500/15 text-violet-300 border-violet-500/25',
    'Chemistry':'bg-amber-500/15 text-amber-300 border-amber-500/25',
    'Biology':'bg-teal-500/15 text-teal-300 border-teal-500/25',
    'Engineering':'bg-sky-500/15 text-sky-300 border-sky-500/25',
  }
  const cls = map[dept] || 'bg-slate-500/15 text-slate-300 border-slate-500/25'
  return <span className={`chip border ${cls}`}>{dept || '—'}</span>
}

function Avatar({ name }) {
  const colors = [
    'from-indigo-500 to-violet-600','from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600','from-sky-500 to-blue-600',
    'from-pink-500 to-rose-600','from-violet-500 to-purple-600',
  ]
  const initials = name ? name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?'
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center shrink-0`}>
      <span className="font-display font-bold text-white text-sm">{initials}</span>
    </div>
  )
}

/* ── Enrollment Modal ─────────────────────────────────────────────────────── */
function EnrollModal({ student, allCourses, onClose, onSaved, toast }) {
  // Build a set of currently enrolled course IDs
  const [selected, setSelected] = useState(() => {
    const ids = new Set()
    ;(student.courses || []).forEach(c => ids.add(c.id ?? c))
    return ids
  })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = allCourses.filter(c =>
    c.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    c.trainer?.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Build full course objects for selected IDs
      const enrolledCourses = allCourses
        .filter(c => selected.has(c.id))
        .map(c => ({ id: c.id }))   // backend only needs the id

      await api.put(`/student/${student.id}`, {
        name: student.name,
        department: student.department,
        email: student.email,
        courses: enrolledCourses,
      })
      toast.success(`Enrollment updated for ${student.name}!`)
      onSaved()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Enrollment failed'
      toast.error(typeof msg === 'string' ? msg : 'Enrollment failed')
    } finally {
      setSaving(false)
    }
  }

  const enrolledCount = selected.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 glass-card rounded-2xl w-full max-w-xl overflow-hidden animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="font-display font-bold text-white text-lg">Manage Enrollment</h3>
            <p className="text-xs font-body text-slate-500 mt-0.5">
              Student: <span className="text-accent">{student.name}</span> ·{' '}
              <span className="text-success">{enrolledCount}</span> course{enrolledCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 p-1 rounded-lg" style={{transition:'color .15s'}}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses or trainers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-10"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Course list */}
        <div className="px-6 pb-2 overflow-y-auto" style={{ maxHeight: '340px' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpen className="w-9 h-9 text-slate-700 mb-2" />
              <p className="font-display font-semibold text-slate-500 text-sm">No courses found</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {filtered.map((course, i) => {
                const enrolled = selected.has(course.id)
                return (
                  <button
                    key={course.id}
                    onClick={() => toggle(course.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: enrolled ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      border: enrolled ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Checkbox */}
                    <div className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={{
                        background: enrolled ? '#6366F1' : 'rgba(255,255,255,0.05)',
                        border: enrolled ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.15)',
                      }}>
                      {enrolled && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>

                    {/* Course icon */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)' }}>
                      <BookOpen className="w-4 h-4 text-accent" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-white text-sm truncate">
                        {course.courseName}
                      </p>
                      <p className="text-xs font-body text-slate-500 truncate">
                        {course.trainer} · {course.duration}
                      </p>
                    </div>

                    {/* Students count */}
                    <span className="text-xs font-body text-slate-500 shrink-0">
                      {course.students?.length || 0} enrolled
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-xs font-body text-slate-500">
            {enrolledCount === 0
              ? 'No courses selected'
              : `${enrolledCount} course${enrolledCount !== 1 ? 's' : ''} will be enrolled`}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary text-sm" disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary text-sm" disabled={saving}>
              {saving && <Spinner size="sm" />}
              Save Enrollment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Students Page ───────────────────────────────────────────────────── */
const PAGE_SIZE = 8

export default function Students() {
  const { toasts, toast, removeToast } = useToast()

  const [students, setStudents]     = useState([])
  const [courses, setCourses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const [search, setSearch]             = useState('')
  const [deptFilter, setDeptFilter]     = useState('')
  const [page, setPage]                 = useState(1)
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Enrollment modal state
  const [enrollTarget, setEnrollTarget] = useState(null)

  async function loadStudents() {
    try {
      const res = await api.get('/student')
      setStudents(res.data)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  async function loadCourses() {
    try {
      const res = await api.get('/course')
      setCourses(res.data)
    } catch {}
  }

  useEffect(() => { loadStudents(); loadCourses() }, [])

  const filtered = useMemo(() => {
    let list = students
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      )
    }
    if (deptFilter) list = list.filter(s => s.department === deptFilter)
    return list
  }, [students, search, deptFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData   = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  useEffect(() => setPage(1), [search, deptFilter])

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true) }
  function openEdit(s) {
    setEditTarget(s)
    setForm({ name: s.name||'', department: s.department||'', email: s.email||'' })
    setFormErrors({})
    setShowForm(true)
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.department.trim()) errs.department = 'Department is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        department: form.department.trim(),
        email: form.email.trim(),
        courses: editTarget?.courses || [],
      }
      if (editTarget) {
        await api.put(`/student/${editTarget.id}`, payload)
        toast.success('Student updated successfully!')
      } else {
        await api.post('/student', payload)
        toast.success('Student added successfully!')
      }
      setShowForm(false)
      await loadStudents()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Operation failed'
      toast.error(typeof msg === 'string' ? msg : 'Operation failed')
    } finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/student/${deleteTarget.id}`)
      toast.success('Student deleted successfully!')
      setDeleteTarget(null)
      await loadStudents()
    } catch { toast.error('Failed to delete student') }
    finally { setDeleting(false) }
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Enrollment modal */}
      {enrollTarget && (
        <EnrollModal
          student={enrollTarget}
          allCourses={courses}
          onClose={() => setEnrollTarget(null)}
          onSaved={loadStudents}
          toast={toast}
        />
      )}

      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="page-title">Student Management</h2>
            <p className="text-sm font-body text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} of ${students.length} students`}
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input type="text" placeholder="Search by name, email or department…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-10" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="input-field sm:w-52 cursor-pointer">
            <option value="">All Departments</option>
            {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3.5 section-label">Student</th>
                  <th className="text-left px-5 py-3.5 section-label hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3.5 section-label hidden sm:table-cell">Department</th>
                  <th className="text-left px-5 py-3.5 section-label hidden lg:table-cell">Courses</th>
                  <th className="text-right px-5 py-3.5 section-label">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <TableLoader cols={5} rows={6} />
                ) : pageData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <GraduationCap className="w-12 h-12 text-slate-700" />
                        <p className="font-display font-semibold text-slate-500">No students found</p>
                        {(search || deptFilter) && (
                          <p className="text-sm font-body text-slate-600">Try clearing your filters</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((student, i) => (
                    <tr key={student.id} className="table-row-hover" style={{ animationDelay: `${i*0.04}s` }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} />
                          <div>
                            <p className="font-display font-semibold text-white text-sm">{student.name}</p>
                            <p className="text-xs font-body text-slate-500 md:hidden">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm font-body text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-600" />{student.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <DeptBadge dept={student.department} />
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-sm font-body text-slate-400">
                            {student.courses?.length || 0} enrolled
                          </span>
                          {student.courses?.length > 0 && (
                            <div className="flex gap-1 ml-1">
                              {student.courses.slice(0,2).map(c => (
                                <span key={c.id} className="chip border bg-accent/10 text-accent border-accent/20 text-[10px]">
                                  {c.courseName?.split(' ')[0]}
                                </span>
                              ))}
                              {student.courses.length > 2 && (
                                <span className="chip border bg-slate-700/40 text-slate-400 border-slate-600/40 text-[10px]">
                                  +{student.courses.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {/* ── Enroll button ── */}
                          <button
                            onClick={() => setEnrollTarget(student)}
                            title="Manage course enrollment"
                            className="p-2 rounded-lg text-slate-400 transition-all"
                            style={{}}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#10B981'
                              e.currentTarget.style.background = 'rgba(16,185,129,0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = ''
                              e.currentTarget.style.background = ''
                            }}
                          >
                            <ListPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(student)}
                            title="Edit student"
                            className="p-2 rounded-lg text-slate-400 transition-all"
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#6366F1'
                              e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = ''
                              e.currentTarget.style.background = ''
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            title="Delete student"
                            className="p-2 rounded-lg text-slate-400 transition-all"
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#EF4444'
                              e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = ''
                              e.currentTarget.style.background = ''
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10">
              <p className="text-xs font-body text-slate-500">
                Page {page} of {totalPages} · {filtered.length} results
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1)
                  .filter(p => Math.abs(p-page)<=2)
                  .map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-7 h-7 rounded-lg text-xs font-display font-semibold transition-all"
                      style={{
                        background: p===page ? '#6366F1' : 'transparent',
                        color: p===page ? '#fff' : '#94a3b8',
                      }}>
                      {p}
                    </button>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <FormModal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Student' : 'Add New Student'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Full Name *</label>
            <input type="text" placeholder="e.g. Arjun Sharma" value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className={`input-field ${formErrors.name ? 'border-danger' : ''}`} />
            {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input type="email" placeholder="student@college.edu" value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
              className={`input-field ${formErrors.email ? 'border-danger' : ''}`} />
            {formErrors.email && <p className="text-xs text-danger mt-1">{formErrors.email}</p>}
          </div>
          <div>
            <label className="label">Department *</label>
            <select value={form.department}
              onChange={e => setForm(f => ({...f, department: e.target.value}))}
              className={`input-field cursor-pointer ${formErrors.department ? 'border-danger' : ''}`}>
              <option value="">Select a department</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {formErrors.department && <p className="text-xs text-danger mt-1">{formErrors.department}</p>}
          </div>
          <div className="flex gap-3 pt-2 justify-end border-t border-white/10">
            <button type="button" onClick={() => setShowForm(false)}
              className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {editTarget ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Student"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </>
  )
}
