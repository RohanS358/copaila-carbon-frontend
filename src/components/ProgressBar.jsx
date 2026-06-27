import React from 'react'

export default function ProgressBar({ value, max = 100, color = '#2D4A32', label, showValue = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-semibold text-forest-700">{label}</span>}
          {showValue && <span className="text-sm font-bold" style={{ color }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
