import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
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