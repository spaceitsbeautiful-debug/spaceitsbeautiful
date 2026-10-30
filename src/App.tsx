import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import { projects } from './data/projects'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Stack from './components/Stack'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import ProjectDetail from './components/ProjectDetail'
import Loader from './components/Loader'
import Marquee from './components/Marquee'
import Journey from './components/Journey'
import Labs from './components/Labs'
import Inspirations from './components/Inspirations'
import CommandPalette from './components/CommandPalette'
import EasterEggs from './components/EasterEggs'
import Toaster from './components/Toaster'
import { installSoundListeners } from './sound'
import { initSmoothScroll } from './smoothScroll'
import { useT } from './i18n'

const projectFromHash = () => projects.find((p) => p.slug === decodeURIComponent(location.hash.slice(1))) ?? null

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 z-40 h-[2px] origin-left bg-accent"
      style={{ scaleX, top: 'env(safe-area-inset-top, 0px)' }}
    />
  )
}

export default function App() {
  // The open project lives in the address (#nativia) so it can be linked and closed with "back"
  const [project, setProject] = useState(projectFromHash)
  const projectRef = useRef(project)
  projectRef.current = project
  const openedFromPage = useRef(false)
  const t = useT()

  useEffect(() => initSmoothScroll(), [])
  useEffect(() => installSoundListeners(), [])

  useEffect(() => {
    const onHash = () => {
      const p = projectFromHash()
      if (p && !projectRef.current) openedFromPage.current = true
      if (!p) openedFromPage.current = false
      setProject(p)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const close = useCallback(() => {
    if (openedFromPage.current) {
      history.back()
    } else {
      history.replaceState(null, '', location.pathname + location.search)
      setProject(null)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#projets"
        className="sr-only z-[90] rounded-full bg-accent px-4 py-2 font-mono text-sm text-bg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t('Aller au contenu', 'Skip to content')}
      </a>
      <Loader />
      <ScrollProgress />
      <Cursor />
      <div className="gutter">
        <Header />
        <main>
          <Hero />
          <Marquee />
          <Projects />
          <Journey />
          <Labs />
          <Inspirations />
          <Stack />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
      <CommandPalette />
      <EasterEggs />
      <Toaster />
      <AnimatePresence>{project && <ProjectDetail key="detail" project={project} onClose={close} />}</AnimatePresence>
    </MotionConfig>
  )
}
