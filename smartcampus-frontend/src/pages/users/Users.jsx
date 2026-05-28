import { useEffect, useState, useMemo } from 'react'
import {
  Search, X, Users, ShieldCheck, User2, Mail,
  Trash2, Pencil, Plus, ChevronLeft, ChevronRight, Lock
} from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { Spinner, TableLoader } from '../../components/ui/LoadingSpinner'
import { ToastContainer } from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'

const ROLES = ['ROLE_ADMIN', 'ROLE_STUDENT']
const EMPTY_FORM = { name: '', email: '', password: '', role: 'ROLE_STUDENT' }
const PAGE_SIZE = 8

function RoleBadge({ role }) {
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN'
  return (
    <span className={`chip border ${isAdmin ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'}`}>
      {isAdmin
        ? <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Admin</span>
        : <span className="flex items-center gap-1"><User2 className="w-3 h-3" />Student</span>
      }
    </span>
  )
}

export default function UsersPage() {
  const { toasts, toast, removeToast } = useToast()

  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [forbidden, setForbidden]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('')
  const [page, setPage]                 = useState(1)
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadUsers() {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
      setForbidden(false)
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) setForbidden(true)
      else toast.error('Failed to load users')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = useMemo(() => {
    let list = users
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }
    if (roleFilter) list = list.filter((u) => u.role === roleFilter)
    return list
  }, [users, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => setPage(1), [search, roleFilter])

  function openAdd() { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true) }
  function openEdit(user) {
    setEditTarget(user)
    setForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'ROLE_STUDENT' })
    setFormErrors({})
    setShowForm(true)
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!editTarget && !form.password) errs.password = 'Password is required'
    if (!form.role) errs.role = 'Role is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      if (editTarget) {
        await api.put(`/users/${editTarget.id}`, { name: form.name.trim(), email: form.email.trim(), role: form.role })
        toast.success('User updated!')
      } else {
        await api.post('/users', { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role })
        toast.success('User registered!')
      }
      setShowForm(false)
      await loadUsers()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Operation failed'
      toast.error(typeof msg === 'string' ? msg : 'Operation failed')
    } finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      toast.success('User deleted!')
      setDeleteTarget(null)
      await loadUsers()
    } catch { toast.error('Failed to delete user') }
    finally { setDeleting(false) }
  }

  if (forbidden) {
    return (
      <div className="glass-card rounded-2xl py-24 flex flex-col items-center gap-4 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-xl">Admin Access Required</h2>
          <p className="text-sm font-body text-slate-400 mt-2 max-w-xs">
            You need <span className="text-amber-400 font-semibold">ROLE_ADMIN</span> to access Users.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="page-title">User Management</h2>
            <p className="text-sm font-body text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} of ${users.length} users`}
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Register User
          </button>
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input type="text" placeholder="Search by name or email…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 pr-10" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field sm:w-44 cursor-pointer">
            <option value="">All Roles</option>
            <option value="ROLE_ADMIN">Admin</option>
            <option value="ROLE_STUDENT">Student</option>
          </select>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/06">
                  <th className="text-left px-5 py-3.5 section-label">User</th>
                  <th className="text-left px-5 py-3.5 section-label hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3.5 section-label hidden sm:table-cell">Role</th>
                  <th className="text-right px-5 py-3.5 section-label">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/04">
                {loading ? <TableLoader cols={4} rows={6} /> : pageData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-slate-700" />
                        <p className="font-display font-semibold text-slate-500">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : pageData.map((user, i) => (
                  <tr key={user.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/70 to-violet-600/70 flex items-center justify-center shrink-0">
                          <span className="font-display font-bold text-white text-sm">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="font-display font-semibold text-white text-sm">{user.name}</p>
                          <p className="text-xs font-body text-slate-500 md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm font-body text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-600" />{user.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><RoleBadge role={user.role} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(user)} className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(user)} className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/06">
              <p className="text-xs font-body text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/05 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-display font-semibold transition-all ${p === page ? 'bg-accent text-white' : 'text-slate-400 hover:text-white hover:bg-white/05'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/05 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormModal isOpen={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit User' : 'Register New User'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Full Name *</label>
            <input type="text" placeholder="e.g. Admin User" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`input-field ${formErrors.name ? 'border-danger/50' : ''}`} />
            {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input type="email" placeholder="user@smartcampus.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`input-field ${formErrors.email ? 'border-danger/50' : ''}`} />
            {formErrors.email && <p className="text-xs text-danger mt-1">{formErrors.email}</p>}
          </div>
          {!editTarget && (
            <div>
              <label className="label">Password *</label>
              <input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={`input-field ${formErrors.password ? 'border-danger/50' : ''}`} />
              {formErrors.password && <p className="text-xs text-danger mt-1">{formErrors.password}</p>}
            </div>
          )}
          <div>
            <label className="label">Role *</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="input-field cursor-pointer">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2 justify-end border-t border-white/06">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {editTarget ? 'Save Changes' : 'Register User'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This is irreversible.`} />
    </>
  )
}
