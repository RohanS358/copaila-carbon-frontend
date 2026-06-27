import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import StudentLayout from '../layouts/StudentLayout'
import { useIsMobile } from '../hooks/useMediaQuery'
import { Star, Trophy, Clock, Award, Lock } from 'lucide-react'

const BADGE_COLORS = {
  green_beginner: { bg: '#dcfce7', border: '#4ade80', accent: '#16a34a' },
  waste_warrior:  { bg: '#dbeafe', border: '#60a5fa', accent: '#2563eb' },
  carbon_hero:    { bg: '#fef3c7', border: '#fbbf24', accent: '#d97706' },
  forest_guardian:{ bg: '#f3e8ff', border: '#c084fc', accent: '#7c3aed' },
  water_saver:    { bg: '#e0f2fe', border: '#38bdf8', accent: '#0369a1' },
  cycle_champ:    { bg: '#dcfce7', border: '#86efac', accent: '#15803d' },
}

const CONFETTI_COLORS = ['#fbbf24','#f87171','#34d399','#60a5fa','#a78bfa','#fb923c','#f472b6','#2dd4bf']

// ── Inject keyframes (always overwrite so hot-reload picks up changes) ────
function useStyles() {
  useEffect(() => {
    let s = document.getElementById('ach-styles')
    if (!s) { s = document.createElement('style'); s.id = 'ach-styles'; document.head.appendChild(s) }
    s.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
      }
      @keyframes overlayIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes cardRevealSpin {
        0%   { opacity: 0; transform: scale(0.1) rotate(0deg); }
        55%  { opacity: 1; transform: scale(1.08) rotate(360deg); }
        75%  { transform: scale(0.96) rotate(360deg); }
        100% { transform: scale(1) rotate(360deg); }
      }
      @keyframes iconSpinTwice {
        0%   { transform: perspective(600px) rotateY(0deg); }
        50%  { transform: perspective(600px) rotateY(360deg); }
        100% { transform: perspective(600px) rotateY(720deg); }
      }
      @keyframes shimmerBadge {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
    `
  }, [])
}

// ── Confetti piece ─────────────────────────────────────────
function ConfettiPiece({ piece }) {
  return (
    <div style={{
      position: 'fixed',
      left: `${piece.left}%`,
      top: -16,
      width: piece.size,
      height: piece.size * 0.55,
      background: piece.color,
      borderRadius: piece.round ? '50%' : 2,
      zIndex: 1001,
      pointerEvents: 'none',
      animation: `confettiFall ${piece.duration}s ${piece.delay}s ease-in both`,
      '--drift': `${piece.drift}px`,
      '--rot': `${piece.rot}deg`,
    }} />
  )
}

// ── Badge modal ────────────────────────────────────────────
function BadgeModal({ badge, onClose }) {
  const c = BADGE_COLORS[badge.id] ?? { bg: '#f8f9ff', border: '#dce9ff', accent: '#264e3c' }

  const [confetti] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.1,
      duration: 1.6 + Math.random() * 1.6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 7 + Math.random() * 9,
      drift: (Math.random() - 0.5) * 160,
      rot: 180 + Math.random() * 540,
      round: Math.random() > 0.6,
    }))
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,20,10,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'overlayIn 0.2s ease both',
      }}
    >
      {/* Confetti */}
      {confetti.map(p => <ConfettiPiece key={p.id} piece={p} />)}

      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          border: `2.5px solid ${c.border}`,
          borderRadius: '1.25rem',
          padding: '2.75rem 2.25rem 2rem',
          textAlign: 'center',
          maxWidth: 300, width: '88%',
          position: 'relative', zIndex: 1002,
          border: `3px solid ${c.border}`,
          animation: 'cardRevealSpin 0.65s cubic-bezier(.34,1.2,.64,1) both',
        }}
      >
        {/* Solid accent top strip */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 5,
          borderRadius: '1.25rem 1.25rem 0 0',
          background: c.accent,
        }} />

        {/* Badge icon — spins once after reveal */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: c.bg,
          border: `4px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.8rem', margin: '0 auto 1.25rem',
          animation: 'iconSpinTwice 1.2s 0.65s ease-in-out both',
        }}>
          {badge.emoji}
        </div>

        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#002114', margin: '0 0 0.35rem' }}>
          {badge.name}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#264e3c', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          Earned on {badge.earnedDate} · Keep up the great work, eco-guardian!
        </p>

        <button
          onClick={onClose}
          style={{
            background: c.accent, color: '#fff', border: 'none',
            borderRadius: '0.75rem', padding: '0.65rem 2rem',
            fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Awesome!
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function Achievements() {
  useStyles()
  const { earnedBadges, inProgressBadges, xp } = useApp()
  const [activeBadge, setActiveBadge] = useState(null)
  const isMobile = useIsMobile()

  return (
    <>
      {activeBadge && <BadgeModal badge={activeBadge} onClose={() => setActiveBadge(null)} />}

      <StudentLayout>
        <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#002114', margin: 0 }}>Trophy Room</h1>
              <p style={{ color: '#264e3c', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Track your eco-milestones and unlock new ranks.</p>
            </div>
            <div style={{ background: '#e8f5e9', border: '1.5px solid #4ade80', borderRadius: '2rem', padding: '0.5rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={14} color="#d97706" fill="#d97706" />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#002114' }}>Total Score: {xp.toLocaleString()}</span>
            </div>
          </div>

          {/* Earned Badges */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', paddingBottom: '0.6rem', borderBottom: '1px solid #dce9ff' }}>
              <Trophy size={20} color="#d97706" />
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#002114', margin: 0 }}>Earned Badges</h2>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#85b098', margin: '0 0 1rem', fontWeight: 600 }}>Tap any badge to celebrate!</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
              {earnedBadges.map((badge) => {
                const c = BADGE_COLORS[badge.id] ?? { bg: '#f8f9ff', border: '#dce9ff', accent: '#264e3c' }
                return (
                  <button
                    key={badge.id}
                    onClick={() => setActiveBadge(badge)}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${c.border}`,
                      borderRadius: '1rem',
                      padding: '1.5rem 1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = '' }}
                  >
                    <div style={{ width: 76, height: 76, borderRadius: '50%', background: c.bg, border: `3px dashed ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.1rem', marginBottom: '0.875rem' }}>
                      {badge.emoji}
                    </div>
                    <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#002114', margin: '0 0 0.25rem' }}>{badge.name}</p>
                    <p style={{ fontSize: '0.72rem', color: '#85b098', margin: 0 }}>Earned {badge.earnedDate}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* In Progress */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid #dce9ff' }}>
              <Clock size={20} color="#4E7D5B" />
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#002114', margin: 0 }}>In Progress</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.875rem' }}>
              {inProgressBadges.map(badge => {
                const pct = Math.round((badge.current / badge.target) * 100)
                const c = BADGE_COLORS[badge.id] ?? { bg: '#f8f9ff', border: '#dce9ff', accent: '#264e3c' }
                return (
                  <div key={badge.id} style={{ background: '#fff', border: '1.5px solid #dce9ff', borderRadius: '1rem', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '0.75rem', background: c.bg, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                      <Award size={26} color={c.accent} />
                      <div style={{ position: 'absolute', top: -6, right: -6, background: '#9ca3af', color: '#fff', borderRadius: 4, padding: '3px 4px', display: 'flex', alignItems: 'center' }}>
                        <Lock size={9} color="#fff" />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#002114', margin: 0 }}>{badge.name}</p>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, background: c.bg, color: c.accent, borderRadius: '1rem', padding: '0.15rem 0.55rem', border: `1px solid ${c.border}` }}>Tier {badge.tier}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#264e3c', margin: '0 0 0.5rem' }}>{badge.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: '#85b098', marginBottom: '0.3rem' }}>
                        <span>Progress</span>
                        <span style={{ color: '#002114', fontWeight: 800 }}>{badge.current} / {badge.target}</span>
                      </div>
                      <div style={{ height: 7, background: '#dce9ff', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#002d1c', borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

        </div>
      </StudentLayout>
    </>
  )
}
