import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard':         { title: 'Dashboard',        subtitle: "Welcome back — here's what's happening" },
  '/students':          { title: 'Students',          subtitle: 'Manage and track all enrolled students' },
  '/courses':           { title: 'Courses',           subtitle: 'Browse and manage available courses' },
  '/users':             { title: 'Users',             subtitle: 'Manage system users and permissions' },
  '/student/dashboard': { title: 'My Dashboard',      subtitle: 'Your personal campus overview' },
  '/student/profile':   { title: 'My Profile',        subtitle: 'View and edit your student profile' },
  '/student/courses':   { title: 'My Courses',        subtitle: 'Courses you are enrolled in' },
}

export function Navbar({ onMobileMenuOpen }) {
  const { pathname } = useLocation()
  const { user, isAdmin } = useAuth()
  const { title, subtitle } = PAGE_TITLES[pathname] || { title: 'SmartCampus', subtitle: '' }

  return (
    <header className="sticky top-0 z-30 h-16 bg-navy-900/80 backdrop-blur-xl border-b border-white/06 flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/05 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-white text-lg leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs font-body text-slate-500 hidden sm:block truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/05 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
          isAdmin
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-accent/10 border-accent/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse-soft ${isAdmin ? 'bg-amber-400' : 'bg-accent'}`} />
          <span className={`text-xs font-display font-semibold tracking-wide ${isAdmin ? 'text-amber-400' : 'text-accent'}`}>
            {isAdmin ? 'Admin' : 'Student'}
          </span>
        </div>
      </div>
    </header>
  )
}
