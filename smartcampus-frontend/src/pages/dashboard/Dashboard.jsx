import { useEffect, useState } from 'react'
import { GraduationCap, BookOpen, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../api/axios'
import { StatCard } from '../../components/ui/StatCard'
import { Spinner } from '../../components/ui/LoadingSpinner'

const DEPT_COLORS = ['#6366F1','#10B981','#F59E0B','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316']

function DeptBadge({ dept }) {
  const map = {
    'Computer Science': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    'Mathematics':      'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    'Physics':          'bg-violet-500/15 text-violet-300 border-violet-500/25',
    'Chemistry':        'bg-amber-500/15 text-amber-300 border-amber-500/25',
    'Biology':          'bg-teal-500/15 text-teal-300 border-teal-500/25',
    'Engineering':      'bg-sky-500/15 text-sky-300 border-sky-500/25',
  }
  const cls = map[dept] || 'bg-slate-500/15 text-slate-300 border-slate-500/25'
  return <span className={`chip border ${cls}`}>{dept}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 rounded-xl border border-white/10 text-xs font-display">
      <p className="text-slate-400">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} students</p>
    </div>
  )
}

export default function Dashboard() {
  const [students, setStudents] = useState([])
  const [courses, setCourses]   = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [sRes, cRes] = await Promise.allSettled([
          api.get('/student'),
          api.get('/course'),
        ])
        if (sRes.status === 'fulfilled') setStudents(sRes.value.data)
        if (cRes.status === 'fulfilled') setCourses(cRes.value.data)
        try {
          const uRes = await api.get('/admin/users')
          setUsers(uRes.data)
        } catch { /* not admin or network error */ }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const recentStudents = [...students].reverse().slice(0, 6)
  const recentCourses  = [...courses].reverse().slice(0, 4)

  // Department breakdown for bar chart
  const deptData = students.reduce((acc, s) => {
    const dept = s.department || 'Other'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})
  const barData = Object.entries(deptData)
    .map(([name, count]) => ({ name: name.split(' ')[0], count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Enrollment pie chart
  const enrolledCount = students.filter((s) => s.courses?.length > 0).length
  const notEnrolled   = students.length - enrolledCount
  const pieData = [
    { name: 'Enrolled', value: enrolledCount },
    { name: 'Not enrolled', value: notEnrolled },
  ]

  const avgCourses = students.length
    ? (students.reduce((a, s) => a + (s.courses?.length || 0), 0) / students.length).toFixed(1)
    : '0'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: loading ? '—' : students.length, icon: GraduationCap, color: 'indigo', trend: 0, subtitle: 'Registered in system' },
          { label: 'Total Courses',  value: loading ? '—' : courses.length,  icon: BookOpen,      color: 'emerald', trend: 0, subtitle: 'Available courses' },
          { label: 'System Users',   value: loading ? '—' : (users.length || '—'), icon: Users,   color: 'violet', subtitle: 'Admin access required' },
          { label: 'Avg Courses/Student', value: loading ? '—' : avgCourses, icon: TrendingUp,    color: 'amber', subtitle: 'Enrollment ratio' },
        ].map((card, i) => (
          <div key={i} className="animate-slide-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Bar chart — students per dept */}
          <div className="xl:col-span-2 glass-card rounded-2xl p-5 animate-slide-in-up" style={{ animationDelay: '0.28s' }}>
            <div className="mb-4">
              <h2 className="font-display font-bold text-white text-base">Students by Department</h2>
              <p className="text-xs font-body text-slate-500 mt-0.5">Distribution across departments</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — enrollment status */}
          <div className="glass-card rounded-2xl p-5 animate-slide-in-up" style={{ animationDelay: '0.35s' }}>
            <div className="mb-4">
              <h2 className="font-display font-bold text-white text-base">Enrollment Status</h2>
              <p className="text-xs font-body text-slate-500 mt-0.5">Students enrolled vs. not</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  <Cell fill="#6366F1" fillOpacity={0.9} />
                  <Cell fill="#1E3A5F" fillOpacity={0.9} />
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'Outfit' }}>{value}</span>
                  )}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="glass-card px-3 py-2 rounded-xl border border-white/10 text-xs font-display">
                        <p className="text-slate-400">{payload[0].name}</p>
                        <p className="text-white font-semibold">{payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent students + courses */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Recent Students */}
        <div className="xl:col-span-3 glass-card rounded-2xl overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
            <div>
              <h2 className="font-display font-bold text-white text-base">Recent Students</h2>
              <p className="text-xs font-body text-slate-500 mt-0.5">Latest additions to the system</p>
            </div>
            <Link to="/students" className="flex items-center gap-1.5 text-xs font-display font-semibold text-accent hover:text-accent-light transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : recentStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GraduationCap className="w-10 h-10 text-slate-700 mb-3" />
              <p className="font-display font-semibold text-slate-500">No students yet</p>
              <Link to="/students" className="btn-primary mt-4 text-xs">Add First Student</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/04">
              {recentStudents.map((student, i) => (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/80 to-violet-600/80 flex items-center justify-center shrink-0">
                    <span className="font-display font-bold text-white text-sm">{student.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white text-sm truncate">{student.name}</p>
                    <p className="text-xs font-body text-slate-500 truncate">{student.email}</p>
                  </div>
                  <div className="hidden sm:block shrink-0"><DeptBadge dept={student.department} /></div>
                  <div className="shrink-0 text-xs font-body text-slate-600">
                    {student.courses?.length || 0} course{student.courses?.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Courses */}
        <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
            <div>
              <h2 className="font-display font-bold text-white text-base">Recent Courses</h2>
              <p className="text-xs font-body text-slate-500 mt-0.5">Latest courses added</p>
            </div>
            <Link to="/courses" className="flex items-center gap-1.5 text-xs font-display font-semibold text-accent hover:text-accent-light transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : recentCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-10 h-10 text-slate-700 mb-3" />
              <p className="font-display font-semibold text-slate-500">No courses yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/04">
              {recentCourses.map((course) => (
                <div key={course.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-white text-sm truncate">{course.courseName}</p>
                      <p className="text-xs font-body text-slate-500 mt-0.5 truncate">{course.trainer}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span className="text-xs font-body text-slate-600">{course.duration}</span>
                      </div>
                    </div>
                    <div className="text-xs font-body text-slate-600 shrink-0">
                      {course.students?.length || 0} enrolled
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
