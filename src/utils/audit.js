// ============================================================
// Shared helpers for rendering a school's real carbon-audit result.
// ============================================================

// ActivityCategory enum (backend) → display label, icon and chart colour.
export const CATEGORY_META = {
  ELECTRICITY:    { label: 'Electricity',   icon: '⚡', color: '#f59e0b' },
  GENERATOR_FUEL: { label: 'Generator',     icon: '🔧', color: '#ef4444' },
  VEHICLE_FUEL:   { label: 'Vehicle Fuel',  icon: '🚐', color: '#dc2626' },
  COOKING_FUEL:   { label: 'Cooking Fuel',  icon: '🔥', color: '#fb923c' },
  REFRIGERANT:    { label: 'Refrigerant',   icon: '❄️', color: '#38bdf8' },
  COMMUTE:        { label: 'Commuting',     icon: '🚌', color: '#3b82f6' },
  PAPER:          { label: 'Paper',         icon: '📄', color: '#a3a3a3' },
  FOOD:           { label: 'Food / Canteen',icon: '🍱', color: '#84cc16' },
  WASTE:          { label: 'Waste',         icon: '🗑️', color: '#2D4A32' },
  WATER:          { label: 'Water',         icon: '💧', color: '#0ea5e9' },
}

export const SCOPE_META = {
  SCOPE_1: { label: 'Scope 1 — Direct',   color: '#1E2F1E' },
  SCOPE_2: { label: 'Scope 2 — Energy',   color: '#4E7D5B' },
  SCOPE_3: { label: 'Scope 3 — Indirect', color: '#a3c9a8' },
}

// Emission-factor reference table (mirrors the backend config) — surfaced in
// the downloadable report so the methodology is transparent and auditable.
export const EMISSION_FACTORS_REFERENCE = [
  { name: 'Grid electricity',       value: '0.0198',   unit: 'kg CO₂e / kWh',           source: 'NEA / CDM baseline (2025)' },
  { name: 'Diesel',                 value: '2.68',     unit: 'kg CO₂e / litre',         source: 'IPCC 2006, Vol. 2' },
  { name: 'Petrol',                 value: '2.31',     unit: 'kg CO₂e / litre',         source: 'IPCC 2006, Vol. 2' },
  { name: 'LPG',                    value: '1.61',     unit: 'kg CO₂e / litre',         source: 'IPCC 2006, Vol. 2' },
  { name: 'Firewood / biomass',     value: '1.88',     unit: 'kg CO₂e / kg',            source: 'IPCC 2006, Vol. 2' },
  { name: 'Charcoal',               value: '3.49',     unit: 'kg CO₂e / kg',            source: 'IPCC 2006, Vol. 2' },
  { name: 'Motorcycle',             value: '0.113',    unit: 'kg CO₂e / passenger-km',  source: 'UK DESNZ 2023' },
  { name: 'Car / Jeep',             value: '0.171',    unit: 'kg CO₂e / passenger-km',  source: 'UK DESNZ 2023' },
  { name: 'Public microbus / tempo',value: '0.089',    unit: 'kg CO₂e / passenger-km',  source: 'WRI India 2015' },
  { name: 'School bus',             value: '0.027',    unit: 'kg CO₂e / passenger-km',  source: 'UK DESNZ 2023 (adapted)' },
  { name: 'Walking / cycling',      value: '0',        unit: 'kg CO₂e / passenger-km',  source: 'Universal' },
  { name: 'Paper / textbooks',      value: '1.84',     unit: 'kg CO₂e / kg',            source: 'EEA / IPCC lifecycle' },
  { name: 'Dal-bhat meal',          value: '0.9',      unit: 'kg CO₂e / meal',          source: 'Poore & Nemecek 2018' },
  { name: 'Mixed meal with meat',   value: '1.8',      unit: 'kg CO₂e / meal',          source: 'Poore & Nemecek 2018' },
  { name: 'Municipal landfill waste',value: '0.467',   unit: 'kg CO₂e / kg',            source: 'IPCC 2006, Vol. 5' },
  { name: 'Open burning waste',     value: '0.689',    unit: 'kg CO₂e / kg',            source: 'IPCC 2006, Vol. 5' },
  { name: 'Composting',             value: '0.01',     unit: 'kg CO₂e / kg',            source: 'IPCC 2006, Vol. 5' },
  { name: 'Pumped water',           value: '0.000344', unit: 'kg CO₂e / litre',         source: 'UKWIR proxy' },
]

