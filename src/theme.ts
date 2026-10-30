import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

/** The theme on screen: an explicit choice, or the system setting (dark when there is none). */
export function effectiveTheme(): Theme {
  const t = document.documentElement.dataset.theme
  if (t === 'light' || t === 'dark') return t
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Switches light/dark, remembers it, and reveals the new theme as a circle growing from
 * `origin` (screen coordinates; styles in index.css).
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = effectiveTheme() === 'dark' ? 'light' : 'dark'
  const root = document.documentElement
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* private window: the choice just won't be remembered */
  }
  root.style.setProperty('--vt-x', `${origin?.x ?? window.innerWidth - 40}px`)
  root.style.setProperty('--vt-y', `${origin?.y ?? 40}px`)
  const apply = () => {
    root.dataset.theme = next
    window.dispatchEvent(new Event('themechange'))
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if ('startViewTransition' in document && !reduce) document.startViewTransition(apply)
  else apply()
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(effectiveTheme)
  useEffect(() => {
    const sync = () => setTheme(effectiveTheme())
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', sync)
    window.addEventListener('themechange', sync)
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('themechange', sync)
    }
  }, [])
  return theme
}

/** "Shadow mode" easter egg: crimson accent instead of lavender (styles in index.css). */
export function toggleShadowMode() {
  const root = document.documentElement
  if (root.dataset.mode === 'shadow') delete root.dataset.mode
  else root.dataset.mode = 'shadow'
  return root.dataset.mode === 'shadow'
}
