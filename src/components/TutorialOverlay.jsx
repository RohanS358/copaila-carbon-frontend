import React, { useState, useEffect, useCallback } from 'react'
import {
  X, ChevronRight, ChevronLeft, CalendarCheck, BookOpen,
  Trophy, Medal, CalendarDays, Plus, Zap, Lightbulb, Leaf,
} from 'lucide-react'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  m200: '#EEF2DC', m300: '#d8e8c0',
}

const PAD = 10     // px of breathing room around highlighted element
const CARD_W = 318

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to your Student Portal!',
    body: "Let's take a quick tour. I'll show you where everything lives and how to start earning XP on your eco journey.",
    target: null,
    position: null,
    Icon: Leaf,
    tip: null,
    actionLabel: 'Start Tour',
  },
  {
    id: 'xp-bar',
    title: 'Your XP Progress Bar',
    body: "This bar tracks how close you are to your next level. Fill it by completing eco-activities, lessons, and events. Level up to unlock rare avatar accessories for your pet!",
    target: '[data-tour="xp-bar"]',
    position: 'bottom',
    Icon: Zap,
    tip: "Today's goal: earn 50 XP by logging one small activity.",
  },
  {
    id: 'nav-quests',
    title: '① Daily Quests — Start Here',
    body: "This is the heart of your portal. Every day, log the eco-friendly things you actually did — cycling to school, skipping meat, turning off lights. Each action earns XP and reduces your real carbon footprint.",
    target: '[data-tour="nav-quests"]',
    position: 'right',
    Icon: CalendarCheck,
    tip: "Log something every day to keep your streak alive for bonus XP!",
  },
  {
    id: 'nav-lessons',
    title: '② Lessons — Learn & Earn',
    body: "Your AI tutor walks you through climate, energy, waste, and biodiversity. Each lesson ends with a short quiz — answer correctly for extra XP. The tutor even reads aloud if you prefer listening.",
    target: '[data-tour="nav-lessons"]',
    position: 'right',
    Icon: BookOpen,
    tip: "Complete 3 lessons in a row to unlock the Knowledge Sprout badge!",
  },
  {
    id: 'nav-leaderboard',
    title: '③ Leaderboard — Compete & Inspire',
    body: "See how you rank among classmates and schools across Nepal. The board resets monthly — so every new month is a fresh chance to climb to the top.",
    target: '[data-tour="nav-leaderboard"]',
    position: 'right',
    Icon: Trophy,
    tip: "Schools with the highest average XP earn monthly recognition.",
  },
  {
    id: 'nav-achievements',
    title: '④ Achievements — Collect Badges',
    body: "Earn badges by hitting milestones: logging your 10th activity, reaching Level 5, joining an event. Some badges are secret — you discover them just by exploring and doing.",
    target: '[data-tour="nav-achievements"]',
    position: 'right',
    Icon: Medal,
    tip: "There is a hidden badge for completing all activity categories in a single day!",
  },
  {
    id: 'nav-events',
    title: '⑤ Eco Events — Join or Create',
    body: "Browse upcoming community events like tree-planting drives and river clean-ups. You can also create your own event, set a date, and invite classmates to join you!",
    target: '[data-tour="nav-events"]',
    position: 'right',
    Icon: CalendarDays,
    tip: "Joining an event earns a big XP bonus on top of your daily activities.",
  },
  {
    id: 'log-activity',
    title: 'Log Activity — Quick Shortcut',
    body: "This button is always visible in the sidebar. Click it any time to quickly record an eco-action and bank your XP. It takes under a minute, so there is no excuse to skip a day!",
    target: '[data-tour="log-activity"]',
    position: 'right',
    Icon: Plus,
    tip: "Tap this every morning to build your daily eco habit.",
  },
  {
    id: 'done',
    title: "You are all set!",
    body: "Now you know your way around. Start by logging your first activity today — even something small like using a reusable bottle counts. Every action adds up to a real impact on our planet.",
    target: null,
    position: null,
    Icon: Leaf,
    tip: null,
    isFinal: true,
    actionLabel: "Let's go!",
  },
]

