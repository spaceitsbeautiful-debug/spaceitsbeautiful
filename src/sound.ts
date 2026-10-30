import { useSyncExternalStore } from 'react'

// All sounds are synthesized with the Web Audio API: no audio files to load.
// Sound is off by default; the choice is remembered. Browsers only allow audio after a
// click or key press, so the audio context starts on the first interaction.

type Sfx = 'hover' | 'click' | 'open' | 'chime' | 'burst'

let enabled = false
try {
  enabled = localStorage.getItem('sound') === 'on'
} catch {
  /* private window */
}
const listeners = new Set<() => void>()
let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambient: { stop: () => void } | null = null
let lastHover = 0

function ensureContext() {
  if (ctx) return ctx
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  return ctx
}

/** Low, slowly breathing drone: two detuned voices through a soft low-pass filter. */
function startAmbient() {
  if (!ctx || !master || ambient) return
  const out = ctx.createGain()
  out.gain.value = 0
  out.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  filter.connect(out)
  out.connect(master)

  const voices = [110, 164.81, 220.5].map((f, i) => {
    const o = ctx!.createOscillator()
    o.type = i === 2 ? 'triangle' : 'sine'
    o.frequency.value = f
    o.detune.value = (i - 1) * 6
    const g = ctx!.createGain()
    g.gain.value = i === 2 ? 0.15 : 0.5
    o.connect(g).connect(filter)
    o.start()
    return o
  })
  // Slow "breathing" on the filter
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 220
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()

  ambient = {
    stop() {
      const t = ctx!.currentTime
      out.gain.cancelScheduledValues(t)
      out.gain.setValueAtTime(out.gain.value, t)
      out.gain.linearRampToValueAtTime(0, t + 0.8)
      setTimeout(() => {
        voices.forEach((v) => v.stop())
        lfo.stop()
        out.disconnect()
      }, 900)
    },
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, endFreq?: number, delay = 0) {
  if (!ctx || !master) return
  const t = ctx.currentTime + delay
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur: number, from: number, to: number, vol: number) {
  if (!ctx || !master) return
  const t = ctx.currentTime
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
  const d = buffer.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.2
  bp.frequency.setValueAtTime(from, t)
  bp.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.3)
  g.gain.linearRampToValueAtTime(0, t + dur)
  src.connect(bp).connect(g).connect(master)
  src.start(t)
}

export function playSfx(kind: Sfx) {
  if (!enabled || !ctx || ctx.state !== 'running') return
  switch (kind) {
    case 'hover': {
      const now = performance.now()
      if (now - lastHover < 70) return
      lastHover = now
      tone(1760, 0.07, 'sine', 0.025)
      break
    }
    case 'click':
      tone(660, 0.14, 'triangle', 0.06, 330)
      break
    case 'open':
      noise(0.45, 300, 2400, 0.07)
      tone(440, 0.5, 'sine', 0.04, 880)
      break
    case 'chime':
      tone(880, 0.9, 'sine', 0.025)
      tone(1318.5, 0.9, 'sine', 0.018, undefined, 0.06)
      break
    case 'burst':
      noise(0.8, 2000, 200, 0.09)
      tone(220, 0.8, 'sawtooth', 0.025, 55)
      break
  }
}

function notify() {
  listeners.forEach((l) => l())
}

export function setSound(on: boolean) {
  enabled = on
  try {
    localStorage.setItem('sound', on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
  if (on) {
    const c = ensureContext()
    c?.resume().then(startAmbient)
  } else if (ambient) {
    ambient.stop()
    ambient = null
  }
  notify()
}

export const toggleSound = () => setSound(!enabled)

export function useSoundEnabled() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => enabled,
  )
}

/** Hover and click sounds for every link and button, plus resuming audio on the first gesture. */
export function installSoundListeners() {
  const onFirstGesture = () => {
    if (enabled) {
      const c = ensureContext()
      c?.resume().then(startAmbient)
    }
  }
  window.addEventListener('pointerdown', onFirstGesture, { once: true })
  window.addEventListener('keydown', onFirstGesture, { once: true })

  let lastTarget: Element | null = null
  const onOver = (e: PointerEvent) => {
    const t = e.target instanceof Element ? e.target.closest('a, button, [data-cursor="card"]') : null
    if (t && t !== lastTarget) playSfx('hover')
    lastTarget = t
  }
  const onClick = (e: MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('a, button')) playSfx('click')
  }
  document.addEventListener('pointerover', onOver)
  document.addEventListener('click', onClick)
  return () => {
    document.removeEventListener('pointerover', onOver)
    document.removeEventListener('click', onClick)
    window.removeEventListener('pointerdown', onFirstGesture)
    window.removeEventListener('keydown', onFirstGesture)
  }
}
