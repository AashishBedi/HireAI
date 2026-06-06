import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { register as registerApi } from '../api/auth'

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains uppercase', ok: /[A-Z]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const barColor = ['bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-emerald-500'][score]
  return (
      <div className="mt-2 space-y-1.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? barColor : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map(({ label, ok }) => (
              <span key={label} className={`text-xs ${ok ? 'text-green-600' : 'text-slate-400'}`}>
            {ok ? '✓' : '○'} {label}
          </span>
          ))}
        </div>
      </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SEEKER' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registerApi(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Briefcase size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900">Hire<span className="text-blue-600">AI</span></span>
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900">Create account</h1>
              <p className="text-slate-500 mt-1">Join thousands of professionals on HireAI</p>
            </div>

            {/* Role toggle */}
            <div className="flex gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
              {[
                { value: 'SEEKER', icon: <User size={16} />, label: 'Job Seeker' },
                { value: 'RECRUITER', icon: <Users size={16} />, label: 'Recruiter' },
              ].map(({ value, icon, label }) => (
                  <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          form.role === value
                              ? 'bg-white text-blue-700 shadow-md'
                              : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {icon} {label}
                  </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

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
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all text-slate-900 placeholder-slate-400"
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
                      placeholder="Create a strong password"
                      className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all text-slate-900 placeholder-slate-400"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {form.password && <PasswordStrength password={form.password} />}
              </div>

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-95 mt-2"
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
                ) : `Join as ${form.role === 'SEEKER' ? 'Job Seeker' : 'Recruiter'}`}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}