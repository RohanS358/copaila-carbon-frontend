import React from 'react'
import { Check } from 'lucide-react'

export default function PetCard({ pet, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pet)}
      className={`relative w-full text-left rounded-3xl border-3 p-5 transition-all duration-300 hover:-translate-y-1 ${
        selected
          ? 'border-forest-700 shadow-xl scale-105'
          : 'border-mint-200 bg-white hover:border-mint-400 hover:shadow-lg'
      }`}
      style={selected ? { background: pet.bgColor, borderColor: pet.color } : {}}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white"
          style={{ background: pet.color }}>
          <Check size={14} />
        </div>
      )}
      <div className="text-5xl mb-3 animate-float">{pet.emoji}</div>
      <h3 className="font-display text-xl text-forest-800">{pet.name}</h3>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: pet.color }}>{pet.species}</p>
      <p className="text-sm text-forest-600 leading-relaxed">{pet.storyline}</p>
      <div className="mt-3 flex gap-2 flex-wrap">
        <span className="badge text-xs" style={{ background: pet.bgColor, color: pet.color }}>
          🏔️ {pet.habitat}
        </span>
        <span className="badge text-xs" style={{ background: pet.bgColor, color: pet.color }}>
          ✨ {pet.specialPower}
        </span>
      </div>
    </button>
  )
}
