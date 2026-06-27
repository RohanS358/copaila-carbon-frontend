import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import BackButton from '../components/BackButton'
import SearchBar from '../components/SearchBar'
import { primeSpeech } from '../services/tts'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

const inputStyle = {
  width: '100%', padding: '0.65rem 0.875rem',
  border: '1.5px solid #d1d5db', borderRadius: '0.65rem',
  fontSize: '0.85rem', color: B.f900, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}

export default function Login() {
  const navigate = useNavigate()
  const { login, studentLogin } = useAuth()
  const { setSelectedRole, selectedSchool, selectedSchoolId } = useApp()
  const { t } = useLang()

  // 'student' = passwordless class + roll-no entry; 'staff' = email + password.
  const [mode, setMode] = useState('student')

  const [name, setName]           = useState('')
  const [className, setClassName] = useState('')
  const [rollNo, setRollNo]       = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleStudent(e) {
    e.preventDefault()
    setError('')
    if (!selectedSchoolId) { setError(t('Please find and select your school first.')); return }
    primeSpeech() // unlock speech synthesis during this user-gesture click
    setLoading(true)
    try {
      await studentLogin(selectedSchoolId, className.trim(), rollNo.trim(), name.trim())
      setSelectedRole('student')
      navigate('/student')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStaff(e) {
    e.preventDefault()
    setError('')
    primeSpeech() // unlock speech synthesis during this user-gesture click
    setLoading(true)
    try {
      const res = await login(email, password, selectedSchoolId)
      const role = res?.user?.role
      if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'TEACHER') {
        setSelectedRole('school')
        navigate('/dashboard')
      } else {
        setSelectedRole('student')
        navigate('/student')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const ModeBtn = ({ value, label }) => {
    const active = mode === value
    return (
      <button type="button" onClick={() => { setMode(value); setError('') }}
        style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem', fontWeight: 700, background: active ? B.f800 : 'transparent', color: active ? '#EEF2DC' : B.f600, border: 'none', cursor: 'pointer', borderRadius: '1.5rem', transition: 'all 0.18s' }}>
        {label}
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: B.m100, fontFamily: "'Google Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', border: `2px solid ${B.m300}`, padding: '1.5rem 2rem 2.5rem', maxWidth: 420, width: '100%' }}>

        <div style={{ marginBottom: '1.25rem' }}>
          <BackButton to="/" label={t('Home')} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: B.f800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 0.75rem' }}>🌿</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', color: B.f900, margin: '0 0 0.25rem' }}>{t('Welcome back')}</h1>
          <p style={{ fontSize: '0.82rem', color: B.f600, margin: 0 }}>{t('Sign in to your school portal')}</p>
          {selectedSchool && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: B.m200, color: B.f800, borderRadius: '1rem', padding: '0.3rem 0.85rem', fontSize: '0.76rem', fontWeight: 700, marginTop: '0.75rem' }}>
              🏫 {selectedSchool}
            </div>
          )}
        </div>

        {!selectedSchool && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.4rem' }}>{t('Find your school')}</label>
            <SearchBar />
            <p style={{ fontSize: '0.72rem', color: B.f400, margin: '0.5rem 0 0' }}>
              {t('Select your school so we can sign you in to the right place.')}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', background: '#f0f4e8', borderRadius: '2rem', padding: '0.25rem', marginBottom: '1.25rem' }}>
          <ModeBtn value="student" label={t("I'm a Student")} />
          <ModeBtn value="staff" label={t('Teacher / Admin')} />
        </div>

        {mode === 'student' ? (
          <form onSubmit={handleStudent}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.3rem' }}>{t('Your Name')}</label>
              <input style={inputStyle} type="text" required value={name} onChange={e => setName(e.target.value)} placeholder={t('e.g. Sita Sharma')} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.3rem' }}>{t('Class')}</label>
                <input style={inputStyle} type="text" required value={className} onChange={e => setClassName(e.target.value)} placeholder={t('e.g. 10')} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.3rem' }}>{t('Roll Number')}</label>
                <input style={inputStyle} type="text" required value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder={t('e.g. 12')} />
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.65rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626' }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: loading ? '#9ca3af' : B.f800, color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
              {loading ? t('Entering…') : t('Enter Portal →')}
            </button>
            <p style={{ fontSize: '0.72rem', color: B.f400, margin: '0.75rem 0 0', textAlign: 'center' }}>
              {t('First time? Just enter your name, class and roll number — no password needed.')}
            </p>
          </form>
        ) : (
          <form onSubmit={handleStaff}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.3rem' }}>{t('Email')}</label>
              <input style={inputStyle} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="principal@school.edu.np" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.3rem' }}>{t('Password')}</label>
              <input style={inputStyle} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.65rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626' }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: loading ? '#9ca3af' : B.f800, color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
              {loading ? t('Logging in…') : t('Log In →')}
            </button>
          </form>
        )}

        <hr style={{ border: 'none', borderTop: `1px solid ${B.m300}`, margin: '1.5rem 0' }} />

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: B.f600, margin: 0 }}>
          {t('Want to register your school?')}{' '}
          <button onClick={() => navigate('/join')} style={{ background: 'none', border: 'none', color: B.f800, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline' }}>
            {t('Join CoPaila')}
          </button>
        </p>
      </div>
    </div>
  )
}