function getTargetRect(selector) {
  if (!selector) return null
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function calcCardPos(rect, position) {
  const base = {
    position: 'fixed',
    width: CARD_W,
    maxWidth: 'calc(100vw - 1.5rem)',
    zIndex: 1003,
    boxSizing: 'border-box',
  }
  if (!rect || !position) {
    return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const CARD_H_EST = 310

  if (position === 'right') {
    let left = rect.left + rect.width + PAD + 18
    let top  = rect.top - 8
    if (left + CARD_W > vw - 12) left = rect.left - CARD_W - PAD - 18
    top = Math.max(12, Math.min(top, vh - CARD_H_EST - 12))
    return { ...base, top, left }
  }

  if (position === 'bottom') {
    let top  = rect.top + rect.height + PAD + 16
    let left = rect.left + rect.width / 2 - CARD_W / 2
    left = Math.max(12, Math.min(left, vw - CARD_W - 12))
    if (top + CARD_H_EST > vh - 12) top = rect.top - CARD_H_EST - PAD - 8
    return { ...base, top, left }
  }

  return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
}

export default function TutorialOverlay({ open, onClose }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)

  const current = STEPS[step]

  const refreshRect = useCallback(() => {
    setRect(getTargetRect(current.target))
  }, [current.target])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(refreshRect, 40) // let DOM settle after step change
    window.addEventListener('resize', refreshRect)
    window.addEventListener('scroll', refreshRect, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', refreshRect)
      window.removeEventListener('scroll', refreshRect, true)
    }
  }, [open, refreshRect])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape')      { onClose?.(); return }
      if (e.key === 'ArrowRight')  setStep(s => Math.min(s + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft')   setStep(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => { if (open) setStep(0) }, [open])

  if (!open) return null

  // Compute highlight box with padding
  const hl = rect
    ? { t: rect.top - PAD, l: rect.left - PAD, w: rect.width + PAD * 2, h: rect.height + PAD * 2 }
    : null

  const cardStyle = calcCardPos(rect, current.position)
  const OV = 'rgba(0,0,0,0.72)'

  const goNext = () => step >= STEPS.length - 1 ? onClose?.() : setStep(s => s + 1)
  const goBack = () => step > 0 && setStep(s => s - 1)

  return (
    <>
      <style>{`
        @keyframes _tp { 0%,100%{box-shadow:0 0 0 0 rgba(78,125,91,.8)} 60%{box-shadow:0 0 0 10px rgba(78,125,91,0)} }
        @keyframes _tc { from{opacity:0;transform:translateY(7px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {/* ── Dark overlay: 4 rects framing the highlighted element ── */}
      {hl ? (
        <>
          <div style={{ position:'fixed', top:0,     left:0,            right:0,             height:hl.t,           background:OV, zIndex:1001, pointerEvents:'all', transition:'height .25s ease' }} />
          <div style={{ position:'fixed', top:hl.t+hl.h, left:0,       right:0,             bottom:0,              background:OV, zIndex:1001, pointerEvents:'all', transition:'top .25s ease' }} />
          <div style={{ position:'fixed', top:hl.t,  left:0,           width:hl.l,          height:hl.h,           background:OV, zIndex:1001, pointerEvents:'all', transition:'all .25s ease' }} />
          <div style={{ position:'fixed', top:hl.t,  left:hl.l+hl.w,  right:0,             height:hl.h,           background:OV, zIndex:1001, pointerEvents:'all', transition:'all .25s ease' }} />
          {/* transparent blocker over the hole so nothing is accidentally clickable */}
          <div style={{ position:'fixed', top:hl.t,  left:hl.l,        width:hl.w,          height:hl.h,           zIndex:1002, pointerEvents:'all' }} />
        </>
      ) : (
        <div style={{ position:'fixed', inset:0, background:OV, zIndex:1001, pointerEvents:'all' }} />
      )}

      {/* ── Pulsing highlight ring around the target ── */}
      {hl && (
        <div style={{
          position:'fixed', top:hl.t, left:hl.l, width:hl.w, height:hl.h,
          borderRadius:11, border:'2.5px solid #4E7D5B',
          zIndex:1002, pointerEvents:'none',
          animation:'_tp 1.9s ease-in-out infinite',
          transition:'top .25s ease,left .25s ease,width .25s ease,height .25s ease',
        }} />
      )}

      {/* ── Tooltip card — key={step} remounts on every step to replay the entry animation ── */}
      <div
        key={step}
        style={{
          ...cardStyle,
          background:'#fff',
          borderRadius:'1.2rem',
          boxShadow:'0 12px 56px rgba(0,0,0,0.32)',
          padding:'1.4rem 1.5rem 1.3rem',
          animation:'_tc .2s ease',
        }}
      >
        {/* Progress bar */}
        <div style={{ display:'flex', gap:3, marginBottom:'1rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height:3, flex:1, borderRadius:2, background: i <= step ? B.f800 : B.m300, transition:'background .3s' }} />
          ))}
        </div>

        {/* Close / skip */}
        <button
          onClick={onClose}
          title="Skip tour (Esc)"
          style={{ position:'absolute', top:'0.85rem', right:'0.85rem', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:4 }}
        >
          <X size={15} />
        </button>

        {/* Icon + title */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.55rem', marginBottom:'0.5rem' }}>
          {current.Icon && (
            <div style={{ width:34, height:34, background:B.m200, borderRadius:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <current.Icon size={17} color={B.f800} />
            </div>
          )}
          <h3 style={{ fontWeight:900, fontSize:'0.93rem', color:B.f900, margin:0, lineHeight:1.3 }}>{current.title}</h3>
        </div>

        {/* Body */}
        <p style={{ fontSize:'0.79rem', color:'#374151', lineHeight:1.78, margin:'0 0 0.65rem' }}>
          {current.body}
        </p>

        {/* Tip */}
        {current.tip && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'0.4rem', background:B.m200, border:`1px solid ${B.m300}`, borderRadius:'0.6rem', padding:'0.45rem 0.6rem', marginBottom:'0.65rem' }}>
            <Lightbulb size={13} color={B.f800} style={{ flexShrink:0, marginTop:1 }} />
            <span style={{ fontSize:'0.71rem', color:B.f800, fontWeight:600, lineHeight:1.6 }}>{current.tip}</span>
          </div>
        )}

        {/* Navigation row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button
            onClick={goBack}
            disabled={step === 0}
            style={{
              display:'flex', alignItems:'center', gap:'0.25rem',
              padding:'0.46rem 0.7rem', border:`1.5px solid ${step === 0 ? '#f0f0f0' : B.m300}`,
              borderRadius:'0.6rem', background:'#fff',
              color: step === 0 ? '#d1d5db' : B.f600,
              fontWeight:700, fontSize:'0.75rem',
              cursor: step === 0 ? 'default' : 'pointer',
            }}
          >
            <ChevronLeft size={13} /> Back
          </button>

          <span style={{ fontSize:'0.67rem', color:'#9ca3af', fontWeight:600 }}>
            {step + 1} / {STEPS.length}
          </span>

          <button
            onClick={goNext}
            style={{
              display:'flex', alignItems:'center', gap:'0.3rem',
              padding:'0.46rem 0.9rem', border:'none',
              borderRadius:'0.6rem', background:B.f800,
              color:'#EEF2DC', fontWeight:800, fontSize:'0.75rem', cursor:'pointer',
            }}
          >
            {current.isFinal
              ? (current.actionLabel || "Let's go!")
              : (current.actionLabel || 'Next')}
            {!current.isFinal && <ChevronRight size={13} />}
          </button>
        </div>

        {/* Keyboard hint */}
        <p style={{ textAlign:'center', fontSize:'0.62rem', color:'#c4c4c4', margin:'0.65rem 0 0' }}>
          Use arrow keys to navigate · Esc to close
        </p>
      </div>
    </>
  )
}
