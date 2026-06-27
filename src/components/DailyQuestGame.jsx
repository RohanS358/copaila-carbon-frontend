import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useTalkingPet } from '../hooks/useTalkingPet'
import { getQuestIntro, getEncouragement, getCelebration } from '../services/petService'
import { generateRecommendations } from '../services/recommendationEngine'
import { recommendationsApi } from '../services/api'
import { questSections } from '../data/quests'
import PetStage from './Pet/PetStage'

// ── DailyQuestGame ────────────────────────────────────────────────────────────
// A Kahoot-style quiz where the animated character physically *speaks* every
// question. It is also the daily data-collection step. When the quiz ends:
//   1. answers → recommendation engine (the "calculator")
//   2. the character speaks each recommendation for tomorrow, one by one
//   3. a final happy dance + confetti
//   4. ONLY THEN is the day's XP banked and the pet grows.
//
// Phases: intro → playing → calculating → reco → celebrate → done

const TILES = [
  { bg: '#E24A4A', shape: '▲' },
  { bg: '#4477D9', shape: '◆' },
  { bg: '#DCA83D', shape: '●' },
  { bg: '#4B9A45', shape: '■' },
  { bg: '#8C4BDD', shape: '★' },
  { bg: '#3C9EB8', shape: '♦' },
]

function useGameStyles() {
  useEffect(() => {
    if (document.getElementById('quest-game-styles')) return
    const s = document.createElement('style')
    s.id = 'quest-game-styles'
    s.textContent = `
      @keyframes tileIn  { from { opacity:0; transform: translateY(12px) scale(.96); } to { opacity:1; transform:none; } }
      @keyframes qIn     { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
      @keyframes recoIn  { from { opacity:0; transform: translateX(-14px); } to { opacity:1; transform:none; } }
      @keyframes xpFloat { 0%{opacity:0; transform:translateY(0) scale(.7);} 35%{opacity:1; transform:translateY(-16px) scale(1.15);} 100%{opacity:0; transform:translateY(-34px) scale(1);} }
      @keyframes calcPulse { 0%,100%{ transform:scale(1); opacity:.6;} 50%{ transform:scale(1.25); opacity:1;} }
      @keyframes floatGlow { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-6px); } }
    `
    document.head.appendChild(s)
  }, [])
}

