import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import BackButton from '../components/BackButton'
import logoImg from '../assets/logo.png'

function useStyles() {
  useEffect(() => {
    if (document.getElementById('dl-styles')) return
    const s = document.createElement('style')
    s.id = 'dl-styles'
    s.textContent = `
      @keyframes dlFloat { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-8px);} }
      @keyframes dlFadeUp { from{ opacity:0; transform:translateY(24px);} to{ opacity:1; transform:none;} }
      @keyframes dlSpin { to{ transform:rotate(360deg);} }
      .dl-card { animation: dlFadeUp 0.5s ease both; }
      .dl-card:nth-child(2) { animation-delay: 0.12s; }
      .dl-btn:hover { transform: scale(1.04); }
      .dl-btn:active { transform: scale(1); }
    `
    document.head.appendChild(s)
  }, [])
}

const B = {
  bg: '#f5f7ee',
  dark: '#1E2F1E',
  mid: '#2D4A32',
  teal: '#4E7D5B',
  light: '#7BAE7F',
  cream: '#EEF2DC',
  border: '#d8e8c0',
}

const DOWNLOADS = [
  {
    id: 'desktop',
    icon: '🖥️',
    title: { en: 'Desktop App', ne: 'डेस्कटप एप' },
    subtitle: { en: 'Windows · Mac · Linux', ne: 'विन्डोज · म्याक · लिनक्स' },
    desc: {
      en: 'Full-featured offline companion. Track your carbon footprint, grow your pet, and complete daily quests — all without an internet connection.',
      ne: 'पूर्ण सुविधायुक्त अफलाइन साथी। इन्टरनेट नभएपनि आफ्नो कार्बन फुटप्रिन्ट ट्र्याक गर्नुहोस्, पाल्तु बढाउनुहोस् र दैनिक क्विज पूरा गर्नुहोस्।',
    },
    features: [
      { en: 'Full offline functionality', ne: 'पूर्ण अफलाइन कार्यक्षमता' },
      { en: 'Syncs when connected', ne: 'जोडिएको बेला सिङ्क हुन्छ' },
      { en: 'Native performance', ne: 'नेटिभ प्रदर्शन' },
    ],
    file: '/downloads/cpaila_desktop',
    filename: 'CoPaila_Desktop',
    size: '244 KB',
    color: B.mid,
    glow: 'rgba(45,74,50,0.22)',
    badge: { en: 'For PC', ne: 'PC को लागि' },
  },
  {
    id: 'mobile',
    icon: '📱',
    title: { en: 'Mobile App', ne: 'मोबाइल एप' },
    subtitle: { en: 'Android · iOS', ne: 'एन्ड्रोइड · आइओएस' },
    desc: {
      en: 'Learn on the go. Answer daily quests from anywhere, earn XP for your pet, and join your school leaderboard — even offline.',
      ne: 'जहाँबाट पनि सिक्नुहोस्। जहाँबाट पनि दैनिक क्विजको जवाफ दिनुहोस्, पाल्तुको लागि XP कमाउनुहोस् र विद्यालय लिडरबोर्डमा सामेल हुनुहोस्।',
    },
    features: [
      { en: 'Lightweight & fast', ne: 'हल्का र छिटो' },
      { en: 'Works on low-end devices', ne: 'कम क्षमताको उपकरणमा पनि चल्छ' },
      { en: 'Offline-first design', ne: 'अफलाइन-प्रथम डिजाइन' },
    ],
    file: '/downloads/cpaila_mobile',
    filename: 'CoPaila_Mobile',
    size: '244 KB',
    color: '#16a34a',
    glow: 'rgba(22,163,74,0.22)',
    badge: { en: 'For Phone', ne: 'फोनको लागि' },
  },
]

