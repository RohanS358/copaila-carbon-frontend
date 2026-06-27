import React, { useState, useEffect, useRef } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import {
  Plus, X, TreePine, Trash2, Bike, Lightbulb, Zap,
  Droplets, CalendarDays, MapPin, Users, Clock,
  CheckCircle2, Search, ChevronDown, Leaf, Star,
  ArrowUpRight, Filter,
} from 'lucide-react'

const B = {
  f900: '#1E2F1E', f800: '#2D4A32', f600: '#4E7D5B',
  f400: '#7BAE7F', m100: '#f5f7ee', m200: '#EEF2DC', m300: '#d8e8c0',
}

// ── Event type config ────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: 'plantation', label: 'Tree Planting',       Icon: TreePine,   bg: '#dcfce7', color: '#15803d', xp: 150 },
  { value: 'cleanup',    label: 'Clean-Up Drive',      Icon: Trash2,     bg: '#dbeafe', color: '#1d4ed8', xp: 100 },
  { value: 'cycle',      label: 'Cycle to School',     Icon: Bike,       bg: '#fff7ed', color: '#c2410c', xp: 200 },
  { value: 'workshop',   label: 'Eco Workshop',        Icon: Lightbulb,  bg: '#fef3c7', color: '#b45309', xp: 75  },
  { value: 'energy',     label: 'Energy Audit',        Icon: Zap,        bg: '#fef3c7', color: '#d97706', xp: 120 },
  { value: 'water',      label: 'Water Conservation',  Icon: Droplets,   bg: '#e0f2fe', color: '#0369a1', xp: 90  },
  { value: 'other',      label: 'Other',               Icon: Leaf,       bg: '#f0fdf4', color: '#16a34a', xp: 60  },
]

function typeOf(value) { return EVENT_TYPES.find(t => t.value === value) || EVENT_TYPES[EVENT_TYPES.length - 1] }

// ── Seed events (shown on first load) ────────────────────────────────────────
const TODAY = new Date()
const daysOut = (n) => new Date(TODAY.getTime() + n * 86400000).toISOString().slice(0, 10)

const SEED = [
  { id: 'seed_1', title: 'School Forest Day', description: 'Plant 100 trees in the campus together! Gloves and saplings provided. Bring enthusiasm and your friends.', date: daysOut(9),  time: '09:00', location: 'School Campus, Block C', type: 'plantation', organizer: 'Eco Club',        organizerId: '__seed__', maxParticipants: 50,  participants: [], xpReward: 150, createdAt: new Date().toISOString() },
  { id: 'seed_2', title: 'Riverside Clean-Up', description: 'Help keep our local river clean. Bags and gloves will be provided. Every piece of trash removed is a win.', date: daysOut(16), time: '07:00', location: 'River Park, Near Chabel', type: 'cleanup',    organizer: 'Green Team',       organizerId: '__seed__', maxParticipants: 30,  participants: [], xpReward: 100, createdAt: new Date().toISOString() },
  { id: 'seed_3', title: 'Cycle to School Week', description: 'Commit to cycling or walking to school for a whole week and track the CO₂ you personally save!', date: daysOut(4),  time: '07:30', location: 'Starts at Ratnapark', type: 'cycle',      organizer: 'Student Council',  organizerId: '__seed__', maxParticipants: 100, participants: [], xpReward: 200, createdAt: new Date().toISOString() },
  { id: 'seed_4', title: 'Solar Energy Workshop', description: 'Learn how solar panels work and calculate your school\'s renewable energy potential. Hands-on kit included.', date: daysOut(22), time: '10:00', location: 'Science Lab, Room 204', type: 'workshop',   organizer: 'Physics Dept',    organizerId: '__seed__', maxParticipants: 25,  participants: [], xpReward: 75,  createdAt: new Date().toISOString() },
  { id: 'seed_5', title: 'Annual Carbon Audit Day', description: 'Students help teachers measure the school\'s carbon footprint. Learn how to read meters and record real data.', date: daysOut(30), time: '11:00', location: 'Admin Block', type: 'energy',     organizer: 'Science Teachers', organizerId: '__seed__', maxParticipants: 20,  participants: [], xpReward: 120, createdAt: new Date().toISOString() },
  { id: 'seed_6', title: 'Rainwater Harvesting Demo', description: 'See how the school\'s new rainwater system works and learn how to build a simple one at home.', date: daysOut(12), time: '14:00', location: 'School Garden', type: 'water',      organizer: 'Eco Club',        organizerId: '__seed__', maxParticipants: 40,  participants: [], xpReward: 90,  createdAt: new Date().toISOString() },
]

