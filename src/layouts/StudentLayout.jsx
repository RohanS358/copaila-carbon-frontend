import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { CalendarCheck, BookOpen, Trophy, Medal, HelpCircle, Plus, Menu, X, ArrowLeft, CalendarDays } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'
import ProfileMenu from '../components/ProfileMenu'
import TutorialOverlay from '../components/TutorialOverlay'

const NAV = [
  { path: '/student',              label: 'Daily Quests', Icon: CalendarCheck, tour: 'nav-quests'      },
  { path: '/student/lessons',      label: 'Lessons',      Icon: BookOpen,      tour: 'nav-lessons'     },
  { path: '/student/leaderboard',  label: 'Leaderboard',  Icon: Trophy,        tour: 'nav-leaderboard' },
  { path: '/student/achievements', label: 'Achievements', Icon: Medal,         tour: 'nav-achievements' },
  { path: '/student/events',       label: 'Events',       Icon: CalendarDays,  tour: 'nav-events'      },
]

export default function StudentLayout({ children }) {
  const { xp, level, xpToNextLevel } = useApp()
  const { user } = useAuth()
  const { lang, setLanguage, t } = useLang()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  useEffect(() => { setDrawerOpen(false) }, [location.pathname])
  useEffect(() => { if (!isMobile) setDrawerOpen(false) }, [isMobile])

  const xpPct  = Math.min(100, Math.round((xp / xpToNextLevel) * 100))
  const xpLeft = xpToNextLevel - xp
  const studentName = user?.name || t('Student')

  // ── Sidebar contents (shared by desktop rail + mobile drawer) ──
  const SidebarInner = (
    <>
      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem', paddingLeft: '0.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2D4A32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1E2F1E', lineHeight: 1.2 }}>{t('Student Portal')}</p>
          <p style={{ fontSize: '0.62rem', color: '#4E7D5B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>{studentName}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {NAV.map(({ path, label, Icon, tour }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              data-tour={tour}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.55rem',
                padding: '0.575rem 0.75rem', borderRadius: '0.65rem',
                fontWeight: active ? 700 : 500, fontSize: '0.79rem',
                color: active ? '#fff' : '#4E7D5B',
                background: active ? '#2D4A32' : 'transparent',
                textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={15} />
              {t(label)}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop: '1px solid #e4edd6', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button
          data-tour="log-activity"
          onClick={() => navigate('/student')}
          style={{
            background: '#2D4A32', color: '#EEF2DC', border: 'none',
            borderRadius: '0.65rem', padding: '0.625rem 0.75rem',
            fontWeight: 700, fontSize: '0.79rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            marginBottom: '0.375rem',
          }}
        >
          <Plus size={13} /> {t('Log Activity')}
        </button>

        {/* Help button — opens the interactive tutorial */}
        <button
          onClick={() => setTutorialOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.45rem 0.75rem', color: '#7BAE7F', fontSize: '0.77rem',
            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            textAlign: 'left', fontFamily: 'inherit',
          }}
        >
          <HelpCircle size={13} /> {t('Help')}
        </button>

        {/* Language toggle */}
        <div style={{ display: 'flex', background: '#f0f4e8', borderRadius: '2rem', padding: '0.2rem', margin: '0.25rem 0' }}>
          <button onClick={() => setLanguage('en')} style={{ flex: 1, padding: '0.3rem', fontSize: '0.68rem', fontWeight: 700, background: lang === 'en' ? '#2D4A32' : 'transparent', color: lang === 'en' ? '#fff' : '#4E7D5B', border: 'none', cursor: 'pointer', borderRadius: '1.5rem' }}>English</button>
          <button onClick={() => setLanguage('ne')} style={{ flex: 1, padding: '0.3rem', fontSize: '0.68rem', fontWeight: 700, background: lang === 'ne' ? '#2D4A32' : 'transparent', color: lang === 'ne' ? '#fff' : '#4E7D5B', border: 'none', cursor: 'pointer', borderRadius: '1.5rem' }}>नेपाली</button>
        </div>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7ee', fontFamily: "'Google Sans', sans-serif" }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside style={{
          width: 172, flexShrink: 0, background: '#fff',
          borderRight: '1px solid #e4edd6', display: 'flex',
          flexDirection: 'column', padding: '1.5rem 0.75rem',
          minHeight: '100vh', position: 'sticky', top: 0, alignSelf: 'flex-start',
        }}>
          {SidebarInner}
        </aside>
      )}

      {/* ── Mobile slide-in drawer + scrim ── */}
      {isMobile && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,15,0.45)', zIndex: 60 }} />
          <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '78%', maxWidth: 280, background: '#fff', borderRight: '2px solid #e4edd6', display: 'flex', flexDirection: 'column', padding: '1.25rem 0.875rem', zIndex: 61, overflowY: 'auto' }}>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ position: 'absolute', top: '0.9rem', right: '0.9rem', background: 'none', border: 'none', color: '#4E7D5B', cursor: 'pointer', padding: 4 }}>
              <X size={20} />
            </button>
            {SidebarInner}
          </aside>
        </>
      )}

      {/* ── Right: top bar + content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, overflow: 'hidden' }}>
        {/* XP bar (+ hamburger on mobile) */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e4edd6', padding: isMobile ? '0.6rem 1rem 0.6rem' : '0.7rem 1.75rem 0.6rem', position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isMobile && (
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ background: 'none', border: 'none', color: '#1E2F1E', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Menu size={22} />
            </button>
          )}
          {/* Back to Daily Quests — shown on student sub-pages */}
          {location.pathname !== '/student' && (
            <button
              onClick={() => navigate('/student')}
              aria-label="Back to Daily Quests"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f5f7ee', border: '1px solid #e4edd6', borderRadius: '0.55rem', padding: '0.35rem 0.6rem', color: '#2D4A32', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', flexShrink: 0 }}
            >
              <ArrowLeft size={14} /> {!isMobile && t('Quests')}
            </button>
          )}

          {/* XP bar — targeted by the tutorial */}
          <div data-tour="xp-bar" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em', color: '#1E2F1E' }}>{t('LEVEL')} {level} {t('PROGRESS')}</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#4E7D5B' }}>{xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
            </div>
            <div style={{ height: 7, background: '#e4edd6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${xpPct}%`, height: '100%', background: '#2D4A32', borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
            {!isMobile && (
              <p style={{ fontSize: '0.6rem', color: '#7BAE7F', marginTop: '0.25rem' }}>
                Earn {xpLeft.toLocaleString()} more XP to unlock the 'Wind Turbine' accessory!
              </p>
            )}
          </div>

          {/* Profile menu (top-right) */}
          <ProfileMenu accent="#2D4A32" />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>

      {/* ── Interactive tutorial overlay ── */}
      <TutorialOverlay open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  )
}
