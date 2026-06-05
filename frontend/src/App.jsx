import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JobFeedPage from './pages/JobFeedPage'
import JobDetailPage from './pages/JobDetailPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import ResumeUploadPage from './pages/ResumeUploadPage'
import RecruiterDashboard from './pages/RecruiterDashboard'
import ApplicationsManagerPage from './pages/ApplicationsManagerPage'

function AuthRedirect({ children }) {
  const { isAuthenticated, isRecruiter } = useAuth()
  if (isAuthenticated) return <Navigate to={isRecruiter ? '/dashboard' : '/jobs'} replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
          <Route path="/jobs" element={<JobFeedPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* SEEKER only */}
          <Route
            path="/my-applications"
            element={<ProtectedRoute allowedRoles={['SEEKER']}><MyApplicationsPage /></ProtectedRoute>}
          />
          <Route
            path="/resume"
            element={<ProtectedRoute allowedRoles={['SEEKER']}><ResumeUploadPage /></ProtectedRoute>}
          />

          {/* RECRUITER only */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>}
          />
          <Route
            path="/applications-manager"
            element={<ProtectedRoute allowedRoles={['RECRUITER']}><ApplicationsManagerPage /></ProtectedRoute>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  )
}
