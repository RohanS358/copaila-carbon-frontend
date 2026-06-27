import { useState, useEffect, useCallback } from 'react'
import { carbonApi } from '../services/api'

// ============================================================
// useSchoolAudit — fetches the logged-in school's own audits and
// exposes the latest calculated result. The backend scopes audits to
// the authenticated user's schoolId, so each school only ever sees its
// own data here.
// ============================================================
export function useSchoolAudit() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await carbonApi.mySchool() // array, newest first
      setAudits(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load audit data')
      setAudits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Refresh when the tab/window regains focus, so a freshly submitted audit
  // shows up even if the dashboard was already mounted in the background.
  useEffect(() => {
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  // Most recent audit that actually has a calculated result.
  const latest = audits.find((a) => a && a.result) || null
  const result = latest?.result || null

  return { audits, latest, result, loading, error, reload: load }
}
