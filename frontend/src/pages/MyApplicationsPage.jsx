import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Calendar, ChevronRight } from 'lucide-react'
import { getMyApplications } from '../api/applications'
import StatusBadge from '../components/StatusBadge'
import MatchScoreBar from '../components/MatchScoreBar'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/Feedback'

export default function MyApplicationsPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyApplications()
      .then((res) => {
        const data = res.data?.data
        setApplications(Array.isArray(data) ? data : data?.content || [])
      })
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Applications</h1>
        <p className="text-slate-500 mt-1">Track your job applications and AI match scores</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading applications…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No applications yet"
          description="Browse jobs and apply to get started. Your applications will appear here."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => {
            const missingSkills = app.missingSkills || []
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Job info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-bold text-slate-900 text-base hover:text-blue-700 cursor-pointer transition-colors truncate"
                        onClick={() => navigate(`/jobs/${app.jobId || app.job?.id}`)}
                      >
                        {app.jobTitle || app.job?.title || 'Job Position'}
                      </h3>
                      {(app.company || app.job?.company) && (
                        <p className="text-sm text-blue-600 font-medium">{app.company || app.job?.company}</p>
                      )}
                      {app.appliedAt && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar size={11} />
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={app.status} />
                </div>

                <div className="space-y-3">
                  {/* Match score */}
                  {app.matchScore !== undefined && app.matchScore !== null && (
                    <MatchScoreBar score={app.matchScore} />
                  )}

                  {/* Missing skills */}
                  {missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">Skills to improve:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-medium bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View job link */}
                  <button
                    onClick={() => navigate(`/jobs/${app.jobId || app.job?.id}`)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors mt-1"
                  >
                    View job details <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