export default function DailyQuestGame({ onExit }) {
  useGameStyles()
  const isMobile = useIsMobile()
  const { lang, t } = useLang()
  const { setQuestAnswer, completeQuests } = useApp()
  const pet = useTalkingPet()

  const questions = useMemo(
    () => questSections.flatMap((sec) => sec.questions.map((q) => ({ ...q, section: sec }))),
    []
  )
  const total = questions.length

  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [earned, setEarned] = useState(0)
  const [recos, setRecos] = useState([])
  const [recoShown, setRecoShown] = useState(0)
  const [co2Saved, setCo2Saved] = useState(0)

  const earnedRef = useRef(0)
  const answersRef = useRef({})
  const advanceTimer = useRef(null)
  const banked = useRef(false)

  const langText = (en, ne) => (lang === 'ne' && ne ? ne : en)
  const current = questions[index]

  // Speak the intro once when the game opens.
  useEffect(() => {
    pet.speak(getQuestIntro(lang))
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Speak each question as it appears.
  useEffect(() => {
    if (phase !== 'playing' || !current) return
    setPicked(null)
    pet.speak(langText(current.text, current.textNe))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index])

  // CALCULATING: ask the DB recommendation engine (fallback to the local one),
  // then move on to speak them. Phase advances only once recs are ready.
  useEffect(() => {
    if (phase !== 'calculating') return
    let cancelled = false
    pet.speak(t('Let me check your eco footprint…', 'तपाईंको इको फुटप्रिन्ट हेरौं…'))
    ;(async () => {
      const started = Date.now()
      let result
      try {
        result = await recommendationsApi.forQuest(answersRef.current)
      } catch {
        result = generateRecommendations(answersRef.current, lang)
      }
      if (cancelled) return
      const recs = (result.recommendations || []).map((r) => ({ ...r, text: r.text ?? (lang === 'ne' ? r.ne : r.en) }))
      setRecos(recs)
      setCo2Saved(result.potentialCo2Saved || 0)
      const wait = Math.max(0, 1800 - (Date.now() - started)) // min calc animation
      setTimeout(() => { if (!cancelled) setPhase('reco') }, wait)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // RECO: the character speaks each recommendation for tomorrow, one by one.
  useEffect(() => {
    if (phase !== 'reco' || recos.length === 0) return
    let cancelled = false
    ;(async () => {
      await pet.speak(t("Here's how to do even better tomorrow!", 'भोलि अझ राम्रो गर्ने उपायहरू!'))
      for (let i = 0; i < recos.length; i++) {
        if (cancelled) return
        setRecoShown(i + 1)
        await pet.speak(recos[i].text)
        if (cancelled) return
        await new Promise((r) => setTimeout(r, 180))
      }
      if (!cancelled) setPhase('celebrate')
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recos])

  // CELEBRATE: happy dance + confetti, THEN bank the XP and finish.
  useEffect(() => {
    if (phase !== 'celebrate') return
    let stale = false
    ;(async () => {
      await pet.celebrate({ text: getCelebration(lang), duration: 5000 })
      if (stale) return
      if (!banked.current) {
        banked.current = true
        completeQuests(earnedRef.current, co2Saved)
      }
      setPhase('done')
    })()
    return () => { stale = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function startQuiz() { setPhase('playing'); setIndex(0) }

  function choose(opt) {
    if (picked) return
    setPicked(opt.value)
    answersRef.current[current.id] = opt.value
    setQuestAnswer(current.id, opt.value)   // ← data collection, unchanged
    earnedRef.current += opt.xp ?? 0
    setEarned(earnedRef.current)
    pet.speak(getEncouragement(lang))

    const isLast = index + 1 >= total
    advanceTimer.current = setTimeout(() => {
      if (isLast) setPhase('calculating')
      else setIndex((i) => i + 1)
    }, 850)
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <QuestRoot isMobile={isMobile}>
        <TopBar onExit={onExit} label={t('Daily Quest', 'दैनिक क्विज')} t={t} />
        <Center isMobile={isMobile}>
          <PetStage state={pet.state} subtitle={pet.subtitle} height={isMobile ? '42vh' : '52vh'} style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />
          <h1 style={{ ...h1Style, fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#13261A', letterSpacing: '-0.03em' }}>{t("Today's Eco Quest", 'आजको इको क्विज')}</h1>
          <p style={subStyle}>
            {t('Answer ' + total + " questions — I'll read each one out loud!", total + ' प्रश्नको जवाफ दिनुहोस् — म हरेक प्रश्न आवाजमा पढ्छु!')}
          </p>
          <button onClick={startQuiz} style={ctaStyle}>{t("Let's go!", 'सुरु गरौं!')} →</button>
        </Center>
      </QuestRoot>
    )
  }

  // ── CALCULATING ──
  if (phase === 'calculating') {
    return (
      <QuestRoot isMobile={isMobile}>
        <Center isMobile={isMobile}>
          <PetStage state={pet.state} subtitle={pet.subtitle} height={isMobile ? '42vh' : '52vh'} style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />
          <h1 style={{ ...h1Style, fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#13261A', letterSpacing: '-0.03em' }}>{t('Crunching your footprint…', 'फुटप्रिन्ट गणना हुँदैछ…')}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: '#4B9A45', animation: `calcPulse 1s ${i * 0.18}s infinite ease-in-out` }} />
            ))}
          </div>
        </Center>
      </QuestRoot>
    )
  }

  // ── RECO (speaking recommendations one by one) ──
  if (phase === 'reco' || phase === 'celebrate') {
    const celebrating = phase === 'celebrate'
    return (
      <QuestRoot isMobile={isMobile}>
        <Center isMobile={isMobile}>
          <PetStage state={pet.state} subtitle={pet.subtitle} height={isMobile ? '40vh' : '50vh'} style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />
          <h1 style={{ ...h1Style, color: '#13261A', fontSize: 'clamp(1.9rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
            {celebrating ? t('Amazing work!', 'गजब काम!') : t('Your plan for tomorrow', 'भोलिको योजना')}
          </h1>
          <div style={{ width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recos.slice(0, celebrating ? recos.length : recoShown).map((r, i) => (
              <div key={r.id + i} style={{ ...recoCardStyle, background: '#fff', border: '1px solid #D9E7D1', color: '#13261A' }}>
                <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>{langText(r.en, r.ne)}</span>
              </div>
            ))}
          </div>
        </Center>
      </QuestRoot>
    )
  }

  // ── DONE ──
  if (phase === 'done') {
    return (
      <QuestRoot isMobile={isMobile}>
        <Center isMobile={isMobile}>
          <PetStage state={pet.state} subtitle={pet.subtitle} height={isMobile ? '40vh' : '48vh'} style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />
          <h1 style={{ ...h1Style, fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#13261A', letterSpacing: '-0.03em' }}>{t('Quest Complete!', 'क्विज पूरा भयो!')}</h1>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Badge value={`+${earned}`} label={t('XP EARNED', 'XP कमाइयो')} />
            <Badge value={`~${co2Saved}kg`} label={t('CO₂ YOU CAN SAVE', 'बचाउन सकिने CO₂')} />
          </div>
          <button onClick={onExit} style={ctaStyle}>{t('Back to Home', 'गृहपृष्ठमा फर्कनुहोस्')}</button>
        </Center>
      </QuestRoot>
    )
  }

  // ── PLAYING ──
  const sec = current.section
  return (
    <QuestRoot isMobile={isMobile}>
      <TopBar onExit={onExit} label={`${t('Question', 'प्रश्न')} ${index + 1} / ${total}`} t={t} />
      <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto 1rem', height: 7, background: 'rgba(19,38,26,0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${(index / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4B9A45, #77B15A)', borderRadius: 999, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.9fr 1.1fr', gap: isMobile ? '1rem' : '1.5rem', alignItems: 'start' }}>
        <PetStage state={pet.state} subtitle={pet.subtitle} height={isMobile ? '36vh' : '48vh'} style={{ borderRadius: '1.5rem', overflow: 'hidden' }} />

        <div key={index} style={{ animation: 'qIn 0.35s ease both', background: 'rgba(255,255,255,0.78)', border: '1px solid #D9E7D1', borderRadius: '1.5rem', padding: '1.15rem', backdropFilter: 'blur(10px)' }}>
          <span style={{ display: 'inline-block', fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.08em', background: sec.accent, color: '#fff', borderRadius: '999px', padding: '0.22rem 0.75rem', marginBottom: '0.75rem' }}>
            {sec.icon} {langText(sec.title, sec.titleNe).toUpperCase()}
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.35rem)', fontWeight: 900, lineHeight: 1.3, margin: '0 0 1.15rem', color: '#13261A', letterSpacing: '-0.03em' }}>
            {langText(current.text, current.textNe)}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
            {current.options.map((opt, i) => {
              const tile = TILES[i % TILES.length]
              const isPicked = picked === opt.value
              const dim = picked && !isPicked
              return (
                <button
                  key={opt.value}
                  onClick={() => choose(opt)}
                  disabled={!!picked}
                  style={{
                    position: 'relative', border: isPicked ? '3px solid #fff' : '3px solid transparent',
                    borderRadius: '1rem', padding: '0.95rem 0.9rem', background: tile.bg, color: '#fff',
                    cursor: picked ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    minHeight: 64, opacity: dim ? 0.45 : 1, transform: isPicked ? 'scale(1.03)' : 'scale(1)',
                    transition: 'transform 0.15s, opacity 0.2s',
                    animation: `tileIn 0.3s ${i * 0.05}s ease both`,
                    boxShadow: isPicked ? '0 14px 28px rgba(19,38,26,0.18)' : '0 8px 18px rgba(19,38,26,0.08)',
                  }}
                  onMouseEnter={e => { if (!picked) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = isPicked ? 'scale(1.03)' : '' }}
                >
                  <span style={{ fontSize: '1.05rem', opacity: 0.9 }}>{tile.shape}</span>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{opt.emoji}</span>
                  <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.25 }}>{langText(opt.label, opt.labelNe)}</span>
                  {isPicked && (
                    <span style={{ position: 'absolute', top: -10, right: 8, fontSize: '0.8rem', fontWeight: 900, color: '#6ee7a0', animation: 'xpFloat 0.85s ease-out forwards' }}>+{opt.xp} XP</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </QuestRoot>
  )
}

// ── bits (module scope → stable identity, no remounting the pet video) ──
function QuestRoot({ isMobile, children }) {
  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f5f7f0 0%, #edf3e6 100%)', color: '#13261A', padding: isMobile ? '0.75rem' : '1.25rem 1.5rem 2rem' }}>
      {children}
    </div>
  )
}

function Center({ isMobile, children }) {
  return (
    <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem', paddingTop: isMobile ? '0.25rem' : '0.5rem' }}>
      {children}
    </div>
  )
}

function TopBar({ onExit, label, t }) {
  return (
    <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.08em', color: '#4B9A45', textTransform: 'uppercase' }}>{label}</span>
      <button onClick={onExit} style={{ background: '#fff', border: '1px solid #d9e7d1', color: '#13261A', borderRadius: '999px', padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(19,38,26,0.08)' }}>
        {t('Exit', 'बाहिर')} ✕
      </button>
    </div>
  )
}

function Badge({ value, label }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #d9e7d1', borderRadius: '1rem', padding: '0.9rem 1.4rem', textAlign: 'center', minWidth: 120, boxShadow: '0 10px 26px rgba(19,38,26,0.08)' }}>
      <p style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900, color: '#4B9A45' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.6rem', letterSpacing: '0.08em', color: '#6B7D6A', fontWeight: 800 }}>{label}</p>
    </div>
  )
}

const h1Style = { fontSize: 'clamp(1.4rem, 4.5vw, 2rem)', fontWeight: 900, textAlign: 'center', margin: 0 }
const subStyle = { color: '#546558', textAlign: 'center', margin: 0, fontSize: '0.98rem', lineHeight: 1.5 }
const recoCardStyle = {
  display: 'flex', alignItems: 'center', gap: '0.8rem',
  background: '#fff', border: '1px solid #d9e7d1',
  borderRadius: '1rem', padding: '0.85rem 1rem', animation: 'recoIn 0.35s ease both',
  color: '#13261A', boxShadow: '0 10px 26px rgba(19,38,26,0.08)',
}
const ctaStyle = {
  background: 'linear-gradient(135deg, #4B9A45, #2F6F36)', color: '#fff', border: 'none', borderRadius: '999px',
  padding: '0.95rem 2.4rem', fontWeight: 900, fontSize: '1.02rem', cursor: 'pointer', transition: 'transform 0.15s',
  boxShadow: '0 14px 30px rgba(47,111,54,0.22)',
}
