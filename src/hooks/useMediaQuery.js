import { useState, useEffect } from 'react'

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * @param {string} query e.g. '(max-width: 768px)'
 * @returns {boolean} whether the query currently matches
 */
export function useMediaQuery(query) {
  const get = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false

  const [matches, setMatches] = useState(get)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange() // sync in case it changed before the listener attached
    // addEventListener is the modern API; fall back for older Safari
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [query])

  return matches
}

/** True on phone-sized viewports (<= 768px). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}
