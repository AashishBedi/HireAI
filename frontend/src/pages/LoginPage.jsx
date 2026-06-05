import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginWithData } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginApi(form)
      const { token, email, role, name } = res.data.data
      loginWithData(token, { email, role, name })
      toast.success(`Welcome back, ${name}!`)
      navigate(role === 'RECRUITER' ? '/dashboard' : '/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Left decoration */}
      <div className="hidden lg:flex flex-col justify-center items-center w-96 mr-16 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <Briefcase size={36} className="text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
          Hire<span className="text-blue-600">AI</span>
        </h2>
        <p className="text-slate-500 leading-relaxed">
          Your AI-powered career platform. Get matched with opportunities that fit your skills perfectly.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 w-full">
          {['Resume Analysis', 'Skill Matching', 'Smart Ranking', 'Interview Prep'].map((f) => (
            <div key={f} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
              ✨ {f}
            </div>
          ))}
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1">Sign in to your HireAI account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:border-slate-300 transition-all text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:border-slate-300 transition-all text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
