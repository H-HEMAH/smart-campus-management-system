import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, LogOut,
  GraduationCap, ShieldCheck, X, User, ClipboardList,
  Bell, Calendar, FileText, UserCheck, Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ADMIN_NAV = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',            icon: GraduationCap,   label: 'Students' },
  { to: '/courses',             icon: BookOpen,         label: 'Courses' },
  { to: '/users',               icon: Users,            label: 'Users' },
  { section: 'Modules' },
  { to: '/admin/attendance',    icon: UserCheck,        label: 'Attendance' },
  { to: '/admin/announcements', icon: Bell,             label: 'Announcements' },
  { to: '/admin/assignments',   icon: FileText,         label: 'Assignments' },
  { to: '/admin/leave',         icon: ClipboardList,    label: 'Leave Requests' },
  { to: '/admin/timetable',     icon: Calendar,         label: 'Timetable' },
]

const STUDENT_NAV = [
  { to: '/student/dashboard',     icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/student/profile',       icon: User,             label: 'My Profile' },
  { section: 'Academics' },
  { to: '/student/courses',       icon: BookOpen,         label: 'My Courses' },
  { to: '/student/attendance',    icon: UserCheck,        label: 'Attendance' },
  { to: '/student/assignments',   icon: FileText,         label: 'Assignments' },
  { to: '/student/timetable',     icon: Calendar,         label: 'Timetable' },
  { section: 'Communication' },
  { to: '/student/announcements', icon: Bell,             label: 'Announcements' },
  { to: '/student/leave',         icon: ClipboardList,    label: 'Leave Request' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
          )}
          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'}`} />
          {label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout, isAdmin, isStudent } = useAuth()
  const navigate = useNavigate()

  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV
  const roleLabel = isAdmin ? 'Administrator' : 'Student'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/06">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-accent">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-none tracking-tight">SmartCampus</p>
            <p className="text-[10px] font-body text-slate-500 mt-0.5 tracking-widest uppercase">
              {isAdmin ? 'Admin Portal' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Role indicator */}
      <div className="px-4 pt-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${
          isAdmin ? 'from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'from-accent/10 to-violet-500/10 border border-accent/20'
        }`}>
          {isAdmin
            ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            : <GraduationCap className="w-3.5 h-3.5 text-accent shrink-0" />
          }
          <span className={`text-xs font-display font-semibold ${isAdmin ? 'text-amber-400' : 'text-accent'}`}>
            {roleLabel} Access
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <p key={`section-${idx}`} className="section-label px-3 pt-4 pb-2 text-[10px] font-display font-semibold text-slate-600 uppercase tracking-widest">
                {item.section}
              </p>
            )
          }
          return <NavItem key={item.to} {...item} onClick={onMobileClose} />
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/06 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-800 border border-white/06">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${isAdmin ? 'from-amber-500/80 to-orange-600/80' : 'from-accent/80 to-violet-600/80'} flex items-center justify-center shrink-0`}>
            <span className="text-white text-xs font-display font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-semibold text-slate-200 truncate">
              {user?.name || user?.email || 'User'}
            </p>
            <p className="text-[10px] font-body text-slate-500 tracking-widest uppercase">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-display font-medium text-sm
                     text-slate-400 hover:text-danger hover:bg-danger/10 border border-transparent
                     hover:border-danger/20 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-danger text-slate-500 transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-navy-900 border-r border-white/06 h-screen sticky top-0">
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative z-50 w-64 bg-navy-900 h-full border-r border-white/06 animate-slide-in-left flex flex-col">
            <button onClick={onMobileClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
