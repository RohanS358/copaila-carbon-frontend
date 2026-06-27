import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ComposedChart, Area,
} from 'recharts'
import SchoolLayout from '../layouts/SchoolLayout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useSchoolAudit } from '../hooks/useSchoolAudit'
import { BarChart2 } from 'lucide-react'
import {
  categoryRows, toTonnes, fmt, GRADE_COLOR, downloadAuditReport,
} from '../utils/audit'

function NetZeroTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const tgt = payload.find(p => p.dataKey === 'target')?.value
  const act = payload.find(p => p.dataKey === 'actual')?.value
  const diff = act != null && tgt != null ? act - tgt : null
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e4edd6', borderRadius: '0.75rem', padding: '0.6rem 0.875rem', fontSize: '0.75rem', minWidth: 168 }}>
      <p style={{ fontWeight: 700, color: '#1E2F1E', margin: '0 0 0.35rem' }}>{label}</p>
      {tgt != null && <p style={{ color: '#555', margin: '0.1rem 0' }}>Target: <strong>{fmt(tgt, 2)}</strong> tCO₂e</p>}
      {act != null ? (
        <>
          <p style={{ color: '#4E7D5B', margin: '0.1rem 0' }}>Actual: <strong>{fmt(act, 2)}</strong> tCO₂e</p>
          {diff !== null && (
            <p style={{ color: diff > 0 ? '#ef4444' : '#22c55e', margin: '0.3rem 0 0', fontWeight: 700 }}>
              {diff > 0 ? '▲' : '▼'} {fmt(Math.abs(diff), 2)} tCO₂e {diff > 0 ? 'over target' : 'under target'}
            </p>
          )}
        </>
      ) : (
        <p style={{ color: '#9ca3af', margin: '0.1rem 0', fontSize: '0.68rem' }}>No data recorded</p>
      )}
    </div>
  )
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e4edd6', borderRadius: '0.75rem', padding: '0.6rem 0.875rem', fontSize: '0.75rem' }}>
      <p style={{ fontWeight: 700, color: '#1E2F1E', margin: '0 0 0.2rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '0.1rem 0 0' }}>{p.name}: <strong>{fmt(p.value, 0)}</strong> kg CO₂e</p>
      ))}
    </div>
  )
}

