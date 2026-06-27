import React, { useState, useEffect, useCallback } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import { lessonsApi } from '../services/api'
import Confetti from '../components/Confetti'
import { Lock, Check, Star, BookOpen, Lightbulb } from 'lucide-react'

const OFFSETS = [0, 72, 0, -72]

function useStyles() {
  useEffect(() => {
    if (document.getElementById('lessons-styles')) return
    const s = document.createElement('style')
    s.id = 'lessons-styles'
    s.textContent = `
      @keyframes nodePulse { 0%,100%{ box-shadow:0 0 0 0 rgba(34,197,94,0.5);} 50%{ box-shadow:0 0 0 14px rgba(34,197,94,0);} }
      @keyframes lspin { to { transform: rotate(360deg); } }
      @keyframes popIn { from { opacity:0; transform: scale(.92);} to { opacity:1; transform:none;} }
    `
    document.head.appendChild(s)
  }, [])
}

export default function Lessons() {
  useStyles()
  const isMobile = useIsMobile()
  const { lessonsCompleted, applyProgress } = useApp()
  const { lang, t } = useLang()

  const [lessons, setLessons] = useState(null)
  const [active, setActive] = useState(null)
  const tx = (en, ne) => (lang === 'ne' && ne ? ne : en)

  const load = useCallback(() => {
    lessonsApi.list().then(setLessons).catch(() => setLessons([]))
  }, [])
  useEffect(() => { load() }, [load])

  const currentId = lessons?.find((l) => !l.completed && !l.locked)?.id
  const doneCount = lessons?.filter((l) => l.completed).length ?? lessonsCompleted
  const totalXp = lessons?.reduce((s, l) => s + (l.completed ? (l.xpReward || 0) : 0), 0) ?? 0
  const pct = lessons?.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0

  function onLessonDone(profile) {
    if (profile) applyProgress(profile)
    load()
  }

  return (
    <StudentLayout>
      <div style={{ padding: isMobile ? '1.1rem 1rem 2rem' : '1.75rem 2rem 2.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <BookOpen size={26} color="#002114" strokeWidth={2.5} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002114', margin: 0 }}>
            {t('Lessons', 'पाठहरू')}
          </h1>
        </div>
        <p style={{ color: '#264e3c', fontSize: '0.85rem', margin: '0 0 1.75rem', fontWeight: 600 }}>
          {t('Learn carbon skills and earn pet XP.', 'कार्बन सीप सिक्नुहोस् र पाल्तु XP कमाउनुहोस्।')}
        </p>

        {!lessons ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e4edd6', borderTopColor: '#2D4A32', borderRadius: '50%', animation: 'lspin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '2rem', alignItems: 'start' }}>

            {/* ── Sidebar (desktop only) ── */}
            {!isMobile && (
              <div style={{ position: 'sticky', top: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Progress card */}
                <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #d8e8c0', padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>Progress</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '2.5rem', color: '#002114', lineHeight: 1 }}>{doneCount}</span>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: '#9ca3af' }}>/ {lessons.length}</span>
                  </div>
                  <div style={{ height: 8, background: '#f0f4e8', borderRadius: 4, overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', borderRadius: 4, transition: 'width 0.6s' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#264e3c', margin: 0 }}>{pct}% complete</p>
                </div>

                {/* XP earned */}
                <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #d8e8c0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: '#fef9c3', border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={20} color="#d97706" fill="#d97706" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.2rem' }}>XP Earned</p>
                    <p style={{ fontWeight: 900, fontSize: '1.4rem', color: '#002114', margin: 0 }}>{totalXp.toLocaleString()}</p>
                  </div>
                </div>

                {/* Current lesson CTA */}
                {currentId && (() => {
                  const cur = lessons.find(l => l.id === currentId)
                  return cur ? (
                    <button onClick={() => setActive(cur)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '1rem', padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 }}>
                      <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Up Next</span>
                      {tx(cur.titleEn, cur.titleNe)}
                      <span style={{ display: 'block', fontSize: '0.72rem', opacity: 0.8, marginTop: '0.25rem' }}>+{cur.xpReward} XP →</span>
                    </button>
                  ) : null
                })()}

                {doneCount === lessons.length && lessons.length > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                    <Check size={24} color="#16a34a" style={{ marginBottom: '0.35rem' }} />
                    <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#166534', margin: 0 }}>All lessons complete!</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Roadmap ── */}
            <div>
              {/* Mobile progress */}
              {isMobile && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#264e3c' }}>{doneCount} / {lessons.length} complete</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#002114' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: '#f0f4e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', borderRadius: 4 }} />
                  </div>
                </div>
              )}

              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
                {lessons.map((l, i) => {
                  const isCurrent = l.id === currentId
                  const tint = l.locked ? '#cbd5e1' : l.color || '#16a34a'
                  const offset = isMobile ? OFFSETS[i % OFFSETS.length] : OFFSETS[i % OFFSETS.length] * 1.4
                  return (
                    <div key={l.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${offset}px)`, transition: 'transform 0.2s' }}>
                      <button
                        onClick={() => !l.locked && setActive(l)}
                        disabled={l.locked}
                        title={l.locked ? t('Finish the previous lesson first', 'पहिले अघिल्लो पाठ पूरा गर्नुहोस्') : ''}
                        style={{
                          width: isMobile ? 72 : 84, height: isMobile ? 72 : 84,
                          borderRadius: '50%', border: `4px solid ${l.completed ? '#16a34a' : tint}`,
                          background: l.completed ? '#16a34a' : l.locked ? '#f1f5f9' : '#fff',
                          cursor: l.locked ? 'not-allowed' : 'pointer', fontSize: '2rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                          animation: isCurrent ? 'nodePulse 1.8s ease-in-out infinite' : 'none',
                          boxShadow: l.locked ? 'none' : '0 4px 18px rgba(0,0,0,0.1)',
                        }}
                      >
                        {l.completed ? <Check size={isMobile ? 30 : 36} color="#fff" /> : l.locked ? <Lock size={isMobile ? 22 : 26} color="#94a3b8" /> : l.icon}
                        {isCurrent && (
                          <span style={{ position: 'absolute', top: -16, background: '#16a34a', color: '#fff', fontSize: '0.55rem', fontWeight: 900, padding: '0.15rem 0.6rem', borderRadius: '1rem', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                            {t('START', 'सुरु')}
                          </span>
                        )}
                      </button>
                      <p style={{ fontWeight: 800, fontSize: '0.85rem', color: l.locked ? '#9ca3af' : '#1E2F1E', margin: '0.6rem 0 0', textAlign: 'center', maxWidth: 180 }}>{tx(l.titleEn, l.titleNe)}</p>
                      <p style={{ fontSize: '0.65rem', color: l.locked ? '#cbd5e1' : '#85b098', margin: '0.15rem 0 0', fontWeight: 700 }}>+{l.xpReward} XP</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {active && (
        <LessonPlayer
          lesson={active}
          tx={tx}
          t={t}
          onClose={() => setActive(null)}
          onDone={onLessonDone}
        />
      )}
    </StudentLayout>
  )
}

function LessonPlayer({ lesson, tx, t, onClose, onDone }) {
  const questions = Array.isArray(lesson.questions) ? lesson.questions : []
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState(null)
  const [finished, setFinished] = useState(false)
  const [reward, setReward] = useState(0)

  const q = questions[qi]
  const isLast = qi >= questions.length - 1

  function pick(idx) { if (picked === null) setPicked(idx) }

  function next() {
    if (isLast) {
      lessonsApi.complete(lesson.id)
        .then((res) => { setReward(res?.xpReward ?? lesson.xpReward); setFinished(true); onDone(res?.profile) })
        .catch(() => { setReward(lesson.xpReward); setFinished(true) })
    } else {
      setQi((i) => i + 1); setPicked(null)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,20,12,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: 480, padding: '1.75rem', position: 'relative', animation: 'popIn 0.25s ease both' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>

        {finished ? (
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <Confetti count={70} />
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{lesson.icon}</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#15803d', margin: '0.3rem 0' }}>{t('Lesson complete!', 'पाठ पूरा भयो!')}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#166534', borderRadius: '2rem', padding: '0.5rem 1.2rem', fontWeight: 800, margin: '0.4rem 0 1rem' }}>
              <Star size={16} color="#16a34a" fill="#16a34a" /> +{reward} XP
            </div>
            <button onClick={onClose} style={ctaStyle}>{t('Awesome!', 'बढिया!')}</button>
          </div>
        ) : (
          <>
            <div style={{ height: 6, background: '#e4edd6', borderRadius: 3, overflow: 'hidden', marginBottom: '1.1rem' }}>
              <div style={{ width: `${(qi / questions.length) * 100}%`, height: '100%', background: '#16a34a', transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: '0.66rem', fontWeight: 800, color: '#85b098', letterSpacing: '0.06em', margin: 0 }}>
              {tx(lesson.titleEn, lesson.titleNe).toUpperCase()} · {qi + 1}/{questions.length}
            </p>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E2F1E', margin: '0.4rem 0 1rem', lineHeight: 1.35 }}>{tx(q.qEn, q.qNe)}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {(q.options || []).map((opt, idx) => {
                const revealed = picked !== null
                const isCorrect = !!opt.correct
                const isPicked = picked === idx
                let bg = '#fff', border = '#dce9ff', color = '#002114'
                if (revealed && isCorrect) { bg = '#dcfce7'; border = '#16a34a'; color = '#166534' }
                else if (revealed && isPicked && !isCorrect) { bg = '#fef2f2'; border = '#ef4444'; color = '#b91c1c' }
                return (
                  <button key={idx} onClick={() => pick(idx)} disabled={revealed}
                    style={{ textAlign: 'left', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: `2px solid ${border}`, background: bg, color, fontWeight: 700, fontSize: '0.9rem', cursor: revealed ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span>{tx(opt.en, opt.ne)}</span>
                    {revealed && isCorrect && <Check size={18} color="#16a34a" />}
                  </button>
                )
              })}
            </div>

            {picked !== null && (
              <div style={{ marginTop: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#166534', lineHeight: 1.45, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Lightbulb size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{tx(q.explainEn, q.explainNe)}</span>
              </div>
            )}

            <button onClick={next} disabled={picked === null}
              style={{ ...ctaStyle, width: '100%', marginTop: '1.1rem', opacity: picked === null ? 0.5 : 1, cursor: picked === null ? 'not-allowed' : 'pointer' }}>
              {isLast ? t('Finish', 'सक्नुहोस्') : t('Continue', 'अगाडि')} →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const ctaStyle = {
  background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.75rem',
  padding: '0.8rem 2rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
  transition: 'transform 0.15s',
}
