import React from 'react'

export default function StatCard({ icon, label, value, sub, color = '#2D4A32', bg = '#f5f7ee' }) {
  return (
    <div className="card flex items-start gap-4 animate-slide-up">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-forest-500 font-semibold">{label}</p>
        <p className="text-2xl font-display" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-forest-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
