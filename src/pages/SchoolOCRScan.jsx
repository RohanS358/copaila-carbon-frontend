import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SchoolLayout from '../layouts/SchoolLayout'
import { omrApi, carbonApi } from '../services/api'
import schoolLayout from '../data/omr-school-layout.json'
import studentLayout from '../data/omr-student-layout.json'
import { useIsMobile } from '../hooks/useMediaQuery'
import { Camera, Upload, Printer, FileText, School, Backpack, AlertTriangle, CheckCircle2 } from 'lucide-react'

// ============================================================
// OMR SCANNER — wired to the backend OMR child-service.
// Two printable bubble sheets (School + Student) are rendered as
// pixel-exact SVGs from the SAME geometry the OMRChecker template is
// generated from. Print → fill → scan/upload → the backend reads the
// bubbles and returns the answers + a carbon-audit payload.
// ============================================================

const LAYOUTS = { school: schoolLayout, student: studentLayout }
const SHEET_META = {
  school: { tab: 'School Form', label: 'School Carbon Audit' },
  student: { tab: 'Student Survey', label: 'Student Eco Survey' },
}

function useStyles() {
  useEffect(() => {
    let s = document.getElementById('ocr-styles')
    if (!s) { s = document.createElement('style'); s.id = 'ocr-styles'; document.head.appendChild(s) }
    s.textContent = `
      @keyframes scanMove { 0%{top:0%} 50%{top:calc(100% - 2px)} 100%{top:0%} }
      @keyframes ocrSpin { to { transform: rotate(360deg); } }
      @keyframes ocrFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes cornerGlow { 0%,100%{box-shadow:0 0 6px #4ade80} 50%{box-shadow:0 0 16px #4ade80} }
    `
  }, [])
}

// ── The printable OMR sheet (pixel-exact, matches the backend template) ──
function SheetSvg({ layout }) {
  const [W, H] = layout.page
  const r = layout.bubbleR
  const markers = [[16, 16], [W - 38, 16], [16, H - 38], [W - 38, H - 38]]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', background: '#fff', fontFamily: "'Google Sans', sans-serif" }}>
      {/* border + corner markers (registration for CropPage) */}
      <rect x="3" y="3" width={W - 6} height={H - 6} rx="14" fill="#fff" stroke="#1E2F1E" strokeWidth="2.5" />
      {markers.map(([x, y], i) => <rect key={i} x={x} y={y} width="22" height="22" fill="#1E2F1E" />)}

      {/* header */}
      <text x={W / 2} y="46" textAnchor="middle" fontSize="25" fontWeight="800" fill="#1E2F1E">{layout.title}</text>
      <text x={W / 2} y="72" textAnchor="middle" fontSize="12.5" fill="#4E7D5B">CoPaila Carbon Audit Programme</text>
      <text x={W / 2} y="98" textAnchor="middle" fontSize="12.5" fill="#166534">✏️ {layout.hint}</text>

      {layout.sections.map((sec) => (
        <g key={sec.letter}>
          <rect x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="12" fill="#fff" stroke="#e4edd6" strokeWidth="1.5" />
          <path d={`M${sec.x + 12} ${sec.y} h${sec.w - 24} a12 12 0 0 1 12 12 v18 h${-sec.w} v-18 a12 12 0 0 1 12 -12 z`} fill="#1E2F1E" />
          <text x={sec.x + 14} y={sec.y + 20} fontSize="13" fontWeight="800" fill="#EEF2DC">{sec.letter} · {sec.title}</text>
          {sec.questions.map((q) => (
            <g key={q.key}>
              <text x={q.textAt[0]} y={q.textAt[1]} fontSize="13" fontWeight="700" fill="#1E2F1E">{q.n}. {q.text}</text>
              {q.bubbles.map((b, i) => (
                <g key={i}>
                  <circle cx={b.cx} cy={b.cy} r={r} fill="#fff" stroke="#2D4A32" strokeWidth="1.6" />
                  <text x={b.cx + r + 5} y={b.cy} dominantBaseline="central" fontSize="11.5" fill="#1E2F1E">{b.label}</text>
                </g>
              ))}
            </g>
          ))}
        </g>
      ))}

      <text x={W / 2} y={H - 14} textAnchor="middle" fontSize="11" fill="#9ca3af">Form: {layout.sheet} · Fill by hand, then scan via the School Portal → OMR Scanner</text>
    </svg>
  )
}

