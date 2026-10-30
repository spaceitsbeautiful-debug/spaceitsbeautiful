import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { localize, projects, type Project } from '../data/projects'
import { useLang, useT } from '../i18n'
import { playSfx } from '../sound'
import { startScroll, stopScroll } from '../smoothScroll'
import Mock from './Mocks'
import { ease } from './ui'

const pad = (n: number) => String(n).padStart(2, '0')

/** Full-screen page for one project, opened from its card (#slug in the address). */
export default function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const p = localize(project, lang)
  const scroller = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const index = projects.findIndex((x) => x.slug === p.slug)
  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  // Lock the page behind, close on Escape, put focus inside the dialog
  useEffect(() => {
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    stopScroll()
    playSfx('open')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    closeBtn.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = overflow
      startScroll()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Switching to another project: a curtain with its first letter sweeps across
  const [curtain, setCurtain] = useState<string | null>(null)
  const firstSlug = useRef(p.slug)
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    if (p.slug !== firstSlug.current) {
      setCurtain(p.slug)
      playSfx('open')
    }
  }, [p.slug])

  // Previous / next replace the history entry, so "back" still returns to the grid
  const go = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    location.replace(`#${slug}`)
  }

  return (
    <motion.div
      ref={scroller}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      data-lenis-prevent
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence>
        {curtain && (
          <motion.div
            key={curtain}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-accent"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0% 0)', 'inset(0 0 100% 0)'] }}
            transition={{ duration: 1.1, times: [0, 0.45, 1], ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setCurtain(null)}
          >
            <span className="font-display text-[clamp(120px,30vmin,320px)] leading-none font-extrabold text-bg">
              {p.name.charAt(0)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="gutter">
        <div
          className="sticky z-10 flex items-center justify-between gap-4 bg-bg/85 py-5 font-mono text-[13px] backdrop-blur-md"
          style={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
          <button ref={closeBtn} type="button" onClick={onClose} className="text-muted transition-colors hover:text-fg">
            ← {t('Tous les projets', 'All projects')}
          </button>
          <span className="text-muted tabular-nums">
            {pad(index + 1)} / {pad(projects.length)}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <header className="grid gap-6 pt-[clamp(24px,5vw,72px)] pb-[clamp(32px,4vw,56px)]">
              <motion.span
                className="font-mono text-xs uppercase tracking-[0.14em] text-accent-2"
                initial={{ opacity: 0.3, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.15 }}
              >
                {p.kind}
              </motion.span>
              <h1
                id="detail-title"
                className="m-0 overflow-hidden pb-[.06em] font-display text-[clamp(44px,9vw,150px)] leading-[.95] font-extrabold tracking-[-0.03em]"
              >
                <motion.span
                  className="inline-block"
                  initial={{ y: '50%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease, delay: 0.1 }}
                >
                  {p.name}
                </motion.span>
              </h1>
              <motion.p
                className="m-0 max-w-[38em] text-[clamp(17px,1.5vw,22px)] text-muted"
                initial={{ opacity: 0.3, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.25 }}
              >
                {p.summary}
              </motion.p>
            </header>

            <motion.div
              layoutId={`visual-${p.slug}`}
              aria-hidden="true"
              style={{ borderRadius: 22 }}
              transition={{ duration: 0.7, ease }}
              className="visual visual-detail grid aspect-[4/3] max-w-full place-items-center overflow-hidden border border-line sm:aspect-[16/9]"
            >
              <div className="mock w-[min(78%,900px)]">
                <Mock visual={p.visual} />
              </div>
            </motion.div>

            {p.images && p.images.length > 0 && (
              <div className="mt-[clamp(16px,2vw,28px)] grid gap-[clamp(16px,2vw,28px)] sm:grid-cols-2">
                {p.images.map((src, i) => (
                  <motion.img
                    key={src}
                    src={src}
                    alt={`${p.name}, ${t('capture', 'screenshot')} ${i + 1}`}
                    loading="lazy"
                    initial={{ opacity: 0.3, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, ease }}
                    className={`w-full max-w-full rounded-[18px] border border-line object-cover ${
                      p.images!.length % 2 === 1 && i === 0 ? 'sm:col-span-2' : ''
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="grid gap-[clamp(40px,6vw,120px)] py-[clamp(48px,7vw,104px)] md:grid-cols-[1.5fr_1fr]">
              <div className="min-w-0">
                <h2 className="m-0 mb-6 font-display text-[clamp(26px,3vw,40px)] font-bold">{t('Ce que fait le projet', 'What it does')}</h2>
                <ul className="m-0 grid list-none p-0">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-4 border-t border-line py-4 text-[clamp(16px,1.2vw,18px)]">
                      <span aria-hidden="true" className="mt-[.65em] size-1.5 flex-none rounded-full bg-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="m-0 grid min-w-0 content-start gap-7">
                <div className="grid gap-1.5">
                  <dt className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">{t('Rôle', 'Role')}</dt>
                  <dd className="m-0 text-[17px]">{p.role}</dd>
                </div>
                <div className="grid gap-1.5">
                  <dt className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">Type</dt>
                  <dd className="m-0 text-[17px]">{p.kind}</dd>
                </div>
                <div className="grid gap-2.5">
                  <dt className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">{t('Technologies', 'Tech')}</dt>
                  <dd className="m-0 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="tag-accent rounded-full border px-[9px] py-[3px] font-mono text-xs">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
                {(p.links?.code || p.links?.demo) && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {p.links.demo && (
                      <a
                        href={p.links.demo}
                        target="_blank"
                        rel="noopener"
                        className="rounded-full bg-accent px-5 py-2.5 font-mono text-[13px] text-bg transition-transform hover:-translate-y-px"
                      >
                        {t("Tester l'appli", 'Try the app')} ↗
                      </a>
                    )}
                    {p.links.code && (
                      <a
                        href={p.links.code}
                        target="_blank"
                        rel="noopener"
                        className="rounded-full border border-line px-5 py-2.5 font-mono text-[13px] transition-colors hover:border-accent"
                      >
                        {t('Voir le code', 'View the code')} ↗
                      </a>
                    )}
                  </div>
                )}
              </dl>
            </div>
          </motion.div>
        </AnimatePresence>

        <nav aria-label={t('Autres projets', 'Other projects')} className="grid grid-cols-2 border-t border-line">
          <a href={`#${prev.slug}`} onClick={go(prev.slug)} className="group grid min-w-0 content-start gap-2 py-10 pr-4">
            <span className="font-mono text-xs text-muted">← {t('Précédent', 'Previous')}</span>
            <span className="font-display text-[clamp(20px,3vw,44px)] leading-tight font-bold transition-colors group-hover:text-accent">
              {localize(prev, lang).name}
            </span>
          </a>
          <a
            href={`#${next.slug}`}
            onClick={go(next.slug)}
            className="group grid min-w-0 content-start justify-items-end gap-2 border-l border-line py-10 pl-4 text-right"
          >
            <span className="font-mono text-xs text-muted">{t('Suivant', 'Next')} →</span>
            <span className="font-display text-[clamp(20px,3vw,44px)] leading-tight font-bold transition-colors group-hover:text-accent">
              {localize(next, lang).name}
            </span>
          </a>
        </nav>
      </div>
    </motion.div>
  )
}
