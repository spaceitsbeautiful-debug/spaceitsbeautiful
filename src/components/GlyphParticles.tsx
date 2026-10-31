import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroGlyphs } from '../data/site'

// Kanji drawn as particles that scatter away from the pointer and spring back.
// Every few seconds the particles burst and regroup into the next kanji of heroGlyphs.

const FONT = '"Shippori Mincho B1", "Hiragino Mincho ProN", "Yu Mincho", serif'
const FOV = 35
const CAM_Z = 10
const CYCLE_MS = 5000
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Rasterizes a glyph and returns exactly `count` normalized points (-0.5..0.5) as [x0, y0, x1, y1, ...].
 * Every glyph gets the same number of points so the particles can morph from one to the next.
 */
function sampleGlyph(char: string, count: number): Float32Array {
  const S = 400 // sampling resolution: higher = finer strokes
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.fillStyle = '#fff'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `800 356px ${FONT}`
  g.fillText(char, S / 2, S / 2 + 6)
  const data = g.getImageData(0, 0, S, S).data
  const pts: number[] = []
  for (let y = 0; y < S; y += 2) {
    for (let x = 0; x < S; x += 2) {
      if (data[(y * S + x) * 4 + 3] > 128) pts.push(x / S - 0.5, 0.5 - y / S)
    }
  }
  // Spread the points evenly over the glyph: shuffle, then take them in order (no clumps from repeats)
  const n = pts.length / 2
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const out = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const j = order[i % n]
    out[i * 2] = pts[j * 2] + (Math.random() - 0.5) * 0.002
    out[i * 2 + 1] = pts[j * 2 + 1] + (Math.random() - 0.5) * 0.002
  }
  return out
}

/** Soft round sprite so points read as dots instead of squares. */
function makeSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.55, 'rgba(255,255,255,0.9)') // sharper edge
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function readColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    accent: new THREE.Color(cs.getPropertyValue('--accent').trim() || '#c4b5e8'),
    dust: new THREE.Color(cs.getPropertyValue('--muted').trim() || '#9895a6'),
    dark: !cs.colorScheme.includes('light'),
  }
}

/** Bumps whenever the light/dark theme may have changed. */
function useThemeVersion() {
  const [v, setV] = useState(0)
  useEffect(() => {
    const bump = () => setV((x) => x + 1)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', bump)
    const mo = new MutationObserver(bump)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] })
    return () => {
      mq.removeEventListener('change', bump)
      mo.disconnect()
    }
  }, [])
  return v
}

