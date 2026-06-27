import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const inputStyle = {
  width: '100%', padding: '0.65rem 0.875rem',
  border: '1.5px solid #d1d5db', borderRadius: '0.65rem',
  fontSize: '0.85rem', color: B.f900, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', color: B.f900, marginBottom: '0.3rem' }}>{label}</label>
      {hint && <p style={{ fontSize: '0.7rem', color: B.f400, margin: '0 0 0.4rem' }}>{hint}</p>}
      {children}
    </div>
  )
}

// Required, searchable picker of registered schools.
function SchoolPicker({ value, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const debounce = useRef(null)

  async function fetchSchools(q) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/schools/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setResults(Array.isArray(data.data) ? data.data : [])
    } catch { setResults([]) } finally { setLoading(false) }
  }

  useEffect(() => {
    if (!open) return
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetchSchools(query), 250)
    return () => clearTimeout(debounce.current)
  }, [query, open])

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Already chosen → show the locked-in school with a change button.
  if (value?.id) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.6rem 0.875rem', border: `1.5px solid ${B.f600}`, borderRadius: '0.65rem', background: '#f0fdf4' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: B.f900 }}>🏫 {value.name}</span>
        <button type="button" onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', color: B.f600, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Change</button>
      </div>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        value={query}
        placeholder="Search your school…"
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setOpen(true); if (!results.length) fetchSchools('') }}
      />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', borderRadius: '0.65rem', border: `1px solid ${B.m300}`, boxShadow: '0 8px 24px rgba(30,47,30,0.12)', maxHeight: 220, overflowY: 'auto', zIndex: 30 }}>
          {loading && <div style={{ padding: '0.7rem 0.875rem', fontSize: '0.8rem', color: B.f600 }}>Searching…</div>}
          {!loading && results.map(s => (
            <button key={s.id} type="button" onClick={() => { onSelect({ id: s.id, name: s.name }); setOpen(false) }}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${B.m100}`, padding: '0.65rem 0.875rem', cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: B.f900 }}>{s.name}</div>
              <div style={{ fontSize: '0.72rem', color: B.f600 }}>{s.district}, {s.province?.replace('_', ' ')}</div>
            </button>
          ))}
          {!loading && results.length === 0 && (
            <div style={{ padding: '0.85rem 0.875rem', fontSize: '0.78rem', color: B.f600 }}>
              {query.trim() ? <>No schools found for “{query}”.</> : 'No schools registered yet.'}
              <div style={{ fontSize: '0.7rem', color: B.f400, marginTop: 2 }}>Your school must register first.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function IndividualRegister() {
  const navigate = useNavigate()
  const { saveSession } = useAuth()
  const { setSelectedRole, setSelectedSchool, setSelectedSchoolId } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '', whyInterested: '',
    school: null, // { id, name }
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit() {
    setError('')
    if (!form.school?.id) { setError('Please select your school to continue.'); return }
    setLoading(true)
    try {
      const res = await authApi.individualRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        whyInterested: form.whyInterested,
        schoolId: form.school.id,
      })
      saveSession(res.user, res.accessToken, res.refreshToken)
      setSelectedRole('student')
      setSelectedSchool(form.school.name)
      setSelectedSchoolId(form.school.id)
      navigate('/student')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: B.m100, fontFamily: "'Google Sans',sans-serif", display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', border: `1px solid ${B.m300}`, padding: '2rem', maxWidth: 480, width: '100%', marginTop: '2rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${B.m300}` }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: B.f400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>CoPaila</div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: B.f900 }}>Student Registration</div>
          </div>
          <button onClick={() => navigate('/join')} style={{ background: 'none', border: 'none', color: B.f400, cursor: 'pointer', fontSize: '0.8rem' }}>← Back</button>
        </div>

        <Field label="Your school" hint="Pick the school you belong to — you'll join its student portal">
          <SchoolPicker value={form.school} onSelect={v => set('school', v)} />
        </Field>

        <Field label="Name">
          <input style={inputStyle} value={form.name} placeholder="Your full name"
            onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
            onChange={e => set('name', e.target.value)} />
        </Field>

        <Field label="Email">
          <input style={inputStyle} type="email" value={form.email} placeholder="you@example.com"
            onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
            onChange={e => set('email', e.target.value)} />
        </Field>

        <Field label="Why are you interested? (optional)">
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.whyInterested} placeholder="Tell us a bit about your interest in school sustainability…"
            onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
            onChange={e => set('whyInterested', e.target.value)} />
        </Field>

        <Field label="Password" hint="Min 8 characters — used to log in to your student portal">
          <input style={inputStyle} type="password" value={form.password} placeholder="••••••••"
            onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
            onChange={e => set('password', e.target.value)} />
        </Field>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.65rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ background: loading ? '#9ca3af' : B.f800, color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
          {loading ? 'Submitting…' : 'Join CoPaila →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: B.f600 }}>
          Registering a school instead?{' '}
          <button onClick={() => navigate('/register/school')} style={{ background: 'none', border: 'none', color: B.f800, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline' }}>
            School registration
          </button>
        </p>
      </div>
    </div>
  )
}
