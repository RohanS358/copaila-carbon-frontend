import { useState, useRef, useCallback, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import { speak as ttsSpeak, cancelSpeech } from '../services/tts'

// ── useTalkingPet ─────────────────────────────────────────────────────────────
// The brain behind the animated character. Exposes the pet's three states as
// three callable "tools", plus the live subtitle string:
//
//   state      'idle' | 'talking' | 'celebrating'
//   subtitle   the line currently being spoken (shown above the character)
//
//   speak(text, opts)   → talk: play talking.mp4 + speak `text` (TTS) + subtitle,
//                          then return to idle. Resolves when the line finishes.
//   celebrate(opts)     → party: play happy_jumping.mp4 (+ confetti in PetStage),
//                          optionally speak a line, then return to idle.
//   idle()              → stop everything and go back to idle.
//
// `text` can come from anywhere: a hard-coded default string for a button/option,
// or an async LLM response — both just get passed to speak().
//
// Language follows the global EN/NE toggle automatically; pass { lang } to force.

export function useTalkingPet() {
  const { lang } = useLang()
  const [state, setState] = useState('idle')
  const [subtitle, setSubtitle] = useState('')

  const controlRef = useRef(null) // active TTS control { promise, cancel }
  const langRef = useRef(lang)
  const aliveRef = useRef(true)   // guards async state updates after unmount
  useEffect(() => { langRef.current = lang }, [lang])

  // Stop anything in flight on unmount.
  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      try { controlRef.current?.cancel() } catch { /* noop */ }
      cancelSpeech()
    }
  }, [])

  /** idle(): hard stop → back to the resting state. */
  const idle = useCallback(() => {
    try { controlRef.current?.cancel() } catch { /* noop */ }
    controlRef.current = null
    setSubtitle('')
    setState('idle')
  }, [])

  /** speak(text): talk the line, then settle back to idle. */
  const speak = useCallback((text, opts = {}) => {
    const code = opts.lang || langRef.current

    // Interrupt whatever is currently playing.
    try { controlRef.current?.cancel() } catch { /* noop */ }

    setSubtitle(text || '')
    setState('talking')

    let control
    control = ttsSpeak(text, {
      lang: code,
      rate: opts.rate,
      pitch: opts.pitch,
      onStart: opts.onStart,
      onError: opts.onError,
      onEnd: () => {
        // Only settle to idle if this line is still the active one — a newer
        // speak()/celebrate() may have already taken over.
        if (controlRef.current === control) {
          controlRef.current = null
          setSubtitle('')
          setState('idle')
        }
        opts.onEnd && opts.onEnd()
      },
    })
    controlRef.current = control
    return control.promise
  }, [])

  /**
   * celebrate({ text, duration }): play the happy-jumping animation (PetStage
   * adds confetti for this state) while optionally speaking `text`, then idle.
   * Resolves after `duration` ms (default 4200).
   */
  const celebrate = useCallback(async (opts = {}) => {
    const { text = '', duration = 4200 } = opts
    const code = opts.lang || langRef.current

    try { controlRef.current?.cancel() } catch { /* noop */ }
    setState('celebrating')
    setSubtitle(text || '')

    if (text) {
      controlRef.current = ttsSpeak(text, { lang: code })
    }

    await new Promise((res) => setTimeout(res, duration))
    if (!aliveRef.current) return // unmounted mid-celebration

    try { controlRef.current?.cancel() } catch { /* noop */ }
    controlRef.current = null
    setSubtitle('')
    setState('idle')
  }, [])

  return {
    state,
    subtitle,
    isSpeaking: state === 'talking',
    isCelebrating: state === 'celebrating',
    speak,
    celebrate,
    idle,
  }
}
