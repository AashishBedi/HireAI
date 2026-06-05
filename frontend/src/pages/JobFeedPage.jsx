import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { getJobs, searchJobs } from '../api/jobs'
import { applyToJob } from '../api/applications'
import { getMyResume } from '../api/resume'
import { useAuth } from '../context/AuthContext'
import JobCard from '../components/JobCard'
import Pagination from '../components/Pagination'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/Feedback'

export default function JobFeedPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [jobs, setJobs] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applying, setApplying] = useState(null)
  const [hasResume, setHasResume] = useState(false)

  const [skill, setSkill] = useState(searchParams.get('skill') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [searchActive, setSearchActive] = useState(!!(searchParams.get('skill') || searchParams.get('location')))

  // Check if user has resume
  useEffect(() => {
    if (isAuthenticated) {
      getMyResume()
        .then(() => setHasResume(true))
        .catch(() => setHasResume(false))
    }
  }, [isAuthenticated])

  const fetchJobs = useCallback(async (p = 0) => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (searchActive && (skill || location)) {
        res = await searchJobs(skill, location)
        const data = res.data?.data
        const list = Array.isArray(data) ? data : data?.content || []
        setJobs(list)
        setTotalPages(data?.totalPages || 1)
      } else {
        res = await getJobs(p, 9)
        const data = res.data?.data
        const list = Array.isArray(data) ? data : data?.content || []
        setJobs(list)
        setTotalPages(data?.totalPages || 1)
      }
    } catch {
      setError('Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [searchActive, skill, location])

  useEffect(() => { fetchJobs(page) }, [page, fetchJobs])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSearchActive(true)
    setSearchParams({ skill, location })
    fetchJobs(0)
  }

  const handleClear = () => {
    setSkill('')
    setLocation('')
    setSearchActive(false)
    setPage(0)
    setSearchParams({})
  }

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      toast.error('Please login to apply')
      return
    }
    setApplying(jobId)
    try {
      await applyToJob(jobId)
      toast.success('Application submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply. You may have already applied.')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Job Opportunities</h1>
        <p className="text-slate-500 mt-1">
          {searchActive ? `Results for "${skill || location}"` : 'Browse all available positions'}
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Skill (e.g. React, Java)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-blue-500/30 active:scale-95"
          >
            <SlidersHorizontal size={15} /> Search
          </button>
          {searchActive && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* No resume warning */}
      {isAuthenticated && !hasResume && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Upload your resume to see AI match scores</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Get personalized match percentages on every job listing.{' '}
              <a href="/resume" className="underline font-medium">Upload now →</a>
            </p>
          </div>
        </div>
      )}

      {/* Jobs grid */}
      {loading ? (
        <LoadingSpinner text="Loading jobs…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchJobs(page)} />
      ) : jobs.length === 0 ? (
        <EmptyState icon="🔍" title="No jobs found" description="Try adjusting your search criteria or check back later." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, i) => (
              <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <JobCard
                  job={job}
                  onApply={isAuthenticated ? handleApply : undefined}
                  applying={applying === job.id}
                  hasResume={hasResume}
                  matchScore={job.matchScore}
                />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
