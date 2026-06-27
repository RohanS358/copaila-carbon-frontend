import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, Plus, Trash2,
  School, Zap, Sun, Flame, Truck, Bus,
  FileText, UtensilsCrossed, Droplets, Leaf,
  MapPin, AlertTriangle, TreePine, Car, Bike, PersonStanding,
  SlidersHorizontal, Download, Upload as UploadIcon, X,
} from 'lucide-react'
import { carbonApi } from '../services/api'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useLang } from '../context/LanguageContext'

// ============================================================
// SCHOOL DATA ENTRY — Annual Carbon Audit form.
//
// Every duration-based field is captured as a { value, period } pair.
// `annualize()` normalises each entry to an ANNUAL figure before it is
// handed to the existing tier-aware calculation engine — so the engine,
// the DTO and the database schema all stay exactly as they were.
//   100 L / month → 1200 L / yr     50 kg / week → 2600 kg / yr
// ============================================================

const inputStyle = { width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #d1d5db', borderRadius: '0.6rem', fontSize: '0.85rem', color: '#002114', background: '#fff', outline: 'none', boxSizing: 'border-box' }

// ── Period options + normalisation factors (→ per year) ──
const PERIODS = [
  { value: 'day',     label: 'Per Day',     factor: 365 },
  { value: 'week',    label: 'Per Week',    factor: 52 },
  { value: 'month',   label: 'Per Month',   factor: 12 },
  { value: 'quarter', label: 'Per Quarter', factor: 4 },
  { value: 'year',    label: 'Per Year',    factor: 1 },
]
const PERIOD_FACTOR = PERIODS.reduce((m, p) => ({ ...m, [p.value]: p.factor }), {})

const n = v => (v === '' || v === undefined || v === null ? undefined : Number(v))
// value + period → annual number (undefined when blank)
const annualize = (v, p) => { const x = n(v); return x === undefined ? undefined : x * (PERIOD_FACTOR[p] || 1) }

// Conversion constants (documented) used only to feed the EXISTING engine,
// which already works in annual measured units.
const LPG_LITRES_PER_CYLINDER = 26.3 // 14.2 kg cylinder ÷ 0.54 kg/L density
const NPR_PER_KWH             = 13   // approx NEA domestic tariff → kWh from a bill
const REAM_KG                = 2.5  // 1 ream A4 80gsm ≈ 2.5 kg
const TEXTBOOK_KG            = 0.5  // average school textbook

const OPTIONAL_HINT = 'Optional — leave blank if unknown.'
const DRAFT_KEY = 'auditDraft'

// Scope-1 fuel combustion factors (kg CO2e per litre) — mirror of the
// backend emission-factors config (IPCC 2006). Used only for the live
// per-vehicle estimate shown in the form; the backend recalculates
// authoritatively on submit.
const DIESEL_FACTOR = 2.68
const PETROL_FACTOR = 2.31

// Vehicle types selectable for the owned/operated fleet. Each maps to the
// fuel it typically runs on, so the correct combustion factor is applied to
// the fuel entered below. (Selecting a type auto-fills its usual fuel; the
// fuel can still be changed per vehicle.)
const VEHICLE_TYPES = [
  { value: 'School Bus',       fuel: 'diesel' },
  { value: 'Van / Mini Van',   fuel: 'diesel' },
  { value: 'Car / Jeep',       fuel: 'diesel' },
  { value: 'Microbus / Tempo', fuel: 'diesel' },
  { value: 'Truck / Lorry',    fuel: 'diesel' },
  { value: 'Tractor',          fuel: 'diesel' },
  { value: 'Motorcycle',       fuel: 'petrol' },
  { value: 'Other',            fuel: 'diesel' },
]

// Default fleet rows for the School Transportation section.
const DEFAULT_VEHICLES = [
  { type: 'School Bus',     count: '', fuel: 'diesel', litres: '', litresP: 'year' },
  { type: 'Van / Mini Van', count: '', fuel: 'diesel', litres: '', litresP: 'year' },
  { type: 'Car / Jeep',     count: '', fuel: 'diesel', litres: '', litresP: 'year' },
  { type: 'Motorcycle',     count: '', fuel: 'petrol', litres: '', litresP: 'year' },
]

// Student commuting modes (Scope 3). `mode` matches the engine's CommuteMode
// keys; `factor` is the per-passenger-km emission factor used only for the
// live in-form estimate (the backend recalculates authoritatively).
const COMMUTE_MODES = [
  { mode: 'walk',      label: 'Walking / Cycling',     factor: 0,     needsKm: false },
  { mode: 'schoolBus', label: 'School Bus',            factor: 0.027, needsKm: true  },
  { mode: 'publicBus', label: 'Public Bus / Microbus', factor: 0.089, needsKm: true  },
  { mode: 'motorbike', label: 'Motorcycle',            factor: 0.113, needsKm: true  },
  { mode: 'car',       label: 'Car / Jeep',            factor: 0.171, needsKm: true  },
]
const COMMUTE_ICON = {
  walk: <PersonStanding size={18} color="#4E7D5B" />,
  schoolBus: <Bus size={18} color="#4E7D5B" />,
  publicBus: <Bus size={18} color="#4E7D5B" />,
  motorbike: <Bike size={18} color="#4E7D5B" />,
  car: <Car size={18} color="#4E7D5B" />,
}
// The engine uses a fixed 200 school days/yr for commute; mirror it here so the
// live estimate matches the backend result.
const COMMUTE_SCHOOL_DAYS = 200
const COMMUTE_FACTOR = COMMUTE_MODES.reduce((m, c) => ({ ...m, [c.mode]: c.factor }), {})

// ── Custom Emission Factors ──────────────────────────────────────────────────
// Mirrors the backend emission-factors.config.ts table. Used only to render
// the custom-factors panel; the engine always recalculates authoritatively.
const FACTORS_META = [
  { key: 'gridElectricity',  label: 'Grid Electricity',         unit: 'kWh',           scope: 'scope2', default: 0.0198,    group: 'Electricity' },
  { key: 'dieselCombustion', label: 'Diesel',                   unit: 'litre',         scope: 'scope1', default: 2.68,      group: 'Fuel' },
  { key: 'petrolCombustion', label: 'Petrol',                   unit: 'litre',         scope: 'scope1', default: 2.31,      group: 'Fuel' },
  { key: 'lpg',              label: 'LPG',                      unit: 'litre',         scope: 'scope1', default: 1.61,      group: 'Fuel' },
  { key: 'firewood',         label: 'Firewood',                 unit: 'kg',            scope: 'scope1', default: 1.88,      group: 'Fuel' },
  { key: 'charcoal',         label: 'Charcoal',                 unit: 'kg',            scope: 'scope1', default: 3.49,      group: 'Fuel' },
  { key: 'commuteSchoolBus', label: 'School Bus',               unit: 'passenger-km',  scope: 'scope3', default: 0.027,     group: 'Commuting' },
  { key: 'commutePublicBus', label: 'Public Bus',               unit: 'passenger-km',  scope: 'scope3', default: 0.089,     group: 'Commuting' },
  { key: 'commuteMotorbike', label: 'Motorcycle',               unit: 'passenger-km',  scope: 'scope3', default: 0.113,     group: 'Commuting' },
  { key: 'commuteCar',       label: 'Car / Jeep',               unit: 'passenger-km',  scope: 'scope3', default: 0.171,     group: 'Commuting' },
  { key: 'food',             label: 'Vegetarian Meal',          unit: 'meal',          scope: 'scope3', default: 0.9,       group: 'Food' },
  { key: 'foodMixedMeat',    label: 'Mixed Meal (Meat)',        unit: 'meal',          scope: 'scope3', default: 1.8,       group: 'Food' },
  { key: 'foodSnack',        label: 'Snack',                    unit: 'meal',          scope: 'scope3', default: 0.5,       group: 'Food' },
  { key: 'paper',            label: 'Paper',                    unit: 'kg',            scope: 'scope3', default: 1.84,      group: 'Other' },
  { key: 'waste',            label: 'Waste (Landfill)',         unit: 'kg',            scope: 'scope3', default: 0.467,     group: 'Waste' },
  { key: 'wasteOpenBurning', label: 'Waste (Open Burning)',     unit: 'kg',            scope: 'scope3', default: 0.689,     group: 'Waste' },
  { key: 'wasteComposting',  label: 'Waste (Composting)',       unit: 'kg',            scope: 'scope3', default: 0.01,      group: 'Waste' },
  { key: 'waterPumped',      label: 'Water (Pumped)',           unit: 'litre',         scope: 'scope3', default: 0.000344,  group: 'Water' },
]

const SCOPE_STYLE = {
  scope1: { bg: '#fff7ed', color: '#c2410c', label: 'Scope 1' },
  scope2: { bg: '#eff6ff', color: '#1d4ed8', label: 'Scope 2' },
  scope3: { bg: '#f0fdf4', color: '#15803d', label: 'Scope 3' },
}

function downloadCsvTemplate() {
  const rows = ['key,value,unit,label']
  for (const f of FACTORS_META) rows.push(`${f.key},${f.default},${f.unit},"${f.label}"`)
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'emission-factors-template.csv'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function parseFactorsCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')
  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
  const ki = header.indexOf('key'), vi = header.indexOf('value')
  if (ki < 0 || vi < 0) throw new Error('CSV must have "key" and "value" columns')
  const result = {}
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''))
    const key = cols[ki]; const val = parseFloat(cols[vi])
    if (key && !isNaN(val)) result[key] = val
  }
  return result
}

