import { MapPin, IndianRupee, Cpu, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  OPEN: 'bg-green-100 text-green-700 border-green-200',
  CLOSED: 'bg-red-100 text-red-700 border-red-200',
}

export default function JobCard({ job, onApply, applying, matchScore, hasResume }) {
  const navigate = useNavigate()

  const score = matchScore != null ? Math.round(matchScore * 100) : null
  const scoreColor =
    score >= 70 ? 'text-green-600' :
    score >= 40 ? 'text-amber-500' :
    'text-red-500'

  const ringColor =
    score >= 70 ? 'border-green-400' :
    score >= 40 ? 'border-amber-400' :
    'border-red-400'

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col gap-4 cursor-pointer group"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[job.status] || statusColors.OPEN}`}>
              {job.status || 'OPEN'}
            </span>
            {hasResume && score !== null && (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border-2 ${ringColor} ${scoreColor} bg-white`}>
                <Sparkles size={10} />
                {score}% match
              </div>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
            {job.title}
          </h3>
          {job.company && (
            <p className="text-sm text-blue-600 font-medium mt-0.5">{job.company}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Cpu size={22} className="text-blue-600" />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-sm text-slate-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-blue-400" /> {job.location}
          </span>
        )}
        {job.salaryRange && (
          <span className="flex items-center gap-1">
            <IndianRupee size={13} className="text-green-500" /> {job.salaryRange}
          </span>
        )}
      </div>

      {/* Description preview */}
      {job.description && (
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{job.description}</p>
      )}

      {/* Skills */}
      {job.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
              +{job.requiredSkills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Apply button */}
      {onApply && (
        <button
          onClick={(e) => { e.stopPropagation(); onApply(job.id) }}
          disabled={applying}
          className="mt-auto w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          {applying ? 'Applying…' : 'Apply Now'}
        </button>
      )}
    </div>
  )
}