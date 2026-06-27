import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, BookOpen, Trophy, Medal, ArrowRight, Lock, Check, Flame, Leaf, Play } from 'lucide-react'
import StudentLayout from '../layouts/StudentLayout'
import PetStage from '../components/Pet/PetStage'
import DailyQuestGame from '../components/DailyQuestGame'
import Forest3D from '../components/Forest3D'
import { useTalkingPet } from '../hooks/useTalkingPet'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useSchoolAudit } from '../hooks/useSchoolAudit'
import { getPetResponse, getEcoTip, getLLMPetResponse } from '../services/petService'
import { primeSpeech } from '../services/tts'
import { studentApi, lessonsApi } from '../services/api'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

const RANK_COLORS = { 1: '#D4AC0D', 2: '#909090', 3: '#A0522D' }

const BADGE_COLORS = {
  green_beginner:  { bg: '#dcfce7', border: '#4ade80', accent: '#16a34a' },
  waste_warrior:   { bg: '#dbeafe', border: '#60a5fa', accent: '#2563eb' },
  carbon_hero:     { bg: '#fef3c7', border: '#fbbf24', accent: '#d97706' },
  forest_guardian: { bg: '#f3e8ff', border: '#c084fc', accent: '#7c3aed' },
  water_saver:     { bg: '#e0f2fe', border: '#38bdf8', accent: '#0369a1' },
  cycle_champ:     { bg: '#dcfce7', border: '#86efac', accent: '#15803d' },
}

function useHubStyles() {
  useEffect(() => {
    if (document.getElementById('hub-styles')) return
    const s = document.createElement('style')
    s.id = 'hub-styles'
    s.textContent = `
      @keyframes ctaGlow { 0%,100%{ opacity:1; } 50%{ opacity:0.85; } }
      @keyframes floatY  { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-5px); } }
      @keyframes hubSpin { to { transform: rotate(360deg); } }
    `
    document.head.appendChild(s)
  }, [])
}

// ── Shared shell ───────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${B.m300}`, borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ icon, title, to, nav }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: `1px solid ${B.m300}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: B.f600 }}>
        {icon}
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: B.f900 }}>{title}</span>
      </div>
      {to && nav && (
        <button onClick={() => nav(to)} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: B.f600, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
          See all <ArrowRight size={11} style={{ marginLeft: 2 }} />
        </button>
      )}
    </div>
  )
}

function Spin() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: 24, height: 24, border: '3px solid #e4edd6', borderTopColor: B.f800, borderRadius: '50%', animation: 'hubSpin 0.8s linear infinite' }} />
    </div>
  )
}

// ── Daily Quest card ───────────────────────────────────────────
function QuestCard({ questCompleted, onStart, pet, lang }) {
  return (
    <Card>
      <CardHeader icon={<CalendarCheck size={15} />} title="Daily Quest" />
      <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {questCompleted ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '1.25rem', background: '#f0fdf4', border: `1.5px solid #bbf7d0`, borderRadius: '0.75rem', textAlign: 'center' }}>
            <Check size={28} color="#16a34a" />
            <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534', margin: 0 }}>Quest done for today!</p>
            <p style={{ fontSize: '0.72rem', color: '#4ade80', margin: 0 }}>Return tomorrow to earn more XP</p>
            <button onClick={onStart} style={{ marginTop: '0.4rem', background: 'none', border: `1.5px solid #4ade80`, borderRadius: '0.6rem', padding: '0.35rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
              Play again
            </button>
          </div>
        ) : (
          <button
            onClick={onStart}
            style={{
              flex: 1, background: B.f800, color: '#fff', border: 'none', borderRadius: '0.75rem',
              padding: '1rem', fontWeight: 800, cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', gap: '0.875rem', textAlign: 'left',
              transition: 'transform 0.15s', animation: 'ctaGlow 2.4s ease-in-out infinite',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <span style={{ animation: 'floatY 2.4s ease-in-out infinite', flexShrink: 0, display: 'flex' }}><Play size={26} color="#6ee7a0" /></span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 900 }}>Start Daily Quest</span>
              <span style={{ display: 'block', fontSize: '0.72rem', opacity: 0.85, marginTop: 3 }}>Answer questions · Earn XP · Grow your pet</span>
            </span>
            <ArrowRight size={18} />
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { primeSpeech(); pet.speak(getEcoTip(lang)) }}
            disabled={pet.isSpeaking}
            style={{ flex: 1, background: B.m200, border: `1.5px solid ${B.m300}`, borderRadius: '0.6rem', padding: '0.5rem 0.6rem', fontSize: '0.74rem', fontWeight: 700, color: B.f800, cursor: 'pointer' }}>
            Eco Tip
          </button>
          <button
            onClick={async () => {
              primeSpeech()
              const line = await getLLMPetResponse('motivate', {}, lang)
              pet.speak(line)
            }}
            disabled={pet.isSpeaking}
            style={{ flex: 1, background: B.m200, border: `1.5px solid ${B.m300}`, borderRadius: '0.6rem', padding: '0.5rem 0.6rem', fontSize: '0.74rem', fontWeight: 700, color: B.f800, cursor: 'pointer' }}>
            Pep Talk
          </button>
        </div>
      </div>
    </Card>
  )
}

