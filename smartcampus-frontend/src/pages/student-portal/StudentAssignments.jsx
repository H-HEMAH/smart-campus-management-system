import { useEffect, useState } from 'react'
import { FileText, Calendar, BookOpen, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Spinner } from '../../components/ui/LoadingSpinner'

function getDaysLeft(deadline) {
  if (!deadline) return null
  const diff = new Date(deadline) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function StudentAssignments() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [aRes, sRes] = await Promise.allSettled([
          api.get('/assignments'),
          api.get('/student'),
        ])
        if (aRes.status === 'fulfilled') setAssignments(aRes.value.data)
        if (sRes.status === 'fulfilled') {
          const found = sRes.value.data.find(s => s.email?.toLowerCase() === user?.email?.toLowerCase())
          if (found?.courses) {
            setEnrolledCourseIds(new Set(found.courses.map(c => c.id)))
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  // Show assignments for enrolled courses only
  const myAssignments = assignments.filter(a =>
    !a.courseId || enrolledCourseIds.size === 0 || enrolledCourseIds.has(a.courseId)
  )

  const upcoming  = myAssignments.filter(a => getDaysLeft(a.deadline) > 0)
  const overdue   = myAssignments.filter(a => getDaysLeft(a.deadline) <= 0)

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>

  const AssignmentCard = ({ assignment }) => {
    const daysLeft = getDaysLeft(assignment.deadline)
    const isOverdue = daysLeft !== null && daysLeft <= 0
    const isUrgent  = daysLeft !== null && daysLeft > 0 && daysLeft <= 3
    return (
      <div className="glass-card rounded-2xl p-5 border border-white/06 hover:border-accent/20 transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          {isOverdue
            ? <span className="chip border bg-danger/10 text-danger border-danger/20 text-[10px] flex items-center gap-1"><AlertCircle className="w-3 h-3" />Overdue</span>
            : isUrgent
              ? <span className="chip border bg-amber-400/10 text-amber-400 border-amber-400/20 text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" />Due soon</span>
              : <span className="chip border bg-success/10 text-success border-success/20 text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>
          }
        </div>
        <h3 className="font-display font-bold text-white text-sm mb-2">{assignment.title}</h3>
        {assignment.description && (
          <p className="text-xs font-body text-slate-400 mb-3 line-clamp-2">{assignment.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {assignment.courseName && (
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{assignment.courseName}</span>
          )}
          {assignment.deadline && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-danger' : isUrgent ? 'text-amber-400' : ''}`}>
              <Calendar className="w-3 h-3" />
              {isOverdue ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`
                         : daysLeft === 0 ? 'Due today'
                         : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">My Assignments</h2>
        <p className="text-sm font-body text-slate-500 mt-0.5">Assignments from your enrolled courses</p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
          <FileText className="w-12 h-12 text-slate-700" />
          <p className="font-display font-semibold text-slate-500">No assignments yet</p>
          <p className="text-sm font-body text-slate-600">Assignments will appear here once your instructor posts them.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Active Assignments ({upcoming.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map(a => <AssignmentCard key={a.id} assignment={a} />)}
              </div>
            </div>
          )}
          {overdue.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-danger" /> Overdue ({overdue.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdue.map(a => <AssignmentCard key={a.id} assignment={a} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