const FACTOR_GROUPS = [...new Set(FACTORS_META.map(f => f.group))]

function CustomFactorsPanel({ customFactors, setCustomFactors }) {
  const { t } = useLang()
  const [tab, setTab] = useState('manual')
  const [csvError, setCsvError] = useState('')
  const [csvParsed, setCsvParsed] = useState(null)
  const fileRef = useRef(null)
  const activeCount = Object.keys(customFactors).length

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError(''); setCsvParsed(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseFactorsCsv(ev.target.result)
        const recognized = Object.keys(parsed).filter(k => FACTORS_META.some(f => f.key === k))
        if (recognized.length === 0) throw new Error('No recognized emission factor keys found in this CSV.')
        setCsvParsed({ all: parsed, recognized })
      } catch (err) { setCsvError(err.message) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function applyParsed() {
    if (!csvParsed) return
    const next = { ...customFactors }
    for (const key of csvParsed.recognized) next[key] = csvParsed.all[key]
    setCustomFactors(next); setCsvParsed(null)
  }

  function setFactor(key, val) {
    const v = val === '' ? null : parseFloat(val)
    setCustomFactors(prev => {
      const next = { ...prev }
      if (v === null || isNaN(v)) delete next[key]
      else next[key] = v
      return next
    })
  }

  const tabBtn = (k, label) => (
    <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '0.45rem 0', fontWeight: 700, fontSize: '0.74rem', borderRadius: '0.5rem', border: `1.5px solid ${tab === k ? '#264e3c' : '#dce9ff'}`, background: tab === k ? '#f0fdf4' : '#fff', color: tab === k ? '#002114' : '#85b098', cursor: 'pointer' }}>
      {t(label)}
    </button>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        {tabBtn('template', 'Template')}
        {tabBtn('upload', 'CSV Upload')}
        {tabBtn('manual', 'Manual Entry')}
      </div>

      {/* ── Template tab ── */}
      {tab === 'template' && (
        <div>
          <p style={{ fontSize: '0.78rem', color: '#264e3c', lineHeight: 1.65, margin: '0 0 0.875rem' }}>
            {t('Download a pre-filled CSV with all emission factor keys and their current default values (kg CO₂e per unit). Edit the')} <strong>value</strong> {t('column for any factors you want to customise, then upload it using the CSV Upload tab.')}
          </p>
          <button onClick={downloadCsvTemplate} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#002114', color: '#EEF2DC', border: 'none', borderRadius: '0.65rem', padding: '0.65rem 1.1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            <Download size={15} /> {t('Download CSV Template')}
          </button>
          <p style={{ fontSize: '0.67rem', color: '#9ca3af', marginTop: '0.55rem' }}>
            {t('Format: key, value, unit, label · All values in kg CO₂e per stated unit')}
          </p>
          {activeCount > 0 && (
            <button onClick={() => setCustomFactors({})} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.9rem', background: 'none', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.3rem 0.65rem', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}>
              <X size={12} /> {t('Clear all')} {activeCount} {t('custom override(s)')}
            </button>
          )}
        </div>
      )}

      {/* ── CSV Upload tab ── */}
      {tab === 'upload' && (
        <div>
          <p style={{ fontSize: '0.78rem', color: '#264e3c', lineHeight: 1.65, margin: '0 0 0.875rem' }}>
            {t('Upload a CSV with at minimum a')} <strong>key</strong> {t('column and a')} <strong>value</strong> {t('column. Only rows whose key matches a recognised factor will be applied — the rest are ignored.')}
          </p>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f8f9ff', color: '#002114', border: '1.5px dashed #264e3c', borderRadius: '0.65rem', padding: '0.65rem 1.1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            <UploadIcon size={15} /> {t('Choose CSV / text file')}
          </button>
          {csvError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.65rem', padding: '0.6rem 0.85rem', marginTop: '0.75rem', color: '#b91c1c', fontSize: '0.78rem' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {csvError}
            </div>
          )}
          {csvParsed && (
            <div style={{ marginTop: '0.875rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#002114', margin: '0 0 0.5rem' }}>
                {t('Preview')} · {csvParsed.recognized.length} {t('factors recognised')}
                {Object.keys(csvParsed.all).length > csvParsed.recognized.length && (
                  <span style={{ fontWeight: 500, color: '#9ca3af', marginLeft: '0.4rem' }}>
                    ({Object.keys(csvParsed.all).length - csvParsed.recognized.length} {t('unknown keys skipped')})
                  </span>
                )}
              </p>
              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #dce9ff', borderRadius: '0.65rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                  <thead>
                    <tr style={{ background: '#f5f7f0', position: 'sticky', top: 0 }}>
                      <th style={{ textAlign: 'left', padding: '0.45rem 0.75rem', fontWeight: 700, color: '#002114', borderBottom: '1px solid #dce9ff' }}>{t('Factor')}</th>
                      <th style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontWeight: 700, color: '#002114', borderBottom: '1px solid #dce9ff' }}>{t('Your Value')}</th>
                      <th style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #dce9ff' }}>{t('Default')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvParsed.recognized.map((key, idx) => {
                      const meta = FACTORS_META.find(f => f.key === key)
                      return (
                        <tr key={key} style={{ background: idx % 2 === 0 ? '#fff' : '#fafdf7' }}>
                          <td style={{ padding: '0.4rem 0.75rem', color: '#002114' }}>{meta?.label || key}</td>
                          <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#002d1c' }}>{csvParsed.all[key]}</td>
                          <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#9ca3af' }}>{meta?.default ?? '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <button onClick={applyParsed} style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.65rem', padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                Apply {csvParsed.recognized.length} Factor{csvParsed.recognized.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Manual entry tab ── */}
      {tab === 'manual' && (
        <div>
          <p style={{ fontSize: '0.72rem', color: '#85b098', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
            {t('Enter a custom value (kg CO₂e per unit) for any factor. Leave blank to use the default. Highlighted rows are overridden.')}
          </p>
          {FACTOR_GROUPS.map(group => (
            <div key={group} style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#264e3c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.35rem' }}>{t(group)}</p>
              {FACTORS_META.filter(f => f.group === group).map(f => {
                const hasCustom = customFactors[f.key] !== undefined
                const ss = SCOPE_STYLE[f.scope]
                return (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.65rem', borderRadius: '0.5rem', marginBottom: '0.25rem', background: hasCustom ? '#f0fdf4' : '#fafdf7', border: `1px solid ${hasCustom ? '#86efac' : '#f0f4e8'}`, transition: 'all 0.15s' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: hasCustom ? 700 : 500, color: '#002114' }}>{f.label}</span>
                      <span style={{ fontSize: '0.63rem', color: '#9ca3af', marginLeft: '0.35rem' }}>/{f.unit}</span>
                    </div>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: ss.color, background: ss.bg, borderRadius: '0.9rem', padding: '0.1rem 0.4rem', flexShrink: 0 }}>{ss.label}</span>
                    <input
                      type="number" min="0" step="any"
                      value={customFactors[f.key] !== undefined ? customFactors[f.key] : ''}
                      placeholder={String(f.default)}
                      onChange={e => setFactor(f.key, e.target.value)}
                      style={{ width: 84, padding: '0.32rem 0.5rem', border: `1.5px solid ${hasCustom ? '#86efac' : '#d1d5db'}`, borderRadius: '0.4rem', fontSize: '0.78rem', fontWeight: hasCustom ? 700 : 400, color: '#002114', textAlign: 'right', flexShrink: 0, background: hasCustom ? '#f0fdf4' : '#fff' }}
                    />
                    {hasCustom && (
                      <button onClick={() => setFactor(f.key, '')} title={t('Reset to default')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '0.1rem', flexShrink: 0 }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          {activeCount > 0 && (
            <button onClick={() => setCustomFactors({})} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.3rem 0.65rem', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', marginTop: '0.25rem' }}>
              <X size={12} /> {t('Reset all')} {activeCount} {t('override(s) to defaults')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Primitive field building blocks (unchanged visual language) ──
// Leaf components translate their own text props, so the form body can keep
// passing plain English strings and everything localises automatically.
function Field({ label, hint, tip, children }) {
  const { t } = useLang()
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.8rem', color: '#002114', marginBottom: '0.25rem' }}>
        {t(label)}
        {tip && <span title={t(tip)} style={{ cursor: 'help', color: '#85b098', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #c0edd3', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>i</span>}
      </label>
      {hint && <p style={{ fontSize: '0.68rem', color: '#85b098', margin: '0 0 0.35rem' }}>{t(hint)}</p>}
      {children}
    </div>
  )
}

function Num({ value, onChange, unit, placeholder }) {
  const { t } = useLang()
  return (
    <div style={{ position: 'relative' }}>
      <input type="number" min="0" value={value} placeholder={placeholder || '0'} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, paddingRight: unit ? '3.5rem' : '0.8rem' }} />
      {unit && <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>{t(unit)}</span>}
    </div>
  )
}

// Numeric value + period dropdown (the flexible time-period control).
function PeriodInput({ value, period, onValue, onPeriod, unit, placeholder }) {
  const { t } = useLang()
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <input type="number" min="0" value={value} placeholder={placeholder || '0'} onChange={e => onValue(e.target.value)} style={{ ...inputStyle, paddingRight: unit ? '3rem' : '0.8rem' }} />
        {unit && <span style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600 }}>{t(unit)}</span>}
      </div>
      <select value={period} onChange={e => onPeriod(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 118, flexShrink: 0, fontWeight: 600 }}>
        {PERIODS.map(o => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
      </select>
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// Single-select option list (radio).
function Radio({ value, onChange, options }) {
  const { t } = useLang()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <label key={opt.value} onClick={() => onChange(opt.value)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.55rem 0.875rem', borderRadius: '0.65rem', border: `1.5px solid ${active ? '#264e3c' : '#dce9ff'}`, background: active ? '#f8f9ff' : '#fff', transition: 'all 0.15s' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${active ? '#002d1c' : '#d1d5db'}`, background: active ? '#002d1c' : '#fff', flexShrink: 0, boxShadow: active ? 'inset 0 0 0 2px #fff' : 'none' }} />
            <span style={{ fontSize: '0.82rem', color: '#002114', fontWeight: active ? 700 : 500 }}>{t(opt.label)}</span>
          </label>
        )
      })}
    </div>
  )
}

// Multi-select chip/row (checkbox).
function Check({ label, checked, onChange }) {
  const { t } = useLang()
  return (
    <label onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: '0.6rem', border: `1.5px solid ${checked ? '#264e3c' : '#dce9ff'}`, background: checked ? '#f8f9ff' : '#fff', transition: 'all 0.15s' }}>
      <div style={{ width: 16, height: 16, borderRadius: '0.3rem', border: `2px solid ${checked ? '#002d1c' : '#d1d5db'}`, background: checked ? '#002d1c' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}>{checked ? '✓' : ''}</div>
      <span style={{ fontSize: '0.8rem', color: '#002114', fontWeight: checked ? 700 : 500 }}>{t(label)}</span>
    </label>
  )
}

// Collapsible category card (keeps the existing card visuals + scope chip).
function Card({ icon, title, scope, children, collapsible = true, defaultOpen = true }) {
  const { t } = useLang()
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #dce9ff', padding: '1.25rem 1.4rem', marginBottom: '1rem' }}>
      <div
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: open ? '1rem' : 0, cursor: collapsible ? 'pointer' : 'default', userSelect: 'none' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', color: '#4E7D5B', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#002114' }}>{t(title)}</span>
        {scope && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#264e3c', background: '#f8f9ff', border: '1px solid #d1fae5', borderRadius: '1rem', padding: '0.1rem 0.55rem' }}>{t(scope)}</span>}
        {collapsible && <span style={{ marginLeft: 'auto', color: '#85b098', display: 'flex' }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>}
      </div>
      {open && children}
    </div>
  )
}

// ── Checkbox groups with a mutually-exclusive "None" ──
const GROUPS = {
  cook: { none: 'cookNone', keys: ['cookLpg', 'cookFirewood', 'cookCharcoal'] },
  fac:  { none: 'facNone',  keys: ['facCanteen', 'facHostel', 'facMidday'] },
  en:   { none: 'enNone',   keys: ['enClub', 'enCommittee', 'enClimate', 'enEvents'] },
  rc:   { none: 'rcNone',   keys: ['rcWater', 'rcEnergy', 'rcLed', 'rcRain'] },
}

const empty = {
  // General
  academicYear: new Date().getFullYear(),
  students: '', teachers: '', nonTeaching: '', schoolDays: '',
  // Electricity
  elecMode: 'consumption',
  elecKwh: '', elecKwhP: 'month',
  elecBill: '', elecBillP: 'month',
  // Solar
  hasSolar: 'no', solarKwp: '', solarGen: '', solarGenP: 'year',
  // Generator
  hasGen: 'no', genLitres: '', genLitresP: 'month',
  // Cooking fuel
  cookLpg: false, cookFirewood: false, cookCharcoal: false, cookNone: false,
  lpgQty: '', lpgQtyP: 'month', lpgUnit: 'cylinders',
  firewood: '', firewoodP: 'month',
  charcoal: '', charcoalP: 'month',
  // School transportation (Scope 1) — owned/operated fleet
  vehicles: DEFAULT_VEHICLES.map(v => ({ ...v })),
  // Student commuting (Scope 3) — % of students per mode + avg one-way distance
  commuteModes: COMMUTE_MODES.map(m => ({ mode: m.mode, pct: '', km: '' })),
  // Paper & procurement
  paperMode: 'a4',
  a4: '', a4P: 'year',
  textbooks: '', textbooksP: 'year',
  stationery: '',
  // Food & canteen
  facCanteen: false, facHostel: false, facMidday: false, facNone: false,
  veg: '', vegP: 'week',
  mixed: '', mixedP: 'week',
  // Water
  waterSource: 'municipal',
  waterMode: 'consumption',
  waterCons: '', waterConsP: 'month',
  waterBill: '', waterBillP: 'month',
  // Waste
  wasteKg: '', wasteKgP: 'week',
  tLandfill: false, tBurning: false, tComposting: false, tRecycling: false,
  pctLandfill: '', pctBurning: '', pctComposting: '', pctRecycling: '',
  // Sustainability (optional)
  treePractice: '', renewable: '', renewableKwp: '',
  enClub: false, enCommittee: false, enClimate: false, enEvents: false, enNone: false,
  rcWater: false, rcEnergy: false, rcLed: false, rcRain: false, rcNone: false,
}

// Sum of commute mode percentages (live guide; should aim for 100%).
function commuteSum(f) {
  return (f.commuteModes || []).reduce((s, m) => s + Number(m.pct || 0), 0)
}

// Walk the few treatment %s that are actually selected.
function treatmentSum(f) {
  let sum = 0
  if (f.tLandfill)   sum += Number(f.pctLandfill || 0)
  if (f.tBurning)    sum += Number(f.pctBurning || 0)
  if (f.tComposting) sum += Number(f.pctComposting || 0)
  if (f.tRecycling)  sum += Number(f.pctRecycling || 0)
  return sum
}

function validate(f) {
  if (!f.academicYear) return 'Academic year is required.'
  // Waste-treatment percentages don't have to sum to 100 — the engine
  // normalises them proportionally. The live "Total" indicator is just a guide.
  return ''
}

// Build the engine payload — all period figures normalised to ANNUAL.
function buildPayload(f, customFactors = {}) {
  const a = annualize
  const payload = {
    academicYear: Number(f.academicYear),
    enrollment: n(f.students),
  }

  // ── Electricity (Scope 2) ──
  const elec = { solarKwp: f.hasSolar === 'yes' ? n(f.solarKwp) : undefined }
  if (f.hasSolar === 'yes') elec.solarAnnualKwh = a(f.solarGen, f.solarGenP)
  if (f.elecMode === 'consumption') {
    elec.measuredKwh = a(f.elecKwh, f.elecKwhP)
  } else {
    const billYr = a(f.elecBill, f.elecBillP)
    elec.billNprPerYear = billYr
    if (billYr !== undefined) { elec.measuredKwh = Math.round(billYr / NPR_PER_KWH); elec.estimatedFromBill = true }
  }
  payload.electricity = elec

  // ── Generator (Scope 1) ──
  if (f.hasGen === 'yes') {
    payload.generator = { hasGenerator: true, measuredLitres: a(f.genLitres, f.genLitresP) }
  }

  // ── Cooking fuel (Scope 1) ── LPG sent in LITRES (matches the factor)
  const cooking = {}
  if (f.cookLpg) {
    const qty = a(f.lpgQty, f.lpgQtyP)
    if (qty !== undefined) cooking.lpgLitres = Math.round(f.lpgUnit === 'cylinders' ? qty * LPG_LITRES_PER_CYLINDER : qty)
  }
  if (f.cookFirewood) cooking.firewoodKg = a(f.firewood, f.firewoodP)
  if (f.cookCharcoal) cooking.charcoalKg = a(f.charcoal, f.charcoalP)
  if (Object.values(cooking).some(v => v !== undefined)) payload.cooking = cooking

  // ── School transportation (Scope 1) ── owned/operated fleet
  let dieselLitres = 0, petrolLitres = 0
  const vehiclesOut = []
  for (const v of (f.vehicles || [])) {
    const litresYr = a(v.litres, v.litresP)
    if (litresYr === undefined) continue
    if (v.fuel === 'petrol') petrolLitres += litresYr; else dieselLitres += litresYr
    vehiclesOut.push({ type: v.type, count: n(v.count), fuel: v.fuel, litresPerYear: litresYr })
  }
  if (dieselLitres > 0 || petrolLitres > 0) {
    payload.vehicle = {
      dieselLitres: dieselLitres || undefined,
      petrolLitres: petrolLitres || undefined,
      vehicles: vehiclesOut,
    }
  }

  // ── Student commuting (Scope 3) ── per-mode % share + avg one-way distance.
  // Only sent when at least one mode has a share; otherwise the engine falls
  // back to its regional per-student default.
  const commuteModes = (f.commuteModes || [])
    .filter(m => n(m.pct) !== undefined && Number(m.pct) > 0)
    .map(m => ({ mode: m.mode, pct: Number(m.pct), oneWayKm: n(m.km) || 0 }))
  if (commuteModes.length > 0) payload.commute = { modes: commuteModes }

  // ── Paper & procurement (Scope 3) ──
  if (f.paperMode === 'a4') {
    const reamsYr = a(f.a4, f.a4P)
    if (reamsYr !== undefined) payload.paper = { measuredKg: Math.round(reamsYr * REAM_KG), reamsPerYear: reamsYr, stationeryBudgetNpr: n(f.stationery) }
  } else {
    const booksYr = a(f.textbooks, f.textbooksP)
    if (booksYr !== undefined) payload.paper = { measuredKg: Math.round(booksYr * TEXTBOOK_KG), textbooksPerYear: booksYr, stationeryBudgetNpr: n(f.stationery) }
  }

  // ── Food & canteen (Scope 3) ──
  const hasCanteen = f.facCanteen || f.facHostel || f.facMidday
  if (hasCanteen) {
    const veg = a(f.veg, f.vegP)
    const mixed = a(f.mixed, f.mixedP)
    const total = (veg || 0) + (mixed || 0)
    payload.food = {
      hasCanteen: true,
      measuredMealsPerYear: total > 0 ? Math.round(total) : undefined,
      vegMealsPerYear: veg, mixedMealsPerYear: mixed,
      facilities: { canteen: f.facCanteen, hostel: f.facHostel, midDayMeal: f.facMidday },
    }
  } else {
    payload.food = { hasCanteen: false }
  }

  // ── Waste (Scope 3) ── annual kg sent directly
  const kgPerYear = a(f.wasteKg, f.wasteKgP)
  const segregation = (f.tComposting && f.tRecycling) ? 'three' : (f.tComposting || f.tRecycling) ? 'two' : 'none'
  payload.waste = {
    measuredKgPerYear: kgPerYear,
    segregation,
    composting: f.tComposting,
    recycling: f.tRecycling,
    treatment: { landfill: n(f.pctLandfill), burning: n(f.pctBurning), composting: n(f.pctComposting), recycling: n(f.pctRecycling) },
  }

  // ── Water (Scope 3, minor) ──
  const water = { source: f.waterSource }
  if (f.waterMode === 'consumption') water.litresPerYear = a(f.waterCons, f.waterConsP)
  else water.billNprPerYear = a(f.waterBill, f.waterBillP)
  if (water.litresPerYear !== undefined || water.billNprPerYear !== undefined) payload.water = water

  // Custom emission factor overrides (sent only when school has provided any).
  if (Object.keys(customFactors).length > 0) payload.customFactors = customFactors

  // (Sustainability-practice checkboxes are informational and not part of the
  //  emissions engine, so they are not sent to the calculator.)
  return payload
}

export default function SchoolDataEntry() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { t } = useLang()
  const col2 = isMobile ? '1fr' : '1fr 1fr'
  // Restore an in-progress draft (save progress & return later).
  const [f, setF] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) return { ...empty, ...JSON.parse(saved) }
    } catch { /* ignore */ }
    return empty
  })
  const [customFactors, setCustomFactors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  // Autosave the draft on every change.
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(f)) } catch { /* ignore */ }
  }, [f])

  // ── Vehicle fleet helpers ──
  const setVehicle = (i, key, val) => setF(p => {
    const vehicles = p.vehicles.map((v, idx) => idx === i ? { ...v, [key]: val } : v)
    return { ...p, vehicles }
  })
  // Selecting a vehicle type also fills in its usual fuel (still editable).
  const setVehicleType = (i, type) => setF(p => {
    const def = VEHICLE_TYPES.find(v => v.value === type)
    const vehicles = p.vehicles.map((v, idx) => idx === i ? { ...v, type, fuel: def ? def.fuel : v.fuel } : v)
    return { ...p, vehicles }
  })
  const addVehicle = () => setF(p => ({ ...p, vehicles: [...p.vehicles, { type: 'Other', count: '', fuel: 'diesel', litres: '', litresP: 'year' }] }))
  const removeVehicle = (i) => setF(p => ({ ...p, vehicles: p.vehicles.filter((_, idx) => idx !== i) }))

  // ── Commute helper ──
  const setCommute = (i, key, val) => setF(p => {
    const commuteModes = p.commuteModes.map((m, idx) => idx === i ? { ...m, [key]: val } : m)
    return { ...p, commuteModes }
  })

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setF(empty)
  }

  // Toggle a checkbox inside a group, keeping "None" mutually exclusive.
  function toggleGroup(groupKey, field) {
    const g = GROUPS[groupKey]
    setF(p => {
      const nv = !p[field]
      const np = { ...p, [field]: nv }
      if (field === g.none && nv) g.keys.forEach(k => { np[k] = false })
      else if (field !== g.none && nv) np[g.none] = false
      return np
    })
  }

  async function submit() {
    const msg = validate(f)
    if (msg) { setError(msg); return }
    setSubmitting(true); setError('')
    try {
      await carbonApi.submit(buildPayload(f, customFactors))
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#002114', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Google Sans',sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '3rem 2.5rem', maxWidth: 440, width: '90%', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌿</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#002114', margin: '0 0 0.5rem' }}>{t('Audit Submitted & Calculated!')}</h2>
          <p style={{ fontSize: '0.82rem', color: '#264e3c', margin: '0 0 1.75rem', lineHeight: 1.7 }}>{t('Your footprint, scope breakdown and data-confidence score are ready on the dashboard.')}</p>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#002114', color: '#e5eeff', border: 'none', borderRadius: '0.875rem', padding: '0.875rem 2rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}>{t('View Dashboard →')}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f0', fontFamily: "'Google Sans',sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #dce9ff', padding: isMobile ? '0.8rem 1rem' : '0.9rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 30, height: 30, background: '#002114', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={14} color="#EEF2DC" /></div>
          <span style={{ fontWeight: 900, fontSize: '0.88rem', color: '#002114' }}>{t('Annual Carbon Audit')}</span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ fontSize: '0.78rem', color: '#85b098', background: 'none', border: '1px solid #dce9ff', borderRadius: '0.5rem', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}>{t('← Dashboard')}</button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#002114', margin: '0 0 0.25rem' }}>{t('Enter your activity data')}</h1>
        <p style={{ fontSize: '0.8rem', color: '#85b098', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
          {t("Enter what you know. For anything you can't measure, skip it — we'll use transparent national-average estimates where appropriate.")}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <button onClick={clearDraft} type="button" style={{ fontSize: '0.7rem', color: '#85b098', background: 'none', border: '1px solid #d1fae5', borderRadius: '0.45rem', padding: '0.3rem 0.65rem', cursor: 'pointer', fontWeight: 600 }}>{t('Clear form')}</button>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={14} /> {t(error)}</div>}

        {/* ── 🏫 School Information ── */}
        <Card icon={<School size={17} />} title="School Information" collapsible={false}>
          <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '1rem' }}>
            <Field label="Academic Year" tip="The year this audit covers."><Num value={f.academicYear} onChange={v => set('academicYear', v)} /></Field>
            <Field label="Number of Students" tip="Used for per-student intensity and Tier-2 estimates."><Num value={f.students} onChange={v => set('students', v)} unit="students" /></Field>
            <Field label="Number of Teachers" tip="Teaching staff on roll."><Num value={f.teachers} onChange={v => set('teachers', v)} unit="staff" /></Field>
            <Field label="Number of Non-Teaching Staff" tip="Admin, support and other non-teaching staff."><Num value={f.nonTeaching} onChange={v => set('nonTeaching', v)} unit="staff" /></Field>
            <Field label="Total School Days per Year" tip="Operating days in the academic year — used to scale daily activity."><Num value={f.schoolDays} onChange={v => set('schoolDays', v)} unit="days" /></Field>
          </div>
        </Card>

        {/* ── ⚡ Electricity ── */}
        <Card icon={<Zap size={17} />} title="Electricity" scope="Scope 2">
          <Field label="How would you like to provide electricity data?">
            <Radio value={f.elecMode} onChange={v => set('elecMode', v)} options={[
              { value: 'consumption', label: 'I know the electricity consumption' },
              { value: 'bills', label: 'I only have electricity bills' },
            ]} />
          </Field>
          {f.elecMode === 'consumption' ? (
            <Field label="Electricity Consumption" tip="Total units (kWh) from your NEA meter / bills.">
              <PeriodInput value={f.elecKwh} period={f.elecKwhP} onValue={v => set('elecKwh', v)} onPeriod={v => set('elecKwhP', v)} unit="kWh" />
            </Field>
          ) : (
            <Field label="Electricity Bill Amount" tip="We convert the bill to kWh using an approximate NEA tariff.">
              <PeriodInput value={f.elecBill} period={f.elecBillP} onValue={v => set('elecBill', v)} onPeriod={v => set('elecBillP', v)} unit="NPR" />
            </Field>
          )}
        </Card>

        {/* ── ☀️ Solar Energy ── */}
        <Card icon={<Sun size={17} />} title="Solar Energy" scope="Scope 2">
          <Field label="Does the school have rooftop solar?">
            <Radio value={f.hasSolar} onChange={v => set('hasSolar', v)} options={[
              { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
            ]} />
          </Field>
          {f.hasSolar === 'yes' && (
            <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '1rem', marginTop: '0.5rem' }}>
              <Field label="Installed Solar Capacity" tip="Total rated capacity of your rooftop array."><Num value={f.solarKwp} onChange={v => set('solarKwp', v)} unit="kWp" /></Field>
              <Field label="Estimated Solar Generation" hint="Optional" tip="Electricity generated by your solar array — offsets grid use.">
                <PeriodInput value={f.solarGen} period={f.solarGenP} onValue={v => set('solarGen', v)} onPeriod={v => set('solarGenP', v)} unit="kWh" />
              </Field>
            </div>
          )}
        </Card>

        {/* ── 🔥 Fuel Consumption ── */}
        <Card icon={<Flame size={17} />} title="Fuel Consumption" scope="Scope 1">
          {/* Generator */}
          <Field label="Does your school use a diesel generator?">
            <Radio value={f.hasGen} onChange={v => set('hasGen', v)} options={[
              { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
            ]} />
          </Field>
          {f.hasGen === 'yes' && (
            <Field label="Diesel Consumed" tip="Litres of diesel burned by the backup generator.">
              <PeriodInput value={f.genLitres} period={f.genLitresP} onValue={v => set('genLitres', v)} onPeriod={v => set('genLitresP', v)} unit="Litres" />
            </Field>
          )}

          {/* Cooking fuel */}
          <div style={{ borderTop: '1px dashed #dce9ff', margin: '1rem 0', paddingTop: '1rem' }}>
            <Field label="What fuel does the school use for cooking?" hint="Select all that apply">
              <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.5rem' }}>
                <Check label="LPG"      checked={f.cookLpg}      onChange={() => toggleGroup('cook', 'cookLpg')} />
                <Check label="Firewood" checked={f.cookFirewood} onChange={() => toggleGroup('cook', 'cookFirewood')} />
                <Check label="Charcoal" checked={f.cookCharcoal} onChange={() => toggleGroup('cook', 'cookCharcoal')} />
                <Check label="None"     checked={f.cookNone}     onChange={() => toggleGroup('cook', 'cookNone')} />
              </div>
            </Field>
            {f.cookLpg && (
              <Field label="LPG Used" hint={OPTIONAL_HINT} tip="Enter cylinders (≈26 L each) or litres — pick the unit on the right.">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <PeriodInput value={f.lpgQty} period={f.lpgQtyP} onValue={v => set('lpgQty', v)} onPeriod={v => set('lpgQtyP', v)} />
                  </div>
                  <select value={f.lpgUnit} onChange={e => set('lpgUnit', e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 110, flexShrink: 0, fontWeight: 600 }}>
                    <option value="cylinders">{t('Cylinders')}</option>
                    <option value="litres">{t('Litres')}</option>
                  </select>
                </div>
              </Field>
            )}
            {f.cookFirewood && (
              <Field label="Firewood Used" tip="Weight of firewood / biomass burned.">
                <PeriodInput value={f.firewood} period={f.firewoodP} onValue={v => set('firewood', v)} onPeriod={v => set('firewoodP', v)} unit="kg" />
              </Field>
            )}
            {f.cookCharcoal && (
              <Field label="Charcoal Used" tip="Weight of charcoal used for cooking.">
                <PeriodInput value={f.charcoal} period={f.charcoalP} onValue={v => set('charcoal', v)} onPeriod={v => set('charcoalP', v)} unit="kg" />
              </Field>
            )}
          </div>
        </Card>

        {/* ── School Transportation (school-owned/operated vehicles only) ── */}
        <Card icon={<Truck size={17} />} title="School Transportation" scope="Scope 1">
          <p style={{ fontSize: '0.72rem', color: '#85b098', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
            {t('School-owned or school-operated vehicles only. Student commuting is not collected here.')} · {t(OPTIONAL_HINT)}
          </p>
          {f.vehicles.map((v, i) => {
            const litresYr = annualize(v.litres, v.litresP)
            const estKg = litresYr ? Math.round(litresYr * (v.fuel === 'petrol' ? PETROL_FACTOR : DIESEL_FACTOR)) : 0
            return (
            <div key={i} style={{ border: '1px solid #dce9ff', borderRadius: '0.75rem', padding: '0.85rem', marginBottom: '0.75rem', background: '#fafdf7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Select value={v.type} onChange={val => setVehicleType(i, val)} options={[
                    { value: '', label: t('Select vehicle type…') },
                    ...VEHICLE_TYPES.map(o => ({ value: o.value, label: t(o.value) })),
                  ]} />
                </div>
                {f.vehicles.length > 1 && (
                  <button type="button" onClick={() => removeVehicle(i)} aria-label={t('Remove')} style={{ background: 'none', border: '1px solid #dce9ff', borderRadius: '0.5rem', padding: '0.45rem', cursor: 'pointer', color: '#b91c1c', display: 'flex', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.6rem' }}>
                <Field label="Number of Vehicles"><Num value={v.count} onChange={val => setVehicle(i, 'count', val)} /></Field>
                <Field label="Fuel Type">
                  <Select value={v.fuel} onChange={val => setVehicle(i, 'fuel', val)} options={[
                    { value: 'diesel', label: t('Diesel') },
                    { value: 'petrol', label: t('Petrol') },
                  ]} />
                </Field>
              </div>
              <Field label="Fuel Consumed" tip="Total fuel this vehicle type burns. This is what drives the Scope-1 emission calculation.">
                <PeriodInput value={v.litres} period={v.litresP} onValue={val => setVehicle(i, 'litres', val)} onPeriod={val => setVehicle(i, 'litresP', val)} unit="Litres" />
              </Field>
              {estKg > 0 && (
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#002d1c', margin: '0.15rem 0 0' }}>
                  ≈ {estKg.toLocaleString()} {t('kg CO₂e/yr')} <span style={{ color: '#85b098', fontWeight: 500 }}>({v.fuel === 'petrol' ? t('Petrol') : t('Diesel')} · {Math.round(litresYr).toLocaleString()} L/yr)</span>
                </p>
              )}
            </div>
            )
          })}
          <button type="button" onClick={addVehicle} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8f9ff', color: '#002d1c', border: '1px dashed #264e3c', borderRadius: '0.65rem', padding: '0.55rem 0.9rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            <Plus size={15} /> {t('Add vehicle')}
          </button>
        </Card>

        {/* ── 🚌 Student Commuting (Scope 3) ── */}
        <Card icon={<Bus size={17} />} title="Student Commuting" scope="Scope 3">
          <p style={{ fontSize: '0.72rem', color: '#85b098', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
            {t('How students travel to school — often the single largest source. Enter the share of students using each mode and their average one-way distance.')} · {t(OPTIONAL_HINT)}
          </p>
          {f.commuteModes.map((m, i) => {
            const meta = COMMUTE_MODES.find(c => c.mode === m.mode) || {}
            const students = n(f.students)
            const pkm = students && Number(m.pct) > 0 && meta.needsKm
              ? students * (Number(m.pct) / 100) * Number(m.km || 0) * 2 * COMMUTE_SCHOOL_DAYS
              : 0
            const estKg = Math.round(pkm * (COMMUTE_FACTOR[m.mode] || 0))
            return (
              <div key={m.mode} style={{ border: '1px solid #dce9ff', borderRadius: '0.75rem', padding: '0.75rem 0.85rem', marginBottom: '0.6rem', background: '#fafdf7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', flexShrink: 0 }}>{COMMUTE_ICON[m.mode]}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#002114' }}>{t(meta.label)}</span>
                  {meta.factor === 0 && <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', borderRadius: '1rem', padding: '0.1rem 0.5rem' }}>{t('Zero emission')}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: meta.needsKm ? col2 : '1fr', gap: '0.6rem' }}>
                  <Field label="% of Students"><Num value={m.pct} onChange={v => setCommute(i, 'pct', v)} unit="%" /></Field>
                  {meta.needsKm && <Field label="Avg One-Way Distance"><Num value={m.km} onChange={v => setCommute(i, 'km', v)} unit="km" /></Field>}
                </div>
                {estKg > 0 && (
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#002d1c', margin: '0.4rem 0 0' }}>≈ {estKg.toLocaleString()} {t('kg CO₂e/yr')}</p>
                )}
              </div>
            )
          })}
          <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: '0.25rem 0 0', color: Math.round(commuteSum(f)) === 100 ? '#16a34a' : '#85b098' }}>
            {t('Total')}: {commuteSum(f)}% {Math.round(commuteSum(f)) === 100 ? '✓' : `· ${t('aim for 100% of students')}`}
          </p>
          {!n(f.students) && (
            <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '0.35rem 0 0' }}>{t('Tip: fill in “Number of Students” above to see live commute estimates here.')}</p>
          )}
        </Card>

        {/* ── 📄 Paper & Procurement ── */}
        <Card icon={<FileText size={17} />} title="Paper & Procurement" scope="Scope 3">
          <Field label="Paper Usage">
            <Radio value={f.paperMode} onChange={v => set('paperMode', v)} options={[
              { value: 'a4', label: 'A4 Reams Purchased' },
              { value: 'textbooks', label: 'Textbooks Purchased' },
            ]} />
          </Field>
          {f.paperMode === 'a4' ? (
            <Field label="A4 Reams" tip="Reams of A4 paper purchased (1 ream ≈ 2.5 kg).">
              <PeriodInput value={f.a4} period={f.a4P} onValue={v => set('a4', v)} onPeriod={v => set('a4P', v)} unit="reams" />
            </Field>
          ) : (
            <Field label="Number of Textbooks" tip="Textbooks purchased (≈ 0.5 kg each).">
              <PeriodInput value={f.textbooks} period={f.textbooksP} onValue={v => set('textbooks', v)} onPeriod={v => set('textbooksP', v)} unit="books" />
            </Field>
          )}
          <Field label="Annual Stationery Budget" hint="Optional" tip="Total yearly spend on stationery & supplies.">
            <Num value={f.stationery} onChange={v => set('stationery', v)} unit="NPR" />
          </Field>
        </Card>

        {/* ── 🍱 Food & Canteen ── */}
        <Card icon={<UtensilsCrossed size={17} />} title="Food & Canteen" scope="Scope 3">
          <Field label="Available Facilities" hint="Select all that apply">
            <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.5rem' }}>
              <Check label="Canteen"             checked={f.facCanteen} onChange={() => toggleGroup('fac', 'facCanteen')} />
              <Check label="Hostel"              checked={f.facHostel}  onChange={() => toggleGroup('fac', 'facHostel')} />
              <Check label="Mid-day Meal Program" checked={f.facMidday}  onChange={() => toggleGroup('fac', 'facMidday')} />
              <Check label="None"                checked={f.facNone}    onChange={() => toggleGroup('fac', 'facNone')} />
            </div>
          </Field>
          {(f.facCanteen || f.facHostel || f.facMidday) && (
            <>
              <Field label="Vegetarian Meals Served" tip="Plant-based / dal-bhat meals served.">
                <PeriodInput value={f.veg} period={f.vegP} onValue={v => set('veg', v)} onPeriod={v => set('vegP', v)} unit="meals" />
              </Field>
              <Field label="Mixed Meals With Meat Served" tip="Meals including meat / higher-footprint items.">
                <PeriodInput value={f.mixed} period={f.mixedP} onValue={v => set('mixed', v)} onPeriod={v => set('mixedP', v)} unit="meals" />
              </Field>
            </>
          )}
        </Card>

        {/* ── 💧 Water Use ── */}
        <Card icon={<Droplets size={17} />} title="Water Use" scope="Scope 3">
          <Field label="Primary Water Source">
            <Radio value={f.waterSource} onChange={v => set('waterSource', v)} options={[
              { value: 'municipal', label: 'Municipal Supply' },
              { value: 'borewell', label: 'Borewell' },
              { value: 'gravity', label: 'Gravity-Fed Supply' },
              { value: 'other', label: 'Other' },
            ]} />
          </Field>
          <Field label="Water Data">
            <Radio value={f.waterMode} onChange={v => set('waterMode', v)} options={[
              { value: 'consumption', label: 'Water Consumption' },
              { value: 'bill', label: 'Water Bill' },
            ]} />
          </Field>
          {f.waterMode === 'consumption' ? (
            <Field label="Water Consumption" tip="Volume of water used.">
              <PeriodInput value={f.waterCons} period={f.waterConsP} onValue={v => set('waterCons', v)} onPeriod={v => set('waterConsP', v)} unit="Litres" />
            </Field>
          ) : (
            <Field label="Water Bill" tip="Amount billed for water supply.">
              <PeriodInput value={f.waterBill} period={f.waterBillP} onValue={v => set('waterBill', v)} onPeriod={v => set('waterBillP', v)} unit="NPR" />
            </Field>
          )}
        </Card>

        {/* ── 🗑️ Waste Management ── */}
        <Card icon={<Trash2 size={17} />} title="Waste Management" scope="Scope 3">
          <Field label="Waste Generated" hint={OPTIONAL_HINT} tip="Total weight of solid waste produced.">
            <PeriodInput value={f.wasteKg} period={f.wasteKgP} onValue={v => set('wasteKg', v)} onPeriod={v => set('wasteKgP', v)} unit="kg" />
          </Field>

          <div style={{ borderTop: '1px dashed #dce9ff', margin: '1rem 0', paddingTop: '1rem' }}>
            <Field label="Waste Disposal Methods" hint="Select all that apply — roughly how your waste is split (we scale it to 100%)">
              <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.5rem' }}>
                <Check label="Landfill"     checked={f.tLandfill}   onChange={() => set('tLandfill', !f.tLandfill)} />
                <Check label="Open Burning" checked={f.tBurning}    onChange={() => set('tBurning', !f.tBurning)} />
                <Check label="Composting"   checked={f.tComposting} onChange={() => set('tComposting', !f.tComposting)} />
                <Check label="Recycling"    checked={f.tRecycling}  onChange={() => set('tRecycling', !f.tRecycling)} />
              </div>
            </Field>
            {(f.tLandfill || f.tBurning || f.tComposting || f.tRecycling) && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.75rem', marginTop: '0.25rem' }}>
                  {f.tLandfill   && <Field label="Landfill"><Num value={f.pctLandfill} onChange={v => set('pctLandfill', v)} unit="%" /></Field>}
                  {f.tBurning    && <Field label="Open Burning"><Num value={f.pctBurning} onChange={v => set('pctBurning', v)} unit="%" /></Field>}
                  {f.tComposting && <Field label="Composting"><Num value={f.pctComposting} onChange={v => set('pctComposting', v)} unit="%" /></Field>}
                  {f.tRecycling  && <Field label="Recycling"><Num value={f.pctRecycling} onChange={v => set('pctRecycling', v)} unit="%" /></Field>}
                </div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: '0.25rem 0 0', color: Math.round(treatmentSum(f)) === 100 ? '#16a34a' : '#85b098' }}>
                  {t('Total')}: {treatmentSum(f)}% {Math.round(treatmentSum(f)) === 100 ? '✓' : `· ${t('will be scaled to 100%')}`}
                </p>
              </>
            )}
          </div>
        </Card>

        {/* ── Custom Emission Factors (optional, collapsed) ── */}
        {(() => {
          const cfCount = Object.keys(customFactors).length
          return (
            <Card
              icon={<SlidersHorizontal size={17} />}
              title="Custom Emission Factors"
              scope={cfCount > 0 ? `${cfCount} custom` : 'Defaults'}
              defaultOpen={false}
            >
              <CustomFactorsPanel customFactors={customFactors} setCustomFactors={setCustomFactors} />
            </Card>
          )
        })()}

        {/* ── 🌳 Sustainability Practices (optional, collapsed) ── */}
        <Card icon={<TreePine size={17} />} title="Sustainability Practices" scope="Optional" defaultOpen={false}>
          <Field label="Tree Plantation & Green Spaces">
            <Radio value={f.treePractice} onChange={v => set('treePractice', v)} options={[
              { value: 'regular', label: 'Regular Tree Plantation Programs' },
              { value: 'garden', label: 'School Garden / Green Campus' },
              { value: 'occasional', label: 'Occasional Plantation Activities' },
              { value: 'none', label: 'None' },
            ]} />
          </Field>

          <Field label="Renewable Energy">
            <Radio value={f.renewable} onChange={v => set('renewable', v)} options={[
              { value: 'solar', label: 'Rooftop Solar Installed' },
              { value: 'other', label: 'Other Renewable Energy Source' },
              { value: 'none', label: 'No Renewable Energy System' },
            ]} />
          </Field>
          {f.renewable === 'solar' && (
            <Field label="Installed Capacity"><Num value={f.renewableKwp} onChange={v => set('renewableKwp', v)} unit="kWp" /></Field>
          )}

          <Field label="Environmental Engagement" hint="Select all that apply">
            <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.5rem' }}>
              <Check label="Environmental / Eco Club"     checked={f.enClub}      onChange={() => toggleGroup('en', 'enClub')} />
              <Check label="Sustainability Committee"     checked={f.enCommittee} onChange={() => toggleGroup('en', 'enCommittee')} />
              <Check label="Climate Awareness Activities" checked={f.enClimate}   onChange={() => toggleGroup('en', 'enClimate')} />
              <Check label="Annual Environmental Events"  checked={f.enEvents}    onChange={() => toggleGroup('en', 'enEvents')} />
              <Check label="None"                         checked={f.enNone}      onChange={() => toggleGroup('en', 'enNone')} />
            </div>
          </Field>

          <Field label="Resource Conservation" hint="Select all that apply">
            <div style={{ display: 'grid', gridTemplateColumns: col2, gap: '0.5rem' }}>
              <Check label="Water-Saving Initiatives" checked={f.rcWater}  onChange={() => toggleGroup('rc', 'rcWater')} />
              <Check label="Energy-Saving Campaigns"  checked={f.rcEnergy} onChange={() => toggleGroup('rc', 'rcEnergy')} />
              <Check label="LED Lighting"             checked={f.rcLed}    onChange={() => toggleGroup('rc', 'rcLed')} />
              <Check label="Rainwater Harvesting"     checked={f.rcRain}   onChange={() => toggleGroup('rc', 'rcRain')} />
              <Check label="None"                     checked={f.rcNone}   onChange={() => toggleGroup('rc', 'rcNone')} />
            </div>
          </Field>
        </Card>

        <button onClick={submit} disabled={submitting} style={{ width: '100%', background: submitting ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.95rem', fontWeight: 800, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
          {submitting ? t('Calculating…') : t('Submit & Calculate Footprint')}
        </button>
      </div>
    </div>
  )
}
