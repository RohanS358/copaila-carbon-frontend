import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // true on first load while we verify token

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSession = useCallback((userData, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
  }, [])

  const login = useCallback(async (email, password, schoolId) => {
    const res = await authApi.login({ email, password, schoolId })
    saveSession(res.user, res.accessToken, res.refreshToken)
    return res
  }, [saveSession])

  // Passwordless student entry — identified by school + class + roll number.
  const studentLogin = useCallback(async (schoolId, className, rollNo, name) => {
    const res = await authApi.studentLogin({ schoolId, className, rollNo, name })
    saveSession(res.user, res.accessToken, res.refreshToken)
    return res
  }, [saveSession])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch (_) {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, studentLogin, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
