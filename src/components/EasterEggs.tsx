import { useEffect, useRef, useState } from 'react'
import { playSfx } from '../sound'
import { toggleShadowMode } from '../theme'
import { toast } from './Toaster'

const RAIN = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン影夢炎黒創心'
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

type Trigger = () => void
let triggerRain: Trigger | null = null

/** Starts the kanji rain (also used by the command palette). */
export function kanjiRain() {
  triggerRain?.()
}

/** Konami code toggles "shadow mode" (also used by the command palette). */
export function shadowMode() {
  const on = toggleShadowMode()
  playSfx('burst')
  toast(on ? '影 Mode Shadow activé' : 'Mode Shadow désactivé')
}

/**
 * Hidden surprises:
 * - typing "kage" anywhere makes katakana rain over the page
 * - the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) switches the accent to crimson
 */
export default function EasterEggs() {
  const [raining, setRaining] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    triggerRain = () => setRaining(true)
    let typed = ''
    let konami = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, [contenteditable="true"]')) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0
      if (konami === KONAMI.length) {
        konami = 0
        shadowMode()
      }
      if (key.length === 1) {
        typed = (typed + key).slice(-4)
        if (typed === 'kage') {
          typed = ''
          setRaining(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      triggerRain = null
    }
  }, [])

  useEffect(() => {
    if (!raining) return
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth, h = window.innerHeight
    cv.width = w * dpr
    cv.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const size = Math.max(14, Math.min(22, w / 60))
    const cols = Math.ceil(w / size)
    const drops = Array.from({ length: cols }, () => -Math.random() * h)
    const speeds = Array.from({ length: cols }, () => 0.6 + Math.random() * 1.2)
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    playSfx('burst')
    toast('影 kage · l’ombre envahit la page')

    const DURATION = reduced ? 1500 : 4200
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = (now - start) / DURATION
      ctx.globalAlpha = 0.18
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      ctx.globalAlpha = t > 0.75 ? Math.max(0, (1 - t) / 0.25) : 1
      ctx.fillStyle = accent
      ctx.font = `${size}px "Shippori Mincho B1", "JetBrains Mono", serif`
      if (!reduced) {
        for (let i = 0; i < cols; i++) {
          ctx.fillText(RAIN[Math.floor(Math.random() * RAIN.length)], i * size, drops[i])
          drops[i] += size * speeds[i] * 0.5
          if (drops[i] > h && Math.random() > 0.96) drops[i] = -size
        }
      } else {
        ctx.font = `800 ${Math.min(w, h) * 0.5}px "Shippori Mincho B1", serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('影', w / 2, h / 2)
      }
      if (t < 1) raf = requestAnimationFrame(tick)
      else setRaining(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [raining])

  return raining ? <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[75] size-full" /> : null
}
