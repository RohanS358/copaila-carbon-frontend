import React from 'react'

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="mb-5">
        <h3 className="font-display text-xl text-forest-800">{title}</h3>
        {subtitle && <p className="text-sm text-forest-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