function FormsModal({ onClose, initialTab = 'school' }) {
  const [tab, setTab] = useState(initialTab)

  function handlePrint() {
    const area = document.getElementById('ocr-print-area')
    if (!area) return
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>${SHEET_META[tab].label}</title>
      <style>@page { size: A4; margin: 10mm; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } body { margin: 0; }</style>
      </head><body>${area.innerHTML}</body></html>`)
    win.document.close(); win.focus()
    setTimeout(() => win.print(), 150)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,20,10,0.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '1.5rem 1rem' }}>
      <div style={{ background: '#f7f9f2', borderRadius: '1.25rem', width: '100%', maxWidth: 760, marginBottom: '2rem' }}>
        <div style={{ background: '#1E2F1E', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }}>
          <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#EEF2DC' }}>📋 Printable OMR Sheets</span>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={handlePrint} style={{ background: '#4E7D5B', color: '#EEF2DC', border: 'none', borderRadius: '0.5rem', padding: '0.45rem 0.9rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>🖨️ Print / Download</button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#EEF2DC', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #e4edd6', background: '#fff' }}>
          {Object.keys(LAYOUTS).map((key) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, border: 'none', background: tab === key ? '#f0fdf4' : '#fff', cursor: 'pointer', padding: '0.75rem 1rem', borderBottom: tab === key ? '3px solid #2D4A32' : '3px solid transparent', fontWeight: 800, fontSize: '0.84rem', color: tab === key ? '#1E2F1E' : '#9ca3af' }}>
              {SHEET_META[key].tab}
            </button>
          ))}
        </div>
        <div id="ocr-print-area" style={{ padding: '1.25rem', background: '#fff' }}>
          <SheetSvg layout={LAYOUTS[tab]} />
        </div>
      </div>
    </div>
  )
}

function Corner({ pos }) {
  const s = { position: 'absolute', width: 22, height: 22, animation: 'cornerGlow 1.8s ease-in-out infinite' }
  if (pos === 'tl') return <div style={{ ...s, top: -2, left: -2, borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
  if (pos === 'tr') return <div style={{ ...s, top: -2, right: -2, borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
  if (pos === 'bl') return <div style={{ ...s, bottom: -2, left: -2, borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
  return <div style={{ ...s, bottom: -2, right: -2, borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
}

export default function SchoolOCRScan() {
  useStyles()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const [phase, setPhase] = useState('idle')   // idle|camera|processing|results
  const [scanSheet, setScanSheet] = useState('school')
  const [capturedImg, setCapturedImg] = useState(null)
  const [result, setResult] = useState(null)   // { sheet, submit, answers, audit }
  const [error, setError] = useState('')
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear())
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formTab, setFormTab] = useState('school')

  useEffect(() => {
    if (phase === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [phase])
  useEffect(() => () => stopStream(), [])

  function stopStream() {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
  }

  async function openCamera() {
    setError('')
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } } })
      setPhase('camera')
    } catch {
      setError('Camera unavailable. Use "Upload an image" instead.')
    }
  }

  function captureFromCamera() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    canvas.getContext('2d').drawImage(video, 0, 0)
    setCapturedImg(canvas.toDataURL('image/jpeg', 0.92))
    stopStream()
    canvas.toBlob(b => scanImage(new File([b], 'sheet.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92)
  }

  function onFilePicked(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCapturedImg(URL.createObjectURL(file))
    scanImage(file)
  }

  async function scanImage(file) {
    setError('')
    setPhase('processing')
    try {
      const res = await omrApi.scan(file, scanSheet)   // → { sheet, submit, answers, audit }
      setResult(res)
      setPhase('results')
    } catch (err) {
      setError(err.message || 'Scan failed')
      setPhase('idle')
    }
  }

  async function submitAudit() {
    setSubmitting(true)
    setError('')
    try {
      await carbonApi.submit({ academicYear: Number(academicYear), ...result.audit })
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setSaved(false); setCapturedImg(null); setResult(null); setError(''); setPhase('idle')
  }

  return (
    <SchoolLayout>
      {showForm && <FormsModal onClose={() => setShowForm(false)} initialTab={formTab} />}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFilePicked} style={{ display: 'none' }} />

      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div style={{ width: 38, height: 38, background: '#1E2F1E', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={20} color="#EEF2DC" /></div>
            <h1 style={{ fontWeight: 900, fontSize: '1.7rem', color: '#1E2F1E', margin: 0 }}>OMR Form Scanner</h1>
          </div>
          <p style={{ color: '#7BAE7F', fontSize: '0.82rem', margin: 0, maxWidth: '54rem', lineHeight: 1.6 }}>
            Print the School or Student bubble sheet, fill it by hand, then scan or upload it. The backend reads the bubbles — no typing required.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={14} /> {error}</div>
        )}

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e4edd6', padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1E2F1E', margin: '0 0 1rem' }}>Which sheet are you scanning?</h2>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {Object.keys(LAYOUTS).map((key) => (
                  <button key={key} onClick={() => setScanSheet(key)}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem',
                      border: scanSheet === key ? '2px solid #2D4A32' : '1.5px solid #e4edd6',
                      background: scanSheet === key ? '#f0fdf4' : '#fff', color: scanSheet === key ? '#1E2F1E' : '#6b7280' }}>
                    {SHEET_META[key].tab}
                  </button>
                ))}
              </div>

              <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1E2F1E', margin: '0 0 1rem' }}>How it works</h2>
              {[
                { n: '1', title: 'Print the sheet', desc: 'Open the printable forms on the right and print the School or Student sheet.' },
                { n: '2', title: 'Fill the bubbles', desc: 'Shade one circle per question. Fill it in completely.' },
                { n: '3', title: 'Scan or upload', desc: 'Use your camera or upload a clear photo / scan of the sheet.' },
                { n: '4', title: 'Review & submit', desc: 'Check the read answers, then submit the school audit.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E2F1E', color: '#EEF2DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.78rem', flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E2F1E', margin: '0 0 0.2rem' }}>{s.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={openCamera} style={{ flex: 1, background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.875rem', padding: '0.9rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Camera size={18} /> Open Camera</button>
                <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, background: '#fff', color: '#1E2F1E', border: '1.5px solid #2D4A32', borderRadius: '0.875rem', padding: '0.9rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Upload size={18} /> Upload an image</button>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.6rem', textAlign: 'center' }}>Scanning: <strong style={{ color: '#2D4A32' }}>{SHEET_META[scanSheet].label}</strong></p>
            </div>

            <div>
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '1rem', padding: '1.1rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={15} /> Printable OMR Sheets</p>
                <p style={{ fontSize: '0.74rem', color: '#166534', margin: '0 0 0.75rem', lineHeight: 1.6 }}>School audit + Student survey. Print, fill the bubbles, then scan.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setFormTab('school'); setShowForm(true) }} style={{ flex: 1, background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.6rem', padding: '0.55rem', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><School size={13} /> School</button>
                  <button onClick={() => { setFormTab('student'); setShowForm(true) }} style={{ flex: 1, background: '#fff', color: '#1E2F1E', border: '1.5px solid #2D4A32', borderRadius: '0.6rem', padding: '0.55rem', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><Backpack size={13} /> Student</button>
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '1rem', padding: '0.875rem 1rem', fontSize: '0.72rem', color: '#92400e', lineHeight: 1.6 }}>
                Best results: lay the sheet flat, fill the whole frame, avoid shadows.
              </div>
            </div>
          </div>
        )}

        {/* ── CAMERA ── */}
        {phase === 'camera' && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ position: 'relative', background: '#000', borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3', marginBottom: '1rem' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '8%', left: '6%', right: '6%', bottom: '8%', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}>
                <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#4ade80', animation: 'scanMove 2.4s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.875rem' }}>
              <button onClick={() => { stopStream(); setPhase('idle') }} style={{ flex: 1, background: '#fff', color: '#1E2F1E', border: '1.5px solid #e4edd6', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>← Cancel</button>
              <button onClick={captureFromCamera} style={{ flex: 2, background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>📸 Capture &amp; Scan</button>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'processing' && (
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
            {capturedImg && <img src={capturedImg} alt="" style={{ width: '100%', borderRadius: '1rem', marginBottom: '1.25rem', filter: 'brightness(0.85)' }} />}
            <div style={{ width: 48, height: 48, border: '4px solid #e4edd6', borderTopColor: '#2D4A32', borderRadius: '50%', animation: 'ocrSpin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 800, color: '#1E2F1E', margin: 0 }}>Reading the OMR sheet…</p>
            <p style={{ fontSize: '0.78rem', color: '#7BAE7F', marginTop: '0.3rem' }}>The backend OMR engine is detecting the marked bubbles.</p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && result && !saved && (
          <div style={{ animation: 'ocrFadeUp 0.4s ease both', maxWidth: 720, margin: '0 auto' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.75rem' }}>✅</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, color: '#166534', margin: '0 0 0.15rem' }}>{SHEET_META[result.sheet].label} — sheet read</p>
                <p style={{ fontSize: '0.75rem', color: '#4E7D5B', margin: 0 }}>{result.answers.filter(a => a.answer).length} of {result.answers.length} questions detected. Unread ones show “—”.</p>
              </div>
              {capturedImg && <img src={capturedImg} alt="" style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: '0.5rem', border: '2px solid #86efac' }} />}
            </div>

            {/* answers */}
            <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e4edd6', overflow: 'hidden', marginBottom: '1.25rem' }}>
              {result.answers.map((a, i) => (
                <div key={a.key} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.7rem 1rem', borderTop: i ? '1px solid #f1f5f0' : 'none' }}>
                  <span style={{ fontSize: '0.8rem', color: '#374151' }}>{i + 1}. {a.question}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: a.answer ? '#166534' : '#d1d5db', whiteSpace: 'nowrap' }}>{a.answer || '—'}</span>
                </div>
              ))}
            </div>

            {result.submit ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E2F1E' }}>Academic year</label>
                  <input type="number" value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ width: 110, padding: '0.45rem 0.7rem', border: '1.5px solid #e4edd6', borderRadius: '0.5rem', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.875rem' }}>
                  <button onClick={reset} style={{ flex: 1, background: '#fff', color: '#1E2F1E', border: '1.5px solid #e4edd6', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>↩ Scan Again</button>
                  <button onClick={submitAudit} disabled={submitting} style={{ flex: 2, background: submitting ? '#9ca3af' : '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Submitting…' : '✓ Confirm & Submit Audit'}</button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.875rem' }}>
                <button onClick={reset} style={{ flex: 1, background: '#fff', color: '#1E2F1E', border: '1.5px solid #e4edd6', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>↩ Scan Again</button>
                <button onClick={() => setSaved(true)} style={{ flex: 2, background: '#1E2F1E', color: '#EEF2DC', border: 'none', borderRadius: '0.875rem', padding: '0.875rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>✓ Save Responses</button>
              </div>
            )}
          </div>
        )}

        {/* ── SAVED ── */}
        {saved && (
          <div style={{ maxWidth: 460, margin: '2rem auto 0', background: '#1E2F1E', borderRadius: '1rem', padding: '2.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🌿</span>
            <p style={{ fontWeight: 900, fontSize: '1.15rem', color: '#EEF2DC', margin: '0 0 0.4rem' }}>{result?.submit ? 'Audit submitted & calculated!' : 'Responses saved!'}</p>
            <p style={{ fontSize: '0.78rem', color: '#a3c9a8', margin: '0 0 1.25rem', lineHeight: 1.6 }}>{result?.submit ? 'The scanned data was processed by the carbon calculator and is on your dashboard.' : 'The student survey responses have been recorded.'}</p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button onClick={reset} style={{ background: 'rgba(255,255,255,0.12)', color: '#EEF2DC', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '0.75rem', padding: '0.65rem 1.25rem', fontWeight: 700, cursor: 'pointer' }}>Scan Another</button>
              <button onClick={() => navigate('/dashboard')} style={{ background: '#EEF2DC', color: '#1E2F1E', border: 'none', borderRadius: '0.75rem', padding: '0.65rem 1.25rem', fontWeight: 800, cursor: 'pointer' }}>View Dashboard →</button>
            </div>
          </div>
        )}
      </div>
    </SchoolLayout>
  )
}