function Particles({ glyphs, index }: { glyphs: Float32Array[]; index: number }) {
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const theme = useThemeVersion()
  const mobile = size.width < 640

  const group = useRef<THREE.Group>(null!)
  const geom = useRef<THREE.BufferGeometry>(null!)
  const mat = useRef<THREE.PointsMaterial>(null!)
  const mouse = useRef({ x: 999, y: 999, nx: 0, ny: 0 })
  const sprite = useMemo(makeSprite, [])

  // Where the glyph sits, in world units at z = 0
  const layout = useMemo(() => {
    const visH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const visW = (visH * size.width) / size.height
    const G = mobile ? Math.min(visH * 0.55, visW * 0.9) : Math.min(visH * 0.72, visW * 0.42)
    const gPx = (G / visH) * size.height
    const centerPx = mobile ? size.width * 0.62 : size.width - gPx * 0.5 - size.width * 0.06
    return { visW, visH, G, gx: (centerPx / size.width - 0.5) * visW, gy: visH * (mobile ? 0.14 : 0.08) }
  }, [size.width, size.height, mobile])
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  // Glyph points first, then ambient dust
  const data = useMemo(() => {
    const Ng = glyphs[0].length / 2
    const N = Ng + (mobile ? 160 : 420)
    const home = new Float32Array(N * 3) // glyph: glyph-normalized ; dust: viewport-normalized
    for (let i = 0; i < Ng; i++) home[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    for (let i = Ng; i < N; i++) {
      home[i * 3] = Math.random() - 0.5
      home[i * 3 + 1] = Math.random() - 0.5
      home[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    return { Ng, N, home, pos: new Float32Array(N * 3), vel: new Float32Array(N * 3), colors: new Float32Array(N * 3) }
  }, [glyphs, mobile])

  const homeOf = (i: number, t: number, out: number[]) => {
    const { visW, visH, G, gx, gy } = layoutRef.current
    const b = i * 3
    if (i < data.Ng) {
      out[0] = gx + data.home[b] * G
      out[1] = gy + data.home[b + 1] * G
    } else {
      out[0] = data.home[b] * visW * 1.1 + Math.sin(t * 0.25 + i) * 0.15
      out[1] = data.home[b + 1] * visH * 1.1 + Math.cos(t * 0.2 + i * 1.3) * 0.15
    }
    out[2] = data.home[b + 2]
  }

  // Point the glyph particles at the current kanji. Except on first show, give them a
  // burst outward first so the change reads as an explosion that regroups.
  const firstGlyph = useRef(true)
  useLayoutEffect(() => {
    const pts = glyphs[index % glyphs.length]
    for (let i = 0; i < data.Ng; i++) {
      data.home[i * 3] = pts[i * 2]
      data.home[i * 3 + 1] = pts[i * 2 + 1]
    }
    if (firstGlyph.current) {
      firstGlyph.current = false
      return
    }
    if (reduced) {
      const tmp = [0, 0, 0]
      for (let i = 0; i < data.Ng; i++) {
        homeOf(i, 0, tmp)
        data.pos.set(tmp, i * 3)
      }
      geom.current.attributes.position.needsUpdate = true
      invalidate()
      return
    }
    const { gx, gy } = layoutRef.current
    for (let i = 0; i < data.Ng; i++) {
      const b = i * 3
      const dx = data.pos[b] - gx, dy = data.pos[b + 1] - gy
      const d = Math.sqrt(dx * dx + dy * dy) + 1e-3
      const f = 0.06 + Math.random() * 0.08
      data.vel[b] += (dx / d) * f + (Math.random() - 0.5) * 0.05
      data.vel[b + 1] += (dy / d) * f + (Math.random() - 0.5) * 0.05
      data.vel[b + 2] += (Math.random() - 0.3) * 0.25
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, data, glyphs])

  // Intro: start scattered, the springs pull everything into the glyph
  useLayoutEffect(() => {
    const { visW, visH } = layoutRef.current
    const tmp = [0, 0, 0]
    const spread = reduced ? 0 : 1
    for (let i = 0; i < data.N; i++) {
      homeOf(i, 0, tmp)
      const b = i * 3
      data.pos[b] = tmp[0] + (Math.random() - 0.5) * visW * 1.4 * spread
      data.pos[b + 1] = tmp[1] + (Math.random() - 0.5) * visH * 1.4 * spread
      data.pos[b + 2] = tmp[2] + (Math.random() - 0.5) * 6 * spread
    }
    geom.current.attributes.position.needsUpdate = true
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Without animation, re-place the points whenever the layout changes
  useEffect(() => {
    if (!reduced) return
    const tmp = [0, 0, 0]
    for (let i = 0; i < data.N; i++) {
      homeOf(i, 0, tmp)
      data.pos.set(tmp, i * 3)
    }
    geom.current.attributes.position.needsUpdate = true
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, data])

  useEffect(() => {
    const col = readColors()
    for (let i = 0; i < data.N; i++) {
      const c = i < data.Ng ? col.accent : col.dust
      data.colors[i * 3] = c.r
      data.colors[i * 3 + 1] = c.g
      data.colors[i * 3 + 2] = c.b
    }
    geom.current.attributes.color.needsUpdate = true
    mat.current.blending = col.dark ? THREE.AdditiveBlending : THREE.NormalBlending
    // Normal blending on a light page washes the soft dots out, so make them bigger and opaque there
    mat.current.opacity = (col.dark ? 0.8 : 1) * (mobile ? 0.5 : 1)
    mat.current.size = col.dark ? 0.036 : 0.048
    mat.current.needsUpdate = true
    invalidate()
  }, [theme, data, mobile, invalidate])

  useEffect(() => {
    const m = mouse.current
    const onMove = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1)
      m.nx = Math.max(-1, Math.min(1, nx))
      m.ny = Math.max(-1, Math.min(1, ny))
      if (e.clientY < r.top || e.clientY > r.bottom) {
        m.x = m.y = 999
        return
      }
      m.x = (nx * layoutRef.current.visW) / 2
      m.y = (ny * layoutRef.current.visH) / 2
    }
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) m.x = m.y = 999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
    }
  }, [gl])

  const tmp = useMemo(() => [0, 0, 0], [])
  useFrame((_, delta) => {
    if (reduced) return
    const dt = Math.min(delta * 60, 3)
    const t = performance.now() / 1000
    const { pos, vel, N, Ng } = data
    const m = mouse.current
    const R = mobile ? 0.9 : 1.15
    const R2 = R * R
    const damp = Math.pow(0.88, dt)
    for (let i = 0; i < N; i++) {
      const b = i * 3
      homeOf(i, t, tmp)
      let vx = vel[b], vy = vel[b + 1], vz = vel[b + 2]
      const dx = pos[b] - m.x, dy = pos[b + 1] - m.y
      const d2 = dx * dx + dy * dy
      if (d2 < R2) {
        const d = Math.sqrt(d2) + 1e-4
        const f = (1 - d / R) * 0.09 * dt
        vx += (dx / d) * f
        vy += (dy / d) * f
        vz += f * 1.6
      }
      const k = i < Ng ? 0.024 : 0.006
      vx += (tmp[0] - pos[b]) * k * dt
      vy += (tmp[1] - pos[b + 1]) * k * dt
      vz += (tmp[2] - pos[b + 2]) * k * dt
      vel[b] = vx * damp
      vel[b + 1] = vy * damp
      vel[b + 2] = vz * damp
      pos[b] += vel[b] * dt
      pos[b + 1] += vel[b + 1] * dt
      pos[b + 2] += vel[b + 2] * dt
    }
    geom.current.attributes.position.needsUpdate = true
    group.current.rotation.y += (m.nx * 0.12 - group.current.rotation.y) * 0.05
    group.current.rotation.x += (-m.ny * 0.08 - group.current.rotation.x) * 0.05
  })

  return (
    <group ref={group}>
      <points key={data.N} frustumCulled={false}>
        <bufferGeometry ref={geom}>
          <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={mat} size={0.036} map={sprite} vertexColors transparent depthWrite={false} sizeAttenuation />
      </points>
    </group>
  )
}

function webglSupported() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

type Props = {
  onReady: () => void
  /** Called with the index (in heroGlyphs) of the kanji now shown */
  onGlyphChange?: (index: number) => void
}

export default function GlyphParticles({ onReady, onGlyphChange }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [glyphs, setGlyphs] = useState<Float32Array[] | null>(null)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady
  const onChangeRef = useRef(onGlyphChange)
  onChangeRef.current = onGlyphChange

  // Wait for the display font so the glyphs are sampled in Shippori Mincho, not a fallback
  useEffect(() => {
    if (!webglSupported()) return
    let cancelled = false
    const chars = heroGlyphs.map((g) => g.kanji).join('')
    const fontReady = document.fonts?.load ? document.fonts.load(`800 196px ${FONT}`, chars).catch(() => {}) : Promise.resolve()
    Promise.race([fontReady, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      if (cancelled) return
      const count = window.innerWidth < 640 ? 4000 : 10000
      setGlyphs(heroGlyphs.map((g) => sampleGlyph(g.kanji, count)))
      onReadyRef.current()
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Pause rendering (and the cycle) while the hero is off screen
  useEffect(() => {
    const hero = wrap.current?.parentElement
    if (!hero || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!glyphs || !visible || reduced || glyphs.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % glyphs.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [glyphs, visible])

  useEffect(() => {
    onChangeRef.current?.(index)
  }, [index])

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2">
      {glyphs && (
        <Canvas
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          frameloop={visible && !reduced ? 'always' : 'demand'}
        >
          <Particles glyphs={glyphs} index={index} />
        </Canvas>
      )}
    </div>
  )
}
