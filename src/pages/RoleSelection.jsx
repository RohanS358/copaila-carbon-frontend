import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import MainLayout from '../layouts/MainLayout'
import BackButton from '../components/BackButton'

const B = {
  dark: '#1E2F1E',
  mid: '#2D4A32',
  teal: '#4E7D5B',
  light: '#7BAE7F',
  cream: '#EEF2DC',
  border: '#d8e8c0',
  bg: '#f5f7ee',
}

export default function RoleSelection() {
  const { selectedSchool, setSelectedRole } = useApp()
  const { t } = useLang()
  const navigate = useNavigate()

  function choose(role, path) {
    setSelectedRole(role)
    navigate(path)
  }

  return (
    <MainLayout>
      <div style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', background: B.bg }}>
        <div style={{ width: '100%', maxWidth: 720 }}>

          {/* Back */}
          <div style={{ marginBottom: '1.5rem' }}>
            <BackButton label={t('Back')} />
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {selectedSchool && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: B.cream, color: B.mid, borderRadius: '2rem', padding: '0.4rem 1.1rem', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.25rem', border: `1.5px solid ${B.border}` }}>
                🏫 {selectedSchool}
              </div>
            )}
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 2.75rem)', color: B.dark, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
              {t('Who are you?')}
            </h1>
            <p style={{ color: B.teal, fontSize: '1rem', margin: 0 }}>
              {t('Choose your role to enter the right experience.')}
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Student card */}
            <div
              style={{ background: '#fff', border: `2px solid ${B.border}`, borderRadius: '1rem', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = B.mid }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = B.border }}
            >
              {/* Top accent strip */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: B.mid }} />

              <div style={{ paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block', lineHeight: 1 }}>👦</div>
                <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: B.dark, margin: '0 0 0.5rem' }}>{t('Student')}</h2>
                <p style={{ color: B.teal, fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {t('Track your eco actions, care for your virtual pet, earn badges, and compete with friends to save the planet!')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {['🐾 Virtual Pet', '🏆 Badges', '📊 Eco Points'].map(tag => (
                    <span key={tag} style={{ background: B.cream, color: B.mid, fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '0.4rem', border: `1px solid ${B.border}` }}>{tag}</span>
                  ))}
                </div>

                <button
                  onClick={() => choose('student', '/student')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: B.mid, color: '#fff', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <PlayCircle size={17} />
                  {t('Login for Demo')}
                  <ArrowRight size={15} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: B.light, margin: '0.6rem 0 0' }}>{t('No credentials required')}</p>
              </div>
            </div>

            {/* School card */}
            <div
              style={{ background: B.dark, border: `2px solid #2D4A32`, borderRadius: '1rem', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = B.light }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#2D4A32' }}
            >
              {/* Top accent strip */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: B.cream }} />

              <div style={{ paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block', lineHeight: 1 }}>🏫</div>
                <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: B.cream, margin: '0 0 0.5rem' }}>{t('School')}</h2>
                <p style={{ color: '#9fd6b6', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {t('Enter consumption data, generate carbon footprint reports, get AI-powered insights, and track sustainability progress.')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {['📈 Analytics', '🎯 Insights', '📋 Reports'].map(tag => (
                    <span key={tag} style={{ background: '#2D4A3266', color: B.cream, fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '0.4rem', border: `1px solid ${B.light}44` }}>{tag}</span>
                  ))}
                </div>

                <button
                  onClick={() => choose('school', '/school')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: B.cream, color: B.dark, border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <PlayCircle size={17} />
                  {t('Login for Demo')}
                  <ArrowRight size={15} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: B.light, margin: '0.6rem 0 0' }}>{t('No credentials required')}</p>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: B.teal, fontSize: '0.82rem', marginTop: '2rem' }}>
            {t('🔓 Demo mode — explore all features freely without signing up!')}
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
