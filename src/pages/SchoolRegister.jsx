import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

const STEPS = [
  { num: 1, title: 'Identity' },
  { num: 2, title: 'Location' },
  { num: 3, title: 'Operations' },
]

const inputStyle = {
  width: '100%', padding: '0.65rem 0.875rem',
  border: `1.5px solid #d1d5db`, borderRadius: '0.65rem',
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

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {options.map(opt => (
        <label key={opt.value} onClick={() => onChange(opt.value)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.55rem 0.875rem', borderRadius: '0.65rem', border: `1.5px solid ${value === opt.value ? B.f600 : '#e4edd6'}`, background: value === opt.value ? '#f0fdf4' : '#fff', transition: 'all 0.15s' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${value === opt.value ? B.f800 : '#d1d5db'}`, background: value === opt.value ? B.f800 : '#fff', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: B.f900, fontWeight: value === opt.value ? 700 : 400 }}>{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

function ProgressBar({ step }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: B.f600 }}>Step {step} of 3</span>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{Math.round(((step - 1) / 2) * 100)}% complete</span>
      </div>
      <div style={{ height: 6, background: B.m200, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${((step - 1) / 2) * 100}%`, height: '100%', background: B.f800, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
        {STEPS.map(s => (
          <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: s.num < step ? B.f800 : s.num === step ? B.f900 : B.m200, color: s.num <= step ? '#fff' : '#9ca3af', border: s.num === step ? `2.5px solid ${B.f400}` : 'none', transition: 'all 0.25s' }}>
              {s.num < step ? '✓' : s.num}
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: s.num === step ? 700 : 500, color: s.num <= step ? B.f900 : '#9ca3af' }}>{s.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Step 1 ----
function Step1({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  return (
    <>
      <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: B.f900, margin: '0 0 1.5rem' }}>Step 1 of 3 — Identity</h2>
      <Field label="School name">
        <input style={inputStyle} value={data.schoolName} placeholder="e.g. Green Valley School"
          onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
          onChange={e => set('schoolName', e.target.value)} />
      </Field>
      <Field label="Contact person's name">
        <input style={inputStyle} value={data.contactName} placeholder="e.g. Ram Sharma"
          onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
          onChange={e => set('contactName', e.target.value)} />
      </Field>
      <Field label="Role">
        <RadioGroup value={data.contactRole} onChange={v => set('contactRole', v)} options={[
          { value: 'PRINCIPAL', label: 'Principal' },
          { value: 'TEACHER', label: 'Teacher' },
          { value: 'ADMINISTRATOR', label: 'Administrator' },
          { value: 'OTHER', label: 'Other' },
        ]} />
        {data.contactRole === 'OTHER' && (
          <input style={{ ...inputStyle, marginTop: '0.5rem' }} value={data.contactOther} placeholder="Specify role"
            onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
            onChange={e => set('contactOther', e.target.value)} />
        )}
      </Field>
      <Field label="Email">
        <input style={inputStyle} type="email" value={data.email} placeholder="school@example.edu.np"
          onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
          onChange={e => set('email', e.target.value)} />
      </Field>
      <Field label="Phone (optional)">
        <input style={inputStyle} value={data.phone} placeholder="+977-1-5551234"
          onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
          onChange={e => set('phone', e.target.value)} />
      </Field>
      <Field label="Password" hint="Min 8 characters — used to log into your school account">
        <input style={inputStyle} type="password" value={data.password} placeholder="••••••••"
          onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
          onChange={e => set('password', e.target.value)} />
      </Field>
    </>
  )
}

// ---- Step 2 ----
function Step2({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  return (
    <>
      <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: B.f900, margin: '0 0 1.5rem' }}>Step 2 of 3 — Location</h2>
      <Field label="Province">
        <RadioGroup value={data.province} onChange={v => set('province', v)} options={[
          { value: 'KOSHI', label: 'Koshi' },
          { value: 'MADHESH', label: 'Madhesh' },
          { value: 'BAGMATI', label: 'Bagmati' },
          { value: 'GANDAKI', label: 'Gandaki' },
          { value: 'LUMBINI', label: 'Lumbini' },
          { value: 'KARNALI', label: 'Karnali' },
          { value: 'SUDURPASHCHIM', label: 'Sudurpashchim' },
        ]} />
      </Field>
      <Field label="District">
        <input style={inputStyle} value={data.district} placeholder="e.g. Lalitpur"
          onFocus={e => e.target.style.borderColor = B.f600} onBlur={e => e.target.style.borderColor = '#d1d5db'}
          onChange={e => set('district', e.target.value)} />
      </Field>
      <Field label="Area type">
        <RadioGroup value={data.areaType} onChange={v => set('areaType', v)} options={[
          { value: 'URBAN', label: 'Urban' },
          { value: 'PERI_URBAN', label: 'Peri-urban' },
          { value: 'RURAL', label: 'Rural' },
        ]} />
      </Field>
      <Field label="School type">
        <RadioGroup value={data.schoolType} onChange={v => set('schoolType', v)} options={[
          { value: 'GOVERNMENT', label: 'Government' },
          { value: 'COMMUNITY', label: 'Community' },
          { value: 'PRIVATE', label: 'Private' },
          { value: 'INTERNATIONAL', label: 'International' },
        ]} />
      </Field>
    </>
  )
}

// ---- Step 3 ----
function Step3({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  return (
    <>
      <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: B.f900, margin: '0 0 1.5rem' }}>Step 3 of 3 — Operations</h2>
      <Field label="Student enrollment">
        <RadioGroup value={data.enrollment} onChange={v => set('enrollment', v)} options={[
          { value: 'UNDER_100', label: 'Under 100' },
          { value: 'RANGE_100_500', label: '100–500' },
          { value: 'RANGE_500_1000', label: '500–1,000' },
          { value: 'OVER_1000', label: 'Over 1,000' },
        ]} />
      </Field>
      <Field label="Electricity availability">
        <RadioGroup value={data.electricity} onChange={v => set('electricity', v)} options={[
          { value: 'RELIABLE_GRID', label: 'Reliable grid power' },
          { value: 'LOAD_SHEDDING', label: 'Sometimes available / load shedding' },
          { value: 'NO_GRID', label: 'No grid — generator or solar only' },
        ]} />
      </Field>
      <Field label="Internet connectivity">
        <RadioGroup value={data.connectivity} onChange={v => set('connectivity', v)} options={[
          { value: 'RELIABLE', label: 'Reliable' },
          { value: 'INTERMITTENT', label: 'Intermittent' },
          { value: 'NONE', label: 'None' },
        ]} />
      </Field>
      <Field label="Preferred language">
        <RadioGroup value={data.language} onChange={v => set('language', v)} options={[
          { value: 'NEPALI', label: 'Nepali (नेपाली)' },
          { value: 'ENGLISH', label: 'English' },
        ]} />
      </Field>
    </>
  )
}

// ---- Confirmation ----
function Confirmation({ school }) {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: B.f900, margin: '0 0 0.75rem' }}>Registration Complete!</h2>
      <p style={{ fontSize: '0.85rem', color: B.f600, lineHeight: 1.7, marginBottom: '1rem' }}>
        Thank you, <strong>{school?.name}</strong>. Your school profile is under review.<br />
        You can now log in to start your carbon audit.
      </p>
      <div style={{ background: B.m200, borderRadius: '0.875rem', padding: '0.875rem 1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
        <div style={{ fontSize: '0.78rem', color: B.f600, fontWeight: 700, marginBottom: '0.4rem' }}>Access mode assigned</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: B.f900 }}>{school?.accessMode?.replace('_', ' ') || 'HYBRID'}</div>
      </div>
      <button onClick={() => navigate('/login')}
        style={{ background: B.f800, color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.875rem 2rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}>
        Log In →
      </button>
    </div>
  )
}

// ---- Main Component ----
export default function SchoolRegister() {
  const navigate = useNavigate()
  const { saveSession } = useAuth()

  const [step, setStep]       = useState(1)
  const [draftId, setDraftId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(null) // school object on success

  const [s1, setS1] = useState({ schoolName: '', contactName: '', contactRole: 'PRINCIPAL', contactOther: '', email: '', phone: '', password: '' })
  const [s2, setS2] = useState({ province: 'BAGMATI', district: '', areaType: 'URBAN', schoolType: 'PRIVATE' })
  const [s3, setS3] = useState({ enrollment: 'RANGE_100_500', electricity: 'LOAD_SHEDDING', connectivity: 'INTERMITTENT', language: 'ENGLISH' })

  async function handleNext() {
    setError('')
    setLoading(true)
    try {
      if (step === 1) {
        const res = await authApi.schoolStep1(s1)
        setDraftId(res.draftId)
        setStep(2)
      } else if (step === 2) {
        await authApi.schoolStep2(draftId, s2)
        setStep(3)
      } else {
        const res = await authApi.schoolStep3(draftId, s3)
        if (res.accessToken) saveSession(null, res.accessToken, res.refreshToken)
        setDone(res.school)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: B.m100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans',sans-serif", padding: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: '1.25rem', border: `1px solid ${B.m300}`, padding: '2.5rem 2rem', maxWidth: 440, width: '100%' }}>
          <Confirmation school={done} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: B.m100, fontFamily: "'Google Sans',sans-serif", display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', border: `1px solid ${B.m300}`, padding: '2rem', maxWidth: 540, width: '100%', marginTop: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${B.m300}` }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: B.f400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>CoPaila</div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: B.f900 }}>School Registration</div>
          </div>
          <button onClick={() => navigate('/join')} style={{ background: 'none', border: 'none', color: B.f400, cursor: 'pointer', fontSize: '0.8rem' }}>← Back</button>
        </div>

        <ProgressBar step={step} />

        {step === 1 && <Step1 data={s1} onChange={setS1} />}
        {step === 2 && <Step2 data={s2} onChange={setS2} />}
        {step === 3 && <Step3 data={s3} onChange={setS3} />}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.65rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${B.m200}` }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/join')}
            style={{ background: '#fff', color: B.f900, border: `1.5px solid ${B.m300}`, borderRadius: '0.75rem', padding: '0.7rem 1.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            ← Back
          </button>
          <button onClick={handleNext} disabled={loading}
            style={{ background: loading ? '#9ca3af' : B.f800, color: '#fff', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.75rem', fontWeight: 700, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', minWidth: 120 }}>
            {loading ? 'Please wait…' : step < 3 ? 'Next Step →' : '✓ Complete Registration'}
          </button>
        </div>

      </div>
    </div>
  )
}
