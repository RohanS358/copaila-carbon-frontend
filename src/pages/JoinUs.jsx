import React from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useLang } from '../context/LanguageContext'
import { Leaf, School, User } from 'lucide-react'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

export default function JoinUs() {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <div style={{ minHeight: '100vh', background: B.m100, fontFamily: "'Google Sans', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>

      {/* Back to home */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <BackButton to="/" label={t('Home')} />
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: B.f800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><Leaf size={26} color="#EEF2DC" /></div>
        <h1 style={{ fontWeight: 900, fontSize: '2rem', color: B.f900, margin: '0 0 0.5rem' }}>{t('Join CoPaila')}</h1>
        <p style={{ fontSize: '0.95rem', color: B.f600, margin: 0 }}>{t('Who are you joining as?')}</p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 700, width: '100%' }}>

        {/* School card */}
        <button
          onClick={() => navigate('/register/school')}
          style={{ flex: '1 1 280px', maxWidth: 300, background: '#fff', border: `2px solid ${B.m300}`, borderRadius: '1.25rem', padding: '2rem 1.5rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = B.f600; e.currentTarget.style.transform = 'scale(1.03)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = B.m300; e.currentTarget.style.transform = 'scale(1)' }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '1rem', background: B.m200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><School size={32} color={B.f800} /></div>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: B.f900, margin: '0 0 0.5rem' }}>{t('School')}</h2>
          <p style={{ fontSize: '0.82rem', color: B.f600, lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            {t('Register your school to track carbon emissions, submit annual audits, and benchmark against other schools in Nepal.')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: B.f800 }}>{t('3-step registration')}</span>
            <span style={{ fontSize: '0.75rem', color: B.f400 }}>→</span>
          </div>
        </button>

        
      </div>

      {/* Demo entry — no registration needed */}
      <div style={{ marginTop: '2rem', background: '#fff', border: `1.5px solid ${B.m300}`, borderRadius: '1rem', padding: '1rem 1.5rem', maxWidth: 560, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: B.f900 }}>{t('Just want to explore?')}</div>
          <div style={{ fontSize: '0.78rem', color: B.f600 }}>{t('Try the full demo — no registration required.')}</div>
        </div>
        <button onClick={() => navigate('/role-selection')}
          style={{ background: B.m200, color: B.f800, border: `1.5px solid ${B.m300}`, borderRadius: '0.75rem', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = B.f600}
          onMouseLeave={e => e.currentTarget.style.borderColor = B.m300}>
          {t('Try Demo →')}
        </button>
      </div>

      {/* Login link */}
      <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: B.f600 }}>
        {t('Already have an account?')}{' '}
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: B.f800, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline' }}>
          {t('Log in')}
        </button>
      </p>
    </div>
  )
}
