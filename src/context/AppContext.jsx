import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { studentApi } from '../services/api'

// Student's local day as YYYY-MM-DD (used for streaks + "done today").
const todayStamp = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const XP_PER_LEVEL = 3000

const AppContext = createContext(null)

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

// Read a persisted value once on mount (survives page refresh).
const persisted = (key) => {
  try { return localStorage.getItem(key) || null } catch { return null }
}

export function AppProvider({ children }) {
  // The selected school + role are persisted so a refresh doesn't drop them —
  // this is what stops the login screen from showing "without the school".
  const [selectedSchool, setSelectedSchool] = useState(() => persisted('selectedSchool'))
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => persisted('selectedSchoolId'))
  const [selectedRole, setSelectedRole] = useState(() => persisted('selectedRole'))
  const [selectedPet, setSelectedPet] = useState(null)

  // When a stored session is restored on refresh, mirror the real user's
  // role + school into the app context so the navbar / chip stay correct
  // without forcing the user to log in again.
  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    setSelectedRole(prev => prev || (user.role === 'STUDENT' ? 'student' : 'school'))
    if (user.school?.name) setSelectedSchool(prev => prev || user.school.name)
    if (user.school?.id)   setSelectedSchoolId(prev => prev || user.school.id)
  }, [user])

  // Keep localStorage in sync so the context can be rebuilt after a reload.
  useEffect(() => {
    try {
      selectedSchool   ? localStorage.setItem('selectedSchool', selectedSchool)     : localStorage.removeItem('selectedSchool')
      selectedSchoolId ? localStorage.setItem('selectedSchoolId', selectedSchoolId) : localStorage.removeItem('selectedSchoolId')
      selectedRole     ? localStorage.setItem('selectedRole', selectedRole)         : localStorage.removeItem('selectedRole')
    } catch { /* ignore quota / private-mode errors */ }
  }, [selectedSchool, selectedSchoolId, selectedRole])

  // ── Real per-student pet progress ───────────────────────────────────────────
  // Every student starts at 0 XP / level 1 and grows their pet (= their carbon
  // leader score) through daily quests and lessons. The source of truth is the
  // backend StudentProfile; we mirror it here and keep it in sync.
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [xpToNextLevel] = useState(XP_PER_LEVEL)
  const [petHappiness, setPetHappiness] = useState(50)
  const [petStage, setPetStage] = useState(1)          // 1 | 2 | 3
  const [streak, setStreak] = useState(0)
  const [lessonsCompleted, setLessonsCompleted] = useState(0)
  const [totalCo2Saved, setTotalCo2Saved] = useState(0)

  // Merge a server StudentProfile (from progress / quest / lesson endpoints)
  // into the local mirror, flagging a pet evolution when the stage grows.
  const applyProgress = useCallback((p) => {
    if (!p) return
    if (typeof p.xp === 'number') setXp(p.xp)
    if (typeof p.level === 'number') setLevel(p.level)
    if (typeof p.petHappiness === 'number') setPetHappiness(p.petHappiness)
    if (typeof p.streak === 'number') setStreak(p.streak)
    if (typeof p.lessonsCompleted === 'number') setLessonsCompleted(p.lessonsCompleted)
    if (typeof p.totalCo2Saved === 'number') setTotalCo2Saved(Math.round(p.totalCo2Saved * 10) / 10)
    if (typeof p.petStage === 'number') {
      setPetStage(prev => { if (p.petStage > prev) setShowEvolution(true); return p.petStage })
    }
  }, [])

  // Pull the real profile whenever a STUDENT session is active.
  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return
    let alive = true
    studentApi.progress().then(p => { if (alive) applyProgress(p) }).catch(() => {})
    return () => { alive = false }
  }, [user, applyProgress])

  // Daily quest — flat map of questionId → selected answer value
  const [questAnswers, setQuestAnswers] = useState({})
  const [questCompleted, setQuestCompleted] = useState(false)
  const [showEvolution, setShowEvolution] = useState(false)

  function setQuestAnswer(qId, value) {
    if (questCompleted) return
    setQuestAnswers(prev => ({ ...prev, [qId]: value }))
  }

  // Trophy Room data
  const [earnedBadges, setEarnedBadges] = useState([
    { id: 'green_beginner', name: 'Green Beginner',   earnedDate: 'Oct 12', emoji: '🌱', color: '#22c55e' },
    { id: 'waste_warrior',  name: 'Waste Warrior',    earnedDate: 'Nov 05', emoji: '♻️', color: '#3b82f6' },
    { id: 'cycle_champ',    name: 'Cycle Champion',   earnedDate: 'Jan 15', emoji: '🚲', color: '#16a34a' },
  ])
  const [inProgressBadges] = useState([
    { id: 'carbon_hero',     name: 'Carbon Hero',     desc: 'Walk or bike to school 10 times.',      tier: 2, current: 6,  target: 10 },
    { id: 'forest_guardian', name: 'Forest Guardian', desc: 'Answer 20 eco survey sections with all green choices.', tier: 3, current: 15, target: 20 },
  ])

  // Recent activities
  const [recentActivities, setRecentActivities] = useState([
    { date: 'Today',      action: 'Walked to school', points: +50, icon: '🚶' },
    { date: 'Today',      action: 'Recycled waste',   points: +20, icon: '♻️' },
    { date: 'Yesterday',  action: 'Plant-based meal', points: +15, icon: '🥗' },
    { date: 'Yesterday',  action: 'Low screen time',  points: +10, icon: '⚡' },
    { date: '2 days ago', action: 'Used bicycle',     points: +50, icon: '🚲' },
  ])

  // School data (form scratch state). The dashboard no longer uses any
  // client-side dummy footprint — it reads the school's real calculated
  // result from the backend (see hooks/useSchoolAudit.js).
  const [schoolData, setSchoolData] = useState({
    electricity: '', water: '', paper: '', fuel: '',
    waste: '', students: '', staff: '', transport: '',
  })

  // Bank a finished daily quest. `gained` is the XP summed from the answers and
  // `co2Saved` is the kg the recommendations could save. We optimistically grow
  // the pet, then reconcile with the backend (the real source of truth).
  const completeQuests = useCallback((gained, co2Saved = 0) => {
    setQuestCompleted(true)
    setXp(prev => prev + gained)
    setPetHappiness(prev => Math.min(100, prev + Math.floor(gained / 8)))
    setRecentActivities(prev => [
      { date: 'Just now', action: 'Completed eco survey', points: gained, icon: '🌿' },
      ...prev.slice(0, 4),
    ])

    studentApi.questComplete({ gained, co2Saved, date: todayStamp() })
      .then(res => applyProgress(res))
      .catch(() => {})

    return gained
  }, [applyProgress])

  function resetDailyQuest() {
    setQuestAnswers({})
    setQuestCompleted(false)
  }

  return (
    <AppContext.Provider value={{
      selectedSchool, setSelectedSchool,
      selectedSchoolId, setSelectedSchoolId,
      selectedRole,   setSelectedRole,
      selectedPet,    setSelectedPet,
      xp, level, xpToNextLevel,
      petHappiness, petStage, streak, lessonsCompleted, totalCo2Saved,
      applyProgress,
      questAnswers, setQuestAnswer, questCompleted, completeQuests, resetDailyQuest,
      showEvolution, setShowEvolution,
      earnedBadges, inProgressBadges,
      recentActivities,
      schoolData, setSchoolData,
    }}>
      {children}
    </AppContext.Provider>
  )
}
