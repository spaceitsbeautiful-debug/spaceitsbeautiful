import { useSyncExternalStore } from 'react'

// French / English. The choice is remembered; on a first visit the browser language decides
// (French browsers get French, everyone else English).
// In components: const t = useT(); t('Bonjour', 'Hello')

export type Lang = 'fr' | 'en'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'fr' || saved === 'en') return saved
  } catch {
    /* private window */
  }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

let lang: Lang = initialLang()
const listeners = new Set<() => void>()

const META = {
  fr: 'Portfolio de Gounteni David, développeur full-stack : React, Node.js, Python et IA.',
  en: 'Portfolio of Gounteni David, full-stack developer: React, Node.js, Python and AI.',
}

function applyToDocument() {
  document.documentElement.lang = lang
  document.querySelector('meta[name="description"]')?.setAttribute('content', META[lang])
}
applyToDocument()

export function setLang(next: Lang) {
  lang = next
  try {
    localStorage.setItem('lang', next)
  } catch {
    /* ignore */
  }
  applyToDocument()
  listeners.forEach((l) => l())
}

export const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr')
export const getLang = () => lang

export function useLang(): Lang {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => lang,
  )
}

/** Returns a picker: t(french, english) gives the text for the current language. */
export function useT() {
  const l = useLang()
  return <T,>(fr: T, en: T): T => (l === 'en' ? en : fr)
}

/** Same as useT, outside React (toasts, palette commands...). */
export const tr = <T,>(fr: T, en: T): T => (lang === 'en' ? en : fr)
