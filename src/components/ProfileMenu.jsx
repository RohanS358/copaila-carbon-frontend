import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User as UserIcon, Mail, School as SchoolIcon, MapPin, BadgeCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'

// ============================================================
// PROFILE MENU — the top-right avatar button + dropdown.
// Shows the signed-in user's name, email, role and school, and
// provides a working Logout action. Shared by the School and
// Student portals so both behave identically.
// ============================================================

// Build a short initials avatar from a name/email, falling back to 👤.
function initialsOf(name, email) {
  const src = (name || email || '').trim()
  if (!src) return ''
  const parts = src.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  STUDENT: 'Student',
}

export default function ProfileMenu({ accent = '#1E2F1E' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    selectedSchool, level,
    setSelectedRole, setSelectedSchool, setSelectedSchoolId,
  } = useApp()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const name = user?.name || t('Guest')
  const email = user?.email || ''
  const role = ROLE_LABEL[user?.role] || (user?.role ? String(user.role) : t('Guest'))
  const schoolName = user?.school?.name || selectedSchool || ''
  const place = [user?.school?.district, user?.school?.province].filter(Boolean).join(', ')
  const initials = initialsOf(user?.name, user?.email)

  async function handleLogout() {
    setOpen(false)
    await logout()
    setSelectedRole(null)
    setSelectedSchool(null)
    setSelectedSchoolId(null)
    navigate('/')
  }

  const Row = ({ icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', padding: '0.4rem 0' }}>
      <span style={{ color: '#7BAE7F', flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: '0.78rem', color: '#1E2F1E', wordBreak: 'break-word', lineHeight: 1.4 }}>{children}</span>
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('Open profile menu')}
        aria-expanded={open}
        style={{
          width: 34, height: 34, borderRadius: '50%', background: accent,
          color: '#fff', border: open ? '2px solid #7BAE7F' : '2px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: initials ? '0.72rem' : '0.95rem', fontWeight: 800,
          cursor: 'pointer', flexShrink: 0, padding: 0,
        }}
      >
        {initials || <UserIcon size={16} color="#fff" />}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, width: 260,
            background: '#fff', border: '2px solid #d8e8c0', borderRadius: '0.9rem',
            padding: '0.9rem 1rem',
            zIndex: 80,
          }}
        >
          {/* Identity header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingBottom: '0.7rem', borderBottom: '1px solid #f0f4e8', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: initials ? '0.85rem' : '1.1rem', fontWeight: 800, flexShrink: 0 }}>
              {initials || <UserIcon size={16} color="#fff" />}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E2F1E', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#2D4A32', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: '1rem', padding: '0.1rem 0.5rem', display: 'inline-block', marginTop: 2 }}>{t(role)}</span>
            </div>
          </div>

          {/* Details */}
          {email && <Row icon={<Mail size={14} />}>{email}</Row>}
          {schoolName && <Row icon={<SchoolIcon size={14} />}>{schoolName}</Row>}
          {place && <Row icon={<MapPin size={14} />}>{place}</Row>}
          {user?.role === 'STUDENT' && typeof level === 'number' && (
            <Row icon={<BadgeCheck size={14} />}>{t('Eco-Guardian Level')} {level}</Row>
          )}
          {user?.school?.status && (
            <Row icon={<BadgeCheck size={14} />}>{t('Status')}: {String(user.school.status).toLowerCase()}</Row>
          )}
          {!user && (
            <Row icon={<UserIcon size={14} />}>{t('Not signed in')}</Row>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              marginTop: '0.7rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.65rem',
              padding: '0.6rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            <LogOut size={14} /> {t('Logout')}
          </button>
        </div>
      )}
    </div>
  )
}
