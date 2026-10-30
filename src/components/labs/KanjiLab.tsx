import { useEffect, useRef, useState } from 'react'

const GLYPHS = [
  { k: '影', label: 'ombre' },
  { k: '炎', label: 'flamme' },
  { k: '黒', label: 'noir' },
  { k: '夢', label: 'rêve' },
]
const COUNT = 1400
const FONT = '"Shippori Mincho B1", "Hiragino Mincho ProN", "Yu Mincho", serif'

/** Normalized (0..1) points filling the glyph, always COUNT of them so particles can morph between glyphs. */
function sample(glyph: string): Float32Array {
  const S = 160
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `800 ${S * 0.86}px ${FONT}`
  g.fillText(glyph, S / 2, S / 2 + 4)
  const data = g.getImageData(0, 0, S, S).data
  const pts: number[] = []
  for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 128) pts.push(x / S, y / S)
  const out = new Float32Array(COUNT * 2)
  const n = pts.length / 2
  for (let i = 0; i < COUNT; i++) {
    const j = Math.floor(Math.random() * n)
    out[i * 2] = pts[j * 2] + (Math.random() - 0.5) * 0.006
    out[i * 2 + 1] = pts[j * 2 + 1] + (Math.random() - 0.5) * 0.006
  }
  return out
}

/** Pick a kanji and its particles regroup into it; the pointer pushes them away. */
export default function KanjiLab() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [glyph, setGlyph] = useState(0)
  const targets = useRef<Float32Array | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = () => !cancelled && (targets.current = sample(GLYPHS[glyph].k))
    if (document.fonts?.load) document.fonts.load(`800 120px ${FONT}`, GLYPHS[glyph].k).then(run, run)
    else run()
    return () => {
      cancelled = true
    }
  }, [glyph])

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pos = new Float32Array(COUNT * 2).map(() => Math.random())
    const vel = new Float32Array(COUNT * 2)
    const mouse = { x: -9, y: -9 }
    let w = 0, h = 0, side = 0, ox = 0, oy = 0
    let color = '#c4b5e8'
    let raf = 0, frame = 0, visible = true

    const resize = () => {
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      side = Math.min(w, h) * 0.86
      ox = (w - side) / 2
      oy = (h - side) / 2
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      const s = Math.max(1.4, side / 260)
      for (let i = 0; i < COUNT; i++) ctx.fillRect(ox + pos[i * 2] * side, oy + pos[i * 2 + 1] * side, s, s)
    }
    const step = () => {
      const t = targets.current
      if (t) {
        const R = 0.12
        for (let i = 0; i < COUNT; i++) {
          const b = i * 2
          let vx = vel[b], vy = vel[b + 1]
          const dx = pos[b] - mouse.x, dy = pos[b + 1] - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const d = Math.sqrt(d2) + 1e-4
            const f = (1 - d / R) * 0.012
            vx += (dx / d) * f
            vy += (dy / d) * f
          }
          vx += (t[b] - pos[b]) * 0.035
          vy += (t[b + 1] - pos[b + 1]) * 0.035
          vel[b] = vx * 0.86
          vel[b + 1] = vy * 0.86
          pos[b] += vel[b]
          pos[b + 1] += vel[b + 1]
        }
      }
    }
    const loop = () => {
      if (frame++ % 30 === 0) color = getComputedStyle(cv).getPropertyValue('--accent').trim() || color
      step()
      draw()
      raf = visible ? requestAnimationFrame(loop) : 0
    }
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      mouse.x = (e.clientX - r.left - ox) / side
      mouse.y = (e.clientY - r.top - oy) / side
    }
    const onLeave = () => {
      mouse.x = mouse.y = -9
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    cv.addEventListener('pointermove', onMove)
    cv.addEventListener('pointerleave', onLeave)

    if (reduced) {
      // No animation: snap to the glyph and redraw now and then (glyph or theme change)
      const id = setInterval(() => {
        if (targets.current) pos.set(targets.current)
        color = getComputedStyle(cv).getPropertyValue('--accent').trim() || color
        draw()
      }, 300)
      return () => {
        clearInterval(id)
        ro.disconnect()
      }
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(loop)
    })
    io.observe(cv)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="grid gap-4">
      <canvas ref={canvas} aria-label={`Le kanji ${GLYPHS[glyph].k} (${GLYPHS[glyph].label}) dessiné en particules`} className="aspect-[4/3] w-full max-w-full touch-none rounded-[14px] bg-vis" />
      <div role="group" aria-label="Choisir un kanji" className="flex flex-wrap gap-2">
        {GLYPHS.map((g, i) => (
          <button
            key={g.k}
            type="button"
            aria-pressed={glyph === i}
            onClick={() => setGlyph(i)}
            className={`flex items-baseline gap-2 rounded-full border px-3.5 py-1.5 transition-colors ${
              glyph === i ? 'border-accent bg-accent text-bg' : 'border-line hover:border-accent'
            }`}
          >
            <span className="font-display text-lg font-bold">{g.k}</span>
            <span className="font-mono text-xs opacity-75">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
