import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadResume, getMyResume } from '../api/resume'

export default function ResumeUploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    getMyResume()
        .then((res) => setResumeData(res.data?.data || res.data))
        .catch(() => setResumeData(null))
        .finally(() => setLoadingExisting(false))
  }, [])

  const handleFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.')
      return
    }
    setUploading(true)
    try {
      const res = await uploadResume(file)
      const data = res.data?.data || res.data
      setResumeData(data)
      toast.success('Resume uploaded and analyzed successfully!')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const onFileChange = (e) => handleFile(e.target.files[0])

  const skills = resumeData?.extractedSkills || resumeData?.skills || []

  return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Resume Upload</h1>
          <p className="text-slate-500 mt-1">Upload your resume to unlock AI-powered job matching</p>
        </div>

        {/* Upload zone */}
        <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                    : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            } ${uploading ? 'pointer-events-none' : ''}`}
        >
          <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={onFileChange}
          />

          {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div>
                  <p className="font-semibold text-slate-700 text-lg">Analyzing your resume…</p>
                  <p className="text-sm text-slate-400 mt-1">AI is extracting your skills</p>
                </div>
              </div>
          ) : (
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-blue-600 scale-110' : 'bg-blue-100'}`}>
                  <Upload size={32} className={dragOver ? 'text-white' : 'text-blue-600'} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xl">
                    {dragOver ? 'Drop your PDF here!' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText size={13} />
                  <span>PDF only · Max 5MB</span>
                </div>
              </div>
          )}
        </div>

        {/* Existing resume */}
        {!loadingExisting && resumeData && (
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fade-in">
              {/* Resume file info */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Resume on file</p>
                  <p className="text-xs text-slate-400">
                    {resumeData.fileName || 'resume.pdf'}
                    {resumeData.uploadedAt && ` · Uploaded ${new Date(resumeData.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              </div>

              {/* Extracted skills */}
              {skills.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="font-bold text-slate-900">Extracted Skills</h2>
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {skills.length} detected
                </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                          <span
                              key={skill}
                              className="flex items-center gap-1.5 text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full"
                          >
                    <CheckCircle size={11} className="text-green-500" /> {skill}
                  </span>
                      ))}
                    </div>
                  </div>
              ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle size={16} />
                    <p className="text-sm">No skills extracted yet. AI analysis may still be in progress.</p>
                  </div>
              )}
            </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">💡 Tips for better matching</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>List all technical skills clearly in your resume</li>
            <li>Include certifications and tools you've used</li>
            <li>Keep your resume updated for accurate matches</li>
            <li>Use industry-standard skill names (e.g. "React.js", "Spring Boot")</li>
          </ul>
        </div>
      </div>
  )
}