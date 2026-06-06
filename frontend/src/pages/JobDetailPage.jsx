import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, ArrowLeft, Cpu, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getJobById } from '../api/jobs'
import { applyToJob } from '../api/applications'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import { LoadingSpinner, ErrorMessage } from '../components/Feedback'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isSeeker } = useAuth()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    getJobById(id)
        .then((res) => setJob(res.data?.data || res.data))
        .catch(() => setError('Failed to load job details.'))
        .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!isAuthenticated) { toast.error('Please login to apply'); navigate('/login'); return }
    setApplying(true)
    try {
      await applyToJob(id)
      setApplied(true)
      toast.success('Application submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><LoadingSpinner text="Loading job details…" /></div>
  if (error || !job) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorMessage message={error || 'Job not found'} onRetry={() => window.location.reload()} /></div>

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to jobs
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3">
                  <StatusBadge status={job.status || 'OPEN'} />
                </div>
                <h1 className="text-3xl font-extrabold leading-tight">{job.title}</h1>
                {job.company && <p className="text-blue-200 mt-1 text-lg font-medium">{job.company}</p>}
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cpu size={28} className="text-white" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-sm">
              {job.location && (
                  <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                <MapPin size={14} /> {job.location}
              </span>
              )}
              {job.salaryRange && (
                  <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                <IndianRupee size={14} /> {job.salaryRange}
              </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* Description */}
            {job.description && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Job Description</h2>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                    {job.description}
                  </div>
                </section>
            )}

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                        <span
                            key={skill}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
                        >
                    <CheckCircle size={12} className="text-blue-500" /> {skill}
                  </span>
                    ))}
                  </div>
                </section>
            )}

            {/* Apply */}
            {isSeeker && (
                <div className="border-t border-slate-100 pt-6">
                  {applied ? (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                        <CheckCircle size={20} className="text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Application Submitted!</p>
                          <p className="text-sm text-green-600">You'll hear back soon. Track it in My Applications.</p>
                        </div>
                      </div>
                  ) : (
                      <button
                          onClick={handleApply}
                          disabled={applying || job.status === 'CLOSED'}
                          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-95"
                      >
                        {applying ? (
                            <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </span>
                        ) : job.status === 'CLOSED' ? 'Position Closed' : 'Apply for This Position'}
                      </button>
                  )}
                </div>
            )}

            {!isAuthenticated && (
                <div className="border-t border-slate-100 pt-6">
                  <p className="text-slate-500 text-sm">
                    <button onClick={() => navigate('/login')} className="text-blue-600 font-semibold hover:underline">Sign in</button> to apply for this position.
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}