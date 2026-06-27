import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Leaf, TrendingDown, Target, Sparkles } from 'lucide-react'
import SchoolLayout from '../layouts/SchoolLayout'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useLang } from '../context/LanguageContext'
import { useSchoolAudit } from '../hooks/useSchoolAudit'
import { fmt, toTonnes } from '../utils/audit'

// ============================================================
// CLIMATE RECOMMENDATIONS — now driven entirely by the engine's
// rule-based, data-aware recommendations (result.recommendations).
// Each item carries: icon, category, scope, effort(1-3), timeframe,
// title, text, potentialReductionKg, priority.
// ============================================================

const CAT_STYLE = {
  Energy:    { bg: '#fffbeb', color: '#d97706', ring: '#fde68a' },
  Fuel:      { bg: '#fef2f2', color: '#dc2626', ring: '#fecaca' },
  Transport: { bg: '#eff6ff', color: '#2563eb', ring: '#bfdbfe' },
  Food:      { bg: '#f0fdf4', color: '#16a34a', ring: '#bbf7d0' },
  Waste:     { bg: '#ecfdf5', color: '#15803d', ring: '#bbf7d0' },
  Paper:     { bg: '#f8fafc', color: '#64748b', ring: '#e2e8f0' },
  Water:     { bg: '#ecfeff', color: '#0891b2', ring: '#a5f3fc' },
}
const catStyle = (c) => CAT_STYLE[c] || { bg: '#f3f4f6', color: '#6b7280', ring: '#e5e7eb' }

const PRIO = {
  High:   { label: 'High impact',   bg: '#fee2e2', color: '#dc2626' },
  Medium: { label: 'Medium impact', bg: '#fef3c7', color: '#d97706' },
  Low:    { label: 'Quick win',     bg: '#dcfce7', color: '#16a34a' },
}

// Reduction shown as kg under 1 t, else tonnes.
const reductionLabel = (kg) => (kg >= 1000 ? `${fmt(toTonnes(kg), 2)} tCO₂e` : `${fmt(kg, 0)} kg CO₂e`)

function EffortDots({ level, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: '0.58rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginRight: 2 }}>{t('Effort')}</span>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i <= level ? '#9ca3af' : 'transparent', border: '1.5px solid #cbd5e1' }} />
      ))}
    </div>
  )
}

