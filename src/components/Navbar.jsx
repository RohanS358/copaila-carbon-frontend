import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Home, BarChart2, School, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { dashboardPathForUser } from './RouteGuards'
import logoImg from '../assets/logo.png'

// Brand tokens
const B = {
  f900: '#1E2F1E',
  f800: '#2D4A32',
  f700: '#3a5c3f',
  f600: '#4E7D5B',
  f400: '#7BAE7F',
  f200: '#c5dfbc',
  m100: '#f5f7ee',
  m200: '#EEF2DC',
  m300: '#d8e8c0',
}

function useScrollTo() {
  const navigate = useNavigate()
  const location = useLocation()
  return (sectionId) => {
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 150)
    }
  }
}

function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') { setActive(null); return }
    const observers = []
    const visible = new Map()
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          visible.set(id, entry.isIntersecting)
          const first = ids.find(i => visible.get(i))
          setActive(first || null)
        },
        { threshold: 0.25 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [location.pathname])

  return active
}

// Tracks whether the user has scrolled past the hero
function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { lang, toggleLang, t } = useLang()
  const { selectedSchool, selectedRole, ecoPoints, setSelectedRole, setSelectedSchool, setSelectedSchoolId } = useApp()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    setSelectedRole(null)
    setSelectedSchool(null)
    setSelectedSchoolId(null)
  }
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const scrollTo = useScrollTo()
  const activeSection = useActiveSection(['about', 'faq'])
  const scrolled = useScrolled()

  const links = selectedRole === 'student'
    ? [
        { to: '/student',     label: 'Dashboard',   icon: <Home size={15} /> },
        { to: '/student/pet', label: 'My Pet',       icon: <User size={15} /> },
        { to: '/dashboard',   label: 'School Stats', icon: <BarChart2 size={15} /> },
      ]
    : selectedRole === 'school'
    ? [
        { to: '/school',    label: 'Data Entry', icon: <School size={15} /> },
        { to: '/dashboard', label: 'Dashboard',  icon: <BarChart2 size={15} /> },
      ]
    : []

  function navItemStyle(sectionId) {
    const isActive = activeSection === sectionId
    return {
      background: isActive ? B.f800 : 'transparent',
      color: isActive ? '#ffffff' : B.f600,
      borderRadius: '9999px',
      padding: '6px 16px',
      fontSize: '0.875rem',
      fontWeight: isActive ? 600 : 400,
      transition: 'all 0.2s',
      border: 'none',
      cursor: 'pointer',
    }
  }

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: '#ffffff',
        borderBottom: `2px solid ${scrolled ? B.m300 : '#f0f4e8'}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImg} alt="Co Paila" className="h-10 w-auto object-contain" />
          </Link>

          {/* Landing nav links */}
          {isLanding && (
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => scrollTo('about')} style={navItemStyle('about')} onMouseEnter={(e) => { if (activeSection !== 'about') { e.currentTarget.style.background = B.m200; e.currentTarget.style.color = B.f800 } }} onMouseLeave={(e) => { if (activeSection !== 'about') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = B.f600 } }}>
                {t('About us')}
              </button>
              <button onClick={() => scrollTo('faq')} style={navItemStyle('faq')} onMouseEnter={(e) => { if (activeSection !== 'faq') { e.currentTarget.style.background = B.m200; e.currentTarget.style.color = B.f800 } }} onMouseLeave={(e) => { if (activeSection !== 'faq') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = B.f600 } }}>
                {t('FAQ')}
              </button>
              <Link to="/download" style={navItemStyle('download')} onMouseEnter={(e) => { if (activeSection !== 'download') { e.currentTarget.style.background = B.m200; e.currentTarget.style.color = B.f800 } }} onMouseLeave={(e) => { if (activeSection !== 'download') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = B.f600 } }}>
                {t('Download')}
              </Link>
              {user ? (
                <>
                  <Link to={dashboardPathForUser(user)} className="ml-2 py-1.5 px-5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: B.f800, color: '#ffffff' }}>
                    {t('Go to Dashboard')}
                  </Link>
                  <button onClick={handleLogout} className="ml-1 py-1.5 px-5 rounded-full text-sm font-semibold transition-all" style={{ background: B.m200, color: B.f800, border: 'none', cursor: 'pointer' }}>
                    {t('Log out')}
                  </button>
                </>
              ) : (
                <Link to="/join" className="ml-1 py-1.5 px-5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: B.f800, color: '#ffffff' }}>
                  {t('Join Us')}
                </Link>
              )}
            </div>
          )}

          {/* Authenticated nav links */}
          {!isLanding && links.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm transition-all"
                  style={location.pathname === l.to
                    ? { background: B.f800, color: '#fff' }
                    : { color: B.f600 }
                  }
                  onMouseEnter={(e) => { if (location.pathname !== l.to) { e.currentTarget.style.background = B.m200; e.currentTarget.style.color = B.f800 } }}
                  onMouseLeave={(e) => { if (location.pathname !== l.to) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = B.f600 } }}
                >
                  {l.icon} {t(l.label)}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="rounded-full py-1.5 px-4 text-xs font-semibold transition-all"
              style={{ border: `1px solid ${B.m300}`, color: B.f600 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = B.f400; e.currentTarget.style.color = B.f800 }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = B.m300; e.currentTarget.style.color = B.f600 }}
            >
              {lang === 'en' ? 'नेपाली' : 'English'}
            </button>


            {selectedRole === 'student' && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#fef9ec', color: '#92620a', border: '1px solid #fde68a' }}>
                🌱 {ecoPoints} pts
              </span>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-1 transition-colors" style={{ color: B.f600 }} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 space-y-1" style={{ borderTop: `1px solid ${B.m200}` }}>
            {isLanding && (
              <>
                <button onClick={() => { scrollTo('about'); setOpen(false) }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={activeSection === 'about' ? { background: B.f800, color: '#fff' } : { color: B.f600 }}>
                  {t('About us')}
                </button>
                <button onClick={() => { scrollTo('faq'); setOpen(false) }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={activeSection === 'faq' ? { background: B.f800, color: '#fff' } : { color: B.f600 }}>
                  {t('FAQ')}
                </button>
                <button onClick={() => { scrollTo('download'); setOpen(false) }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={activeSection === 'download' ? { background: B.f800, color: '#fff' } : { color: B.f600 }}>
                  {t('Download')}
                </button>
                {user ? (
                  <>
                    <Link to={dashboardPathForUser(user)} onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-full text-sm font-semibold text-center mx-2 mb-1" style={{ background: B.f800, color: '#fff' }}>
                      {t('Go to Dashboard')}
                    </Link>
                    <button onClick={() => { handleLogout(); setOpen(false) }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: B.f600 }}>
                      {t('Log out')}
                    </button>
                  </>
                ) : (
                  <Link to="/join" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-full text-sm font-semibold text-center mx-2" style={{ background: B.f800, color: '#fff' }}>
                    {t('Join Us')}
                  </Link>
                )}
              </>
            )}
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={location.pathname === l.to ? { background: B.f800, color: '#fff', fontWeight: 600 } : { color: B.f600 }}
              >
                {l.icon} {t(l.label)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
