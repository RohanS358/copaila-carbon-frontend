import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import SchoolLayout from '../layouts/SchoolLayout'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useSchoolAudit } from '../hooks/useSchoolAudit'
import {
  SCOPE_META, categoryRows, toTonnes, fmt, downloadAuditReport,
} from '../utils/audit'

// Category accent colours for recommendation cards (mirrors the engine's
// recommendation `category` field).
const REC_CAT_COLOR = {
  Energy: '#d97706', Fuel: '#dc2626', Transport: '#2563eb',
  Food: '#16a34a', Waste: '#15803d', Paper: '#64748b', Water: '#0891b2',
}

// Plain-language explainer for each scope — surfaced when a slice is clicked.
const SCOPE_INFO = {
  SCOPE_1: { key: 'SCOPE_1', title: 'Scope 1 — Direct Emissions', desc: 'Emissions from sources your school owns or controls directly — cooking fuel (LPG, firewood), diesel generators and school-owned vehicles.' },
  SCOPE_2: { key: 'SCOPE_2', title: 'Scope 2 — Energy', desc: 'Indirect emissions from the electricity your school purchases from the grid (NEA). Nepal’s hydro-heavy grid keeps this low.' },
  SCOPE_3: { key: 'SCOPE_3', title: 'Scope 3 — Indirect Emissions', desc: 'All other indirect emissions across your value chain — student & staff commuting, canteen food, paper, water and waste.' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'2px solid #d8e8c0', borderRadius:'0.75rem', padding:'0.6rem 0.875rem' }}>
      <p style={{ fontWeight:700, fontSize:'0.78rem', color:'#002114', margin:'0 0 0.25rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize:'0.75rem', color:p.color||'#002d1c', margin:0 }}>
          {p.name}: <strong>{fmt(p.value, 0)}</strong> kg CO₂e
        </p>
      ))}
    </div>
  )
}