export default function SchoolReports() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { audits, latest, result, loading, error } = useSchoolAudit()
  const { selectedSchool } = useApp()
  const { t } = useLang()
  const schoolName = selectedSchool?.name || selectedSchool || 'Your School'
  // Drives the grow-in animation of the hotspot bars on mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const id = setTimeout(() => setMounted(true), 60); return () => clearTimeout(id) }, [])
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 25)

  if (loading) {
    return (
      <SchoolLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem' }}>
          <div style={{ width:44, height:44, border:'4px solid #e4edd6', borderTopColor:'#2D4A32', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <p style={{ color:'#4E7D5B', fontSize:'0.85rem' }}>{t('Loading report…')}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </SchoolLayout>
    )
  }

  if (!result) {
    return (
      <SchoolLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem', textAlign:'center', padding:'2rem' }}>
          <BarChart2 size={52} color="#7BAE7F" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontWeight:800, fontSize:'1.4rem', color:'#1E2F1E', margin:0 }}>{t('No report yet')}</h2>
          <p style={{ color:'#4E7D5B', fontSize:'0.9rem', maxWidth:420 }}>{error || t('Submit an audit to generate your annual emissions report.')}</p>
          <button onClick={() => navigate('/school')} style={{ background:'#1E2F1E', color:'#EEF2DC', border:'none', borderRadius:'0.75rem', padding:'0.8rem 1.5rem', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>{t('Enter Audit Data →')}</button>
        </div>
      </SchoolLayout>
    )
  }

  const rows = categoryRows(result)
  const scopeBars = [
    { name: 'Scope 1 — Direct',      value: Number(result.scope1Emissions) || 0, fill: '#1E2F1E' },
    { name: 'Scope 2 — Electricity', value: Number(result.scope2Emissions) || 0, fill: '#4E7D5B' },
    { name: 'Scope 3 — Indirect',    value: Number(result.scope3Emissions) || 0, fill: '#a3c9a8' },
  ]
  const maxScope = Math.max(...scopeBars.map(s => s.value), 1)
  const hotspots = rows.slice(0, 3)

  // Net zero trajectory data
  const sortedAuditList = [...audits].filter(a => a.result).sort((a, b) => a.academicYear - b.academicYear)
  const firstAuditYear = sortedAuditList.length > 0 ? parseInt(sortedAuditList[0].academicYear) : new Date().getFullYear()
  const baselineEmissions = sortedAuditList.length > 0
    ? toTonnes(sortedAuditList[0].result.totalEmissions)
    : toTonnes(result.totalEmissions)
  const auditEmissionsByYear = {}
  sortedAuditList.forEach(a => { auditEmissionsByYear[parseInt(a.academicYear)] = toTonnes(a.result.totalEmissions) })
  const effectiveTargetYear = Math.max(targetYear, firstAuditYear + 1)
  const netZeroData = []
  for (let yr = firstAuditYear; yr <= effectiveTargetYear; yr++) {
    const tgt = Math.max(0, baselineEmissions * (1 - (yr - firstAuditYear) / (effectiveTargetYear - firstAuditYear)))
    const act = auditEmissionsByYear[yr] ?? null
    const tgtR = Math.round(tgt * 100) / 100
    netZeroData.push({
      year: yr,
      target: tgtR,
      actual: act,
      actualMin: act !== null ? Math.round(Math.min(act, tgtR) * 100) / 100 : 0,
      greenArea: act !== null && act < tgtR ? Math.round((tgtR - act) * 100) / 100 : 0,
      redArea: act !== null && act > tgtR ? Math.round((act - tgtR) * 100) / 100 : 0,
    })
  }

  // Trend from real audits (multiple periods), oldest → newest.
  const trend = [...audits]
    .filter(a => a.result)
    .sort((a, b) => (a.academicYear - b.academicYear) || ((a.month || 0) - (b.month || 0)))
    .map(a => ({
      label: a.month ? `${a.academicYear}/${a.month}` : `${a.academicYear}`,
      value: toTonnes(a.result.totalEmissions),
    }))

  return (
    <SchoolLayout>
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.75rem', color: '#1E2F1E', margin: '0 0 0.3rem' }}>{t('Annual Emissions Report')}</h1>
            <p style={{ color: '#7BAE7F', fontSize: '0.82rem', margin: 0 }}>{schoolName} · FY {latest.academicYear} · {t('Carbon Management')}</p>
          </div>
          <button onClick={() => downloadAuditReport(latest, schoolName)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.75rem', padding: '0.7rem 1.25rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}>
            {t('↓ Download PDF Report')}
          </button>
        </div>

        {/* ── KPI row (real) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 220px', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Footprint', value: fmt(toTonnes(result.totalEmissions), 2), unit: 'tCO₂e' },
            { label: 'Per Student', value: result.emissionsPerStudent != null ? fmt(result.emissionsPerStudent, 0) : '—', unit: 'kg CO₂e' },
            { label: 'Data Confidence', value: fmt(result.confidenceScore, 0), unit: '%' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e4edd6', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>{t(k.label)}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span style={{ fontWeight: 900, fontSize: '2rem', color: '#1E2F1E', lineHeight: 1 }}>{k.value}</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#7BAE7F' }}>{k.unit}</span>
              </div>
            </div>
          ))}
          {/* Grade card */}
          <div style={{ background: '#1E2F1E', borderRadius: '1rem', padding: '1.25rem', color: '#fff' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(163,201,168,0.7)', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>{t('Efficiency Grade')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 900, fontSize: '2.5rem', color: GRADE_COLOR(result.grade), lineHeight: 1 }}>{result.grade || '—'}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', margin: '0 0 0.15rem' }}>{result.partiallyDefault ? t('Partly estimated') : t('Based on real data')}</p>
                <p style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{t('Intensity + data quality')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scope bars + Category breakdown ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e4edd6', padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E2F1E', margin: '0 0 1rem' }}>{t('Emissions by Scope')}</h3>
            {scopeBars.map((s, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E2F1E' }}>{t(s.name)}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4E7D5B' }}>{fmt(s.value, 0)} kg</span>
                </div>
                <div style={{ height: 10, background: '#f5f7ee', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${(s.value / maxScope) * 100}%`, height: '100%', background: s.fill, borderRadius: 5, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e4edd6', padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E2F1E', margin: '0 0 1rem' }}>{t('Footprint by Category')}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={rows.map(r => ({ name: r.label, value: r.emissions, fill: r.color }))} barSize={26} margin={{ left: isMobile ? -18 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4edd6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} name="Emissions">
                  {rows.map((r, i) => <Cell key={i} fill={r.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Trend (only when multiple periods exist) ── */}
        {trend.length > 1 && (
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e4edd6', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E2F1E', margin: '0 0 0.2rem' }}>{t('Emissions Trend')}</h3>
            <p style={{ fontSize: '0.72rem', color: '#7BAE7F', margin: '0 0 1rem' }}>{t('Total footprint across your submitted periods (tCO₂e)')}</p>
            <ResponsiveContainer width="100%" height={175}>
              <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4edd6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2D4A32" strokeWidth={2.5} dot={{ fill: '#2D4A32', r: 3 }} name="tCO₂e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Net Zero Trajectory ── */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e4edd6', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E2F1E', margin: '0 0 0.2rem' }}>{t('Net Zero Trajectory')}</h3>
              <p style={{ fontSize: '0.72rem', color: '#7BAE7F', margin: 0 }}>{t('Track your performance against your net zero pathway (tCO₂e)')}</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E2F1E', whiteSpace: 'nowrap' }}>{t('Net zero by:')}</span>
              <input
                type="number"
                min={firstAuditYear + 1}
                max={2100}
                value={targetYear}
                onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > firstAuditYear) setTargetYear(v) }}
                style={{
                  width: 82,
                  padding: '0.35rem 0.5rem',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#1E2F1E',
                  background: '#f9faf6',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />
            </label>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            {[
              { type: 'line', dash: true, color: '#1E2F1E', label: t('Net zero pathway') },
              { type: 'line', color: '#4E7D5B', label: t('Actual emissions') },
              { type: 'area', color: 'rgba(239,68,68,0.45)', label: t('Above target') },
              { type: 'area', color: 'rgba(34,197,94,0.45)', label: t('Below target') },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {item.type === 'area' ? (
                  <div style={{ width: 14, height: 10, borderRadius: 3, background: item.color }} />
                ) : (
                  <svg width="22" height="5" style={{ flexShrink: 0 }}>
                    <line x1="0" y1="2.5" x2="22" y2="2.5" stroke={item.color} strokeWidth="2.5" strokeDasharray={item.dash ? '5 3' : undefined} />
                  </svg>
                )}
                <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={netZeroData} margin={{ top: 4, right: 8, bottom: 0, left: isMobile ? -14 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4edd6" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<NetZeroTooltip />} />
              {/* Stacked colored fill: transparent base → green (below target) → red (above target) */}
              <Area type="linear" dataKey="actualMin" stackId="nz" fill="transparent" stroke="none" legendType="none" isAnimationActive={false} />
              <Area type="linear" dataKey="greenArea" stackId="nz" fill="rgba(34,197,94,0.3)" stroke="none" legendType="none" isAnimationActive={false} />
              <Area type="linear" dataKey="redArea" stackId="nz" fill="rgba(239,68,68,0.3)" stroke="none" legendType="none" isAnimationActive={false} />
              {/* Target pathway (dashed) */}
              <Line type="linear" dataKey="target" stroke="#1E2F1E" strokeWidth={2} strokeDasharray="6 3" dot={false} legendType="none" />
              {/* Actual emissions line with dots */}
              <Line type="monotone" dataKey="actual" stroke="#4E7D5B" strokeWidth={2.5} dot={{ fill: '#4E7D5B', r: 4, strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls={false} legendType="none" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ── Emission Hotspots (real top categories) ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', margin: '0 0 0.875rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1E2F1E', margin: 0 }}>{t('Emission Hotspots')}</h2>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{t('Where your footprint is concentrated — tackle the top of the podium first')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {hotspots.map((h, i) => {
            const rankColors = ['#D4AC0D', '#909090', '#A0522D']
            const rankLabels = ['1st', '2nd', '3rd']
            const isTop = i === 0
            return (
              <div key={h.category}
                style={{ position: 'relative', background: '#fff', borderRadius: '1rem', border: `2px solid ${isTop ? h.color + '88' : '#e4edd6'}`, padding: '1.1rem', overflow: 'hidden', transition: 'transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {/* top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: h.color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{ position: 'relative', width: 44, height: 44, background: `${h.color}1a`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                      {h.icon}
                      <span style={{ position: 'absolute', top: -8, left: -8, background: rankColors[i] || '#9ca3af', color: '#fff', fontSize: '0.5rem', fontWeight: 900, padding: '0.1rem 0.35rem', borderRadius: '0.4rem', lineHeight: 1.4 }}>{rankLabels[i] || `#${i+1}`}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E2F1E', margin: 0 }}>{t(h.label)}</p>
                      <p style={{ fontSize: '0.62rem', color: '#9ca3af', margin: 0, textTransform: 'capitalize' }}>{h.scope?.replace('_', ' ')} · {h.tier?.toLowerCase()}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: h.color }}>{h.pct}%</span>
                </div>
                <p style={{ fontWeight: 900, fontSize: '1.35rem', color: '#1E2F1E', margin: '0 0 0.5rem' }}>{fmt(h.emissions, 0)} <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9ca3af' }}>kg CO₂e</span></p>
                {/* share bar (animates on mount) */}
                <div style={{ height: 8, background: '#f5f7ee', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: mounted ? `${h.pct}%` : '0%', height: '100%', background: h.color, borderRadius: 4, transition: 'width 0.9s cubic-bezier(.34,1.1,.64,1)' }} />
                </div>
                {isTop && (
                  <p style={{ fontSize: '0.68rem', color: h.color, fontWeight: 700, margin: '0.6rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    🎯 {t('Your largest single source — cutting this moves the needle most.')}
                  </p>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </SchoolLayout>
  )
}