function DownloadCard({ d, lang }) {
  const [downloading, setDownloading] = useState(false)
  const tx = (obj) => (lang === 'ne' && obj.ne ? obj.ne : obj.en)

  function handleDownload() {
    setDownloading(true)
    const a = document.createElement('a')
    a.href = d.file
    a.download = d.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloading(false), 2200)
  }

  return (
    <div className="dl-card" style={{
      background: '#fff',
      border: `2px solid ${d.color}44`,
      borderRadius: '1.25rem',
      padding: '2.5rem 2rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
    }}>
      {/* Decorative background circle */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: `${d.color}0d`,
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{
        position: 'absolute', top: '1.25rem', right: '1.25rem',
        background: `${d.color}18`, color: d.color,
        fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em',
        padding: '0.25rem 0.7rem', borderRadius: '2rem',
        border: `1px solid ${d.color}33`,
      }}>
        {tx(d.badge)}
      </div>

      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '1rem',
        background: `${d.color}18`,
        border: `2px solid ${d.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.2rem',
        animation: 'dlFloat 3.5s ease-in-out infinite',
      }}>
        {d.icon}
      </div>

      {/* Title */}
      <div>
        <h2 style={{ fontWeight: 900, fontSize: '1.4rem', color: B.dark, margin: '0 0 0.2rem' }}>
          {tx(d.title)}
        </h2>
        <p style={{ fontSize: '0.75rem', color: B.teal, fontWeight: 700, margin: 0, letterSpacing: '0.03em' }}>
          {tx(d.subtitle)}
        </p>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.88rem', color: '#4a5568', lineHeight: 1.65, margin: 0 }}>
        {tx(d.desc)}
      </p>

      {/* Feature list */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {d.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: B.teal, fontWeight: 600 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${d.color}18`, border: `1.5px solid ${d.color}44`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: d.color, flexShrink: 0 }}>✓</span>
            {tx(f)}
          </li>
        ))}
      </ul>

      {/* File info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: B.cream, borderRadius: '0.75rem', padding: '0.55rem 0.875rem' }}>
        <span style={{ fontSize: '0.8rem' }}>📦</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: B.teal }}>
          {lang === 'ne' ? 'फाइलको आकार' : 'File size'}: {d.size}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto', fontWeight: 600 }}>
          {lang === 'ne' ? 'अफलाइन स्ट्यान्डअलोन' : 'Offline standalone'}
        </span>
      </div>

      {/* Download button */}
      <button
        className="dl-btn"
        onClick={handleDownload}
        disabled={downloading}
        style={{
          background: downloading ? `${d.color}88` : d.color,
          color: '#fff',
          border: 'none',
          borderRadius: '0.875rem',
          padding: '0.95rem 1.5rem',
          fontWeight: 800,
          fontSize: '1rem',
          cursor: downloading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          transition: 'all 0.18s',
          marginTop: 'auto',
        }}
      >
        {downloading ? (
          <>
            <span style={{ width: 18, height: 18, border: '2.5px solid #fff4', borderTopColor: '#fff', borderRadius: '50%', animation: 'dlSpin 0.7s linear infinite', flexShrink: 0 }} />
            {lang === 'ne' ? 'डाउनलोड हुँदैछ…' : 'Downloading…'}
          </>
        ) : (
          <>
            <span style={{ fontSize: '1.15rem' }}>⬇️</span>
            {lang === 'ne' ? `${tx(d.title)} डाउनलोड गर्नुहोस्` : `Download ${tx(d.title)}`}
          </>
        )}
      </button>
    </div>
  )
}

export default function Download() {
  useStyles()
  const { lang, t } = useLang()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: B.bg, color: B.dark }}>

      {/* ── Top nav ── */}
      <div style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto' }}>
        <BackButton to="/" label={t('Home', 'होम')} />
        <img src={logoImg} alt="CoPaila" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
      </div>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '3rem 2rem 2.5rem', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: `${B.mid}14`, color: B.mid, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', padding: '0.35rem 1rem', borderRadius: '2rem', border: `1px solid ${B.mid}22`, marginBottom: '1.5rem' }}>
          <span>⬇️</span>
          {t('OFFLINE STANDALONE', 'अफलाइन स्ट्यान्डअलोन')}
        </div>

        <h1 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, margin: '0 0 1rem', color: B.dark }}>
          {t('Download CoPaila', 'CoPaila डाउनलोड गर्नुहोस्')}
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: B.teal, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          {t(
            'Take your eco journey offline. Both apps are fully self-contained — no installation required, no internet needed.',
            'आफ्नो इको यात्रा अफलाइन लैजानुहोस्। दुवै एपहरू पूर्ण स्वतन्त्र छन् — कुनै इन्स्टलेशन आवश्यक छैन, इन्टरनेट पनि चाहिँदैन।',
          )}
        </p>
      </div>

      {/* ── Download cards ── */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 1.5rem 4rem',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {DOWNLOADS.map(d => (
          <DownloadCard key={d.id} d={d} lang={lang} />
        ))}
      </div>

     
    </div>
  )
}