const STORAGE_KEY = 'eco_events_v2'
const JOINED_KEY  = 'eco_events_joined_v2'

function loadEvents() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : SEED }
  catch { return SEED }
}
function saveEvents(ev) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ev)) } catch {} }
function loadJoined() { try { const s = localStorage.getItem(JOINED_KEY); return new Set(s ? JSON.parse(s) : []) } catch { return new Set() } }
function saveJoined(set) { try { localStorage.setItem(JOINED_KEY, JSON.stringify([...set])) } catch {} }

// ── Shared UI atoms ───────────────────────────────────────────────────────────
function Tag({ bg, color, children }) {
  return <span style={{ fontSize: '0.64rem', fontWeight: 700, color, background: bg, borderRadius: '1rem', padding: '0.15rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>{children}</span>
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function daysUntil(iso) {
  if (!iso) return null
  const diff = Math.ceil((new Date(iso + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000)
  return diff
}

function spotsLeft(ev) { return Math.max(0, ev.maxParticipants - ev.participants.length) }

// ── Create / Edit modal ───────────────────────────────────────────────────────
const EMPTY_FORM = { title: '', description: '', date: '', time: '09:00', location: '', type: 'plantation', maxParticipants: 30 }

function CreateModal({ onClose, onSave, userId, userName }) {
  const { t } = useLang()
  const [form, setForm] = useState(EMPTY_FORM)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const today = new Date().toISOString().slice(0, 10)
  const type = typeOf(form.type)

  function submit() {
    if (!form.title.trim()) return setErr('Title is required.')
    if (!form.date) return setErr('Date is required.')
    if (form.date < today) return setErr('Event date must be in the future.')
    if (!form.location.trim()) return setErr('Location is required.')
    setErr('')
    const id = 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    onSave({
      id, ...form, title: form.title.trim(), description: form.description.trim(),
      location: form.location.trim(), maxParticipants: Number(form.maxParticipants) || 30,
      xpReward: type.xp, organizer: userName || 'You', organizerId: userId,
      participants: [userId], createdAt: new Date().toISOString(),
    })
  }

  const inp = {
    width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #d1d5db',
    borderRadius: '0.6rem', fontSize: '0.84rem', color: B.f900,
    background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const lbl = { display: 'block', fontWeight: 700, fontSize: '0.76rem', color: B.f900, marginBottom: '0.3rem' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,15,0.5)', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.1rem', color: B.f900, margin: 0 }}>{t('Create Event')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 4 }}><X size={20} /></button>
        </div>

        {err && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.65rem', padding: '0.6rem 0.9rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.8rem' }}>{err}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={lbl}>{t('Event Title')}</label>
            <input style={inp} placeholder="e.g. School Clean-Up Drive" value={form.title} onChange={e => set('title', e.target.value)} maxLength={80} />
          </div>

          <div>
            <label style={lbl}>{t('Event Type')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.4rem' }}>
              {EVENT_TYPES.map(tp => {
                const active = form.type === tp.value
                return (
                  <button key={tp.value} onClick={() => set('type', tp.value)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.65rem',
                    border: `1.5px solid ${active ? B.f800 : '#dce9ff'}`, borderRadius: '0.55rem',
                    background: active ? B.m200 : '#fff', cursor: 'pointer',
                    fontSize: '0.74rem', fontWeight: active ? 700 : 500, color: active ? B.f900 : '#6b7280',
                  }}>
                    <tp.Icon size={13} style={{ color: tp.color }} /> {tp.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label style={lbl}>{t('Description')}</label>
            <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="What will participants do? Why does it matter?" value={form.description} onChange={e => set('description', e.target.value)} maxLength={500} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={lbl}>{t('Date')}</label>
              <input type="date" style={inp} min={today} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>{t('Time')}</label>
              <input type="time" style={inp} value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={lbl}>{t('Location')}</label>
            <input style={inp} placeholder="e.g. School courtyard, Ground floor" value={form.location} onChange={e => set('location', e.target.value)} maxLength={100} />
          </div>

          <div>
            <label style={lbl}>{t('Max Participants')}</label>
            <input type="number" min={2} max={500} style={inp} value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} />
          </div>

          <div style={{ background: B.m100, borderRadius: '0.65rem', padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={14} color="#b45309" fill="#b45309" />
            <span style={{ fontSize: '0.76rem', color: B.f800, fontWeight: 600 }}>
              Participants earn <strong>{type.xp} XP</strong> for joining this {type.label.toLowerCase()} event.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', border: `1.5px solid ${B.m300}`, borderRadius: '0.75rem', background: '#fff', color: B.f600, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}>{t('Cancel')}</button>
          <button onClick={submit} style={{ flex: 2, padding: '0.7rem', border: 'none', borderRadius: '0.75rem', background: B.f800, color: '#EEF2DC', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}>
            {t('Create Event')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Event detail modal ────────────────────────────────────────────────────────
function DetailModal({ event, joined, onClose, onJoin, onLeave, userId }) {
  const { t } = useLang()
  const tp = typeOf(event.type)
  const isOwn = event.organizerId === userId
  const isFull = spotsLeft(event) === 0 && !joined
  const days = daysUntil(event.date)
  const past = days < 0

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,15,0.5)', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 42, height: 42, background: tp.bg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <tp.Icon size={22} color={tp.color} />
            </div>
            <div>
              <Tag bg={tp.bg} color={tp.color}><tp.Icon size={10} />{tp.label}</Tag>
              {past && <Tag bg="#fee2e2" color="#b91c1c">Past Event</Tag>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 4 }}><X size={20} /></button>
        </div>

        <h2 style={{ fontWeight: 900, fontSize: '1.15rem', color: B.f900, margin: '0 0 0.75rem' }}>{event.title}</h2>
        <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.7, margin: '0 0 1.25rem' }}>{event.description || 'No description provided.'}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.25rem' }}>
          {[
            { icon: <CalendarDays size={14} />, text: `${fmtDate(event.date)} at ${event.time}` },
            { icon: <MapPin size={14} />,       text: event.location },
            { icon: <Users size={14} />,        text: `${event.participants.length} joined · ${spotsLeft(event)} spots left (max ${event.maxParticipants})` },
            { icon: <Star size={14} color="#b45309" />, text: `+${event.xpReward} XP for participants` },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: B.f600 }}>
              <span style={{ color: B.f400, flexShrink: 0 }}>{icon}</span> {text}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: B.f600 }}>
            <span style={{ color: B.f400, flexShrink: 0 }}><Leaf size={14} /></span>
            Organized by <strong style={{ color: B.f900, marginLeft: 3 }}>{event.organizer}</strong>
            {days === 0 && <Tag bg="#fef3c7" color="#b45309"><Clock size={10} />Today!</Tag>}
            {days > 0 && <Tag bg={B.m200} color={B.f600}><Clock size={10} />{days}d away</Tag>}
          </div>
        </div>

        {/* Participants bar */}
        <div style={{ background: B.m100, borderRadius: '0.65rem', padding: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: B.f800, marginBottom: '0.4rem' }}>
            <span>Participation</span>
            <span>{event.participants.length}/{event.maxParticipants}</span>
          </div>
          <div style={{ height: 8, background: B.m300, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (event.participants.length / event.maxParticipants) * 100)}%`, height: '100%', background: B.f600, borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        </div>

        {!past && (
          joined ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.75rem', padding: '0.65rem 0.9rem' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>You're joining this event — see you there!</span>
              </div>
              {!isOwn && (
                <button onClick={onLeave} style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #fca5a5', borderRadius: '0.75rem', background: '#fff', color: '#b91c1c', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  Leave Event
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={isFull ? undefined : onJoin}
              style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '0.75rem', background: isFull ? '#e5e7eb' : B.f800, color: isFull ? '#6b7280' : '#EEF2DC', fontWeight: 800, fontSize: '0.88rem', cursor: isFull ? 'not-allowed' : 'pointer' }}
            >
              {isFull ? 'Event Full' : `Join Event · +${event.xpReward} XP`}
            </button>
          )
        )}
        {past && (
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', padding: '0.5rem' }}>This event has already taken place.</div>
        )}
      </div>
    </div>
  )
}

// ── Single event card ─────────────────────────────────────────────────────────
function EventCard({ event, joined, isOwn, onClick }) {
  const tp = typeOf(event.type)
  const days = daysUntil(event.date)
  const past = days < 0
  const spots = spotsLeft(event)

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: `1.5px solid ${joined ? '#86efac' : B.m300}`,
        borderRadius: '1rem', padding: '1rem 1.1rem', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        transition: 'box-shadow 0.15s, transform 0.15s', opacity: past ? 0.65 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(30,47,30,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <div style={{ width: 38, height: 38, background: tp.bg, borderRadius: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <tp.Icon size={19} color={tp.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: '0.88rem', color: B.f900, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 3, flexWrap: 'wrap' }}>
            <Tag bg={tp.bg} color={tp.color}><tp.Icon size={9} />{tp.label}</Tag>
            {joined && <Tag bg="#dcfce7" color="#15803d"><CheckCircle2 size={9} />Joined</Tag>}
            {isOwn  && <Tag bg={B.m200}   color={B.f600}><Star size={9} />Yours</Tag>}
            {past   && <Tag bg="#f3f4f6" color="#6b7280">Past</Tag>}
          </div>
        </div>
        <ArrowUpRight size={15} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: B.f600 }}>
          <CalendarDays size={12} color={B.f400} />
          {fmtDate(event.date)} · {event.time}
          {!past && days === 0 && <span style={{ fontWeight: 800, color: '#b45309' }}>Today!</span>}
          {!past && days > 0  && <span style={{ color: '#9ca3af' }}>{days}d away</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: B.f600 }}>
          <MapPin size={12} color={B.f400} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{event.location}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: `1px solid ${B.m300}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#6b7280' }}>
          <Users size={11} color={B.f400} />
          <span>{event.participants.length}/{event.maxParticipants}</span>
          {spots > 0 && !past && <span style={{ color: spots < 5 ? '#b45309' : B.f600 }}>{spots < 5 ? `· Only ${spots} left!` : `· ${spots} open`}</span>}
          {spots === 0 && !joined && <span style={{ color: '#b91c1c', fontWeight: 700 }}>· Full</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>
          <Star size={11} fill="#b45309" color="#b45309" /> +{event.xpReward} XP
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Events() {
  const isMobile = useIsMobile()
  const { t } = useLang()
  const { user } = useAuth()
  const { addXp } = useApp() // may or may not exist — guarded below

  const userId   = user?.id || user?.uid || 'guest'
  const userName = user?.name || 'You'

  const [events,   setEvents]   = useState(loadEvents)
  const [joined,   setJoined]   = useState(loadJoined)
  const [filter,   setFilter]   = useState('all')   // 'all'|'joined'|'mine'|type value
  const [search,   setSearch]   = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)    // event being viewed in detail
  const [toast,    setToast]    = useState(null)     // { text, xp }
  const toastTimer = useRef(null)

  // Persist on change
  useEffect(() => { saveEvents(events) }, [events])
  useEffect(() => { saveJoined(joined) }, [joined])

  function showToast(text, xp = 0) {
    setToast({ text, xp })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  function handleJoin(ev) {
    setEvents(prev => prev.map(e => e.id === ev.id
      ? { ...e, participants: [...e.participants, userId] }
      : e
    ))
    setJoined(prev => new Set([...prev, ev.id]))
    if (typeof addXp === 'function') addXp(ev.xpReward)
    showToast(`Joined "${ev.title}"`, ev.xpReward)
    setSelected(s => s ? { ...s, participants: [...s.participants, userId] } : s)
  }

  function handleLeave(ev) {
    setEvents(prev => prev.map(e => e.id === ev.id
      ? { ...e, participants: e.participants.filter(id => id !== userId) }
      : e
    ))
    setJoined(prev => { const n = new Set(prev); n.delete(ev.id); return n })
    showToast(`Left "${ev.title}"`)
    setSelected(s => s ? { ...s, participants: s.participants.filter(id => id !== userId) } : s)
  }

  function handleCreate(ev) {
    setEvents(prev => [ev, ...prev])
    setJoined(prev => new Set([...prev, ev.id]))
    setShowCreate(false)
    showToast(`Created "${ev.title}"`, ev.xpReward)
  }

  // Derived lists
  const now = new Date().toISOString().slice(0, 10)
  const filtered = events.filter(ev => {
    const q = search.toLowerCase()
    const matchSearch = !q || ev.title.toLowerCase().includes(q) || ev.location.toLowerCase().includes(q) || ev.organizer.toLowerCase().includes(q)
    if (!matchSearch) return false
    if (filter === 'joined') return joined.has(ev.id)
    if (filter === 'mine')   return ev.organizerId === userId
    if (filter === 'upcoming') return ev.date >= now
    const tp = EVENT_TYPES.find(t => t.value === filter)
    if (tp) return ev.type === filter
    return true
  }).sort((a, b) => a.date.localeCompare(b.date))

  const myJoinedEvents = events.filter(e => joined.has(e.id) && e.date >= now).sort((a,b) => a.date.localeCompare(b.date))
  const upcoming = events.filter(e => e.date >= now)
  const joinedCount = [...joined].filter(id => events.find(e => e.id === id)).length

  // ── Filter chips ──
  const FILTER_OPTS = [
    { value: 'all',      label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'joined',   label: `Joined (${joinedCount})` },
    { value: 'mine',     label: 'My Events' },
    ...EVENT_TYPES.map(tp => ({ value: tp.value, label: tp.label })),
  ]

  const filterChip = (opt) => (
    <button
      key={opt.value}
      onClick={() => setFilter(opt.value)}
      style={{
        padding: '0.38rem 0.75rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700,
        border: `1.5px solid ${filter === opt.value ? B.f800 : B.m300}`,
        background: filter === opt.value ? B.f800 : '#fff',
        color: filter === opt.value ? '#EEF2DC' : B.f600,
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}
    >
      {t(opt.label)}
    </button>
  )

  return (
    <StudentLayout>
      <div style={{ width: '100%', padding: isMobile ? '0.875rem' : '1.25rem 1.75rem', boxSizing: 'border-box' }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: B.f800, color: '#EEF2DC', borderRadius: '2rem', padding: '0.65rem 1.25rem', zIndex: 300, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 4px 24px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', animation: 'fadeInUp 0.25s ease' }}>
            <CheckCircle2 size={15} color="#86efac" />
            {toast.text}
            {toast.xp > 0 && <span style={{ background: '#16a34a', color: '#fff', borderRadius: '1rem', padding: '0.1rem 0.5rem', marginLeft: 4 }}>+{toast.xp} XP</span>}
          </div>
        )}

        {/* Desktop: 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* ── LEFT SIDEBAR ── */}
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '4rem' }}>

              {/* Create event CTA */}
              <button
                onClick={() => setShowCreate(true)}
                style={{ width: '100%', background: B.f800, color: '#EEF2DC', border: 'none', borderRadius: '0.875rem', padding: '0.8rem 1rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> {t('Create Event')}
              </button>

              {/* Stats card */}
              <div style={{ background: '#fff', border: `1.5px solid ${B.m300}`, borderRadius: '1rem', padding: '1rem' }}>
                <p style={{ fontWeight: 800, fontSize: '0.8rem', color: B.f900, marginBottom: '0.75rem' }}>{t('Your Activity')}</p>
                {[
                  { label: 'Events Joined',   value: joinedCount },
                  { label: 'Events Created',  value: events.filter(e => e.organizerId === userId).length },
                  { label: 'Upcoming Events', value: upcoming.length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: `1px solid ${B.m100}`, fontSize: '0.78rem' }}>
                    <span style={{ color: B.f600 }}>{t(label)}</span>
                    <span style={{ fontWeight: 800, color: B.f900 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* My upcoming events */}
              {myJoinedEvents.length > 0 && (
                <div style={{ background: '#fff', border: `1.5px solid ${B.m300}`, borderRadius: '1rem', padding: '1rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.8rem', color: B.f900, marginBottom: '0.75rem' }}>{t("Events I'm Joining")}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {myJoinedEvents.slice(0, 4).map(ev => {
                      const tp = typeOf(ev.type)
                      return (
                        <div key={ev.id} onClick={() => setSelected(ev)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.35rem 0' }}>
                          <div style={{ width: 28, height: 28, background: tp.bg, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <tp.Icon size={13} color={tp.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.74rem', fontWeight: 700, color: B.f900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                            <p style={{ margin: 0, fontSize: '0.64rem', color: B.f400 }}>{fmtDate(ev.date)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Filter */}
              <div style={{ background: '#fff', border: `1.5px solid ${B.m300}`, borderRadius: '1rem', padding: '1rem' }}>
                <p style={{ fontWeight: 800, fontSize: '0.8rem', color: B.f900, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Filter size={13} />{t('Filter')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {FILTER_OPTS.map(opt => (
                    <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
                      textAlign: 'left', padding: '0.42rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.77rem', fontWeight: filter === opt.value ? 700 : 500,
                      border: 'none', background: filter === opt.value ? B.m200 : 'transparent',
                      color: filter === opt.value ? B.f900 : B.f600, cursor: 'pointer',
                    }}>
                      {t(opt.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RIGHT: MAIN CONTENT ── */}
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem', marginBottom: '1.1rem' }}>
              <div>
                <h1 style={{ fontWeight: 900, fontSize: isMobile ? '1.2rem' : '1.35rem', color: B.f900, margin: '0 0 0.2rem' }}>{t('Eco Events')}</h1>
                <p style={{ fontSize: '0.76rem', color: B.f400, margin: 0 }}>{t('Join or organise carbon-neutral events in your community')}</p>
              </div>
              {isMobile && (
                <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: B.f800, color: '#EEF2DC', border: 'none', borderRadius: '0.75rem', padding: '0.6rem 1rem', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <Plus size={15} /> {t('Create')}
                </button>
              )}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '0.875rem' }}>
              <Search size={15} color={B.f400} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder={t('Search events, locations…')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', border: `1.5px solid ${B.m300}`, borderRadius: '0.75rem', fontSize: '0.82rem', color: B.f900, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><X size={14} /></button>}
            </div>

            {/* Mobile filter chips (horizontal scroll) */}
            {isMobile && (
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.875rem', scrollbarWidth: 'none' }}>
                {FILTER_OPTS.map(filterChip)}
              </div>
            )}

            {/* Results count */}
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.75rem' }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} {filter !== 'all' ? `· ${FILTER_OPTS.find(o => o.value === filter)?.label || ''}` : ''}
              {search && ` · "${search}"`}
            </p>

            {/* Event grid */}
            {filtered.length === 0 ? (
              <div style={{ background: '#fff', border: `1.5px solid ${B.m300}`, borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center' }}>
                <Leaf size={40} color={B.m300} style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 800, fontSize: '0.95rem', color: B.f900, margin: '0 0 0.35rem' }}>{t('No events found')}</p>
                <p style={{ fontSize: '0.78rem', color: B.f400, margin: '0 0 1.25rem' }}>{search ? 'Try a different search term.' : 'Be the first to organise something!'}</p>
                <button onClick={() => setShowCreate(true)} style={{ background: B.f800, color: '#EEF2DC', border: 'none', borderRadius: '0.75rem', padding: '0.65rem 1.25rem', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={14} /> {t('Create an Event')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
                {filtered.map(ev => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    joined={joined.has(ev.id)}
                    isOwn={ev.organizerId === userId}
                    onClick={() => setSelected(ev)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
          userId={userId}
          userName={userName}
        />
      )}
      {selected && (
        <DetailModal
          event={selected}
          joined={joined.has(selected.id)}
          onClose={() => setSelected(null)}
          onJoin={() => handleJoin(selected)}
          onLeave={() => handleLeave(selected)}
          userId={userId}
        />
      )}

      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </StudentLayout>
  )
}
