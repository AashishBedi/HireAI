import { createContext, useContext, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

function getValidToken() {
  const t = localStorage.getItem('token')
  if (!t) return null
  try {
    const decoded = jwtDecode(t)
    // exp is in seconds; Date.now() is in milliseconds
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }
    return t
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getValidToken())
  const [user, setUser] = useState(() => {
    // Only restore user if we have a valid token
    if (!getValidToken()) return null
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (tokenStr) => {
    try {
      const decoded = jwtDecode(tokenStr)
      const userData = {
        name: decoded.name || decoded.sub || 'User',
        email: decoded.email || decoded.sub,
        role: decoded.role,
      }
      setToken(tokenStr)
      setUser(userData)
      localStorage.setItem('token', tokenStr)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (e) {
      console.error('Failed to decode token', e)
      return null
    }
  }

  const loginWithData = (tokenStr, apiUser) => {
    const userData = {
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
    }
    setToken(tokenStr)
    setUser(userData)
    localStorage.setItem('token', tokenStr)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!token
  const isSeeker = user?.role === 'SEEKER'
  const isRecruiter = user?.role === 'RECRUITER'

  return (
      <AuthContext.Provider value={{ token, user, login, loginWithData, logout, isAuthenticated, isSeeker, isRecruiter }}>
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
