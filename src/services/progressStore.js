// ── Per-student progress store ────────────────────────────────────────────────
// Each student's pet starts at ZERO and grows only from real play. Progress is
// keyed by the logged-in user's id so two students on the same device never
// share a pet.
//
// This is the SEAM for the backend: today it persists to localStorage; when the
// StudentProfile API lands, swap load()/save() for GET/PATCH calls — nothing
// else in the app needs to change.

const KEY = (uid) => `leafnode:progress:${uid || 'guest'}`

// A brand-new pet: 0 XP, level 1, no lessons, neutral happiness.
export function zeroProgress() {
  return {
    xp: 0,
    level: 1,
    petHappiness: 50,
    petStage: 1,        // 1 | 2 | 3
    lessonsCompleted: 0,
    streak: 0,
    lastQuestDate: null, // 'YYYY-MM-DD' of the last completed daily quest
    totalCo2Saved: 0,    // kg CO2e, accumulated from quest recommendations
  }
}

export function loadProgress(uid) {
  try {
    const raw = localStorage.getItem(KEY(uid))
    if (!raw) return zeroProgress()
    return { ...zeroProgress(), ...JSON.parse(raw) }
  } catch {
    return zeroProgress()
  }
}

export function saveProgress(uid, progress) {
  try { localStorage.setItem(KEY(uid), JSON.stringify(progress)) } catch { /* quota / private mode */ }
}

// Local date stamp (not UTC) so "today" matches the student's calendar day.
export function todayStamp() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// XP needed to reach the next level. Each level is a flat 3000 XP band.
export const XP_PER_LEVEL = 3000
export const levelForXp = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1
export const stageForLevel = (level) => Math.min(3, Math.floor((level - 1) / 4) + 1)
