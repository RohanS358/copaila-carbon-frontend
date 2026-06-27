import React from 'react'

const priorityColors = {
  High: { bg: '#fee2e2', text: '#dc2626' },
  Medium: { bg: '#fef3c7', text: '#d97706' },
  Low: { bg: '#d1fae5', text: '#059669' },
}

export default function RecommendationCard({ icon, title, text, priority }) {
  const c = priorityColors[priority] || priorityColors.Low
  return (
    <div className="card flex gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-bold text-forest-800">{title}</h4>
          <span className="badge text-xs flex-shrink-0" style={{ background: c.bg, color: c.text }}>
            {priority}
          </span>
        </div>
        <p className="text-sm text-forest-600 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
