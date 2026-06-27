import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { pets } from '../data/schools'
import { petImg, evolutionImgs } from '../data/petImages'
import StudentLayout from '../layouts/StudentLayout'
import { useIsMobile } from '../hooks/useMediaQuery'

const UNLOCKED = new Set(['penguin', 'panda'])

// Unlocked pets first, then locked — within each group preserve original order
const sortedPets = [
  ...pets.filter(p => UNLOCKED.has(p.id)),
  ...pets.filter(p => !UNLOCKED.has(p.id)),
]

// ── Pet selection screen ───────────────────────────────────
function PetSelectScreen({ onSelect }) {
  const [chosen, setChosen] = useState(null)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const chosenPet = sortedPets.find(p => p.id === chosen)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9ff',
      padding: '2rem 1.5rem 3rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Google Sans', sans-serif",
    }}>
      {/* Back */}
      <div style={{ width: '100%', maxWidth: 1000, marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'transparent', border: 'none', color: '#264e3c', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          ← Back
        </button>
      </div>

      {/* ── Pet selection card ──────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 1000,
        borderRadius: '1.25rem',
        background: '#ffffff',
        border: '2px solid #85b098',
        padding: isMobile ? '1.5rem 1.1rem' : '2.5rem 2.25rem 2.25rem',
      }}>

        {/* Title + subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#e5eeff', border: '1px solid #c5d9a0', borderRadius: '2rem', padding: '0.32rem 1.1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1rem' }}>🌿</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#002d1c', letterSpacing: '0.08em' }}>ECO COMPANIONS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.7rem,3.5vw,2.5rem)', fontWeight: 900, margin: '0 0 0.6rem', color: '#002114', lineHeight: 1.2 }}>
            Choose Your Eco Companion
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#002114', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            Your companion grows as you make greener choices. Penguin and Panda are ready to join your journey — more friends unlock soon!
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 2, background: '#d8e8c0', marginBottom: '2rem', borderRadius: 1 }} />

        {/* Pet grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '1.25rem' }}>
          {sortedPets.map(p => {
            const unlocked = UNLOCKED.has(p.id)
            const isChosen = chosen === p.id
            return (
              <PetCard
                key={p.id}
                pet={p}
                unlocked={unlocked}
                chosen={isChosen}
                onChoose={() => unlocked && setChosen(isChosen ? null : p.id)}
                onSelect={() => unlocked && onSelect(p.id)}
              />
            )
          })}
        </div>

        {/* Confirm strip */}
        {chosen && (
          <div style={{
            marginTop: '2rem',
            background: '#f8f9ff',
            border: '1.5px solid #bbf7d0',
            borderRadius: '1.25rem',
            padding: '1.1rem 1.5rem',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', border: '2px solid #85b098', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={petImg[chosen]} alt={chosenPet?.name} style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#002114', margin: 0 }}>{chosenPet?.name} selected</p>
                <p style={{ fontSize: '0.72rem', color: '#264e3c', margin: 0 }}>{chosenPet?.specialPower}</p>
              </div>
            </div>
            <button
              onClick={() => onSelect(chosen)}
              style={{
                background: '#002d1c', color: '#e5eeff', border: 'none',
                borderRadius: '2rem', padding: '0.75rem 2.25rem',
                fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.15s',
              }}
            >
              Let's Go! 🌿
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Individual pet card ────────────────────────────────────
function PetCard({ pet, unlocked, chosen, onChoose, onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onChoose}
      style={{
        background: chosen ? '#f8f9ff' : hovered && unlocked ? '#fafffe' : '#fff',
        border: `2px solid ${chosen ? '#002d1c' : hovered && unlocked ? '#85b098' : '#dce9ff'}`,
        borderRadius: '1.25rem',
        padding: '1.25rem 1rem 1rem',
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(.34,1.2,.64,1)',
        position: 'relative', overflow: 'hidden',
        transform: hovered && unlocked ? 'scale(1.03)' : 'scale(1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Chosen glow ring */}
      {chosen && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '1.25rem', border: '2px solid #264e3c', opacity: 0.4, pointerEvents: 'none' }} />
      )}

      {/* Status badge */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        fontSize: '0.58rem', fontWeight: 800,
        background: unlocked ? '#d1fae5' : '#FEF3C7',
        color: unlocked ? '#166534' : '#92400e',
        border: `1px solid ${unlocked ? '#86efac' : '#fcd34d'}`,
        borderRadius: '1rem', padding: '0.14rem 0.55rem',
      }}>
        {unlocked ? '✅ Available' : '🔒 Coming Soon'}
      </div>

      {/* Pet image area */}
      <div style={{
        height: 140,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '0.9rem',
        background: chosen ? '#dcfce7' : '#f8f9ff',
        borderRadius: '0.875rem',
        overflow: 'hidden',
        transition: 'background 0.2s',
      }}>
        <img
          src={petImg[pet.id]}
          alt={pet.name}
          style={{ height: '88%', maxWidth: '78%', objectFit: 'contain', transition: 'transform 0.2s', transform: hovered && unlocked ? 'scale(1.06)' : 'scale(1)' }}
        />
      </div>

      {/* Name + type */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '0.4rem' }}>
        <h3 style={{ fontWeight: 900, fontSize: '0.98rem', color: '#002114', margin: 0 }}>{pet.name}</h3>
        <span style={{
          fontSize: '0.58rem', fontWeight: 700, flexShrink: 0,
          background: '#e5eeff', color: '#002d1c',
          border: '1px solid #c5d9a0',
          borderRadius: '1rem', padding: '0.14rem 0.55rem',
        }}>{pet.type}</span>
      </div>

      <p style={{ fontSize: '0.74rem', color: '#264e3c', lineHeight: 1.55, flex: 1, margin: '0 0 1rem' }}>
        {pet.description}
      </p>

      {/* Abilities row */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        {(pet.abilities ?? []).map((ab, i) => (
          <span key={i} style={{ fontSize: '0.6rem', fontWeight: 700, background: '#f8f9ff', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.18rem 0.5rem' }}>
            {i === 0 ? '⚡' : '🛡️'} {ab}
          </span>
        ))}
      </div>

      {/* Action button */}
      {unlocked ? (
        <button
          onClick={e => { e.stopPropagation(); onSelect() }}
          style={{
            background: chosen ? '#002d1c' : '#e5eeff',
            color: chosen ? '#e5eeff' : '#002114',
            border: `1.5px solid ${chosen ? '#002d1c' : '#c5d9a0'}`,
            borderRadius: '0.75rem', padding: '0.65rem',
            fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
            transition: 'all 0.15s', width: '100%',
            letterSpacing: '0.01em',
          }}
        >
          {chosen ? `✓ Selected — Let's Go!` : `Choose ${pet.name}`}
        </button>
      ) : (
        <button disabled style={{
          background: '#FEF3C7',
          color: '#92400e', border: '1.5px solid #fcd34d',
          borderRadius: '0.75rem', padding: '0.65rem',
          fontWeight: 700, fontSize: '0.8rem', cursor: 'not-allowed',
          width: '100%',
        }}>
          🔒 Unlocking Soon
        </button>
      )}
    </div>
  )
}

// ── Main: pet detail view ──────────────────────────────────
export default function PetRPG() {
  const { selectedPet, setSelectedPet, petHappiness, petStage, xp, level } = useApp()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  if (!selectedPet) {
    return <PetSelectScreen onSelect={id => { setSelectedPet(id); navigate('/student') }} />
  }

  const pet    = pets.find(p => p.id === selectedPet)
  const evImgs = evolutionImgs[selectedPet] || []

  return (
    <StudentLayout>
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem', maxWidth: 900 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002114', margin: 0 }}>My Pet</h1>
          <p style={{ color: '#264e3c', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>Your eco companion grows as you make greener choices</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
          {/* Current pet */}
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '2px solid #002d1c', padding: '1.5rem', textAlign: 'center' }}>
            <img src={petImg[selectedPet]} alt={pet?.name} style={{ width: 140, height: 140, objectFit: 'contain', margin: '0 auto 1rem' }} />
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#002114', margin: '0 0 0.25rem' }}>{pet?.name}</h2>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#d1fae5', color: '#065f46', borderRadius: '1rem', padding: '0.2rem 0.75rem' }}>{pet?.type}</span>
            <p style={{ fontSize: '0.8rem', color: '#264e3c', margin: '0.75rem 0', lineHeight: 1.6 }}>{pet?.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: '#264e3c', marginBottom: 3 }}>
                  <span>❤️ Happiness</span><span>{petHappiness}%</span>
                </div>
                <div style={{ height: 7, background: '#dce9ff', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${petHappiness}%`, height: '100%', background: '#22c55e', borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9ff', borderRadius: '0.5rem', padding: '0.45rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, color: '#002114' }}>
                <span>⭐ Level</span><span style={{ color: '#002d1c' }}>{level}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9ff', borderRadius: '0.5rem', padding: '0.45rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, color: '#002114' }}>
                <span>🌱 Total XP</span><span style={{ color: '#002d1c' }}>{xp.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPet(null)}
              style={{ marginTop: '1rem', background: 'transparent', border: '1.5px solid #dce9ff', borderRadius: '0.65rem', padding: '0.5rem 1rem', fontSize: '0.78rem', color: '#264e3c', cursor: 'pointer', fontWeight: 600 }}
            >
              Change Pet
            </button>
          </div>

          {/* Evolution */}
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1.5px solid #dce9ff', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#002114', margin: '0 0 1rem' }}>Evolution Path</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(pet?.evolutionStages ?? ['Sprout', 'Grow', 'Flourish']).map((stage, i) => {
                const unlocked = i + 1 <= petStage
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: unlocked ? 1 : 0.45 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${unlocked ? '#002d1c' : '#dce9ff'}`, background: '#f8f9ff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={evImgs[i] || petImg[selectedPet]} alt={stage} style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#002114', margin: 0 }}>Stage {i + 1}: {stage}</p>
                      <p style={{ fontSize: '0.72rem', color: '#85b098', margin: '0.15rem 0 0' }}>
                        {unlocked ? '✅ Unlocked' : `Unlock at Stage ${i + 1}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: '1.25rem', background: '#f8f9ff', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#264e3c', margin: '0 0 0.3rem' }}>Special Power</p>
              <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#002114', margin: 0 }}>⚡ {pet?.specialPower}</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
