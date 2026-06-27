import React, { useEffect } from 'react'
import Confetti from '../Confetti'
import idleImg from '../../assets/idle.png'
import talkingVid from '../../assets/talking.mp4'
import jumpingVid from '../../assets/happy_jumping.mp4'

// ── PetStage ──────────────────────────────────────────────────────────────────
// The visual half of the animated character. The character art has a BLACK
// background, so the stage itself is black — the art blends in seamlessly.
//
// Driven entirely by props from useTalkingPet():
//   state     'idle' | 'talking' | 'celebrating'   → which asset to show
//   subtitle  the spoken line, rendered as a caption above the character
//
//   idle        → idle.png (with a gentle bob so it feels alive)
//   talking     → talking.mp4 (loops while the line is spoken)
//   celebrating → happy_jumping.mp4 + confetti

function useStageStyles() {
  useEffect(() => {
    if (document.getElementById('petstage-styles')) return
    const s = document.createElement('style')
    s.id = 'petstage-styles'
    s.textContent = `
      @keyframes petBob   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5%); } }
      @keyframes capIn    { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      @keyframes capDots  { 0%, 60%, 100% { opacity: .25; } 30% { opacity: 1; } }
    `
    document.head.appendChild(s)
  }, [])
}

function Caption({ text, talking }) {
  if (!text) return null
  return (
    <div
      style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        maxWidth: 'min(90%, 560px)',
        transform: 'translateX(-50%)',
        background: 'rgba(8, 20, 12, 0.82)',
        border: '1px solid rgba(110, 231, 160, 0.35)',
        backdropFilter: 'blur(6px)',
        color: '#eafff2',
        padding: '0.7rem 1.1rem',
        borderRadius: '1rem',
        fontSize: 'clamp(0.95rem, 2.4vw, 1.2rem)',
        fontWeight: 600,
        lineHeight: 1.45,
        textAlign: 'center',
        animation: 'capIn 0.25s ease both',
        zIndex: 4,
      }}
    >
      {text}
      {talking && (
        <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6, verticalAlign: 'middle' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 5, height: 5, borderRadius: '50%', background: '#6ee7a0',
                animation: `capDots 1.1s ${i * 0.18}s infinite ease-in-out`,
              }}
            />
          ))}
        </span>
      )}
    </div>
  )
}

export default function PetStage({
  state = 'idle',
  subtitle = '',
  height = 'min(46vh, 420px)',
  rounded = '1.5rem',
  confetti = true,
  style = {},
}) {
  useStageStyles()
  const isVideo = state === 'talking' || state === 'celebrating'
  const src = state === 'celebrating' ? jumpingVid : talkingVid

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: '#000',
        borderRadius: rounded,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* Soft glow behind the character — green when talking, gold when celebrating */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            state === 'celebrating'
              ? 'radial-gradient(circle at 50% 60%, rgba(251,191,36,0.18), transparent 60%)'
              : 'radial-gradient(circle at 50% 60%, rgba(45,74,50,0.45), transparent 65%)',
          transition: 'background 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      {isVideo ? (
        <video
          key={state} /* remount so the clip restarts on each state change */
          src={src}
          autoPlay
          loop
          muted
          playsInline
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', position: 'relative', zIndex: 2 }}
        />
      ) : (
        <img
          src={idleImg}
          alt="Your eco companion, idle"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            animation: 'petBob 3.2s ease-in-out infinite',
          }}
        />
      )}

      {confetti && state === 'celebrating' && <Confetti />}

      <Caption text={subtitle} talking={state === 'talking'} />
    </div>
  )
}
