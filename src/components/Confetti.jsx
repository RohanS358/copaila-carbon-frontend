import React, { useState, useEffect } from 'react'

// Lightweight, dependency-free confetti overlay. Renders absolutely-positioned
// pieces that fall from the top of the nearest positioned ancestor, so drop it
// inside a `position: relative` container (or a fixed full-screen one).

const COLORS = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#fb923c', '#f472b6', '#2dd4bf']

function useConfettiStyles() {
  useEffect(() => {
    if (document.getElementById('confetti-styles')) return
    const s = document.createElement('style')
    s.id = 'confetti-styles'
    s.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110%) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
      }`
    document.head.appendChild(s)
  }, [])
}

export default function Confetti({ count = 90, spread = 110 }) {
  useConfettiStyles()
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.9,
      duration: 1.8 + Math.random() * 1.9,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.random() * 9,
      drift: (Math.random() - 0.5) * spread * 2,
      rot: 180 + Math.random() * 540,
      round: Math.random() > 0.6,
    }))
  )

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 6 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -16,
            width: p.size,
            height: p.size * 0.55,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in both`,
            '--drift': `${p.drift}px`,
            '--rot': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}
