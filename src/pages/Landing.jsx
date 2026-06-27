import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  BarChart3, Scan, FileText, CalendarCheck, BookOpen,
  Trophy, CalendarDays, Zap, ArrowRight, CheckCircle2,
} from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MainLayout from '../layouts/MainLayout'
import { useLang } from '../context/LanguageContext'
import logoImg from '../assets/logo.png'

// ── Leaf images ──────────────────────────────────────────────
import leaf1  from '../assets/leaf/leaf1.png'
import leaf2  from '../assets/leaf/leaf2.png'
import leaf3  from '../assets/leaf/leaf3.png'
import leaf4  from '../assets/leaf/leaf4.png'
import leaf5  from '../assets/leaf/leaf5.png'
import leaf6  from '../assets/leaf/leaf6.png'
import leaf7  from '../assets/leaf/leaf7.png'
import leaf8  from '../assets/leaf/leaf8.png'
import leaf9  from '../assets/leaf/leaf9.png'
import leaf10 from '../assets/leaf/leaf10.png'
import leaf11 from '../assets/leaf/leaf11.png'
import leaf12 from '../assets/leaf/leaf12.png'

// ── Product screenshots ──────────────────────────────────────
import imgDash    from '../assets/images/school/dashboard.png'
import imgOCR     from '../assets/images/school/OCR.png'
import imgReport  from '../assets/images/school/report.png'
import imgSQuest  from '../assets/images/student portal/quest.png'
import imgSLeader from '../assets/images/student portal/leaderboard.png'
import imgSLesson from '../assets/images/student portal/lessons.png'
import imgSEvents from '../assets/images/student portal/evetns.png'
import imgSDash   from '../assets/images/student portal/dashbaord.png'

gsap.registerPlugin(ScrollTrigger)

// ── Brand tokens ─────────────────────────────────────────────
const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f700: '#3a5c3f', f600: '#4E7D5B',
  f500: '#5a8f66', f400: '#7BAE7F', f300: '#9ec8a2', f200: '#c5dfbc',
  m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}
// Parrot-green palette (the new main color)
const P   = '#6DCF7A'
const PD  = '#3d8f49'
const PL  = '#edfef0'
const PM  = '#b8eec0'

// ── Helpers ──────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  }]
}

function useCountUp(target, duration = 1800, suffix = '') {
  const [display, setDisplay] = useState('0' + suffix)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])
  useEffect(() => {
    if (!started) return
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration, suffix])
  return { display, ref }
}


