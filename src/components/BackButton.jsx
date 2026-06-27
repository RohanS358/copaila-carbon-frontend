import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Reusable "go back" control.
// - If a `to` prop is given, navigates there.
// - Otherwise it walks one entry back in history, falling back to `fallback`
//   (default "/") when there is nowhere to go back to (e.g. opened directly).
export default function BackButton({ to, fallback = '/', label = 'Back', style = {} }) {
  const navigate = useNavigate()

  function handleClick() {
    if (to) { navigate(to); return }
    if (window.history.length > 1) navigate(-1)
    else navigate(fallback)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        background: '#fff', color: '#2D4A32',
        border: '1.5px solid #d8e8c0', borderRadius: '0.65rem',
        padding: '0.5rem 0.9rem', fontWeight: 700, fontSize: '0.82rem',
        cursor: 'pointer', transition: 'all 0.15s', ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4E7D5B'; e.currentTarget.style.background = '#f5f7ee' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d8e8c0'; e.currentTarget.style.background = '#fff' }}
    >
      <ArrowLeft size={16} /> {label}
    </button>
  )
}
