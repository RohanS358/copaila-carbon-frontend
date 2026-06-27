import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { NE } from '../i18n/ne'

// ============================================================
// Bilingual (English / नेपाली) support.
//
// Usage:
//   const { t, lang, toggleLang } = useLang()
//   <h1>{t('Welcome back')}</h1>
//   t('Welcome back', 'फेरि स्वागत छ')   // inline override also works
//
// Strings are looked up by their English text in the NE dictionary
// (src/i18n/ne.js). Anything not yet translated falls back to English,
// so the UI never breaks while translations are filled in.
// ============================================================

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') === 'ne' ? 'ne' : 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch { /* ignore */ }
    document.documentElement.lang = lang
  }, [lang])

  // t('English')           → dictionary lookup
  // t('English', 'नेपाली') → inline Nepali override (handy for one-offs)
  const t = useCallback((en, ne) => {
    if (lang !== 'ne') return en
    if (ne !== undefined) return ne
    return (NE[en] !== undefined ? NE[en] : en)
  }, [lang])

  const toggleLang = useCallback(() => setLang(l => (l === 'ne' ? 'en' : 'ne')), [])
  const setLanguage = useCallback((l) => setLang(l === 'ne' ? 'ne' : 'en'), [])

  return (
    <LanguageContext.Provider value={{ lang, isNe: lang === 'ne', t, setLanguage, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
