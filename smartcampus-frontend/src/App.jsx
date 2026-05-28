import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminRoute, StudentRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { FullPageLoader } from './components/ui/LoadingSpinner'

// Auth
import Login from './pages/auth/Login'

// Admin pages
import Dashboard         from './pages/dashboard/Dashboard'
import Students          from './pages/students/Students'
import Courses           from './pages/courses/Courses'
import UsersPage         from './pages/users/Users'
import AdminAttendance   from './pages/admin/AdminAttendance'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminAssignments  from './pages/admin/AdminAssignments'
import AdminLeave        from './pages/admin/AdminLeave'
import AdminTimetable    from './pages/admin/AdminTimetable'

// Student pages
import StudentDashboard    from './pages/student-portal/StudentDashboard'
import StudentProfile      from './pages/student-portal/StudentProfile'
import StudentCourses      from './pages/student-portal/StudentCourses'
import StudentAttendance   from './pages/student-portal/StudentAttendance'
import StudentAssignments  from './pages/student-portal/StudentAssignments'
import StudentAnnouncements from './pages/student-portal/StudentAnnouncements'
import StudentLeave        from './pages/student-portal/StudentLeave'
import StudentTimetable    from './pages/student-portal/StudentTimetable'

function RootRedirect() {
  const { isAuthenticated, isAdmin, initializing } = useAuth()
  if (initializing) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"      element={<RootRedirect />} />

          {/* ── ADMIN ROUTES ──────────────────────────────────── */}
          <Route element={<AdminRoute><Layout /></AdminRoute>}>
            <Route path="/dashboard"            element={<Dashboard />} />
            <Route path="/students"             element={<Students />} />
            <Route path="/courses"              element={<Courses />} />
            <Route path="/users"                element={<UsersPage />} />
            <Route path="/admin/attendance"     element={<AdminAttendance />} />
            <Route path="/admin/announcements"  element={<AdminAnnouncements />} />
            <Route path="/admin/assignments"    element={<AdminAssignments />} />
            <Route path="/admin/leave"          element={<AdminLeave />} />
            <Route path="/admin/timetable"      element={<AdminTimetable />} />
          </Route>

          {/* ── STUDENT ROUTES ────────────────────────────────── */}
          <Route path="/student" element={<StudentRoute><Layout /></StudentRoute>}>
            <Route path="dashboard"     element={<StudentDashboard />} />
            <Route path="profile"       element={<StudentProfile />} />
            <Route path="courses"       element={<StudentCourses />} />
            <Route path="attendance"    element={<StudentAttendance />} />
            <Route path="assignments"   element={<StudentAssignments />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="leave"         element={<StudentLeave />} />
            <Route path="timetable"     element={<StudentTimetable />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