// kg CO2e → tonnes, 2 dp.
export const toTonnes = (kg) => (Number(kg || 0) / 1000)
export const fmt = (n, dp = 1) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: dp })

// Build a sorted [{category,label,icon,color,emissions,tier,scope,pct}] list
// from a result's breakdown JSON.
export function categoryRows(result) {
  if (!result?.breakdown) return []
  const total = Number(result.totalEmissions) || 0
  return Object.entries(result.breakdown)
    .map(([cat, v]) => ({
      category: cat,
      ...(CATEGORY_META[cat] || { label: cat, icon: '•', color: '#9ca3af' }),
      emissions: Number(v.emissions) || 0,
      tier: v.tier,
      scope: v.scope,
      unit: v.unit,
      activityValue: v.activityValue,
      pct: total > 0 ? Math.round(((Number(v.emissions) || 0) / total) * 100) : 0,
    }))
    .sort((a, b) => b.emissions - a.emissions)
}

const GRADE_COLOR = (g) =>
  !g ? '#9ca3af'
    : g.startsWith('A') ? '#16a34a'
    : g.startsWith('B') ? '#65a30d'
    : g.startsWith('C') ? '#d97706'
    : '#dc2626'
export { GRADE_COLOR }

// ============================================================
// Downloadable report — opens a print window with a formatted summary.
// The browser's "Save as PDF" turns it into a real downloadable PDF.
// ============================================================
export function downloadAuditReport(audit, schoolName = 'Your School') {
  const r = audit?.result
  if (!r) {
    alert('No calculated result to download yet. Submit an audit first.')
    return
  }
  const rows = categoryRows(r)
  const period = audit.month ? `${audit.academicYear} · Month ${audit.month}` : `${audit.academicYear}`
  const recs = Array.isArray(r.recommendations) ? r.recommendations : []
  const enrollment = audit.enrollment || audit.result?.enrollment || null

  // Implied emission factor per category (emissions ÷ activity), shown only
  // when the activity figure is a real physical quantity (not the regional
  // per-student default, whose "activity" is already the kg value itself).
  const impliedFactor = (x) => {
    const a = Number(x.activityValue)
    if (!a || a <= 0 || /default/i.test(x.unit || '')) return '—'
    const f = Number(x.emissions) / a
    return `${f.toLocaleString(undefined, { maximumFractionDigits: 4 })} kg/${(x.unit || '').replace('passenger-km', 'pkm')}`
  }

  // Per-category rows with the underlying activity data + implied factor
  // (text only — emoji icons print as broken boxes in PDFs).
  const rowHtml = rows.map(x => `
    <tr>
      <td>${x.label}</td>
      <td>${x.activityValue != null ? `${fmt(x.activityValue, 1)} ${x.unit || ''}` : '—'}</td>
      <td style="text-align:right">${impliedFactor(x)}</td>
      <td style="text-align:right">${fmt(x.emissions, 0)} kg</td>
      <td style="text-align:right">${x.pct}%</td>
      <td>${x.scope?.replace('_', ' ')}</td>
      <td>${x.tier}</td>
    </tr>`).join('')

  // Owned-fleet detail, if the school transportation section was filled in.
  // Per-vehicle rows live on the persisted activity inputs, not in the result
  // breakdown, so read them from audit.activities.
  const activities = Array.isArray(audit.activities) ? audit.activities : []
  const vehicleAct = activities.find(a => a.category === 'VEHICLE_FUEL')
  const fleet = Array.isArray(vehicleAct?.inputs?.vehicles) ? vehicleAct.inputs.vehicles : []
  const fleetHtml = fleet.length ? `
    <h2>School Transportation Fleet (Scope 1)</h2>
    <table>
      <tr><th>Vehicle type</th><th style="text-align:right">Count</th><th>Fuel</th><th style="text-align:right">Litres / yr</th><th style="text-align:right">kg CO₂e / yr</th></tr>
      ${fleet.map(v => {
        const litres = Number(v.litresPerYear) || 0
        const factor = v.fuel === 'petrol' ? 2.31 : 2.68
        return `<tr>
          <td>${v.type || '—'}</td>
          <td style="text-align:right">${v.count != null ? v.count : '—'}</td>
          <td>${v.fuel || '—'}</td>
          <td style="text-align:right">${fmt(litres, 0)}</td>
          <td style="text-align:right">${fmt(litres * factor, 0)}</td>
        </tr>`
      }).join('')}
    </table>` : ''

  // Top-3 emission hotspots — the same insight shown on the Reports page.
  const hotspots = rows.slice(0, 3)
  const hotspotHtml = hotspots.map((h, i) => `
    <div class="hotspot">
      <div class="hs-rank">#${i + 1}</div>
      <div class="hs-body">
        <div class="hs-name">${h.label}</div>
        <div class="hs-meta">${h.scope?.replace('_', ' ')} · ${String(h.tier || '').toLowerCase()}</div>
      </div>
      <div class="hs-val">${fmt(h.emissions, 0)} kg<span>${h.pct}% of total</span></div>
    </div>`).join('')

  const totalSaving = recs.reduce((s, x) => s + (Number(x.potentialReductionKg) || 0), 0)
  const recHtml = recs.map(x => `<li>
      <strong>${x.title || ''}</strong>${x.priority ? ` <span class="pri pri-${String(x.priority).toLowerCase()}">${x.priority}</span>` : ''} — ${x.text || ''}
      ${x.potentialReductionKg ? `<em>(~${fmt(x.potentialReductionKg, 0)} kg CO₂e/yr potential saving)</em>` : ''}
    </li>`).join('')

  const factorHtml = EMISSION_FACTORS_REFERENCE.map(f => `
    <tr><td>${f.name}</td><td style="text-align:right">${f.value}</td><td>${f.unit}</td><td>${f.source}</td></tr>`).join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Carbon Audit Report — ${schoolName}</title>
    <style>
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
      body { font-family: Arial, 'Noto Sans', sans-serif; color:#1E2F1E; margin:32px; }
      h1 { margin:0 0 4px; font-size:22px; } .sub { color:#4E7D5B; font-size:13px; margin:0 0 20px; }
      .kpis { display:flex; gap:14px; margin-bottom:22px; flex-wrap:wrap; }
      .kpi { border:1px solid #e4edd6; border-radius:10px; padding:12px 16px; min-width:140px; }
      .kpi .l { font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; }
      .kpi .v { font-size:24px; font-weight:800; }
      table { width:100%; border-collapse:collapse; margin:8px 0 20px; font-size:12.5px; }
      th,td { border-bottom:1px solid #eee; padding:7px 8px; text-align:left; vertical-align:top; }
      th { background:#f5f7ee; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#4E7D5B; }
      h2 { font-size:15px; margin:20px 0 6px; } ul { font-size:13px; line-height:1.7; padding-left:18px; }
      .foot { margin-top:28px; font-size:11px; color:#9ca3af; border-top:1px solid #eee; padding-top:10px; }
      .flag { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:#fef3c7; color:#92400e; }
      .hotspot { display:flex; align-items:center; gap:12px; border:1px solid #e4edd6; border-radius:10px; padding:10px 14px; margin-bottom:8px; }
      .hs-rank { font-size:18px; font-weight:800; color:#4E7D5B; width:34px; }
      .hs-body { flex:1; } .hs-name { font-weight:700; font-size:13px; } .hs-meta { font-size:11px; color:#9ca3af; text-transform:capitalize; }
      .hs-val { text-align:right; font-weight:800; font-size:14px; color:#1E2F1E; }
      .hs-val span { display:block; font-size:10px; font-weight:600; color:#9ca3af; }
      .pri { font-size:10px; font-weight:700; padding:1px 6px; border-radius:8px; }
      .pri-high { background:#fee2e2; color:#dc2626; } .pri-medium { background:#fef3c7; color:#d97706; } .pri-low { background:#dcfce7; color:#16a34a; }
      .note { font-size:11.5px; color:#6b7280; margin:2px 0 14px; }
    </style></head><body>
    <h1>Annual Carbon Audit Report</h1>
    <p class="sub">${schoolName} · ${period} · CoPaila Carbon Audit Programme</p>

    <div class="kpis">
      <div class="kpi"><div class="l">Total Footprint</div><div class="v">${fmt(toTonnes(r.totalEmissions), 2)} tCO₂e</div></div>
      <div class="kpi"><div class="l">Per Student</div><div class="v">${fmt(r.emissionsPerStudent, 0)} kg</div></div>
      <div class="kpi"><div class="l">Grade</div><div class="v">${r.grade || '—'}</div></div>
      <div class="kpi"><div class="l">Data Confidence</div><div class="v">${fmt(r.confidenceScore, 0)}%</div></div>
    </div>

    <h2>Audit Details</h2>
    <table>
      <tr><td>School</td><td>${schoolName}</td></tr>
      <tr><td>Reporting period</td><td>${period}</td></tr>
      ${enrollment ? `<tr><td>Enrolment (students)</td><td>${fmt(enrollment, 0)}</td></tr>` : ''}
      <tr><td>Total emissions</td><td>${fmt(r.totalEmissions, 0)} kg CO₂e (${fmt(toTonnes(r.totalEmissions), 2)} tCO₂e)</td></tr>
    </table>

    <h2>Emissions by Scope</h2>
    <table>
      <tr><th>Scope</th><th style="text-align:right">kg CO₂e</th><th style="text-align:right">Share</th></tr>
      <tr><td>Scope 1 — Direct (fuel, generator, vehicles, cooking)</td><td style="text-align:right">${fmt(r.scope1Emissions, 0)}</td><td style="text-align:right">${r.totalEmissions > 0 ? Math.round((r.scope1Emissions / r.totalEmissions) * 100) : 0}%</td></tr>
      <tr><td>Scope 2 — Purchased electricity</td><td style="text-align:right">${fmt(r.scope2Emissions, 0)}</td><td style="text-align:right">${r.totalEmissions > 0 ? Math.round((r.scope2Emissions / r.totalEmissions) * 100) : 0}%</td></tr>
      <tr><td>Scope 3 — Indirect (commute, food, paper, waste, water)</td><td style="text-align:right">${fmt(r.scope3Emissions, 0)}</td><td style="text-align:right">${r.totalEmissions > 0 ? Math.round((r.scope3Emissions / r.totalEmissions) * 100) : 0}%</td></tr>
      <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${fmt(r.totalEmissions, 0)}</strong></td><td style="text-align:right"><strong>100%</strong></td></tr>
    </table>

    <h2>Breakdown by Category</h2>
    <table>
      <tr><th>Category</th><th>Activity data</th><th style="text-align:right">Implied factor</th><th style="text-align:right">Emissions</th><th style="text-align:right">Share</th><th>Scope</th><th>Data tier</th></tr>
      ${rowHtml}
    </table>
    <p class="note">"Activity data" is the underlying measured/estimated quantity; "implied factor" is emissions ÷ activity for that line.</p>

    ${fleetHtml}

    ${hotspots.length ? `<h2>Emission Hotspots</h2>${hotspotHtml}` : ''}

    <h2>Data Confidence</h2>
    <p style="font-size:13px">Tier 1 (measured): <strong>${fmt(r.tier1Pct, 0)}%</strong> ·
       Tier 2 (estimated): <strong>${fmt(r.tier2Pct, 0)}%</strong> ·
       Tier 3 (national default): <strong>${fmt(r.tier3Pct, 0)}%</strong> ·
       Overall confidence: <strong>${fmt(r.confidenceScore, 0)}%</strong></p>
    ${r.partiallyDefault ? `<p><span class="flag">Contains default data</span> — categories with no data provided use transparent national-average estimates (Tier 3); treat those parts as estimates, not measurements.</p>` : ''}

    ${recs.length ? `<h2>Recommendations${totalSaving > 0 ? ` — up to ${fmt(totalSaving, 0)} kg CO₂e/yr potential saving` : ''}</h2><ul>${recHtml}</ul>` : ''}

    <h2>Emission Factors &amp; Methodology</h2>
    <p class="note">All factors are kg CO₂e per stated unit. CO₂e uses 100-yr GWPs (IPCC AR5). Calculation follows the GHG Protocol three-scope model with a three-tier data-quality system (measured → estimated → national default).</p>
    <table>
      <tr><th>Activity</th><th style="text-align:right">Factor</th><th>Unit</th><th>Source</th></tr>
      ${factorHtml}
    </table>

    <div class="foot">Generated by CoPaila on ${new Date().toLocaleDateString()} · Sources: IPCC 2006 (Vol. 2 &amp; 5), NEA / CDM baseline, UK DESNZ 2023, WRI India 2015, Poore &amp; Nemecek 2018, UKWIR · GWP: IPCC AR5.</div>
    </body></html>`

  const win = window.open('', '_blank')
  if (!win) { alert('Please allow pop-ups to download the report.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
}
