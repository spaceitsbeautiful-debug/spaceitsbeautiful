import { useSyncExternalStore } from 'react'

// All site audio is synthesized with the Web Audio API: no audio files to load.
//  - a lo-fi chill soundtrack (electric piano chords, bass, soft drums, vinyl crackle, a sparse melody)
//  - small interface sounds (hover, click, opening a project...)
// Sound is off by default; the choice is remembered. Browsers only allow audio after a click or a
// key press, so the audio context starts on the first interaction.
// When another player takes over (the Fire Force ending in Inspirations), the soundtrack pauses,
// and it comes back when that player stops: see setExternalPlaying().

type Sfx = 'hover' | 'click' | 'open' | 'chime' | 'burst'

let enabled = false
try {
  enabled = localStorage.getItem('sound') === 'on'
} catch {
  /* private window */
}
let external = false // another player (YouTube) is playing
const listeners = new Set<() => void>()
let ctx: AudioContext | null = null
let master: GainNode | null = null
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

/* ------------------------------------------------------------------ */
/* Lo-fi soundtrack                                                    */
/* ------------------------------------------------------------------ */

const BPM = 74
const STEP = 60 / BPM / 4 // one sixteenth note, in seconds
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

// Dm9 – G13 – Cmaj9 – Am9, one bar each: [bass note, chord voicing]
const PROGRESSION: [number, number[]][] = [
  [38, [53, 57, 60, 64, 65]], // Dm9
  [43, [53, 57, 59, 64, 65]], // G13
  [36, [52, 55, 59, 62, 64]], // Cmaj9
  [45, [55, 59, 60, 64, 67]], // Am9
]
// A minor pentatonic for the melody
const SCALE = [69, 72, 74, 76, 79, 81, 84]

type Music = { bus: GainNode; out: GainNode; noise: AudioBuffer; crackle: AudioBufferSourceNode; timer: number; step: number; next: number }
let music: Music | null = null

function makeNoise(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

/** Sparse pops and a soft hiss, looped: the "old record" texture. */
function makeCrackle(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 4, c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) {
    d[i] = (Math.random() * 2 - 1) * 0.012
    if (Math.random() < 0.0004) d[i] += (Math.random() * 2 - 1) * 0.6
  }
  return b
}