// ── Lessons card ───────────────────────────────────────────────
function LessonsCard({ nav }) {
  const { lessonsCompleted } = useApp()
  const [lessons, setLessons] = useState(null)

  useEffect(() => {
    lessonsApi.list().then(setLessons).catch(() => setLessons([]))
  }, [])

  const currentLesson = lessons?.find(l => !l.completed && !l.locked)
  const doneCount = lessons?.filter(l => l.completed).length ?? lessonsCompleted
  const total = lessons?.length ?? 0
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <Card>
      <CardHeader icon={<BookOpen size={15} />} title="Lessons" to="/student/lessons" nav={nav} />
      <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {!lessons ? <Spin /> : (
          <>
            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: B.f600 }}>{doneCount} / {total} complete</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: B.f900 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: B.m300, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: B.f800, borderRadius: 3, transition: 'width 0.6s' }} />
              </div>
            </div>

            {/* Lesson node strip */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
              {lessons.slice(0, 8).map((l) => {
                const isCurrent = l.id === currentLesson?.id
                return (
                  <button
                    key={l.id}
                    onClick={() => nav('/student/lessons')}
                    disabled={l.locked}
                    title={l.titleEn || l.title || ''}
                    style={{
                      flexShrink: 0, width: 46, height: 46, borderRadius: '50%',
                      border: `2.5px solid ${l.completed ? '#16a34a' : l.locked ? '#d1d5db' : isCurrent ? B.f800 : B.m300}`,
                      background: l.completed ? '#16a34a' : l.locked ? '#f9fafb' : isCurrent ? B.m200 : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: l.locked ? 'not-allowed' : 'pointer', fontSize: '1.15rem', position: 'relative',
                    }}
                  >
                    {l.completed ? <Check size={18} color="#fff" /> : l.locked ? <Lock size={14} color="#9ca3af" /> : (l.icon || '📗')}
                    {isCurrent && (
                      <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: B.f800, color: '#fff', fontSize: '0.44rem', fontWeight: 900, padding: '1px 5px', borderRadius: '1rem', whiteSpace: 'nowrap' }}>NOW</span>
                    )}
                  </button>
                )
              })}
              {lessons.length > 8 && (
                <button onClick={() => nav('/student/lessons')} style={{ flexShrink: 0, width: 46, height: 46, borderRadius: '50%', border: `1.5px dashed ${B.m300}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: B.f600, fontSize: '0.72rem', fontWeight: 700 }}>
                  +{lessons.length - 8}
                </button>
              )}
            </div>

            {/* Current lesson CTA */}
            {currentLesson ? (
              <button onClick={() => nav('/student/lessons')} style={{ background: B.m200, border: `1.5px solid ${B.m300}`, borderRadius: '0.65rem', padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: B.f900 }}>Continue: {currentLesson.titleEn || currentLesson.title}</span>
                  <span style={{ display: 'block', fontSize: '0.62rem', color: B.f600 }}>+{currentLesson.xpReward} XP on completion</span>
                </div>
                <ArrowRight size={14} color={B.f600} />
              </button>
            ) : doneCount > 0 && (
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', textAlign: 'center', margin: 0 }}>All lessons complete!</p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

// ── Leaderboard card ───────────────────────────────────────────
function LeaderboardCard({ nav }) {
  const [players, setPlayers] = useState(null)

  useEffect(() => {
    studentApi.classStandings()
      .then(res => setPlayers((res.ranking || []).slice(0, 5).map(r => ({
        rank: r.rank,
        name: r.isMe ? 'You' : (r.name || 'Student'),
        xp: r.xp, streak: r.streak, isYou: r.isMe,
      }))))
      .catch(() => setPlayers([]))
  }, [])

  return (
    <Card>
      <CardHeader icon={<Trophy size={15} />} title="Class Leaderboard" to="/student/leaderboard" nav={nav} />
      <div style={{ padding: '0.75rem 1rem', flex: 1 }}>
        {players === null ? <Spin /> : players.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: B.f600, textAlign: 'center', padding: '1rem 0', margin: 0 }}>
            Complete a quest to appear on the leaderboard!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {players.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 0.65rem',
                background: p.isYou ? '#f0fdf4' : 'transparent',
                border: p.isYou ? '1.5px solid #bbf7d0' : `1px solid ${B.m300}`,
                borderRadius: '0.6rem',
              }}>
                <span style={{ width: 22, textAlign: 'center', fontWeight: 900, fontSize: p.rank <= 3 ? '0.9rem' : '0.72rem', color: RANK_COLORS[p.rank] || '#9ca3af', flexShrink: 0 }}>
                  {p.rank}
                </span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: RANK_COLORS[p.rank] ? `${RANK_COLORS[p.rank]}22` : B.m200, border: `2px solid ${RANK_COLORS[p.rank] || B.m300}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: RANK_COLORS[p.rank] || B.f600, flexShrink: 0 }}>
                  {(p.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontWeight: p.isYou ? 800 : 600, fontSize: '0.8rem', color: B.f900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.78rem', color: p.isYou ? '#16a34a' : B.f800 }}>
                    {p.xp.toLocaleString()} <span style={{ fontWeight: 500, fontSize: '0.6rem', color: B.f400 }}>XP</span>
                  </span>
                  {p.streak > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 1 }}>
                      <Flame size={9} color="#f97316" />
                      <span style={{ fontSize: '0.58rem', color: '#f97316', fontWeight: 700 }}>{p.streak}d</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Achievements card ──────────────────────────────────────────
function AchievementsCard({ nav }) {
  const { earnedBadges, inProgressBadges } = useApp()

  return (
    <Card>
      <CardHeader icon={<Medal size={15} />} title="Achievements" to="/student/achievements" nav={nav} />
      <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {earnedBadges.length === 0 && inProgressBadges.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: B.f600, textAlign: 'center', padding: '0.75rem 0', margin: 0 }}>
            Complete quests to earn your first badge!
          </p>
        ) : (
          <>
            {/* Earned badges row */}
            {earnedBadges.length > 0 && (
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: B.f600, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {earnedBadges.length} earned
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {earnedBadges.slice(0, 6).map(badge => {
                    const c = BADGE_COLORS[badge.id] ?? { bg: '#f8f9ff', border: '#dce9ff' }
                    return (
                      <div key={badge.id} title={badge.name} style={{ width: 44, height: 44, borderRadius: '50%', background: c.bg, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                        {badge.emoji}
                      </div>
                    )
                  })}
                  {earnedBadges.length > 6 && (
                    <button onClick={() => nav('/student/achievements')} style={{ width: 44, height: 44, borderRadius: '50%', background: B.m200, border: `1.5px dashed ${B.m300}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: B.f600, cursor: 'pointer' }}>
                      +{earnedBadges.length - 6}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* In-progress badges */}
            {inProgressBadges.length > 0 && (
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: B.f600, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  In progress
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {inProgressBadges.slice(0, 2).map(badge => {
                    const pct = Math.round((badge.current / badge.target) * 100)
                    const c = BADGE_COLORS[badge.id] ?? { bg: '#f8f9ff', border: '#dce9ff', accent: '#264e3c' }
                    return (
                      <div key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '0.55rem', background: c.bg, border: `1.5px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                          {badge.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.22rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: B.f900 }}>{badge.name}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: B.f600 }}>{badge.current}/{badge.target}</span>
                          </div>
                          <div style={{ height: 4, background: B.m300, borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: c.accent, borderRadius: 2, transition: 'width 0.6s' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

// ── Main dashboard ─────────────────────────────────────────────
export default function StudentDashboard() {
  useHubStyles()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { lang } = useLang()
  const {
    xp, level, streak, totalCo2Saved,
    questAnswers, questCompleted, resetDailyQuest, petHappiness,
  } = useApp()
  const { result: schoolResult } = useSchoolAudit()

  const [view, setView] = useState('home')
  const pet = useTalkingPet()

  useEffect(() => {
    if (view !== 'home') return
    pet.speak(getPetResponse({ questCompleted, questAnswers, petHappiness }, lang))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  function startQuest() {
    primeSpeech()
    pet.idle()
    if (questCompleted) resetDailyQuest()
    setView('quest')
  }

  if (view === 'quest') {
    return (
      <StudentLayout>
        <DailyQuestGame onExit={() => setView('home')} />
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div style={{ width: '100%', padding: isMobile ? '0.875rem' : '1.25rem 1.75rem', boxSizing: 'border-box' }}>

        {/* ── Pet banner ── */}
        <div style={{ background: '#0a1a0f', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.1rem', display: 'flex', alignItems: 'stretch', minHeight: 160 }}>
          {/* Pet visual — narrow sidecar */}
          <div style={{ width: isMobile ? 110 : 180, flexShrink: 0, alignSelf: 'stretch' }}>
            <PetStage state={pet.state} subtitle="" height="100%" rounded="0" confetti={false} style={{ minHeight: 160 }} />
          </div>

          {/* Greeting + stats */}
          <div style={{ flex: 1, padding: isMobile ? '0.875rem 0.875rem 0.875rem 0.75rem' : '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.6rem' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '1rem' : '1.3rem', fontWeight: 900, color: '#eafff2', margin: '0 0 0.2rem', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Hi, I'm Leaf <Leaf size={isMobile ? 16 : 20} color="#6ee7a0" />
              </h1>
              <p style={{ color: '#9fd6b6', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                {pet.subtitle || 'Your eco companion'}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {[
                { label: 'Level', value: level },
                { label: 'XP', value: xp.toLocaleString() },
                { label: 'CO₂ saved', value: `${totalCo2Saved}kg` },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.09)', borderRadius: '0.45rem', padding: '0.28rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#6ee7a0' }}>{s.value}</span>
                  <span style={{ fontSize: '0.58rem', color: '#9fd6b6', fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
              {streak > 0 && (
                <div style={{ background: 'rgba(249,115,22,0.15)', borderRadius: '0.45rem', padding: '0.28rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Flame size={11} color="#f97316" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#fdba74' }}>{streak}d</span>
                  <span style={{ fontSize: '0.58rem', color: '#fdba74', fontWeight: 600 }}>streak</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 2 × 2 card grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
          <QuestCard questCompleted={questCompleted} onStart={startQuest} pet={pet} lang={lang} />
          <LessonsCard nav={navigate} />
          <LeaderboardCard nav={navigate} />
          <AchievementsCard nav={navigate} />
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <Forest3D
            savedCo2Kg={totalCo2Saved}
            emittedCo2Kg={Number(schoolResult?.totalEmissions) || 0}
            width={1800}
            height={1000}
          />
        </div>
      </div>
    </StudentLayout>
  )
}
