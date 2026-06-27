import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export default function SearchBar({ large = false }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const { setSelectedSchool, setSelectedSchoolId } = useApp()
  const { t } = useLang()
  const navigate   = useNavigate()
  const ref        = useRef(null)
  const debounceRef = useRef(null)

  async function fetchSchools(q) {
    setLoading(true)
    try {
      const res  = await fetch(`${BASE}/schools/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setResults(Array.isArray(data.data) ? data.data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch on focus (show all registered schools immediately)
  function handleFocus() {
    setFocused(true)
    if (results.length === 0) fetchSchools('')
  }

  // Debounced fetch as user types
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSchools(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function selectSchool(school) {
    setSelectedSchool(school.name)
    setSelectedSchoolId(school.id)
    setQuery(school.name)
    setFocused(false)
    // Go to the real login — students and teachers sign in with the
    // credentials made during registration; role decides the portal.
    navigate('/login')
  }

  const showDropdown = focused

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <div className={`flex items-center gap-3 bg-surface rounded-3xl border transition-all duration-200 shadow-ambient ${
        focused ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'
      } ${large ? 'px-5 py-4' : 'px-4 py-3'}`}>
        <Search size={large ? 22 : 18} className="text-primary flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setFocused(true) }}
          onFocus={handleFocus}
          placeholder={t('Search your school...')}
          className={`flex-1 outline-none text-on-surface placeholder-on-surface-variant bg-transparent ${large ? 'text-lg' : 'text-base'}`}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }} className="text-on-surface-variant hover:text-on-surface">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-ambient border border-outline-variant overflow-hidden z-50 animate-slide-up max-h-64 overflow-y-auto">
          {loading && (
            <div className="px-5 py-4 text-sm text-on-surface-variant">{t('Searching…')}</div>
          )}
          {!loading && results.length > 0 && results.map(school => (
            <button
              key={school.id}
              onClick={() => selectSchool(school)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-variant transition-colors text-left border-b border-surface-container-highest last:border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-on text-xs flex-shrink-0">
                {school.schoolType?.charAt(0) || '🏫'}
              </div>
              <div>
                <p className="font-bold text-on-surface">{school.name}</p>
                <p className="text-sm text-on-surface-variant">{school.district}, {school.province?.replace('_', ' ')}</p>
              </div>
            </button>
          ))}
          {!loading && results.length === 0 && (
            <div className="px-5 py-5 text-center">
              <p className="text-on-surface-variant text-sm">
                {query.trim() ? <>{t('No schools found for')} "<strong>{query}</strong>"</> : t('No schools registered yet.')}
              </p>
              <p className="text-on-surface-variant text-xs mt-1">{t('Register your school to appear here.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
