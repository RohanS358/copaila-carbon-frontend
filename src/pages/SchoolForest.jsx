import React from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useApp } from '../context/AppContext'
import Forest3D from '../components/Forest3D'

export default function SchoolForest() {
  const { totalCo2Saved, xp, level, streak } = useApp()

  return (
    <StudentLayout>
      <div style={{ width: '100%', padding: '1.25rem 1.5rem 1.5rem', boxSizing: 'border-box' }}>
        <Forest3D
          savedCo2Kg={totalCo2Saved}
          width={2400}
          height={1400}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { label: 'XP', value: xp.toLocaleString() },
            { label: 'Level', value: level },
            { label: 'Streak', value: `${streak}d` },
            { label: 'Saved CO₂', value: `${totalCo2Saved.toFixed(1)} kg` },
          ].map(item => (
            <div key={item.label} style={{ background: '#fff', border: '1.5px solid #e4edd6', borderRadius: '1rem', padding: '0.9rem 1rem' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.35rem' }}>{item.label}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E2F1E', margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
