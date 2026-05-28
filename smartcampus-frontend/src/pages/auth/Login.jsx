import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, LogIn, AlertCircle, BookOpen, GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui/LoadingSpinner'

export default function Login() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError]     = useState('')

  const { login, loading, error, isAuthenticated, isAdmin, initializing } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!initializing && isAuthenticated) {
      if (isAdmin) navigate('/dashboard', { replace: true })
      else navigate('/student/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAdmin, initializing, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!email.trim()) return setFormError('Email is required.')
    if (!password)     return setFormError('Password is required.')

    const { success, role } = await login(email.trim(), password)

    if (success) {
      // role is already normalized to ROLE_ADMIN / ROLE_STUDENT from AuthContext
      if (role === 'ROLE_ADMIN') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    }
  }

  if (initializing) return null

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/6 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-[420px] animate-slide-in-up">
        {/* Card */}
        <div className="glass-card rounded-3xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-accent via-violet-500 to-indigo-400" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-accent">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-xl leading-none">SmartCampus</p>
                <p className="text-[10px] font-body text-slate-500 tracking-widest uppercase mt-0.5">
                  Unified Portal
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="font-display font-bold text-2xl text-white tracking-tight">Welcome back</h1>
              <p className="font-body text-slate-400 text-sm mt-1.5 leading-relaxed">
                Sign in as <span className="text-amber-400 font-semibold">Admin</span> or{' '}
                <span className="text-accent font-semibold">Student</span> — we'll handle the rest.
              </p>
            </div>

            {/* Role info chips */}
            <div className="flex gap-2 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-display font-semibold text-amber-400">Admin</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                <GraduationCap className="w-3 h-3 text-accent" />
                <span className="text-xs font-display font-semibold text-accent">Student</span>
              </div>
              <span className="text-xs font-body text-slate-500 self-center">auto-detected on login</span>
            </div>

            {/* Error alert */}
            {(error || formError) && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-danger/10 border border-danger/25 mb-5 animate-slide-down">
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                <p className="text-sm font-body text-danger">{formError || error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-11"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 mt-2 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Detecting role &amp; signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Info hint */}
            <div className="mt-6 pt-5 border-t border-white/06">
              <p className="text-xs font-body text-slate-500 text-center leading-relaxed">
                Register users via{' '}
                <code className="text-accent text-[11px] bg-accent/10 px-1.5 py-0.5 rounded-md">POST /users</code>{' '}
                with role{' '}
                <code className="text-amber-400 text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded-md">ADMIN</code>{' '}
                or{' '}
                <code className="text-accent text-[11px] bg-accent/10 px-1.5 py-0.5 rounded-md">STUDENT</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
          <p className="text-xs font-body text-slate-600">
            Connected to{' '}
            <span className="text-slate-500 font-medium">http://localhost:8080</span>
          </p>
        </div>
      </div>
    </div>
  )
}
