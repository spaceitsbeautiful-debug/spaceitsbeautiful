import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { finishIntro } from '../intro'
import { ease } from './ui'

const NAME = 'GOUNTENI DAVID'

/**
 * Intro screen. The progress follows what the page really loads (fonts, the 3D scene, the
 * page itself) and never runs faster than a minimum duration, so the animation always plays.
 * The 影 outline draws itself, fills in, then the screen splits open onto the hero.
 */
export default function Loader() {
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [show, setShow] = useState(!reduced.current)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Chargement des polices')

  useEffect(() => {
    if (reduced.current) {
      finishIntro()
      return
    }

    // A second visit in the same session gets a shorter intro
    let seen = false
    try {
      seen = sessionStorage.getItem('intro-seen') === '1'
      sessionStorage.setItem('intro-seen', '1')
    } catch {
      /* private window */
    }
    // Minimum time on screen, in milliseconds (the 影 drawing in index.css is timed to match)
    const minDuration = seen ? 2500 : 4800

    const steps = [
      { label: 'Chargement des polices', ready: false },
      { label: 'Préparation de la scène 3D', ready: false },
      { label: 'Derniers réglages', ready: false },
    ]
    const markReady = (i: number) => () => {
      steps[i].ready = true
    }
    const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms))
    // Each task gives up after a few seconds so a slow network never blocks the site
    Promise.race([document.fonts?.ready ?? Promise.resolve(), timeout(4000)]).then(markReady(0), markReady(0))
    Promise.race([import('./GlyphParticles'), timeout(6000)]).then(markReady(1), markReady(1))
    const onLoad = markReady(2)
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })

    const start = performance.now()
    let last = start
    let shown = 0
    let raf = 0
    let finished = false
    const tick = (now: number) => {
      const readyShare = steps.filter((s) => s.ready).length / steps.length
      const timeShare = Math.min((now - start) / minDuration, 1)
      // Never ahead of the real loading, never ahead of the clock, and eased toward the target.
      // The easing uses elapsed time, so a throttled tab doesn't slow the counter down.
      const target = Math.min(readyShare, timeShare) * 100
      shown += (target - shown) * (1 - Math.exp(-(now - last) / 120))
      last = now
      if (target === 100 && shown > 99.4) shown = 100
      setProgress(shown)
      const pending = steps.find((s) => !s.ready)
      setStatus(pending ? pending.label : 'Prêt')

      if (shown === 100 && !finished) {
        finished = true
        // Hold on 100% for a moment before opening
        setTimeout(() => {
          setShow(false)
          finishIntro()
        }, 900)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  const pct = Math.round(progress)

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="loader" aria-hidden="true" className="fixed inset-0 z-[70]" exit={{ pointerEvents: 'none' }}>
          {/* Two halves that slide apart on exit */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-bg"
            exit={{ y: '-100%' }}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-bg"
            exit={{ y: '100%' }}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
          />

          <motion.div
            className="absolute inset-0 grid place-items-center"
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
            transition={{ duration: 0.9, ease }}
          >
            <div className="grid justify-items-center gap-6">
              <svg viewBox="0 0 400 400" className="w-[min(52vw,300px)] overflow-visible">
                <text
                  x="200"
                  y="215"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="loader-glyph"
                  style={{ font: '800 300px var(--display)', stroke: 'var(--accent)', strokeWidth: 1.6 }}
                >
                  影
                </text>
              </svg>
              <p className="m-0 flex overflow-hidden font-mono text-[12px] tracking-[0.42em] text-fg">
                {NAME.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block whitespace-pre"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 1.2 + i * 0.07 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </p>
            </div>
          </motion.div>

          {/* Hairline progress along the top */}
          <motion.div
            className="absolute inset-x-0 h-px origin-left bg-accent"
            style={{ top: 'env(safe-area-inset-top, 0px)', scaleX: progress / 100 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-[var(--gutter-x)] pb-[max(28px,env(safe-area-inset-bottom,0px))]"
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid gap-1.5 font-mono text-xs text-muted">
              <span className="text-fg">Portfolio · 2026</span>
              <span>{status}…</span>
            </div>
            <span className="font-display text-[clamp(56px,11vw,140px)] leading-[.8] font-bold text-fg tabular-nums">
              {pct}
              <span className="text-accent">%</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
