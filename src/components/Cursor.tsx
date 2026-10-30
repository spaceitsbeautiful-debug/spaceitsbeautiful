import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'

type State = 'default' | 'link' | 'card'

/**
 * A small dot that sticks to the pointer and a ring that trails behind it.
 * The ring grows over links and turns into a "Voir" bubble over project cards.
 * Only on devices with a real mouse, and not when the viewer asked for less motion.
 */
export default function Cursor() {
  const [enabled] = useState(
    () =>
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<State>('default')
  const [visible, setVisible] = useState(false)
  const t = useT()

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add('has-cursor')
    let x = -100, y = -100, rx = x, ry = y
    let raf = 0

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      setVisible(true)
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('[data-cursor="card"]')) setState('card')
      else if (target?.closest('a, button')) setState('link')
      else setState('default')
    }
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) setVisible(false)
    }
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    raf = requestAnimationFrame(loop)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ring} className="cursor-ring" data-state={state} data-hidden={!visible} aria-hidden="true">
        <span>{t('Voir', 'View')}</span>
      </div>
      <div ref={dot} className="cursor-dot" data-state={state} data-hidden={!visible} aria-hidden="true" />
    </>
  )
}
