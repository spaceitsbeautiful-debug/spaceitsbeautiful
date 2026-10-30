import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { projects } from '../data/projects'
import { avatar, stack } from '../data/site'
import { useT } from '../i18n'
import { Section } from './ui'

const techCount = new Set([...projects.flatMap((p) => p.tags), ...stack.flatMap((g) => g.items.map((i) => i.name))]).size

const figures = [
  { value: projects.length, label: 'projets', en: 'projects' },
  { value: techCount, label: 'technologies utilisées', en: 'technologies used' },
  { value: 1, label: "an de code, et ce n'est que le début", en: "year of coding, and it's only the beginning" },
]

/** Counts up from 0 the first time it comes into view. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [n, setN] = useState(to)
  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const controls = animate(0, to, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [inView, to])
  return <span ref={ref}>{n}</span>
}

// [French label, English label, French value, English value]
const facts = [
  ['Rôle', 'Role', 'Développeur full-stack', 'Full-stack developer'],
  ['Entreprise', 'Company', 'Matrix Industrie', 'Matrix Industrie'],
  ['Langages', 'Languages', 'TypeScript, Python, SQL', 'TypeScript, Python, SQL'],
  ['Outils', 'Tools', 'VS Code, Termux, Acode, Replit', 'VS Code, Termux, Acode, Replit'],
]

export default function About() {
  const t = useT()
  return (
    <Section id="apropos" title={t('À propos', 'About')}>
      <div className="grid gap-[clamp(40px,6vw,120px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Avatar: the picture from data/site.ts, tinted lavender until hovered; otherwise a 影 monogram */}
        <div className="grid content-start gap-6">
          <div className="group relative grid aspect-square w-full max-w-[340px] place-items-center overflow-hidden rounded-[28px] border border-line bg-vis">
            {avatar ? (
              <>
                <img
                  src={avatar}
                  alt="Avatar de Gounteni David"
                  className="absolute inset-0 size-full object-cover grayscale transition-[filter,scale] duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-accent mix-blend-color transition-opacity duration-700 group-hover:opacity-0"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
              </>
            ) : (
              <span aria-hidden="true" className="font-display text-[clamp(140px,22vw,260px)] leading-none font-extrabold text-accent/15">
                影
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 font-mono text-xs text-muted">
              <span className="font-display text-[42px] leading-none font-bold text-fg">GD</span>
              <span>@_shadow.concept</span>
            </span>
          </div>
          <ul className="m-0 grid max-w-[340px] list-none gap-3.5 p-0">
            {facts.map(([k, kEn, v, vEn]) => (
              <li key={k} className="grid gap-0.5">
                <span className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">{t(k, kEn)}</span>
                <span className="text-[15px]">{t(v, vEn)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid min-w-0 content-start gap-[clamp(32px,4vw,56px)]">
          <div className="text-[clamp(17px,1.35vw,20px)] text-muted [&_p]:mt-0 [&_p]:mb-4 [&_p]:max-w-[36em] [&_strong]:font-semibold [&_strong]:text-fg">
            {t(
              <>
                <p>
                  J'ai commencé le développement logiciel il y a un an, et je travaille aujourd'hui chez{' '}
                  <strong>Matrix Industrie</strong> sur les interfaces, les bases de données et les outils internes.
                </p>
                <p>
                  Je code sur PC avec VS Code, mais aussi en déplacement sur tablette avec <strong>Termux</strong> et
                  Acode. Je m'entraîne régulièrement sur Monkeytype pour taper plus vite.
                </p>
                <p>Hors écran : les animes (Fire Force en tête), la musique japonaise, et Warframe avec une manette PS4.</p>
              </>,
              <>
                <p>
                  I started software development a year ago, and today I work at <strong>Matrix Industrie</strong> on
                  interfaces, databases and internal tools.
                </p>
                <p>
                  I code on my PC with VS Code, but also on the go on a tablet with <strong>Termux</strong> and Acode. I
                  practice regularly on Monkeytype to type faster.
                </p>
                <p>Off screen: anime (Fire Force first), Japanese music, and Warframe with a PS4 controller.</p>
              </>,
            )}
          </div>
          <dl className="m-0 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {figures.map((f) => (
              <div key={f.label} className="grid gap-1">
                <dt className="order-2 max-w-[14em] text-sm text-muted">{t(f.label, f.en)}</dt>
                <dd className="order-1 m-0 font-display text-[clamp(48px,6vw,88px)] leading-none font-bold tabular-nums">
                  <CountUp to={f.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}
