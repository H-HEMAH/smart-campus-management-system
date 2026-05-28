import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

// Normalize role to always be ROLE_ADMIN or ROLE_STUDENT
function normalizeRole(rawRole) {
  if (!rawRole) return 'ROLE_STUDENT'
  const r = rawRole.trim().toUpperCase()
  if (r === 'ADMIN' || r === 'ROLE_ADMIN') return 'ROLE_ADMIN'
  if (r === 'STUDENT' || r === 'ROLE_STUDENT') return 'ROLE_STUDENT'
  return `ROLE_${r}`
}

export function AuthProvider({ children }) {
  // initializing = true prevents rendering protected routes before we know auth state
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hydrate user from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sc_token')
      const storedUser  = localStorage.getItem('sc_user')
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser)
        // Normalize the stored role in case it was saved inconsistently
        parsed.role = normalizeRole(parsed.role)
        setUser(parsed)
      }
    } catch {
      localStorage.removeItem('sc_token')
      localStorage.removeItem('sc_user')
    } finally {
      setInitializing(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/users/login', { email, password })

      if (!data.token) {
        setError(data.message || 'Invalid credentials')
        return { success: false, role: null }
      }

      const role   = normalizeRole(data.role)
      const name   = data.name   || ''
      const userId = data.userId || null

      const userData = { email, token: data.token, role, name, userId }

      localStorage.setItem('sc_token', data.token)
      localStorage.setItem('sc_user', JSON.stringify(userData))
      setUser(userData)

      return { success: true, role }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Login failed. Please check your credentials.'
      setError(typeof msg === 'string' ? msg : 'Login failed.')
      return { success: false, role: null }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sc_token')
    localStorage.removeItem('sc_user')
    setUser(null)
    setError(null)
  }, [])

  const isAuthenticated = !!user && !!localStorage.getItem('sc_token')
  const isAdmin   = user?.role === 'ROLE_ADMIN'
  const isStudent = user?.role === 'ROLE_STUDENT'

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, isAuthenticated, isAdmin, isStudent, initializing }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
