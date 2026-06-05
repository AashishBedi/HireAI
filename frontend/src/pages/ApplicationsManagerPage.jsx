import { useState, useEffect } from 'react'
import { User, ChevronDown, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { getJobs } from '../api/jobs'
import { getJobApplications, updateApplicationStatus } from '../api/applications'
import StatusBadge from '../components/StatusBadge'
import MatchScoreBar from '../components/MatchScoreBar'
import { LoadingSpinner, EmptyState } from '../components/Feedback'

const STATUS_OPTIONS = ['APPLIED', 'REVIEWED', 'INTERVIEW', 'REJECTED', 'ACCEPTED']

function ApplicantCard({ app, onStatusChange, updatingId }) {
  const missingSkills = app.missingSkills || []
  const score = app.matchScore ?? null
  const rank = app._rank

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-200 animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Rank badge */}
        {rank && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            rank === 1 ? 'bg-yellow-100 text-yellow-700' :
            rank === 2 ? 'bg-slate-100 text-slate-500' :
            rank === 3 ? 'bg-orange-100 text-orange-600' :
            'bg-slate-50 text-slate-400'
          }`}>
            {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
          </div>
        )}

        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Name & email */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-slate-900">
                {app.applicantName || app.seeker?.name || app.seekerName || 'Applicant'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {app.applicantEmail || app.seeker?.email || app.seekerEmail || ''}
              </p>
            </div>
            {/* Status dropdown */}
            <div className="relative">
              <select
                value={app.status}
                onChange={(e) => onStatusChange(app.id, e.target.value)}
                disabled={updatingId === app.id}
                className="appearance-none pr-7 pl-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-300 transition-all disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Current status badge */}
          <StatusBadge status={app.status} />

          {/* Match score */}
          {score !== null && (
            <MatchScoreBar score={score} />
          )}

          {/* Missing skills */}
          {missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Missing Skills:</p>
              <div className="flex flex-wrap gap-1">
                {missingSkills.map((s) => (
                  <span key={s} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Applied date */}
          {app.appliedAt && (
            <p className="text-xs text-slate-300">
              Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsManagerPage() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [applicants, setApplicants] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingApps, setLoadingApps] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch recruiter's jobs
  useEffect(() => {
    getJobs(0, 50)
      .then((res) => {
        const data = res.data?.data
        const list = Array.isArray(data) ? data : data?.content || []
        setJobs(list)
        if (list.length > 0) setSelectedJobId(String(list[0].id))
      })
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false))
  }, [])

  // Fetch applicants when job selection changes
  useEffect(() => {
    if (!selectedJobId) return
    setLoadingApps(true)
    getJobApplications(selectedJobId)
      .then((res) => {
        const data = res.data?.data
        const list = Array.isArray(data) ? data : data?.content || []
        const sorted = [...list].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
        setApplicants(sorted.map((app, i) => ({ ...app, _rank: i + 1 })))
      })
      .catch(() => setApplicants([]))
      .finally(() => setLoadingApps(false))
  }, [selectedJobId])

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId)
    try {
      await updateApplicationStatus(appId, newStatus)
      setApplicants((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a)
      )
      toast.success(`Status updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const selectedJob = jobs.find((j) => String(j.id) === selectedJobId)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Applications Manager</h1>
        <p className="text-slate-500 mt-1">Review applicants sorted by AI match score</p>
      </div>

      {loadingJobs ? (
        <LoadingSpinner text="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState icon="📋" title="No jobs posted yet" description="Post a job from the Dashboard first." />
      ) : (
        <>
          {/* Job selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Job Position</label>
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full appearance-none pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium cursor-pointer hover:border-blue-300 transition-all"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} {job.location ? `— ${job.location}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {selectedJob && (
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusBadge status={selectedJob.status || 'OPEN'} />
                {selectedJob.requiredSkills?.map((s) => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Applicants header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h2 className="font-bold text-slate-900">
                Applicants
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({applicants.length} total) — sorted by AI match score
                </span>
              </h2>
            </div>
          </div>

          {loadingApps ? (
            <LoadingSpinner text="Loading applicants…" />
          ) : applicants.length === 0 ? (
            <EmptyState icon="👥" title="No applicants yet" description="Applicants will appear here once they apply." />
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => (
                <ApplicantCard
                  key={app.id}
                  app={app}
                  onStatusChange={handleStatusChange}
                  updatingId={updatingId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