// ── Screenshot browser mock ───────────────────────────────────
function ScreenMock({ src, alt = '' }) {
  return (
    <div className="sm" style={{
      background: '#0d1f0d', borderRadius: 14, padding: '6px 6px 0',
      boxShadow: '0 28px 80px rgba(0,0,0,0.42), 0 0 0 1.5px rgba(109,207,122,0.22)',
    }}>
      <div style={{ background: '#1a2e1a', borderRadius: '8px 8px 0 0', height: 28, display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
        <div style={{ flex: 1, background: '#253d25', borderRadius: 4, height: 14, marginLeft: 10 }} />
      </div>
      <img src={src} alt={alt} style={{ width: '100%', display: 'block', borderRadius: '0 0 6px 6px' }} />
    </div>
  )
}

// ── Decorative leaf helper ────────────────────────────────────
function Leaf({ src, style, speed = -100 }) {
  return (
    <img
      src={src} alt="" aria-hidden="true"
      className="lf"
      data-speed={speed}
      style={{ position: 'absolute', pointerEvents: 'none', userSelect: 'none', ...style }}
    />
  )
}

// ── School admin feature data ─────────────────────────────────
const schoolFeatures = [
  {
    Icon: BarChart3,
    badge: 'Carbon Dashboard',
    title: "Your school's carbon footprint — visualized.",
    body: "See emissions across all three scopes in one clean dashboard. Electricity, fuel, commuting, food, waste — everything together. Track trends over time and present real progress to your board.",
    bullets: ['Scope 1, 2 & 3 fully covered', 'Bilingual: Nepali + English', 'Refreshes after every audit submission', 'Override with your own emission factors'],
    img: imgDash,
    flip: false,
  },
  {
    Icon: Scan,
    badge: 'OCR Survey Scanning',
    title: "Zero-internet data collection that actually works.",
    body: "Print a one-page survey, hand it to students, let them fill it on paper. Scan once with a single device later. The system reads responses automatically — no student needs internet, no one does manual data entry.",
    bullets: ['One-click printable survey forms', 'Automatic handwriting parsing via OCR', 'Entire school processed with one device', 'Works in the most remote Nepali schools'],
    img: imgOCR,
    flip: true,
  },
  {
    Icon: FileText,
    badge: 'Reports & Recommendations',
    title: "Actionable reports, not just raw numbers.",
    body: "Get a full audit PDF with AI-powered recommendations tailored to your school. Know which habits to target first, how much CO₂ you can realistically cut, and how to present it to parents.",
    bullets: ['Download-ready PDF reports', 'AI recommendations per school profile', 'SDG 4, 7 & 13 alignment tracking', 'Year-over-year comparison built in'],
    img: imgReport,
    flip: false,
  },
]

// ── Features Section (replaces old AboutSection) ──────────────
function FeaturesSection() {
  const ref = useRef()
  const { t } = useLang()

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Leaf parallax — each .lf reads data-speed
      gsap.utils.toArray('.lf').forEach(el => {
        gsap.to(el, {
          y: parseFloat(el.dataset.speed || -100),
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 2 },
        })
      })

      // Feature rows slide up
      gsap.utils.toArray('.fr').forEach(el => {
        gsap.from(el, {
          y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      // Screenshot mocks scale + fade
      gsap.utils.toArray('.sm').forEach(el => {
        gsap.from(el, {
          scale: 0.93, opacity: 0, y: 30, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })

      // Bento cards stagger in
      const cards = gsap.utils.toArray('.bc')
      if (cards.length) {
        gsap.from(cards, {
          y: 55, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: '.bento-parent', start: 'top 82%' },
        })
      }

      // Divider band text reveal
      gsap.from('.band-text', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.band-text', start: 'top 85%' },
      })

    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="about">

      {/* ──────────────────────────────────────────────────────── */}
      {/* INTRO BLOCK                                            */}
      {/* ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: PL, padding: '8rem 1.5rem 7rem' }}>
        {/* Leaves — big sweeping ones */}
        <Leaf src={leaf5}  style={{ top: '-10%', right: '-14%',  width: '58%', opacity: 0.28, transform: 'rotate(12deg)' }}       speed={-90} />
        <Leaf src={leaf3}  style={{ bottom: '-14%', left: '-12%', width: '52%', opacity: 0.22, transform: 'rotate(-160deg) scaleX(-1)' }} speed={-110} />
        <Leaf src={leaf7}  style={{ top: '8%',  left: '2%',     width: '18%', opacity: 0.18, transform: 'rotate(35deg)' }}         speed={-55}  />
        <Leaf src={leaf9}  style={{ bottom: '6%', right: '6%',   width: '16%', opacity: 0.22, transform: 'rotate(-28deg)' }}        speed={-45}  />
        <Leaf src={leaf12} style={{ top: '50%', left: '18%',    width: '9%',  opacity: 0.14, transform: 'rotate(80deg)' }}          speed={-35}  />

        <div style={{ maxWidth: '54rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <span style={{ display: 'inline-block', background: `${P}28`, color: PD, fontSize: '0.68rem', fontWeight: 900, padding: '0.42rem 1.15rem', borderRadius: '999px', marginBottom: '1.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', border: `1.5px solid ${P}55` }}>
            {t('The Complete Green School Platform')}
          </span>
          <h2 style={{ fontSize: 'clamp(2.6rem, 6.5vw, 4.2rem)', fontWeight: 900, color: B.f900, lineHeight: 1.06, margin: '0 0 1.4rem', letterSpacing: '-0.025em' }}>
            {t('One platform.')}<br />
            <span style={{ color: P }}>{t('Two portals.')}</span><br />
            <span style={{ fontSize: '75%', fontWeight: 700, color: B.f700 }}>{t('Total carbon clarity.')}</span>
          </h2>
          <p style={{ color: B.f600, fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', lineHeight: 1.8, maxWidth: '36rem', margin: '0 auto 2.75rem' }}>
            {t('LeafNode gives school administrators a complete carbon audit tool — and gives every student their own green portal to learn, compete, and act.')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#school-features" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.75rem', background: B.f900, color: '#EEF2DC', borderRadius: '999px', fontSize: '0.88rem', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.03em', boxShadow: '0 4px 20px rgba(30,47,30,0.25)' }}>
              {t('For Administrators')} <ArrowRight size={15} />
            </a>
            <a href="#student-features" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.75rem', background: P, color: '#fff', borderRadius: '999px', fontSize: '0.88rem', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.03em', boxShadow: `0 4px 20px ${P}55` }}>
              {t('For Students')} <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* SCHOOL ADMIN FEATURES                                  */}
      {/* ──────────────────────────────────────────────────────── */}
      <div id="school-features" style={{ background: '#fff', padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background leaves — very low opacity, purely decorative */}
        <Leaf src={leaf1}  style={{ top: '-3%', right: '-8%',   width: '44%', opacity: 0.055, transform: 'rotate(-8deg)' }}        speed={-120} />
        <Leaf src={leaf2}  style={{ bottom: '8%', left: '-5%',  width: '34%', opacity: 0.06,  transform: 'rotate(172deg)' }}        speed={-80}  />
        <Leaf src={leaf6}  style={{ top: '42%', right: '1%',    width: '11%', opacity: 0.13,  transform: 'rotate(-75deg)' }}        speed={-55}  />
        <Leaf src={leaf10} style={{ top: '20%', left: '1%',     width: '8%',  opacity: 0.1,   transform: 'rotate(110deg) scaleX(-1)' }} speed={-40} />

        <div style={{ maxWidth: '70rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '5.5rem' }}>
            <div style={{ height: 2, flex: 1, background: `linear-gradient(to right, ${P}, transparent)`, borderRadius: 2 }} />
            <span style={{ fontSize: '0.67rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: PD, whiteSpace: 'nowrap' }}>{t('For School Administrators')}</span>
            <div style={{ height: 2, flex: 1, background: `linear-gradient(to left, ${P}, transparent)`, borderRadius: 2 }} />
          </div>

          {/* 3 alternating feature rows */}
          {schoolFeatures.map((feat, i) => {
            const Icon = feat.Icon
            const textBlock = (
              <div className="fr" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.1rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: `${P}1c`, border: `1.5px solid ${P}50`, borderRadius: '999px', padding: '0.35rem 0.95rem', width: 'fit-content' }}>
                  <Icon size={14} color={PD} />
                  <span style={{ fontSize: '0.67rem', fontWeight: 900, color: PD, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t(feat.badge)}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1.55rem, 3vw, 2.1rem)', fontWeight: 900, color: B.f900, lineHeight: 1.12, margin: 0 }}>
                  {t(feat.title)}
                </h3>
                <p style={{ color: B.f600, fontSize: '0.9rem', lineHeight: 1.85, margin: 0 }}>{t(feat.body)}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {feat.bullets.map((b, bi) => (
                    <li key={bi} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: B.f700, fontWeight: 600 }}>
                      <CheckCircle2 size={16} color={P} style={{ flexShrink: 0 }} />
                      {t(b)}
                    </li>
                  ))}
                </ul>
              </div>
            )
            const imgBlock = (
              <div className="fr" style={{ position: 'relative' }}>
                {/* Corner leaf decoration on screenshots */}
                <img src={i === 0 ? leaf5 : i === 1 ? leaf8 : leaf4} alt="" aria-hidden="true" style={{ position: 'absolute', top: -22, right: i === 1 ? 'auto' : -22, left: i === 1 ? -22 : 'auto', width: 80, opacity: 0.45, transform: `rotate(${i === 1 ? 170 : -15}deg)`, pointerEvents: 'none', zIndex: 10 }} />
                <ScreenMock src={feat.img} alt={feat.badge} />
              </div>
            )
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(2.5rem, 5vw, 5rem)',
                alignItems: 'center',
                marginBottom: i < schoolFeatures.length - 1 ? '7rem' : 0,
                paddingBottom: i < schoolFeatures.length - 1 ? '7rem' : 0,
                borderBottom: i < schoolFeatures.length - 1 ? `1.5px solid ${PM}` : 'none',
              }}>
                {feat.flip ? <>{imgBlock}{textBlock}</> : <>{textBlock}{imgBlock}</>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* PARROT GREEN DIVIDER BAND                              */}
      {/* ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: P, padding: '5.5rem 1.5rem' }}>
        <Leaf src={leaf4}  style={{ top: '-35%',    left: '-10%',  width: '50%', opacity: 0.25, transform: 'rotate(-12deg) scaleX(-1)' }} speed={-50} />
        <Leaf src={leaf8}  style={{ bottom: '-35%', right: '-10%', width: '50%', opacity: 0.25, transform: 'rotate(172deg)' }}            speed={-50} />
        <Leaf src={leaf10} style={{ top: '5%',      right: '22%',  width: '13%', opacity: 0.2,  transform: 'rotate(-52deg)' }}            speed={-30} />
        <Leaf src={leaf6}  style={{ bottom: '5%',   left: '18%',   width: '10%', opacity: 0.18, transform: 'rotate(120deg)' }}            speed={-25} />

        <div className="band-text" style={{ maxWidth: '50rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: '0.67rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>{t('AND FOR YOUR STUDENTS')}</p>
          <h2 style={{ fontSize: 'clamp(2.1rem, 5.5vw, 3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 1.25rem', letterSpacing: '-0.02em' }}>
            {t('Their own green portal.')}<br />
            <span style={{ fontWeight: 400, fontSize: '72%', opacity: 0.75 }}>{t('Learn. Compete. Act. Every single day.')}</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.97rem', lineHeight: 1.8, maxWidth: '38rem', margin: '0 auto' }}>
            {t('Every student gets a personal eco-dashboard — daily quests, an AI tutor with voice narration, a live leaderboard, achievements, community events, and a virtual pet that grows with their sustainability score.')}
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* STUDENT PORTAL FEATURES — BENTO GRID                  */}
      {/* ──────────────────────────────────────────────────────── */}
      <div id="student-features" style={{ background: PL, padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <Leaf src={leaf11} style={{ top: '-6%',    right: '-9%',  width: '46%', opacity: 0.2,  transform: 'rotate(6deg)' }}                        speed={-100} />
        <Leaf src={leaf12} style={{ bottom: '-6%', left: '-7%',   width: '42%', opacity: 0.18, transform: 'rotate(-172deg) scaleX(-1)' }}           speed={-85}  />
        <Leaf src={leaf2}  style={{ top: '48%',    left: '-4%',   width: '16%', opacity: 0.14, transform: 'rotate(82deg)' }}                        speed={-40}  />
        <Leaf src={leaf7}  style={{ top: '15%',    right: '2%',   width: '9%',  opacity: 0.16, transform: 'rotate(-140deg)' }}                      speed={-35}  />
        <Leaf src={leaf9}  style={{ bottom: '12%', right: '12%',  width: '7%',  opacity: 0.18, transform: 'rotate(50deg)' }}                        speed={-28}  />

        <div style={{ maxWidth: '76rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '4rem' }}>
            <div style={{ height: 2, flex: 1, background: `linear-gradient(to right, ${P}, transparent)`, borderRadius: 2 }} />
            <span style={{ fontSize: '0.67rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: PD, whiteSpace: 'nowrap' }}>{t('For Students')}</span>
            <div style={{ height: 2, flex: 1, background: `linear-gradient(to left, ${P}, transparent)`, borderRadius: 2 }} />
          </div>

          {/* Bento grid — responsive: 1-col mobile → 2-col tablet → 12-col desktop */}
          <div className="bento-parent grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">

            {/* ── Daily Quests — full on mobile/tablet, 7/12 on desktop ── */}
            <div className="bc col-span-1 sm:col-span-2 lg:col-span-7" style={{ background: '#fff', borderRadius: '1.4rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 32px rgba(0,0,0,0.09)', border: `1.5px solid ${PM}`, minHeight: 300, position: 'relative' }}>
              {/* Corner leaf */}
              <img src={leaf5} alt="" aria-hidden="true" style={{ position: 'absolute', top: -18, right: -18, width: 80, opacity: 0.38, transform: 'rotate(-20deg)', pointerEvents: 'none', zIndex: 10 }} />
              <div style={{ padding: '1.6rem 1.6rem 0.9rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: `${P}22`, border: `1.5px solid ${P}55`, borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem' }}>
                  <CalendarCheck size={13} color={PD} />
                  <span style={{ fontSize: '0.63rem', fontWeight: 900, color: PD, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Daily Quests')}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 900, color: B.f900, margin: 0, lineHeight: 1.2 }}>
                  {t('Log eco-actions every day.')}<br /><span style={{ color: P }}>{t('Earn XP. Build real habits.')}</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: B.f600, marginTop: '0.5rem', lineHeight: 1.65 }}>{t("Cycling to school, skipping meat, turning off lights — every action earns XP and chips away at your school's real carbon footprint.")}</p>
              </div>
              <div style={{ flex: 1, padding: '0 1.25rem 1.25rem', minHeight: 0 }}>
                <img src={imgSQuest} alt="Daily Quests" style={{ width: '100%', borderRadius: '0.9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.13)', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* ── Leaderboard — full on mobile/tablet, 5/12 on desktop ── */}
            <div className="bc col-span-1 sm:col-span-2 lg:col-span-5" style={{ background: B.f900, borderRadius: '1.4rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 32px rgba(0,0,0,0.2)', minHeight: 300, position: 'relative' }}>
              <img src={leaf1} alt="" aria-hidden="true" style={{ position: 'absolute', bottom: -20, left: -14, width: 90, opacity: 0.3, transform: 'rotate(160deg)', pointerEvents: 'none', zIndex: 0 }} />
              <div style={{ padding: '1.6rem 1.6rem 0.9rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(251,191,36,0.18)', border: '1.5px solid rgba(251,191,36,0.45)', borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem' }}>
                  <Trophy size={13} color="#fbbf24" />
                  <span style={{ fontSize: '0.63rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Leaderboard')}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  {t('Compete with classmates.')}<br /><span style={{ color: '#fbbf24' }}>{t('Inspire your whole school.')}</span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', lineHeight: 1.65 }}>{t('Monthly resets give everyone a fresh shot at the top. Schools with the highest average XP earn national recognition.')}</p>
              </div>
              <div style={{ flex: 1, padding: '0 1.25rem 1.25rem', minHeight: 0, position: 'relative', zIndex: 1 }}>
                <img src={imgSLeader} alt="Leaderboard" style={{ width: '100%', borderRadius: '0.9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* ── AI Lessons — half on tablet, 4/12 on desktop ── */}
            <div className="bc col-span-1 lg:col-span-4" style={{ background: '#dbeafe', borderRadius: '1.4rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #bfdbfe', minHeight: 260, position: 'relative' }}>
              <img src={leaf3} alt="" aria-hidden="true" style={{ position: 'absolute', top: -14, right: -12, width: 65, opacity: 0.3, transform: 'rotate(-30deg)', pointerEvents: 'none', zIndex: 0 }} />
              <div style={{ padding: '1.4rem 1.4rem 0.8rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(37,99,235,0.12)', border: '1.5px solid rgba(37,99,235,0.3)', borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '0.65rem' }}>
                  <BookOpen size={13} color="#2563eb" />
                  <span style={{ fontSize: '0.63rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('AI Lessons')}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 900, color: '#1e3a5f', margin: 0, lineHeight: 1.25 }}>
                  {t('Your AI tutor.')}<br /><span style={{ color: '#2563eb' }}>{t('With voice narration.')}</span>
                </h3>
              </div>
              <div style={{ flex: 1, padding: '0 1.1rem 1.1rem', position: 'relative', zIndex: 1 }}>
                <img src={imgSLesson} alt="Lessons" style={{ width: '100%', borderRadius: '0.75rem', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* ── Eco Events — half on tablet, 4/12 on desktop ── */}
            <div className="bc col-span-1 lg:col-span-4" style={{ background: '#fff7ed', borderRadius: '1.4rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #fed7aa', minHeight: 260, position: 'relative' }}>
              <img src={leaf9} alt="" aria-hidden="true" style={{ position: 'absolute', bottom: -10, left: -8, width: 55, opacity: 0.35, transform: 'rotate(150deg)', pointerEvents: 'none', zIndex: 0 }} />
              <div style={{ padding: '1.4rem 1.4rem 0.8rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(234,88,12,0.12)', border: '1.5px solid rgba(234,88,12,0.3)', borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '0.65rem' }}>
                  <CalendarDays size={13} color="#ea580c" />
                  <span style={{ fontSize: '0.63rem', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Eco Events')}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 900, color: '#431407', margin: 0, lineHeight: 1.25 }}>
                  {t('Join community drives.')}<br /><span style={{ color: '#ea580c' }}>{t('Create your own.')}</span>
                </h3>
              </div>
              <div style={{ flex: 1, padding: '0 1.1rem 1.1rem', position: 'relative', zIndex: 1 }}>
                <img src={imgSEvents} alt="Events" style={{ width: '100%', borderRadius: '0.75rem', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* ── Student Dashboard — full on tablet (5th card alone), 4/12 on desktop ── */}
            <div className="bc col-span-1 sm:col-span-2 lg:col-span-4" style={{ background: `linear-gradient(140deg, ${B.f800} 0%, ${B.f900} 100%)`, borderRadius: '1.4rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 28px rgba(0,0,0,0.22)', minHeight: 260, position: 'relative' }}>
              <img src={leaf7} alt="" aria-hidden="true" style={{ position: 'absolute', top: -12, right: -10, width: 60, opacity: 0.3, transform: 'rotate(-45deg) scaleX(-1)', pointerEvents: 'none', zIndex: 0 }} />
              <div style={{ padding: '1.4rem 1.4rem 0.8rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(167,139,250,0.18)', border: '1.5px solid rgba(167,139,250,0.38)', borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '0.65rem' }}>
                  <Zap size={13} color="#a78bfa" />
                  <span style={{ fontSize: '0.63rem', fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Dashboard')}</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.25 }}>
                  {t('Track your XP level.')}<br /><span style={{ color: '#a78bfa' }}>{t('Grow your eco-pet.')}</span>
                </h3>
              </div>
              <div style={{ flex: 1, padding: '0 1.1rem 1.1rem', position: 'relative', zIndex: 1 }}>
                <img src={imgSDash} alt="Student Dashboard" style={{ width: '100%', borderRadius: '0.75rem', boxShadow: '0 6px 24px rgba(0,0,0,0.28)', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  )
}

// ── School Modes (kept from original) ────────────────────────
const schoolModes = [
  { id: 1, tag: 'Mode 1', name: 'Urban Schools',      icon: '🏙️', color: B.f300, subtitle: 'Full digital infrastructure',    description: 'Schools in cities with reliable internet and devices. Students submit data through web forms or QR codes on any device — real-time sync to your school dashboard.', features: ['📱 Digital forms on any device', '⚡ Real-time data capture', '📊 Instant analytics & reports', '🔗 Classroom QR code sharing'] },
  { id: 2, tag: 'Mode 2', name: 'Semi-Urban Schools', icon: '🏘️', color: B.f200, subtitle: 'Blended tech & classroom play', description: 'Schools with shared devices or occasional connectivity. Roleplay classroom games make eco-data collection participatory — no individual student device needed.', features: ['🎭 Classroom roleplay activities', '📋 Shared device forms', '🔄 Batch sync when online', '👥 Group-based collection'] },
  { id: 3, tag: 'Mode 3', name: 'Rural Schools',      icon: '🌿', color: B.m200, subtitle: 'Zero-internet, paper-first',    description: 'Schools in remote areas with minimal technology. Paper forms are printed, students fill them by hand, and the teacher scans once. Zero student internet required.',    features: ['🖨️ Printable paper forms', '📷 Teacher-only scanning', '✈️ Zero student internet', '🌍 Works in the most remote areas'] },
]

function SchoolModesSection() {
  const { t } = useLang()
  const [selectedMode, setSelectedMode] = useState(1)
  const [sRef, sStyle] = useReveal()
  const mode = schoolModes.find(m => m.id === selectedMode)

  function ringPath(r1, r2) {
    return [`M 200 ${200-r2}`,`A ${r2} ${r2} 0 1 1 199.999 ${200-r2} Z`,`M 200 ${200-r1}`,`A ${r1} ${r1} 0 1 0 199.999 ${200-r1} Z`].join(' ')
  }

  return (
    <section className="py-20 px-6 overflow-hidden" style={{ background: B.f900 }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div ref={sRef} style={{ ...sStyle, textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ display: 'inline-block', background: `${B.f200}18`, color: B.f200, fontSize: '0.7rem', fontWeight: 700, padding: '0.375rem 1rem', borderRadius: '999px', marginBottom: '1rem', letterSpacing: '0.15em', textTransform: 'uppercase', border: `1px solid ${B.f200}28` }}>{t('Designed For Every School')}</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#ffffff', marginBottom: '0.875rem', lineHeight: 1.2 }}>
            {t('One platform,')}<br/><span style={{ color: B.f300 }}>{t('three modes.')}</span>
          </h2>
          <p style={{ color: `${B.m100}70`, maxWidth: '34rem', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {t('Click each ring to explore how CoPaila adapts — from city centres with full digital infrastructure to remote villages with no internet at all.')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto block">
              <circle cx="200" cy="200" r="196" fill={B.f800} stroke={`${B.f400}25`} strokeWidth="1"/>
              <path d={ringPath(147,191)} fillRule="evenodd" fill={selectedMode===3?`${B.f600}55`:'rgba(255,255,255,0.025)'} style={{transition:'fill 0.4s ease'}}/>
              <circle cx="200" cy="200" r="191" fill="none" stroke={selectedMode===3?B.f300:`${B.f400}30`} strokeWidth={selectedMode===3?2:1} strokeDasharray={selectedMode===3?'':'7 5'} style={{transition:'all 0.4s ease'}}/>
              <circle cx="200" cy="200" r="147" fill="none" stroke={selectedMode===3?`${B.f300}40`:`${B.f500}22`} strokeWidth="1" style={{transition:'all 0.4s ease'}}/>
              <path d={ringPath(103,145)} fillRule="evenodd" fill={selectedMode===2?`${B.f500}65`:'rgba(255,255,255,0.03)'} style={{transition:'fill 0.4s ease'}}/>
              <circle cx="200" cy="200" r="145" fill="none" stroke={selectedMode===2?B.f200:`${B.f400}35`} strokeWidth={selectedMode===2?2:1} strokeDasharray={selectedMode===2?'':'7 5'} style={{transition:'all 0.4s ease'}}/>
              <circle cx="200" cy="200" r="103" fill="none" stroke={selectedMode===2?`${B.f200}40`:`${B.f500}20`} strokeWidth="1" style={{transition:'all 0.4s ease'}}/>
              <path d={ringPath(66,101)} fillRule="evenodd" fill={selectedMode===1?`${B.f400}70`:'rgba(255,255,255,0.04)'} style={{transition:'fill 0.4s ease'}}/>
              <circle cx="200" cy="200" r="101" fill="none" stroke={selectedMode===1?B.f200:`${B.f400}40`} strokeWidth={selectedMode===1?2:1} strokeDasharray={selectedMode===1?'':'7 5'} style={{transition:'all 0.4s ease'}}/>
              <circle cx="200" cy="200" r="66" fill={B.f700}/>
              <circle cx="200" cy="200" r="66" fill="none" stroke={B.f400} strokeWidth="1.5" opacity="0.35"/>
              <ellipse cx="200" cy="234" rx="22" ry="5.5" fill={B.f900} opacity="0.55"/>
              <ellipse cx="178" cy="229" rx="9.5" ry="5" fill="#1a0f0a" transform="rotate(-15 178 229)"/>
              <ellipse cx="222" cy="229" rx="9.5" ry="5" fill="#1a0f0a" transform="rotate(15 222 229)"/>
              <path d="M181 218 Q187 232 197 228" fill={B.f800}/><path d="M219 218 Q213 232 203 228" fill={B.f800}/>
              <ellipse cx="200" cy="228" rx="7" ry="3.5" fill={B.f800}/>
              <rect x="184" y="196" width="32" height="34" rx="10" fill={B.f800}/>
              <rect x="194" y="189" width="12" height="10" rx="5" fill="#e5b896"/>
              <circle cx="200" cy="177" r="19" fill="#e5b896"/>
              <ellipse cx="200" cy="162" rx="15" ry="8" fill="#1a0c07"/>
              <path d="M181 174 Q184 159 200 158 Q216 159 219 174" fill="#1a0c07"/>
              <circle cx="194" cy="177" r="2.5" fill="#1a0c07"/><circle cx="206" cy="177" r="2.5" fill="#1a0c07"/>
              <circle cx="194.8" cy="176" r="1" fill="rgba(255,255,255,0.75)"/><circle cx="206.8" cy="176" r="1" fill="rgba(255,255,255,0.75)"/>
              <path d="M195 183 Q200 188 205 183" stroke="#c07a50" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M216 207 Q230 211 225 197" stroke={B.f800} strokeWidth="8" fill="none" strokeLinecap="round"/>
              <circle cx="223" cy="196" r="7" fill="#e5b896"/>
              <path d="M184 209 Q173 220 177 215" stroke={B.f800} strokeWidth="7" fill="none" strokeLinecap="round"/>
              {selectedMode===3&&<circle cx="200" cy="200" r="191" fill="none" stroke={B.f300} strokeWidth="2" opacity="0.5"><animate attributeName="r" values="189;198;189" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/></circle>}
              {selectedMode===2&&<circle cx="200" cy="200" r="145" fill="none" stroke={B.f200} strokeWidth="2" opacity="0.5"><animate attributeName="r" values="143;152;143" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/></circle>}
              {selectedMode===1&&<circle cx="200" cy="200" r="101" fill="none" stroke={B.f200} strokeWidth="2" opacity="0.5"><animate attributeName="r" values="99;108;99" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/></circle>}
              <g onClick={()=>setSelectedMode(3)} style={{cursor:'pointer'}}><rect x="163" y="9" width="74" height="21" rx="10.5" fill={selectedMode===3?B.f500:`${B.f800}f0`} stroke={selectedMode===3?B.f300:`${B.f500}55`} strokeWidth="1" style={{transition:'all 0.3s'}}/><text x="200" y="24" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={selectedMode===3?'#fff':B.f300}>{t('Mode 3 · Rural')}</text></g>
              <g onClick={()=>setSelectedMode(2)} style={{cursor:'pointer'}}><rect x="154" y="56" width="92" height="21" rx="10.5" fill={selectedMode===2?B.f600:`${B.f800}f0`} stroke={selectedMode===2?B.f200:`${B.f500}55`} strokeWidth="1" style={{transition:'all 0.3s'}}/><text x="200" y="71" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={selectedMode===2?'#fff':B.f300}>{t('Mode 2 · Semi-Urban')}</text></g>
              <g onClick={()=>setSelectedMode(1)} style={{cursor:'pointer'}}><rect x="160" y="102" width="80" height="21" rx="10.5" fill={selectedMode===1?B.f600:`${B.f800}f0`} stroke={selectedMode===1?B.f200:`${B.f500}55`} strokeWidth="1" style={{transition:'all 0.3s'}}/><text x="200" y="117" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={selectedMode===1?'#fff':B.f300}>{t('Mode 1 · Urban')}</text></g>
              <path d={ringPath(147,193)} fillRule="evenodd" fill="rgba(255,255,255,0.001)" stroke="none" onClick={()=>setSelectedMode(3)} style={{cursor:'pointer'}}/>
              <path d={ringPath(103,147)} fillRule="evenodd" fill="rgba(255,255,255,0.001)" stroke="none" onClick={()=>setSelectedMode(2)} style={{cursor:'pointer'}}/>
              <path d={ringPath(66,103)}  fillRule="evenodd" fill="rgba(255,255,255,0.001)" stroke="none" onClick={()=>setSelectedMode(1)} style={{cursor:'pointer'}}/>
            </svg>
            <div className="flex items-center justify-center gap-2 mt-4">
              {schoolModes.map(m=>(
                <button key={m.id} onClick={()=>setSelectedMode(m.id)} style={{ width:selectedMode===m.id?'2rem':'0.5rem', height:'0.5rem', borderRadius:'999px', border:'none', cursor:'pointer', background:selectedMode===m.id?mode.color:`${B.f500}55`, transition:'all 0.35s cubic-bezier(0.25,1,0.5,1)' }}/>
              ))}
            </div>
          </div>
          <div key={selectedMode} className="animate-fade-in">
            <div style={{ background:B.f800, border:`2px solid ${mode.color}44`, borderRadius:'1rem', padding:'2rem' }}>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ background:`${mode.color}1e`, color:mode.color, fontSize:'0.65rem', fontWeight:700, padding:'0.3rem 0.875rem', borderRadius:'999px', letterSpacing:'0.12em', textTransform:'uppercase', border:`1px solid ${mode.color}28` }}>{t(mode.tag)}</span>
                <span style={{ fontSize:'1.5rem' }}>{mode.icon}</span>
              </div>
              <h3 style={{ fontSize:'1.65rem', fontWeight:800, color:'#ffffff', marginBottom:'0.3rem', lineHeight:1.1 }}>{t(mode.name)}</h3>
              <p style={{ color:mode.color, fontSize:'0.8rem', fontWeight:600, marginBottom:'1.125rem', opacity:0.9 }}>{t(mode.subtitle)}</p>
              <p style={{ color:`${B.m100}72`, fontSize:'0.875rem', lineHeight:1.8, marginBottom:'1.5rem' }}>{t(mode.description)}</p>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {mode.features.map((f,i)=>(
                  <li key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.875rem', color:`${B.m200}cc` }}>
                    <span style={{ width:'1.25rem', height:'1.25rem', borderRadius:'50%', background:`${mode.color}1a`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', color:mode.color, fontWeight:800, border:`1px solid ${mode.color}28` }}>✓</span>
                    {t(f)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── FAQ section (kept from original) ─────────────────────────
const faqs = [
  { q: 'So what do you calculate?', a: "CoPaila calculates your school's total carbon footprint across three scopes: direct emissions from fuel and vehicles, electricity consumption, and indirect emissions from commutes, food, devices, and waste. The result is a clear CO₂ figure your school can track and reduce over time." },
  { q: 'Do students need smartphones or laptops?', a: 'Not necessarily. With OCR mode, students fill out printed paper forms and teachers scan them. Roleplay mode works with classroom activities. Quick Form is the only mode that needs a device, and any basic smartphone or shared computer works.' },
  { q: 'How long does it take to set up a school?', a: 'Most schools are fully onboarded within one session. A school admin creates an account, enters basic details, and the system generates your custom survey forms immediately.' },
  { q: 'Is the data shared publicly?', a: "No. Your school's data is private by default. Schools can opt into anonymised leaderboards to compare progress with peer institutions — entirely your choice." },
  { q: 'Which UN SDGs does CoPaila address?', a: 'CoPaila directly supports SDG 4 (Quality Education), SDG 7 (Affordable and Clean Energy), and SDG 13 (Climate Action) by embedding sustainability literacy into everyday school life.' },
]

function FAQSection() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  const [headerRef, headerStyle] = useReveal()
  return (
    <section id="faq" className="scroll-mt-16 py-20 px-6" style={{ background: B.m100 }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div ref={headerRef} style={{ ...headerStyle, textAlign: 'center', marginBottom: '3.5rem' }}>
          
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: B.f900, marginBottom: '0.75rem' }}>{t('Frequently Asked Questions')}</h2>
          <p style={{ color: B.f600, maxWidth: '28rem', margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.7 }}>{t('Everything you need to know about CoPaila and how it works in your school.')}</p>
        </div>
        <div className="gap-12 items-start">
          <div className="space-y-3">
            {faqs.map((faq,i)=>(
              <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background:open===i?B.m200:'#ffffff', border:`2px solid ${open===i?B.f600:B.m300}` }}>
                <button className="w-full flex items-center justify-between px-6 py-4 text-left gap-4" onClick={()=>setOpen(open===i?-1:i)}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background:open===i?B.f800:B.m200, color:open===i?'#fff':B.f600 }}>{i+1}</span>
                    <span className="font-semibold text-sm" style={{ color:B.f900 }}>{t(faq.q)}</span>
                  </div>
                  <span style={{ color:B.f600, flexShrink:0 }}>{open===i?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</span>
                </button>
                {open===i&&<div className="px-6 pb-5 pl-[3.75rem]"><p style={{ color:B.f600, fontSize:'0.875rem', lineHeight:1.7 }}>{t(faq.a)}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function Landing() {
  return (
    <MainLayout>

      {/* ── Hero (unchanged) ─────────────────────────────── */}
      <section className="relative flex flex-col" style={{ background: '#ffffff', minHeight: '92vh' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full" style={{ background: B.m300, opacity: 0.18 }} />
          <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full" style={{ background: B.f200, opacity: 0.10 }} />
          <div className="absolute bottom-32 left-1/4 w-40 h-40" style={{ background: B.m200, opacity: 0.14, transform: 'rotate(45deg)' }} />
          {/* Leaf accents in hero */}
          <img src={leaf5} alt="" aria-hidden="true" style={{ position: 'absolute', bottom: '8%', right: '-6%', width: '28%', opacity: 0.1, transform: 'rotate(10deg)', pointerEvents: 'none' }} />
          <img src={leaf3} alt="" aria-hidden="true" style={{ position: 'absolute', top: '5%', left: '-4%', width: '22%', opacity: 0.08, transform: 'rotate(-165deg) scaleX(-1)', pointerEvents: 'none' }} />
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center relative z-20" style={{ paddingTop: '6vh', paddingBottom: '2vh' }}>
          {/* Doubled the min, preferred, and max values inside clamp() */}
          <img src={logoImg} alt="Co Paila" className="w-auto object-contain mb-5" style={{ height: 'clamp(320px, 48vw, 560px)' }} />
          <div className="w-full" style={{ maxWidth: '520px' }}>
            <SearchBar />
          </div>
        </div>
        <div className="relative z-10 w-full mt-auto">
          <div className="relative w-full py-8" style={{ background: B.f900, borderTop: `3px solid ${B.f800}` }}>
           
          </div>
        </div>
      </section>

      {/* ── Features (new about section) ─────────────────── */}
      <FeaturesSection />


      {/* ── FAQ ──────────────────────────────────────────── */}
      <FAQSection />

    </MainLayout>
  )
}
