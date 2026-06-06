import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Briefcase, LogOut, Menu, X, User,
  LayoutDashboard, FileText, ClipboardList, Upload
} from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout, isSeeker, isRecruiter } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
      `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
      }`

  const seekerLinks = [
    { to: '/jobs', icon: <Briefcase size={15} />, label: 'Browse Jobs' },
    { to: '/my-applications', icon: <ClipboardList size={15} />, label: 'My Applications' },
    { to: '/resume', icon: <Upload size={15} />, label: 'Resume' },
  ]

  const recruiterLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { to: '/applications-manager', icon: <FileText size={15} />, label: 'Applicants' },
  ]

  const links = isSeeker ? seekerLinks : isRecruiter ? recruiterLinks : []

  return (
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Briefcase size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">
              Hire<span className="text-blue-600">AI</span>
            </span>
            </NavLink>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {!isAuthenticated && (
                  <NavLink to="/" className={linkClass}>Home</NavLink>
              )}
              {links.map(({ to, icon, label }) => (
                  <NavLink key={to} to={to} className={linkClass}>
                    {icon} {label}
                  </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">{user?.name}</span>
                      <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {user?.role}
                  </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </>
              ) : (
                  <>
                    <NavLink
                        to="/login"
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      Login
                    </NavLink>
                    <NavLink
                        to="/register"
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Get Started
                    </NavLink>
                  </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1 animate-fade-in">
              {!isAuthenticated && (
                  <NavLink to="/" className={linkClass} onClick={() => setMobileOpen(false)}>Home</NavLink>
              )}
              {links.map(({ to, icon, label }) => (
                  <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
                    {icon} {label}
                  </NavLink>
              ))}
              {isAuthenticated ? (
                  <button
                      onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2"
                  >
                    <LogOut size={15} /> Logout ({user?.name})
                  </button>
              ) : (
                  <div className="flex gap-2 mt-2">
                    <NavLink to="/login" className="flex-1 text-center px-4 py-2 text-sm font-medium border border-blue-300 text-blue-600 rounded-lg" onClick={() => setMobileOpen(false)}>Login</NavLink>
                    <NavLink to="/register" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg" onClick={() => setMobileOpen(false)}>Register</NavLink>
                  </div>
              )}
            </div>
        )}
      </nav>
  )
}