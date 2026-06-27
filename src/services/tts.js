// ── Text-to-Speech engine ────────────────────────────────────────────────────
// Client-side speech via the browser Web Speech API (no keys, no backend).
// Speaks English + Nepali (नेपाली). Designed to be SWAPPABLE: to move to a
// cloud TTS (Google / ElevenLabs / Azure) later, replace the body of `speak()`
// with a fetch that plays an <audio> element, keeping the same return shape:
//
//     const { promise, cancel } = speak(text, { lang, onStart, onEnd })
//
// `promise` resolves when speech finishes (or the silent fallback timer fires),
// so callers can `await` a line before moving on. `cancel()` stops it early.

let voicesCache = []
let voicesPromise = null  // dedup concurrent loadVoices() calls

/** Whether the browser can synthesize speech at all. */
export function ttsSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  )
}

// Voices populate asynchronously in most browsers — resolve once they're ready.
// Multiple concurrent callers share the same promise so we only attach one listener.
function loadVoices() {
  if (!ttsSupported()) return Promise.resolve([])

  // Fast path: voices already cached.
  if (voicesCache.length) return Promise.resolve(voicesCache)

  // Deduplicate: if a load is already in flight, return it.
  if (voicesPromise) return voicesPromise

  const synth = window.speechSynthesis

  // Some browsers already have voices synchronously.
  const immediate = synth.getVoices()
  if (immediate && immediate.length) {
    voicesCache = immediate
    return Promise.resolve(voicesCache)
  }

  voicesPromise = new Promise((resolve) => {
    let timer = null

    const done = (list) => {
      if (timer) { clearTimeout(timer); timer = null }
      voicesCache = list && list.length ? list : voicesCache
      voicesPromise = null
      resolve(voicesCache)
    }

    const onChange = () => {
      const v = synth.getVoices()
      if (v && v.length) {
        synth.removeEventListener?.('voiceschanged', onChange)
        done(v)
      }
    }
    synth.addEventListener?.('voiceschanged', onChange)

    // Timeout fallback — some browsers never fire voiceschanged.
    timer = setTimeout(() => {
      synth.removeEventListener?.('voiceschanged', onChange)
      done(synth.getVoices() || [])
    }, 1500)
  })

  return voicesPromise
}

const norm = (s) => (s || '').toLowerCase().replace('_', '-')

// Pick the best available voice for a UI language code ('en' | 'ne').
// Nepali voices are rarely installed, so we fall back to Hindi, which reads
// Devanagari script intelligibly, then to any English voice.
function pickVoice(voices, lang) {
  if (!voices || !voices.length) return null

  const prefs = lang === 'ne'
    ? ['ne-np', 'ne', 'hi-in', 'hi', 'en-in', 'en-gb', 'en-us', 'en']
    : ['en-in', 'en-gb', 'en-us', 'en-au', 'en']

  // Exact tag match first.
  for (const p of prefs) {
    const hit = voices.find((v) => norm(v.lang) === p)
    if (hit) return hit
  }
  // Base-language match (any "en-*" / "hi-*").
  for (const p of prefs) {
    const base = p.split('-')[0]
    const hit = voices.find((v) => norm(v.lang).startsWith(base + '-') || norm(v.lang) === base)
    if (hit) return hit
  }
  // Any voice is better than none.
  return voices[0]
}

function langTag(lang, voice) {
  if (voice?.lang) return voice.lang
  return lang === 'ne' ? 'ne-NP' : 'en-US'
}

/**
 * Estimate how long a line takes to speak (ms). Used to drive the talking
 * animation + subtitles when audio is unavailable or blocked, and as a safety
 * net for engines that never fire `onend`.
 */
export function estimateDurationMs(text, lang = 'en') {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length
  const wps = lang === 'ne' ? 2.2 : 2.8 // words per second
  return Math.max(1100, Math.round((words / wps) * 1000) + 400)
}

/**
 * Speak `text`. Returns `{ promise, cancel }`.
 *   - promise: resolves when the utterance ends (or the fallback timer fires).
 *   - cancel(): stops playback immediately and resolves the promise.
 * Options: { lang, rate, pitch, onStart, onEnd, onError }.
 */
