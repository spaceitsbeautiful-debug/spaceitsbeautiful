import Lenis from 'lenis'

// Damped, smooth page scrolling. Off when the viewer asked for less motion.
// Overlays (project page, menus) call stopScroll()/startScroll() and mark their own
// scrolling areas with data-lenis-prevent so they keep native scrolling.

let lenis: Lenis | null = null

export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({ lerp: 0.09, anchors: { offset: -72 } })
  let raf = 0
  const loop = (t: number) => {
    lenis?.raf(t)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    lenis?.destroy()
    lenis = null
  }
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
