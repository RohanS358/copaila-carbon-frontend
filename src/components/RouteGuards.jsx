import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Where a logged-in user belongs based on their backend role.
export function dashboardPathForUser(user) {
  const role = user?.role
  if (role === 'STUDENT') return '/student'
  // SUPER_ADMIN / SCHOOL_ADMIN / TEACHER → school portal
  return '/dashboard'
}

// Full-screen brand splash while we verify the stored session on first load.
function AuthSplash() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#f5f7ee' }}>
      <div style={{ width: 44, height: 44, border: '4px solid #e4edd6', borderTopColor: '#2D4A32', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#4E7D5B', fontSize: '0.85rem' }}>Restoring your session…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// Guards every portal route. Access requires a real authenticated session —
// typing a URL while logged out (or after logout) always redirects to /login.
// `role` optionally restricts a route to a portal: 'student' or 'school'.
export function RequireAccess({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthSplash />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  // Keep students out of the school portal and vice-versa.
  if (role) {
    const isStudent = user.role === 'STUDENT'
    if (role === 'student' && !isStudent) return <Navigate to="/dashboard" replace />
    if (role === 'school' && isStudent) return <Navigate to="/student" replace />
  }
  return children
}

// Auth pages (login / join): a user who is already signed in should never
// see these again — bounce them straight to their dashboard.
export function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <AuthSplash />
  if (user) return <Navigate to={dashboardPathForUser(user)} replace />
  return children
}
