import React, { useState, useEffect } from 'react'
import { Trophy, Zap, Flame, Users, School } from 'lucide-react'
import StudentLayout from '../layouts/StudentLayout'
import { useLang } from '../context/LanguageContext'
import { studentApi } from '../services/api'

// ── Leaderboard ────────────────────────────────────────────────────────────────
// Students compete on PET EXPERIENCE (XP) — which grows from daily green
// carbon habits. Rank 1 in class = Carbon Hero; rank 1 in school = Super Carbon Hero.

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f700: '#3a5c3f', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

const RANK_COLORS = {
  1: '#D4AC0D',
  2: '#909090',
  3: '#A0522D',
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('lb-styles')) return
    const s = document.createElement('style')
    s.id = 'lb-styles'
    s.textContent = `
      @keyframes lbIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes xpFill { from { width: 0%; } to { width: var(--w); } }
      @keyframes lbspin { to { transform: rotate(360deg); } }
    `
    document.head.appendChild(s)
  }, [])
}

// ── Initials avatar ────────────────────────────────────────
function Avatar({ name, rank, size = 40 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const ringColor = RANK_COLORS[rank] || B.f300
  const bg = rank === 1 ? '#FFF8DC' : rank === 2 ? '#F5F5F5' : rank === 3 ? '#FFF0E8' : B.m200
  const textColor = rank === 1 ? '#B8860B' : rank === 2 ? '#606060' : rank === 3 ? '#8B4513' : B.f600

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg,
      border: `2px solid ${ringColor || B.m300}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 800, color: textColor,
    }}>
      {initials}
    </div>
  )
}

// ── Rank badge (number or medal label) ─────────────────────
function RankBadge({ rank }) {
  const color = RANK_COLORS[rank]
  return (
    <div style={{
      width: 28, textAlign: 'center', flexShrink: 0,
      fontWeight: 900, fontSize: rank <= 3 ? '1rem' : '0.78rem',
      color: color || '#9ca3af',
    }}>
      {rank}
    </div>
  )
}

// ── Single list row ────────────────────────────────────────
function Row({ player, index, maxXp, subLabel }) {
  const { rank, name, xp, streak, isYou, badge } = player
  const pct = maxXp > 0 ? Math.round((xp / maxXp) * 100) : 0
  const isTop3 = rank <= 3

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: isYou ? '#f0fdf4' : '#fff',
      border: `1.5px solid ${isYou ? '#4ade80' : isTop3 ? `${RANK_COLORS[rank]}44` : '#e4edd6'}`,
      borderRadius: '0.75rem',
      padding: '0.65rem 0.875rem',
      animation: `lbIn 0.3s ${index * 0.04}s both ease-out`,
    }}>
      <RankBadge rank={rank} />

      <Avatar name={name} rank={rank} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{
            fontWeight: isYou ? 800 : 700,
            fontSize: '0.85rem',
            color: B.f900,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: '140px',
          }}>
            {name}
          </span>
          {isYou && (
            <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', borderRadius: '0.4rem', padding: '0.1rem 0.4rem', flexShrink: 0 }}>
              You
            </span>
          )}
          {badge && (
            <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#fef9c3', color: '#854d0e', borderRadius: '0.4rem', padding: '0.1rem 0.4rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.62rem', color: '#9ca3af', margin: '0 0 0.25rem', fontWeight: 600 }}>{subLabel(player)}</p>
        <div style={{ height: 4, background: '#e4edd6', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            '--w': `${pct}%`, width: `${pct}%`, height: '100%',
            background: isYou ? '#22c55e' : isTop3 ? RANK_COLORS[rank] : B.f600,
            borderRadius: 2, animation: 'xpFill 0.8s ease-out both',
          }} />
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontWeight: 800, fontSize: '0.82rem', color: isYou ? '#16a34a' : B.f800, margin: 0 }}>
          {xp.toLocaleString()} <span style={{ fontWeight: 600, fontSize: '0.65rem', color: B.f400 }}>XP</span>
        </p>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 2 }}>
            <Flame size={10} color="#f97316" />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f97316' }}>{streak}d</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Leaderboard() {
  useStyles()
  const { t } = useLang()
  const [tab, setTab] = useState('class')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    const fetcher = tab === 'class' ? studentApi.classStandings : studentApi.schoolStandings
    fetcher()
      .then(res => { if (alive) setData(d => ({ ...d, [tab]: res })) })
      .catch(e => { if (alive) setError(e.message || 'Failed to load standings') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [tab])

  const current = data[tab]
  const heroBadge = tab === 'class' ? t('Carbon Hero') : t('Super Carbon Hero')

  const players = (current?.ranking || []).map(r => ({
    rank: r.rank,
    name: r.isMe ? t('You') : (r.name || t('Student')),
    rollNo: r.rollNo, className: r.className, level: r.level,
    xp: r.xp, streak: r.streak,
    badge: r.rank === 1 ? heroBadge : null,
    isYou: r.isMe,
  }))

  const maxXp = players[0]?.xp || 1
  const youRow = players.find(p => p.isYou)
  const above = youRow ? players.find(p => p.rank === youRow.rank - 1) : null
  const xpGap = above && youRow ? above.xp - youRow.xp : 0

  const subLabel = (p) => tab === 'class'
    ? `Roll ${p.rollNo || '—'} · Level ${p.level}`
    : `Class ${p.className || '—'} · Level ${p.level}`

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <StudentLayout>
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Trophy size={26} color={B.f800} strokeWidth={2.5} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: B.f900 }}>
              {t('Leaderboard')}
            </h1>
          </div>
          <p style={{ color: B.f600, fontSize: '0.82rem', margin: 0, fontWeight: 500, paddingLeft: '2.1rem' }}>
            {t('Grow your pet with green habits to climb the ranks!')}
          </p>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', background: B.m200, borderRadius: '0.75rem', padding: '0.2rem', marginBottom: '1.5rem', gap: '0.2rem', maxWidth: isMobile ? '100%' : 400 }}>
          {[
            { key: 'class', icon: <Users size={14} strokeWidth={2.5} />, label: t('My Class') },
            { key: 'school', icon: <School size={14} strokeWidth={2.5} />, label: t('My School') },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              flex: 1, border: 'none', borderRadius: '0.55rem', padding: '0.6rem 0', fontWeight: 700,
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
              background: tab === tb.key ? B.f800 : 'transparent',
              color: tab === tb.key ? B.m200 : B.f600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {loading && !current ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e4edd6', borderTopColor: B.f800, borderRadius: '50%', animation: 'lbspin 0.8s linear infinite' }} />
            <p style={{ color: B.f600, fontSize: '0.85rem', margin: 0 }}>{t('Loading standings…')}</p>
          </div>
        ) : players.length === 0 ? (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '1rem', padding: '2.5rem 2rem', textAlign: 'center', maxWidth: 480 }}>
            <Trophy size={36} color={B.f600} style={{ marginBottom: '0.875rem' }} />
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#166534', margin: 0 }}>
              {t('No scores yet — finish a daily quest to join the board!')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

            {/* ── Main list ── */}
            <div>
              {tab === 'class' && current?.className && (
                <p style={{ fontSize: '0.78rem', color: B.f600, fontWeight: 700, margin: '0 0 0.875rem' }}>
                  Class {current.className} · {players.length} students
                </p>
              )}
              {xpGap > 0 && above && (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '0.75rem', padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={15} color="#d97706" fill="#d97706" />
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
                    Only <strong>{xpGap.toLocaleString()} XP</strong> away from overtaking {above.name}!
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {players.map((p, i) => (
                  <Row key={p.rank} player={p} index={i} maxXp={maxXp} subLabel={subLabel} />
                ))}
              </div>
            </div>

            {/* ── Sidebar stats (desktop) ── */}
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Your rank card */}
                {youRow && (
                  <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #bbf7d0', padding: '1.25rem' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>Your Standing</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: '#16a34a' }}>
                        {(youRow.name || 'Y').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '1.5rem', color: B.f900, margin: 0, lineHeight: 1 }}>#{youRow.rank}</p>
                        <p style={{ fontSize: '0.72rem', color: B.f600, margin: '0.15rem 0 0' }}>{youRow.xp.toLocaleString()} XP</p>
                      </div>
                    </div>
                    {youRow.streak > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.5rem', padding: '0.4rem 0.75rem' }}>
                        <Flame size={14} color="#f97316" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c2410c' }}>{youRow.streak}-day streak</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Top 3 */}
                <div style={{ background: '#fff', borderRadius: '1rem', border: `1.5px solid ${B.m300}`, padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Top Performers</p>
                  {players.slice(0, 3).map((p, i) => (
                    <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: i < 2 ? '0.6rem' : 0 }}>
                      <span style={{ width: 22, fontWeight: 900, fontSize: '0.9rem', color: RANK_COLORS[p.rank] || '#9ca3af', flexShrink: 0 }}>{p.rank}</span>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: RANK_COLORS[p.rank] ? `${RANK_COLORS[p.rank]}22` : B.m200, border: `2px solid ${RANK_COLORS[p.rank] || B.m300}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: RANK_COLORS[p.rank] || B.f600, flexShrink: 0 }}>
                        {(p.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: B.f900, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        <p style={{ fontSize: '0.62rem', color: B.f400, margin: 0 }}>{p.xp.toLocaleString()} XP</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Motivator */}
                <div style={{ background: B.f900, borderRadius: '1rem', padding: '1.25rem', color: '#fff' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#eafff2', margin: '0 0 0.35rem' }}>
                    {t('Keep going, eco-guardian!')}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                    {t("Complete today's quest to climb the ranks and grow your pet.")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
