import { useEffect, useRef, useState } from 'react'
import { avatar } from '../../data/site'

type Mode = 'particles' | 'ascii'

const GRID = 96 // samples per side
const ASCII_RAMP = ' .·:;-=+*x#%@'
const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン影'

type Dot = { hx: number; hy: number; b: number; x: number; y: number; vx: number; vy: number }

/** Samples the image into a GRID×GRID brightness map (0..1), cropped to a centered square. */
function sampleImage(img: HTMLImageElement): Float32Array {
  const c = document.createElement('canvas')
  c.width = c.height = GRID
  const g = c.getContext('2d', { willReadFrequently: true })!
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  g.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, GRID, GRID)
  const data = g.getImageData(0, 0, GRID, GRID).data
  const out = new Float32Array(GRID * GRID)
  for (let i = 0; i < out.length; i++) {
    out[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255
  }
  return out
}

/**
 * The avatar rebuilt from thousands of particles (or ASCII characters). The pointer pushes them,
 * a click makes them burst, then they find their place again.
 */
export default function ImageLab() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<Mode>('particles')
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    if (!avatar) return
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dots: Dot[] = []
    let map: Float32Array | null = null
    let w = 0, h = 0, side = 0, ox = 0, oy = 0
    let accent = '#c4b5e8', fg = '#e9e6ef', muted = '#9895a6'
    let raf = 0, frame = 0, visible = true
    const mouse = { x: -9, y: -9, active: false }

    const readColors = () => {
      const cs = getComputedStyle(cv)
      accent = cs.getPropertyValue('--accent').trim() || accent
      fg = cs.getPropertyValue('--fg').trim() || fg
      muted = cs.getPropertyValue('--muted').trim() || muted
    }

    const build = (m: Float32Array) => {
      map = m
      dots = []
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const b = m[y * GRID + x]
          if (b < 0.18) continue // the dark areas stay empty, like the shadow in the picture
          const hx = (x + 0.5) / GRID, hy = (y + 0.5) / GRID
          dots.push({
            hx, hy, b,
            x: reduced ? hx : Math.random(),
            y: reduced ? hy : Math.random(),
            vx: 0, vy: 0,
          })
        }
      }
    }

    const resize = () => {
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      side = Math.min(w, h) * 0.94
      ox = (w - side) / 2
      oy = (h - side) / 2
    }

    const step = () => {
      const R = 0.11
      for (const d of dots) {
        if (mouse.active) {
          const dx = d.x - mouse.x, dy = d.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const dist = Math.sqrt(d2) + 1e-4
            const f = (1 - dist / R) * 0.006
            d.vx += (dx / dist) * f
            d.vy += (dy / dist) * f
          }
        }
        d.vx += (d.hx - d.x) * 0.03
        d.vy += (d.hy - d.y) * 0.03
        d.vx *= 0.85
        d.vy *= 0.85
        d.x += d.vx
        d.y += d.vy
      }
    }

    const drawParticles = () => {
      const cell = side / GRID
      ctx.fillStyle = accent
      // Five brightness bands, one alpha each, so we change fill state only a few times per frame
      for (let band = 0; band < 5; band++) {
        const lo = 0.18 + band * 0.164, hi = lo + 0.164
        ctx.globalAlpha = 0.35 + band * 0.16
        for (const d of dots) {
          if (d.b < lo || d.b >= hi) continue
          const s = cell * (0.35 + d.b * 0.75)
          ctx.fillRect(ox + d.x * side - s / 2, oy + d.y * side - s / 2, s, s)
        }
      }
      ctx.globalAlpha = 1
    }

    const drawAscii = () => {
      if (!map) return
      const cols = 64
      const cell = side / cols
      ctx.font = `${cell * 1.05}px "JetBrains Mono", Consolas, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const R = 0.12
      for (let y = 0; y < cols; y++) {
        for (let x = 0; x < cols; x++) {
          const gx = Math.floor(((x + 0.5) / cols) * GRID), gy = Math.floor(((y + 0.5) / cols) * GRID)
          const b = map[gy * GRID + gx]
          const nx = (x + 0.5) / cols, ny = (y + 0.5) / cols
          const near = mouse.active && (nx - mouse.x) ** 2 + (ny - mouse.y) ** 2 < R * R
          let ch: string
          if (near) {
            // Under the pointer the characters turn into flickering katakana
            ch = KATAKANA[(x * 7 + y * 13 + (frame >> 2)) % KATAKANA.length]
            ctx.fillStyle = accent
          } else {
            ch = ASCII_RAMP[Math.min(ASCII_RAMP.length - 1, Math.floor(b * ASCII_RAMP.length))]
            ctx.fillStyle = b > 0.55 ? fg : muted
          }
          if (ch !== ' ') ctx.fillText(ch, ox + nx * side, oy + ny * side)
        }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      if (modeRef.current === 'ascii') drawAscii()
      else drawParticles()
    }

    const loop = () => {
      if (frame++ % 30 === 0) readColors()
      if (!reduced) step()
      draw()
      raf = visible ? requestAnimationFrame(loop) : 0
    }

    const toLocal = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      return { x: (e.clientX - r.left - ox) / side, y: (e.clientY - r.top - oy) / side }
    }
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e)
      mouse.x = p.x
      mouse.y = p.y
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }
    const onClick = (e: PointerEvent) => {
      if (reduced || modeRef.current !== 'particles') return
      const p = toLocal(e)
      for (const d of dots) {
        const dx = d.x - p.x, dy = d.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-3
        const f = 0.06 / (dist * 6 + 0.4)
        d.vx += (dx / dist) * f + (Math.random() - 0.5) * 0.01
        d.vy += (dy / dist) * f + (Math.random() - 0.5) * 0.01
      }
    }

    resize()
    readColors()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    cv.addEventListener('pointermove', onMove)
    cv.addEventListener('pointerleave', onLeave)
    cv.addEventListener('pointerdown', onClick)

    const img = new Image()
    img.onload = () => {
      build(sampleImage(img))
      if (!raf) raf = requestAnimationFrame(loop)
    }
    img.src = avatar

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf && dots.length) raf = requestAnimationFrame(loop)
    })
    io.observe(cv)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerleave', onLeave)
      cv.removeEventListener('pointerdown', onClick)
    }
  }, [])

  if (!avatar) return null
  return (
    <div className="grid gap-4">
      <canvas
        ref={canvas}
        aria-label="L'avatar recomposé en particules interactives"
        className="aspect-square w-full max-w-full touch-none rounded-[14px] bg-vis"
      />
      <div role="group" aria-label="Choisir le rendu" className="flex flex-wrap gap-2">
        {(
          [
            ['particles', 'Particules'],
            ['ascii', 'ASCII'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
              mode === id ? 'border-accent bg-accent text-bg' : 'border-line hover:border-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