function RecCard({ rec, rank, maxSaving, done, onToggle, t }) {
  const cs = catStyle(rec.category)
  const prio = PRIO[rec.priority] || PRIO.Low
  const barPct = Math.max(6, Math.round(((rec.potentialReductionKg || 0) / maxSaving) * 100))
  return (
    <div style={{
      background: '#fff', borderRadius: '1rem', border: `1px solid ${done ? '#86efac' : '#e4edd6'}`,
      borderLeft: `4px solid ${done ? '#16a34a' : cs.color}`, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', transition: 'transform 0.15s',
      opacity: done ? 0.75 : 1,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      <div style={{ padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '0.7rem', background: cs.bg, border: `1px solid ${cs.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>{rec.icon || '💡'}</div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, color: cs.color, background: cs.bg, border: `1px solid ${cs.ring}`, borderRadius: '1rem', padding: '0.1rem 0.5rem', letterSpacing: '0.03em' }}>{t(rec.category)}</span>
              <span style={{ marginLeft: 6, fontSize: '0.56rem', fontWeight: 700, color: '#94a3b8' }}>{rec.scope?.replace('_', ' ')}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.56rem', fontWeight: 800, background: prio.bg, color: prio.color, borderRadius: '1rem', padding: '0.18rem 0.55rem', textTransform: 'uppercase', flexShrink: 0, whiteSpace: 'nowrap' }}>{t(prio.label)}</span>
        </div>

        {/* title + text */}
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E2F1E', margin: '0 0 0.3rem', lineHeight: 1.3 }}>
            <span style={{ color: cs.color }}>#{rank} </span>{t(rec.title)}
          </p>
          <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{t(rec.text)}</p>
        </div>

        {/* saving + bar */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 900, fontSize: '1rem', color: '#15803d' }}>
              <TrendingDown size={15} /> {reductionLabel(rec.potentialReductionKg)}
            </span>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 600 }}>{t('per year')}</span>
          </div>
          <div style={{ height: 6, background: '#f1f5f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${barPct}%`, height: '100%', background: cs.color, borderRadius: 3, transition: 'width 0.7s ease' }} />
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <EffortDots level={rec.effort || 2} t={t} />
            {rec.timeframe && <span style={{ fontSize: '0.62rem', color: '#9ca3af', fontWeight: 600 }}>⏱ {t(rec.timeframe)}</span>}
          </div>
          <button onClick={onToggle} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer',
            background: done ? '#f0fdf4' : '#1E2F1E', color: done ? '#16a34a' : '#EEF2DC',
            border: done ? '1.5px solid #86efac' : 'none', borderRadius: '0.6rem',
            padding: '0.4rem 0.8rem', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0,
          }}>
            {done ? <CheckCircle2 size={13} /> : <Circle size={13} />} {done ? t('Done') : t('Mark Done')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SchoolRecommendations() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { t } = useLang()
  const { result, loading, error } = useSchoolAudit()

  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recDone') || '{}') } catch { return {} }
  })
  useEffect(() => { try { localStorage.setItem('recDone', JSON.stringify(done)) } catch { /* ignore */ } }, [done])
  const toggle = (k) => setDone(p => ({ ...p, [k]: !p[k] }))

  if (loading) {
    return (
      <SchoolLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #e4edd6', borderTopColor: '#2D4A32', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#4E7D5B', fontSize: '0.85rem' }}>{t('Loading recommendations…')}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </SchoolLayout>
    )
  }

  const recs = Array.isArray(result?.recommendations) ? result.recommendations : []

  if (!result || recs.length === 0) {
    return (
      <SchoolLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '3rem' }}>💡</p>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1E2F1E', margin: 0 }}>{t('No recommendations yet')}</h2>
          <p style={{ color: '#4E7D5B', fontSize: '0.9rem', maxWidth: 440 }}>
            {error || t('Submit an audit and we’ll generate tailored, data-driven actions to cut your school’s footprint.')}
          </p>
          <button onClick={() => navigate('/school')} style={{ background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.75rem', padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{t('Enter Audit Data →')}</button>
        </div>
      </SchoolLayout>
    )
  }

  const totalSaving = recs.reduce((s, r) => s + (Number(r.potentialReductionKg) || 0), 0)
  const maxSaving = Math.max(...recs.map(r => Number(r.potentialReductionKg) || 0), 1)
  const achievedSaving = recs.filter(r => done[r.title]).reduce((s, r) => s + (Number(r.potentialReductionKg) || 0), 0)
  const doneCount = recs.filter(r => done[r.title]).length
  const pctOfFootprint = result.totalEmissions > 0 ? Math.round((totalSaving / result.totalEmissions) * 100) : 0

  // Group by priority; keep engine order (already biggest-first) inside groups.
  const groups = [
    { key: 'High',   title: 'Priority Actions', sub: 'Biggest impact — start here',     recs: recs.filter(r => r.priority === 'High') },
    { key: 'Medium', title: 'This Term',        sub: 'Solid medium-impact improvements', recs: recs.filter(r => r.priority === 'Medium') },
    { key: 'Low',    title: 'Quick Wins',       sub: 'Low-effort, do-anytime actions',   recs: recs.filter(r => r.priority === 'Low') },
  ].filter(g => g.recs.length > 0)

  let rank = 0

  return (
    <SchoolLayout>
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.75rem', color: '#1E2F1E', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={22} color="#16a34a" /> {t('Climate Recommendations')}
          </h1>
          <p style={{ color: '#7BAE7F', fontSize: '0.82rem', margin: 0 }}>{t('Tailored to your latest audit — sorted by how much carbon each one cuts.')}</p>
        </div>

        {/* ── Hero summary ── */}
        <div style={{ background: '#1E2F1E', borderRadius: '1rem', padding: isMobile ? '1.4rem 1.25rem' : '1.6rem 1.9rem', marginBottom: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', borderRadius: '50%', background: 'rgba(123,174,127,0.14)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, auto) 1fr', gap: isMobile ? '1rem' : '2rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(163,201,168,0.85)', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>{t('Total potential')}</p>
              <p style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: '#a3c9a8', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Leaf size={22} /> {fmt(toTonnes(totalSaving), 2)}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>tCO₂e/yr</span>
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '0.35rem 0 0' }}>{pctOfFootprint}% {t('of your current footprint')}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(163,201,168,0.85)', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>{t('Actions')}</p>
              <p style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{recs.length}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '0.35rem 0 0' }}>{t('tailored to your data')}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(163,201,168,0.85)', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>{t('Completed')}</p>
              <p style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{doneCount}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>/{recs.length}</span></p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '0.35rem 0 0' }}>≈ {reductionLabel(achievedSaving)} {t('locked in')}</p>
            </div>
            {/* progress ring-ish bar */}
            <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: '0.3rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Target size={12} /> {t('Progress')}</span>
                <span>{Math.round((doneCount / recs.length) * 100)}%</span>
              </div>
              <div style={{ height: 9, background: 'rgba(255,255,255,0.18)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${(doneCount / recs.length) * 100}%`, height: '100%', background: '#a3c9a8', borderRadius: 5, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Grouped recommendations ── */}
        {groups.map(g => (
          <section key={g.key} style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, background: PRIO[g.key].bg, color: PRIO[g.key].color, borderRadius: '1rem', padding: '0.22rem 0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t(PRIO[g.key].label)}</span>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1E2F1E', margin: 0 }}>{t(g.title)}</h2>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500 }}>— {t(g.sub)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {g.recs.map((rec) => {
                rank += 1
                return (
                  <RecCard key={rec.title} rec={rec} rank={rank} maxSaving={maxSaving} done={!!done[rec.title]} onToggle={() => toggle(rec.title)} t={t} />
                )
              })}
            </div>
          </section>
        ))}

      </div>
    </SchoolLayout>
  )
}
