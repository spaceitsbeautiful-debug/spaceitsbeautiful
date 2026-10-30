import { lazy, Suspense, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { heroGlyphs } from '../data/site'
import { useT } from '../i18n'
import { useIntroDone } from '../intro'
import { playSfx } from '../sound'
import { INVISIBLE_SIGNATURE } from '../watermark'
import { Eyebrow, ease } from './ui'

// Three.js is most of the bundle: load it after the page text is on screen
const GlyphParticles = lazy(() => import('./GlyphParticles'))

// Entrances wait for the loader (`play`), then run
const rise = (delay: number, play: boolean) => ({
  initial: { y: 10, opacity: 0.4 },
  animate: play ? { y: 0, opacity: 1 } : undefined,
  transition: { duration: 0.8, ease, delay },
})

function Line({ children, alt = false, delay = 0 }: { children: ReactNode; alt?: boolean; delay?: number }) {
  const play = useIntroDone()
  return (
    <span className={`block overflow-hidden pb-[.06em] ${alt ? 'pl-[.3em] text-accent sm:pl-[.55em]' : ''}`}>
      <motion.span
        className="inline-block"
        initial={{ y: '105%' }}
        animate={play ? { y: 0 } : undefined}
        transition={{ duration: 1.1, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

// [French label, English label, French value, English value]
const meta = [
  ['Actuellement', 'Currently', 'Matrix Industrie', 'Matrix Industrie'],
  ['Projet phare', 'Main project', 'Nativia', 'Nativia'],
  ['Spécialité', 'Focus', 'Frontend & BDD', 'Frontend & databases'],
  ['Statut', 'Status', 'Ouvert aux projets', 'Open to projects'],
]

export default function Hero() {
  const [has3d, setHas3d] = useState(false)
  const play = useIntroDone()
  const [glyph, setGlyph] = useState(0)
  const g = heroGlyphs[glyph]
  const t = useT()

  return (
    <section
      id="hero"
      className="relative isolate grid min-h-[calc(100svh-80px)] grid-rows-[1fr_auto] gap-12 pt-8 pb-7 sm:min-h-[calc(100svh-90px)] sm:pt-6 sm:pb-8"
    >
      {!has3d && (
        <span aria-hidden="true" className="hero-fallback">
          影
        </span>
      )}
      <Suspense fallback={null}>
        <GlyphParticles onReady={() => setHas3d(true)} onGlyphChange={(i) => {
            setGlyph(i)
            if (i > 0) playSfx('chime')
          }} />
      </Suspense>

      <div className="grid min-w-0 gap-[26px] self-center lg:max-w-[62%]">
        <motion.div {...rise(0.25, play)}>
          <Eyebrow>{t('Développeur full-stack', 'Full-stack developer')}</Eyebrow>
        </motion.div>
        <h1 className="m-0 grid font-display text-[clamp(58px,11vw,196px)] leading-[.9] font-extrabold tracking-[-0.035em]">
          <Line>Gounteni</Line>
          <Line alt delay={0.1}>
            David
          </Line>
        </h1>
        <motion.p {...rise(0.3, play)} className="m-0 flex flex-wrap gap-y-2 font-mono text-[clamp(13px,1vw,15px)]">
          {['React', 'Node.js', 'Python', t('IA', 'AI')].map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="mx-3.5 text-muted">/</span>}
              {s}
            </span>
          ))}
        </motion.p>
        {has3d && (
          <motion.div {...rise(0.35, play)} className="grid gap-1.5 font-mono text-xs text-muted">
            {/* Reading and meaning of the kanji drawn by the particles; swaps with each change */}
            <p className="m-0 flex h-[1.6em] items-center gap-2 overflow-hidden" aria-live="polite">
              <span>↳</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={g.kanji}
                  className="flex items-baseline gap-2"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <span className="font-display text-base font-bold text-accent">{g.kanji}</span>
                  <span className="text-fg">{g.reading}</span>
                  <span>· {t(g.meaning, g.meaningEn)}</span>
                </motion.span>
              </AnimatePresence>
            </p>
            <span className="hidden [@media(hover:hover)]:block">{t('passe la souris sur le kanji', 'hover the kanji')}</span>
          </motion.div>
        )}
      </div>

      <motion.div
        {...rise(0.4, play)}
        className="grid grid-cols-1 items-end gap-x-[clamp(32px,5vw,88px)] gap-y-8 border-t border-line pt-7 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]"
      >
        <p className="m-0 max-w-[32em] min-w-0 text-[clamp(16px,1.25vw,19px)] text-muted [&_strong]:font-semibold [&_strong]:text-fg">
          {t(
            <>
              Je construis des <strong>interfaces React</strong>, des <strong>API Node</strong> et des{' '}
              <strong>outils en Python</strong>. Une appli pour apprendre l'éwé, un assistant vocal de bureau, un portail
              client : j'aime les projets où le code sert{INVISIBLE_SIGNATURE} vraiment à quelqu'un.
            </>,
            <>
              I build <strong>React interfaces</strong>, <strong>Node APIs</strong> and <strong>Python tools</strong>. An
              app to learn Ewe, a desktop voice assistant, a client portal: I like projects where the code is{INVISIBLE_SIGNATURE}{' '}
              actually useful to someone.
            </>,
          )}
        </p>
        <dl className="m-0 grid min-w-0 grid-cols-2 gap-x-8 gap-y-[18px]">
          {meta.map(([k, kEn, v, vEn]) => (
            <div key={k} className="grid gap-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{t(k, kEn)}</dt>
              <dd className="m-0 text-[15px]">{t(v, vEn)}</dd>
            </div>
          ))}
        </dl>
        <a
          href="#projets"
          className="scroll hidden flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-fg lg:flex"
        >
          {t('Projets', 'Projects')}
        </a>
      </motion.div>
    </section>
  )
}