export default function CarbonDashboard() {
  const { selectedSchool } = useApp()
  const { t } = useLang()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { latest, result, loading, error } = useSchoolAudit()
  const schoolName = selectedSchool?.name || 'Your School'
  // Which scope slice the user has clicked open (null = none yet).
  const [activeScopeKey, setActiveScopeKey] = useState(null)

  // ── Loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem' }}>
          <div style={{ width:44, height:44, border:'4px solid #dce9ff', borderTopColor:'#002d1c', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <p style={{ color:'#264e3c', fontSize:'0.85rem' }}>{t('Loading your school’s footprint…')}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </SchoolLayout>
    )
  }

  // ── Empty state (no audit submitted yet) ──
  if (!result) {
    return (
      <SchoolLayout>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1rem', textAlign:'center', padding:'2rem' }}>
          <p style={{ fontSize:'3rem' }}>🌱</p>
          <h2 style={{ fontWeight:800, fontSize:'1.4rem', color:'#002114', margin:0 }}>{t('No carbon audit yet')}</h2>
          <p style={{ color:'#264e3c', fontSize:'0.9rem', maxWidth:420 }}>
            {error
              ? error
              : t('Submit your school’s activity data (or scan an OMR sheet) to see your real carbon footprint, scope breakdown and grade here.')}
          </p>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => navigate('/school')} style={{ background:'#002114', color:'#e5eeff', border:'none', borderRadius:'0.75rem', padding:'0.8rem 1.5rem', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>{t('Enter Audit Data →')}</button>
            <button onClick={() => navigate('/school/scan')} style={{ background:'#fff', color:'#002114', border:'1.5px solid #002d1c', borderRadius:'0.75rem', padding:'0.8rem 1.5rem', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>{t('📷 Scan OMR Sheet')}</button>
          </div>
        </div>
      </SchoolLayout>
    )
  }

  // ── Real data ──
  const scopeData = [
    { key: 'SCOPE_1', name: SCOPE_META.SCOPE_1.label, value: Number(result.scope1Emissions) || 0, color: SCOPE_META.SCOPE_1.color },
    { key: 'SCOPE_2', name: SCOPE_META.SCOPE_2.label, value: Number(result.scope2Emissions) || 0, color: SCOPE_META.SCOPE_2.color },
    { key: 'SCOPE_3', name: SCOPE_META.SCOPE_3.label, value: Number(result.scope3Emissions) || 0, color: SCOPE_META.SCOPE_3.color },
  ].filter(s => s.value > 0)

  const rows = categoryRows(result)
  const barData = rows.map(r => ({ source: r.label, value: r.emissions, fill: r.color }))
  const recs = Array.isArray(result.recommendations) ? result.recommendations : []
  const maxRec = Math.max(...recs.map(r => Number(r.potentialReductionKg) || 0), 1)
  const totalRecSaving = recs.reduce((s, r) => s + (Number(r.potentialReductionKg) || 0), 0)
  const period = latest.month ? `${latest.academicYear} · Month ${latest.month}` : `FY ${latest.academicYear}`

  return (
    <SchoolLayout>
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem' }}>

        {/* ── Hero card ── */}
        <div style={{ background:'#002114', borderRadius:'1rem', padding: isMobile ? '1.4rem 1.25rem' : '1.75rem 2rem', marginBottom:'1.5rem', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-3rem', right:'-3rem', width:'12rem', height:'12rem', borderRadius:'50%', background:'rgba(123,174,127,0.12)', pointerEvents:'none' }} />
          <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0, justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <span style={{ fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.1em', color:'rgba(163,201,168,0.85)', textTransform:'uppercase', display:'block', marginBottom:'0.5rem' }}>{period} · {schoolName}</span>
              <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.6)', margin:'0 0 0.25rem' }}>{t('Total Carbon Footprint')}</p>
              <p style={{ fontSize:'clamp(2.5rem,5vw,3.5rem)', fontWeight:900, color:'rgba(163,201,168,0.9)', margin:0, lineHeight:1 }}>
                {fmt(toTonnes(result.totalEmissions), 2)} <span style={{ fontSize:'1.2rem', fontWeight:600, color:'rgba(255,255,255,0.5)' }}>tCO₂e</span>
              </p>
              <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.6)', margin:'0.5rem 0 0' }}>
                {result.emissionsPerStudent != null ? <>{fmt(result.emissionsPerStudent, 0)} kg CO₂e {t('per student')}</> : t('Per-student intensity unavailable')}
              </p>
            </div>
            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', justifyContent: isMobile ? 'flex-start' : 'flex-end', marginBottom:'0.75rem' }}>
                <div style={{ width:54, height:54, borderRadius:'0.875rem', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                  <span style={{ fontWeight:900, fontSize:'1.4rem', color:'#fff', lineHeight:1 }}>{result.grade || '—'}</span>
                </div>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.8rem', color:'#fff', margin:0 }}>{t('Grade')}</p>
                  <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.6)', margin:0 }}>{fmt(result.confidenceScore, 0)}% {t('data confidence')}</p>
                </div>
              </div>
              <button onClick={() => downloadAuditReport(latest, schoolName)} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'0.65rem', padding:'0.6rem 1.1rem', color:'#fff', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
                {t('↓ Download Summary')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Scope + confidence row ── */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>

          {/* Emissions by Scope (interactive donut) */}
          <div style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #dce9ff', padding:'1.25rem' }}>
            <h3 style={{ fontWeight:800, fontSize:'0.95rem', color:'#002114', margin:'0 0 0.1rem' }}>{t('Emissions by Scope')}</h3>
            <p style={{ fontSize:'0.7rem', color:'#85b098', margin:'0 0 0.5rem' }}>{t('Click a slice or a row to learn what it covers')}</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={scopeData} dataKey="value" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80} paddingAngle={3}
                  onClick={(_, i) => setActiveScopeKey(k => k === scopeData[i].key ? null : scopeData[i].key)}
                  style={{ cursor:'pointer', outline:'none' }}
                >
                  {scopeData.map((entry, i) => {
                    const isActive = activeScopeKey === entry.key
                    const dim = activeScopeKey && !isActive
                    return (
                      <Cell
                        key={i}
                        fill={entry.color}
                        stroke={isActive ? '#002114' : '#fff'}
                        strokeWidth={isActive ? 2.5 : 1}
                        opacity={dim ? 0.45 : 1}
                        style={{ cursor:'pointer', outline:'none', transition:'opacity 0.2s' }}
                      />
                    )
                  })}
                </Pie>
                <Tooltip formatter={(v) => [`${fmt(v, 0)} kg CO₂e`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {scopeData.map((s, i) => {
                const pct = result.totalEmissions > 0 ? Math.round((s.value / result.totalEmissions) * 100) : 0
                const isActive = activeScopeKey === s.key
                return (
                  <button
                    key={i}
                    onClick={() => setActiveScopeKey(k => k === s.key ? null : s.key)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', textAlign:'left', cursor:'pointer', background: isActive ? '#f8f9ff' : 'transparent', border: isActive ? '1px solid #dce9ff' : '1px solid transparent', borderRadius:'0.5rem', padding:'0.3rem 0.45rem', transition:'background 0.15s' }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                      <span style={{ fontSize:'0.75rem', color:'#264e3c', fontWeight: isActive ? 700 : 400 }}>{t(s.name)}</span>
                    </div>
                    <span style={{ fontWeight:700, fontSize:'0.75rem', color:'#002114' }}>{fmt(s.value, 0)} kg · {pct}%</span>
                  </button>
                )
              })}
            </div>

            {/* Detail panel — appears when a scope is selected */}
            {activeScopeKey && SCOPE_INFO[activeScopeKey] && (() => {
              const info = SCOPE_INFO[activeScopeKey]
              const sel = scopeData.find(s => s.key === activeScopeKey)
              const pct = sel && result.totalEmissions > 0 ? Math.round((sel.value / result.totalEmissions) * 100) : 0
              const cats = rows.filter(r => r.scope === activeScopeKey)
              return (
                <div style={{ marginTop:'0.9rem', background:'#f8f9ff', border:'1px solid #dce9ff', borderRadius:'0.75rem', padding:'0.9rem 1rem', animation:'fadeIn 0.2s ease' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.35rem' }}>
                    <span style={{ fontWeight:800, fontSize:'0.82rem', color:'#002114' }}>{t(info.title)}</span>
                    <span style={{ fontWeight:800, fontSize:'0.78rem', color: sel?.color || '#002d1c' }}>{fmt(sel?.value, 0)} kg · {pct}%</span>
                  </div>
                  <p style={{ fontSize:'0.74rem', color:'#264e3c', lineHeight:1.55, margin:'0 0 0.5rem' }}>{t(info.desc)}</p>
                  {cats.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                      {cats.map(c => (
                        <span key={c.category} style={{ fontSize:'0.66rem', fontWeight:600, color:'#002114', background:'#fff', border:'1px solid #dce9ff', borderRadius:'1rem', padding:'0.2rem 0.6rem' }}>
                          {c.label} · {fmt(c.emissions, 0)} kg
                        </span>
                      ))}
                    </div>
                  )}
                  <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
                </div>
              )
            })()}
          </div>

          {/* Data confidence */}
          <div style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #dce9ff', padding:'1.25rem' }}>
            <h3 style={{ fontWeight:800, fontSize:'0.95rem', color:'#002114', margin:'0 0 0.25rem' }}>{t('Data Confidence')}</h3>
            <p style={{ fontSize:'0.72rem', color:'#85b098', margin:'0 0 1rem' }}>{t('How much of your footprint comes from measured vs estimated vs default data')}</p>
            {[
              { label: 'Tier 1 — Measured', pct: result.tier1Pct, color: '#16a34a' },
              { label: 'Tier 2 — Estimated', pct: result.tier2Pct, color: '#f59e0b' },
              { label: 'Tier 3 — Default', pct: result.tier3Pct, color: '#ef4444' },
            ].map((row, i) => (
              <div key={i} style={{ marginBottom:'0.875rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                  <span style={{ fontSize:'0.76rem', fontWeight:600, color:'#002114' }}>{t(row.label)}</span>
                  <span style={{ fontSize:'0.76rem', fontWeight:800, color:row.color }}>{fmt(row.pct, 0)}%</span>
                </div>
                <div style={{ height:8, background:'#f8f9ff', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(100, row.pct)}%`, height:'100%', background:row.color, borderRadius:4, transition:'width 0.8s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ background:'#f8f9ff', borderRadius:'0.6rem', padding:'0.6rem 0.8rem', marginTop:'0.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#002114' }}>{t('Overall confidence score')}</span>
              <span style={{ fontSize:'0.95rem', fontWeight:900, color:'#002d1c' }}>{fmt(result.confidenceScore, 0)}%</span>
            </div>
          </div>
        </div>

        {/* ── Category breakdown (real) ── */}
        {barData.length > 0 && (
          <div style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #dce9ff', padding:'1.25rem', marginBottom:'1.25rem' }}>
            <h3 style={{ fontWeight:800, fontSize:'0.95rem', color:'#002114', margin:'0 0 0.25rem' }}>{t('Emission Sources Breakdown')}</h3>
            <p style={{ fontSize:'0.72rem', color:'#85b098', margin:'0 0 1rem' }}>{t('By category (kg CO₂e)')}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={36} margin={{ left: isMobile ? -18 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce9ff" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: isMobile ? 9 : 11, fill:'#85b098' }} axisLine={false} tickLine={false} interval={0} angle={isMobile ? -30 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 50 : 30} />
                <YAxis tick={{ fontSize:11, fill:'#85b098' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6,6,0,0]} name="Emissions">
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Category cards (real) ── */}
        <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'#002114', margin:'0 0 0.875rem' }}>{t('Categories')}</h2>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {rows.map((cat) => (
            <div key={cat.category} style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #dce9ff', padding:'1.1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.6rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                  <div style={{ width:38, height:38, borderRadius:'0.7rem', background:`${cat.color}1a`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{cat.icon}</div>
                  <div>
                    <p style={{ fontWeight:800, fontSize:'0.9rem', color:'#002114', margin:0 }}>{t(cat.label)}</p>
                    <span style={{ fontSize:'0.58rem', fontWeight:700, color:'#264e3c' }}>{cat.scope?.replace('_',' ')}</span>
                  </div>
                </div>
                <span style={{ fontSize:'0.58rem', fontWeight:800, borderRadius:'1rem', padding:'0.15rem 0.5rem',
                  background: cat.tier==='MEASURED' ? '#dcfce7' : cat.tier==='ESTIMATED' ? '#fef3c7' : '#fee2e2',
                  color: cat.tier==='MEASURED' ? '#16a34a' : cat.tier==='ESTIMATED' ? '#d97706' : '#dc2626' }}>
                  {cat.tier==='MEASURED' ? t('Measured') : cat.tier==='ESTIMATED' ? t('Estimated') : t('Default')}
                </span>
              </div>
              <p style={{ fontWeight:900, fontSize:'1.3rem', color:'#002114', margin:'0 0 0.1rem' }}>{fmt(cat.emissions, 0)} <span style={{ fontSize:'0.7rem', fontWeight:600, color:'#9ca3af' }}>kg CO₂e</span></p>
              <div style={{ height:6, background:'#f8f9ff', borderRadius:3, overflow:'hidden', margin:'0.5rem 0 0.3rem' }}>
                <div style={{ width:`${cat.pct}%`, height:'100%', background:cat.color, borderRadius:3 }} />
              </div>
              <p style={{ fontSize:'0.62rem', color:'#9ca3af', margin:0 }}>{cat.pct}% {t('of total footprint')}</p>
            </div>
          ))}
        </div>

        {/* ── Recommendations (real, from engine) ── */}
        {recs.length > 0 && (
          <>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', alignItems:'center', justifyContent:'space-between', margin:'0 0 0.875rem' }}>
              <h2 style={{ fontWeight:800, fontSize:'1.1rem', color:'#002114', margin:0 }}>{t('Top Recommendations')}</h2>
              <button onClick={() => navigate('/school/recommendations')} style={{ fontSize:'0.74rem', fontWeight:700, color:'#002d1c', background:'#f8f9ff', border:'1px solid #d1fae5', borderRadius:'0.6rem', padding:'0.4rem 0.85rem', cursor:'pointer' }}>
                {t('View all')} ({recs.length}) · ~{fmt(toTonnes(totalRecSaving), 1)} tCO₂e {t('potential')} →
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:'0.875rem' }}>
              {recs.slice(0, 6).map((rec, i) => {
                const cc = REC_CAT_COLOR[rec.category] || '#264e3c'
                const barPct = Math.max(6, Math.round(((Number(rec.potentialReductionKg) || 0) / maxRec) * 100))
                return (
                <div key={i} style={{ background:'#fff', borderRadius:'1rem', border:'1px solid #dce9ff', borderLeft:`4px solid ${cc}`, padding:'1rem 1.1rem', display:'flex', gap:'0.75rem' }}>
                  <div style={{ width:40, height:40, borderRadius:'0.6rem', background:`${cc}1a`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{rec.icon || '💡'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.2rem', flexWrap:'wrap' }}>
                      <p style={{ fontWeight:800, fontSize:'0.85rem', color:'#002114', margin:0 }}>{t(rec.title)}</p>
                      {rec.priority && <span style={{ fontSize:'0.55rem', fontWeight:800, borderRadius:'1rem', padding:'0.1rem 0.45rem', textTransform:'uppercase',
                        background: rec.priority==='High' ? '#fee2e2' : rec.priority==='Medium' ? '#fef3c7' : '#dcfce7',
                        color: rec.priority==='High' ? '#dc2626' : rec.priority==='Medium' ? '#d97706' : '#16a34a' }}>{t(rec.priority === 'High' ? 'High impact' : rec.priority === 'Medium' ? 'Medium impact' : 'Quick win')}</span>}
                    </div>
                    <p style={{ fontSize:'0.74rem', color:'#6b7280', margin:0, lineHeight:1.55 }}>{t(rec.text)}</p>
                    {rec.potentialReductionKg ? (
                      <div style={{ marginTop:'0.45rem' }}>
                        <p style={{ fontSize:'0.72rem', color:'#15803d', fontWeight:800, margin:'0 0 0.25rem' }}>↓ {fmt(rec.potentialReductionKg, 0)} kg CO₂e/yr {t('potential saving')}</p>
                        <div style={{ height:5, background:'#f1f5f0', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ width:`${barPct}%`, height:'100%', background:cc, borderRadius:3 }} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </SchoolLayout>
  )
}