export function speak(text, opts = {}) {
  const { lang = 'en', rate = 1, pitch = 1, onStart, onEnd, onError } = opts

  let settled = false
  let timer = null
  let resolveFn = null
  const promise = new Promise((resolve) => { resolveFn = resolve })

  const clearTimer = () => { if (timer) { clearTimeout(timer); timer = null } }

  // Natural completion → fire onEnd then resolve.
  const end = () => {
    if (settled) return
    settled = true
    clearTimer()
    onEnd && onEnd()
    resolveFn && resolveFn()
  }

  // Interrupted → resolve WITHOUT onEnd (caller is moving on deliberately).
  const cancel = () => {
    if (settled) return
    settled = true
    clearTimer()
    try { window.speechSynthesis?.cancel() } catch { /* noop */ }
    resolveFn && resolveFn()
  }

  const run = async () => {
    const DBG = '[TTS]'
    // No engine (or nothing to say): drive the animation on a timer so the
    // character still "talks" visually and subtitles still show.
    if (!ttsSupported() || !text || !text.trim()) {
      console.warn(DBG, 'not supported or empty text — using silent timer')
      onStart && onStart()
      timer = setTimeout(end, estimateDurationMs(text, lang))
      return
    }

    const synth = window.speechSynthesis
    console.log(DBG, 'speak() called | speaking:', synth.speaking, '| pending:', synth.pending, '| paused:', synth.paused, '| text:', text.slice(0, 60))

    // Cancel any utterance that might be queued or speaking.
    try { synth.cancel() } catch { /* noop */ }

    // ── Chrome cancel→speak timing fix ─────────────────────────────────────
    // Chrome's synthesis engine needs a real macro-task gap after cancel()
    // before it will reliably accept a new speak() call. A microtask gap
    // (just awaiting a resolved promise) is NOT enough — the utterance gets
    // silently dropped. 80 ms is enough in practice while not feeling laggy.
    await new Promise((r) => setTimeout(r, 80))
    if (settled) return // cancelled during the wait

    const voices = await loadVoices()
    console.log(DBG, 'voices loaded:', voices.length, '| first voice:', voices[0]?.name, voices[0]?.lang)
    if (settled) return // cancelled while voices were loading

    const voice = pickVoice(voices, lang)
    console.log(DBG, 'selected voice:', voice?.name, voice?.lang, '| lang:', lang)

    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.lang = langTag(lang, voice)
    u.rate = rate
    u.pitch = pitch

    u.onstart = () => {
      console.log(DBG, 'onstart fired ✓')
      onStart && onStart()
    }

    // Safety net: if onend never fires (a known cross-browser quirk), resolve
    // on an estimated timeout so the UI never gets stuck "talking".
    timer = setTimeout(end, estimateDurationMs(text, lang) + 5000)

    // Chrome pauses synthesis after ~15 s of page idle time.
    // Poll every 5 s: resume if paused, or fire end() if the synth
    // shows "speaking" but has actually gone silent (Chrome freeze bug).
    const resumeInterval = setInterval(() => {
      if (settled) { clearInterval(resumeInterval); return }
      if (synth.paused) {
        synth.resume()
      } else if (!synth.speaking && !synth.pending) {
        // Utterance finished but onend never fired — resolve now.
        console.warn(DBG, 'onend never fired — forcing end via interval')
        clearInterval(resumeInterval)
        end()
      }
    }, 5000)

    u.onend = () => {
      console.log(DBG, 'onend fired ✓')
      clearInterval(resumeInterval)
      end()
    }

    // 'canceled' and 'interrupted' are not errors — they fire when cancel()
    // is called deliberately. 'not-allowed' means no user gesture yet; treat
    // it as a silent fallback (animation still runs via the safety timer).
    u.onerror = (e) => {
      console.warn(DBG, 'onerror:', e?.error, e)
      clearInterval(resumeInterval)
      const code = e?.error
      if (code !== 'canceled' && code !== 'interrupted' && code !== 'not-allowed') {
        onError && onError(e)
      }
      end()
    }

    console.log(DBG, 'calling synth.speak() now')
    try { synth.speak(u) }
    catch (e) {
      console.error(DBG, 'synth.speak() threw:', e)
      clearInterval(resumeInterval)
      onError && onError(e)
      end()
    }
    console.log(DBG, 'after synth.speak() | speaking:', synth.speaking, '| pending:', synth.pending)
  }

  run()
  return { promise, cancel }
}

/** Stop any in-flight speech immediately (global hard stop). */
export function cancelSpeech() {
  try { window.speechSynthesis?.cancel() } catch { /* noop */ }
}

// Best-effort audio "unlock": browsers gate speech behind a user gesture.
// Call this from the first click/tap so later speak() calls are audible.
// We speak a near-silent space at high rate so it finishes in milliseconds,
// then let it complete naturally — calling cancel() right after speak() can
// put Chrome's synthesis engine into a confused state.
export function primeSpeech() {
  if (!ttsSupported()) return
  try {
    const synth = window.speechSynthesis
    // Cancel anything already queued first.
    synth.cancel()
    const u = new SpeechSynthesisUtterance(' ') // non-breaking space
    u.volume = 0
    u.rate = 10  // finish in < 50 ms
    synth.speak(u)
    // Do NOT call cancel() immediately after — let it complete on its own.
    // The actual speak() call in ttsSpeak will cancel it after 80 ms anyway.
  } catch { /* noop */ }
}