function epiano(m: Music, freq: number, t: number, vol: number, dur: number) {
  const c = ctx!
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  for (const [mult, type, level] of [[1, 'sine', 1], [2, 'sine', 0.18], [3, 'triangle', 0.05]] as const) {
    const o = c.createOscillator()
    o.type = type
    o.frequency.value = freq * mult
    o.detune.value = (Math.random() - 0.5) * 8 // slightly out of tune, like a worn tape
    const og = c.createGain()
    og.gain.value = level
    o.connect(og).connect(g)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
  g.connect(m.bus)
}

function bass(m: Music, freq: number, t: number, dur: number) {
  const c = ctx!
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.value = freq
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.32, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(m.bus)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function kick(m: Music, t: number) {
  const c = ctx!
  const o = c.createOscillator()
  o.frequency.setValueAtTime(120, t)
  o.frequency.exponentialRampToValueAtTime(42, t + 0.18)
  const g = c.createGain()
  g.gain.setValueAtTime(0.5, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
  o.connect(g).connect(m.bus)
  o.start(t)
  o.stop(t + 0.4)
}

function hiss(m: Music, t: number, dur: number, freq: number, type: BiquadFilterType, vol: number) {
  const c = ctx!
  const src = c.createBufferSource()
  src.buffer = m.noise
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  const g = c.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(m.bus)
  src.start(t, Math.random() * 1.5)
  src.stop(t + dur + 0.02)
}

/** Schedules one sixteenth note of the loop at time t. */
function playStep(m: Music, step: number, t: number) {
  const bar = Math.floor(step / 16) % PROGRESSION.length
  const s = step % 16
  const [root, chord] = PROGRESSION[bar]
  // Lazy swing: off-beat sixteenths come a little late
  const tt = t + (s % 2 === 1 ? STEP * 0.18 : 0)

  if (s === 0) chord.forEach((n, i) => epiano(m, midi(n), tt + i * 0.012, 0.055, STEP * 15))
  if (s === 10) chord.slice(1, 4).forEach((n) => epiano(m, midi(n), tt, 0.03, STEP * 6))
  if (s === 0) bass(m, midi(root), tt, STEP * 6)
  if (s === 7) bass(m, midi(root + 7), tt, STEP * 2.5)
  if (s === 10) bass(m, midi(root), tt, STEP * 5)
  if (s === 0 || s === 7 || s === 10) kick(m, tt)
  if (s === 4 || s === 12) {
    hiss(m, tt, 0.22, 1800, 'bandpass', 0.22) // snare
    hiss(m, tt, 0.06, 900, 'lowpass', 0.12)
  }
  if (s % 2 === 0) hiss(m, tt, s % 4 === 2 ? 0.08 : 0.04, 8000, 'highpass', s % 4 === 2 ? 0.07 : 0.04) // hats
  // A few soft melody notes, never the same twice
  if ((s === 2 || s === 6 || s === 11 || s === 14) && Math.random() < 0.32) {
    epiano(m, midi(SCALE[Math.floor(Math.random() * SCALE.length)]), tt, 0.035, STEP * 5)
  }
}

function startMusic() {
  if (!ctx || !master || music) return
  const out = ctx.createGain()
  out.gain.value = 0
  out.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 2.5)
  out.connect(master)
  // Warm, slightly muffled sound
  const warm = ctx.createBiquadFilter()
  warm.type = 'lowpass'
  warm.frequency.value = 2600
  warm.connect(out)
  const bus = ctx.createGain()
  bus.connect(warm)

  const crackle = ctx.createBufferSource()
  crackle.buffer = makeCrackle(ctx)
  crackle.loop = true
  const cg = ctx.createGain()
  cg.gain.value = 0.5
  crackle.connect(cg).connect(out)
  crackle.start()

  const m: Music = { bus, out, noise: makeNoise(ctx, 2), crackle, timer: 0, step: 0, next: ctx.currentTime + 0.1 }
  // Look-ahead scheduler: every 25 ms, queue the notes of the next 120 ms
  m.timer = window.setInterval(() => {
    while (m.next < ctx!.currentTime + 0.12) {
      playStep(m, m.step, m.next)
      m.step++
      m.next += STEP
    }
  }, 25)
  music = m
}

function stopMusic() {
  if (!ctx || !music) return
  const m = music
  music = null
  clearInterval(m.timer)
  const t = ctx.currentTime
  m.out.gain.cancelScheduledValues(t)
  m.out.gain.setValueAtTime(m.out.gain.value, t)
  m.out.gain.linearRampToValueAtTime(0, t + 0.8)
  setTimeout(() => {
    m.crackle.stop()
    m.out.disconnect()
  }, 900)
}

/** Starts or stops the soundtrack so it matches the current state. */
function syncMusic() {
  const shouldPlay = enabled && !external && !!ctx && ctx.state === 'running'
  if (shouldPlay) startMusic()
  else stopMusic()
}

/* ------------------------------------------------------------------ */
/* Interface sounds                                                    */
/* ------------------------------------------------------------------ */

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

function sweep(dur: number, from: number, to: number, vol: number) {
  if (!ctx || !master) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoise(ctx, dur)
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
      tone(1760, 0.07, 'sine', 0.02)
      break
    }
    case 'click':
      tone(660, 0.14, 'triangle', 0.05, 330)
      break
    case 'open':
      sweep(0.45, 300, 2400, 0.06)
      tone(440, 0.5, 'sine', 0.035, 880)
      break
    case 'chime':
      tone(880, 0.9, 'sine', 0.02)
      tone(1318.5, 0.9, 'sine', 0.014, undefined, 0.06)
      break
    case 'burst':
      sweep(0.8, 2000, 200, 0.08)
      tone(220, 0.8, 'sawtooth', 0.02, 55)
      break
  }
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

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
  if (on) ensureContext()?.resume().then(syncMusic)
  else syncMusic()
  notify()
}

export const toggleSound = () => setSound(!enabled)

/**
 * Another player started (true) or stopped (false): the soundtrack pauses while it plays and
 * comes back afterwards, if the site sound is on.
 */
export function setExternalPlaying(playing: boolean) {
  external = playing
  syncMusic()
  notify()
}

/** Whether the soundtrack is playing right now. */
export function isMusicPlaying() {
  return !!music
}

/** Whether the site sound is on. */
export function isSoundEnabled() {
  return enabled
}

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
    if (enabled) ensureContext()?.resume().then(syncMusic)
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
