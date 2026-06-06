import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Users, Briefcase, TrendingUp, Zap } from 'lucide-react'
import { getJobs } from '../api/jobs'
import JobCard from '../components/JobCard'
import { LoadingSpinner } from '../components/Feedback'

const STATS = [
  { icon: <Briefcase size={20} />, label: 'Active Jobs', value: '10,000+' },
  { icon: <Users size={20} />, label: 'Companies', value: '500+' },
  { icon: <TrendingUp size={20} />, label: 'Placements', value: '25,000+' },
  { icon: <Zap size={20} />, label: 'AI Powered', value: '100%' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [skill, setSkill] = useState('')
  const [location, setLocation] = useState('')
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJobs(0, 6)
        .then((res) => {
          const data = res.data?.data
          setFeaturedJobs(Array.isArray(data) ? data : data?.content || [])
        })
        .catch(() => setFeaturedJobs([]))
        .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/jobs?skill=${encodeURIComponent(skill)}&location=${encodeURIComponent(location)}`)
  }

  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full text-sm font-medium text-blue-200 mb-6 animate-fade-in">
                <Zap size={14} className="text-yellow-400" />
                AI-Powered Job Matching
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 animate-slide-up">
                Find Your{' '}
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-200 bg-clip-text text-transparent">
                Dream Job
              </span>
                <br />with AI Precision
              </h1>

              <p className="text-lg lg:text-xl text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
                Our AI analyzes your resume and matches you with the best opportunities.
                Get ranked higher, discover hidden skills gaps, and land interviews faster.
              </p>

              {/* Search bar */}
              <form
                  onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto animate-fade-in"
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="text"
                      placeholder="Skill (e.g. React, Java, Python)"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="text"
                      placeholder="Location (e.g. Bangalore)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                  />
                </div>
                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all duration-200 active:scale-95 whitespace-nowrap"
                >
                  Search <ArrowRight size={18} />
                </button>
              </form>

              {/* CTA buttons */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-md hover:bg-blue-50 hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xl leading-none">{value}</p>
                      <p className="text-sm text-slate-500">{label}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured jobs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Featured Jobs</h2>
              <p className="text-slate-500 mt-1">Handpicked opportunities matched by AI</p>
            </div>
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
              <LoadingSpinner text="Loading featured jobs…" />
          ) : featuredJobs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg">No jobs available right now.</p>
                <p className="text-sm mt-1">Check back soon!</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredJobs.map((job, i) => (
                    <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <JobCard job={job} />
                    </div>
                ))}
              </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 mx-4 sm:mx-6 lg:mx-8 mb-16 rounded-3xl overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 py-16 text-center text-white">
            <h2 className="text-3xl font-extrabold mb-4">Ready to find your next role?</h2>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto">
              Upload your resume and let AI match you with the perfect jobs in seconds.
            </p>
            <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 duration-200"
            >
              Start Now — It's Free
            </button>
          </div>
        </section>
      </div>
  )
}