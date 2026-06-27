import React from 'react'

export default function InsightCard({ icon, title, text, color, border }) {
  return (
    <div className="rounded-2xl p-5 border-l-4 animate-slide-up" style={{ background: color, borderColor: border }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-bold text-forest-800 mb-1">{title}</h4>
          <p className="text-sm text-forest-600 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}
