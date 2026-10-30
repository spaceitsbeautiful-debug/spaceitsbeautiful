import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '../i18n'
import { startScroll, stopScroll } from '../smoothScroll'
import LangToggle from './LangToggle'
import SoundToggle from './SoundToggle'
import ThemeToggle from './ThemeToggle'
import { ease } from './ui'

// [section id, French label, English label]
const links = [
  ['projets', 'Projets', 'Projects'],
  ['parcours', 'Parcours', 'Journey'],
  ['labs', 'Labs', 'Labs'],
  ['inspirations', 'Inspirations', 'Inspirations'],
  ['stack', 'Stack', 'Stack'],
  ['apropos', 'À propos', 'About'],
  ['contact', 'Contact', 'Contact'],
] as const

/** Id of the section crossing the upper third of the screen. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const sections = links.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-30% 0px -65% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return active
}

export default function Header() {
  const active = useActiveSection()
  const t = useT()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    stopScroll()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      startScroll()
    }
  }, [menuOpen])

  return (
    <>
      {/* Paints the phone's status-bar band in the header colour */}
      <div aria-hidden="true" className="safe-top-band" />
      <header
        className={`sticky z-30 -mx-[var(--gutter-x)] px-[var(--gutter-x)] transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'border-b border-line bg-bg/80 backdrop-blur-md' : 'border-b border-transparent'
        }`}
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between gap-4 py-4 font-mono text-[13px] text-muted">
          <a href="#hero" className="tracking-[0.04em] text-fg">
            gounteni<span className="text-accent">.</span>dev
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav aria-label="Sections" className="mr-2 hidden items-center gap-0.5 xl:flex">
              {links.map(([id, fr, en]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                  className={`relative rounded-full px-3 py-1.5 transition-colors hover:text-fg ${active === id ? 'text-fg' : ''}`}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-surface ring-1 ring-line"
                      transition={{ duration: 0.45, ease }}
                    />
                  )}
                  {t(fr, en)}
                </a>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-palette'))}
              aria-label={t('Ouvrir la palette de commandes (Ctrl K)', 'Open the command palette (Ctrl K)')}
              title={t('Palette de commandes', 'Command palette')}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-line px-3 text-fg transition-colors hover:border-accent md:flex"
            >
              <kbd className="font-mono text-[11px]">Ctrl K</kbd>
            </button>
            <span className="hidden sm:block">
              <LangToggle />
            </span>
            <SoundToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="h-9 rounded-full border border-line px-3.5 text-fg xl:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="gutter fixed inset-0 z-[55] flex flex-col bg-bg"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="flex items-center justify-between py-4 font-mono text-[13px]">
              <span className="text-fg">gounteni<span className="text-accent">.</span>dev</span>
              <div className="flex items-center gap-2">
                <LangToggle />
                <button
                  type="button"
                  autoFocus
                  onClick={() => setMenuOpen(false)}
                  className="h-9 rounded-full border border-line px-3.5"
                >
                  {t('Fermer', 'Close')}
                </button>
              </div>
            </div>
            <nav aria-label="Sections" className="grid flex-1 content-center gap-1">
              {links.map(([id, fr, en], i) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.05 }}
                  className="flex items-baseline justify-between border-b border-line py-3 font-display text-[clamp(32px,9vw,56px)] font-bold"
                >
                  {t(fr, en)}
                  <span aria-hidden="true" className="font-mono text-base text-muted">→</span>
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
