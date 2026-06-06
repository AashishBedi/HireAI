import { useState, useEffect, useRef } from 'react'
import { Plus, X, ToggleLeft, ToggleRight, Briefcase, MapPin, DollarSign, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { postJob, getJobs, updateJobStatus } from '../api/jobs'
import StatusBadge from '../components/StatusBadge'
import { LoadingSpinner, EmptyState } from '../components/Feedback'

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const addTag = () => {
    const tag = input.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }
  const removeTag = (t) => onChange(value.filter((v) => v !== t))
  return (
      <div className="border border-slate-200 rounded-xl bg-slate-50 p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <div className="flex flex-wrap gap-1.5 mb-1">
          {value.map((tag) => (
              <span key={tag} className="flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-200">
              <X size={11} />
            </button>
          </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder-slate-400 px-1"
          />
          <button
              type="button"
              onClick={addTag}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
          >
            + Add
          </button>
        </div>
      </div>
  )
}

const EMPTY_FORM = { title: '', description: '', requiredSkills: [], location: '', salaryRange: '' }

export default function RecruiterDashboard() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [posting, setPosting] = useState(false)
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [page, setPage] = useState(0)

  const fetchJobs = async () => {
    setLoadingJobs(true)
    try {
      const res = await getJobs(page, 20)
      const data = res.data?.data
      setJobs(Array.isArray(data) ? data : data?.content || [])
    } catch {
      setJobs([])
    } finally {
      setLoadingJobs(false)
    }
  }

  useEffect(() => { fetchJobs() }, [page])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description) { toast.error('Title and description are required'); return }
    setPosting(true)
    try {
      await postJob(form)
      toast.success('Job posted successfully!')
      setForm(EMPTY_FORM)
      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job.')
    } finally {
      setPosting(false)
    }
  }

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    setTogglingId(job.id)
    try {
      await updateJobStatus(job.id, newStatus)
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: newStatus } : j))
      toast.success(`Job marked as ${newStatus}`)
    } catch {
      toast.error('Failed to update job status.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-500 mt-1">Post new jobs and manage your listings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Post job form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus size={15} className="text-blue-600" />
                </div>
                Post New Job
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Job Title *</label>
                  <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Senior React Developer"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description *</label>
                  <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Describe the role, responsibilities, and requirements…"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Required Skills</label>
                  <TagInput
                      value={form.requiredSkills}
                      onChange={(tags) => setForm({ ...form, requiredSkills: tags })}
                      placeholder="Type skill + Enter (e.g. React)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Location</label>
                    <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Bangalore / Remote"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Salary Range</label>
                    <input
                        name="salaryRange"
                        value={form.salaryRange}
                        onChange={handleChange}
                        placeholder="e.g. ₹12-18 LPA"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={posting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-blue-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  {posting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting…</>
                  ) : (
                      <><Plus size={16} /> Post Job</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Job listings */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-lg">Your Job Listings</h2>
              <span className="text-sm text-slate-400">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
            </div>

            {loadingJobs ? (
                <LoadingSpinner text="Loading jobs…" />
            ) : jobs.length === 0 ? (
                <EmptyState icon="📝" title="No jobs posted yet" description="Create your first job listing using the form." />
            ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                      <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-200 animate-fade-in">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <StatusBadge status={job.status || 'OPEN'} />
                            </div>
                            <h3 className="font-bold text-slate-900 truncate">{job.title}</h3>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                              {job.location && <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>}
                              {job.salaryRange && <span className="flex items-center gap-1"><DollarSign size={11} /> {job.salaryRange}</span>}
                            </div>
                            {job.requiredSkills?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {job.requiredSkills.slice(0, 4).map((s) => (
                                      <span key={s} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">{s}</span>
                                  ))}
                                </div>
                            )}
                          </div>

                          {/* Toggle button */}
                          <button
                              onClick={() => toggleStatus(job)}
                              disabled={togglingId === job.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  job.status === 'OPEN'
                                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                                      : 'border-green-200 text-green-600 hover:bg-green-50'
                              } disabled:opacity-50`}
                          >
                            {togglingId === job.id ? (
                                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : job.status === 'OPEN' ? (
                                <ToggleRight size={14} />
                            ) : (
                                <ToggleLeft size={14} />
                            )}
                            {job.status === 'OPEN' ? 'Close' : 'Reopen'}
                          </button>
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