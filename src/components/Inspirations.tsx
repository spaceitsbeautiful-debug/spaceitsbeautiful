import { motion } from 'framer-motion'
import { inspirations } from '../data/site'
import { Section, ease } from './ui'

/** A typographic moodboard: anime with their Japanese titles, plus the track on repeat. */
export default function Inspirations() {
  const { anime, track } = inspirations
  return (
    <Section id="inspirations" title="Inspirations" note="ce qui nourrit mon univers" reveal={false}>
      <div className="grid gap-[clamp(16px,2vw,28px)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ul className="m-0 grid list-none grid-cols-1 gap-px overflow-hidden rounded-[18px] border border-line bg-line p-0 sm:grid-cols-2">
          {anime.map((a, i) => (
            <motion.li
              key={a.title}
              className="group relative grid min-h-[200px] content-between gap-6 overflow-hidden bg-surface p-[clamp(20px,2.4vw,32px)]"
              initial={{ opacity: 0.35 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease, delay: (i % 2) * 0.08 }}
            >
              {/* The Japanese title, huge and faint, slides in on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -bottom-6 font-display text-[clamp(64px,7vw,110px)] leading-none font-extrabold whitespace-nowrap text-accent/[0.07] transition-[translate,color] duration-700 group-hover:-translate-x-6 group-hover:text-accent/15"
              >
                {a.jp}
              </span>
              <span lang="ja" className="relative font-mono text-xs text-accent-2">
                {a.jp}
              </span>
              <div className="relative grid gap-2">
                <h3 className="m-0 font-display text-[clamp(22px,2.2vw,32px)] leading-tight font-bold">{a.title}</h3>
                <p className="m-0 max-w-[30em] text-[15px] text-muted">{a.note}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <motion.a
          href={track.link}
          target="_blank"
          rel="noopener"
          className="group relative grid min-h-[320px] content-between gap-8 overflow-hidden rounded-[18px] border border-line bg-vis p-[clamp(20px,2.4vw,32px)] transition-colors hover:border-accent"
          initial={{ opacity: 0.35, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <span>En boucle</span>
            {/* Equalizer bars, moving like the sound toggle */}
            <span aria-hidden="true" className="flex h-4 items-end gap-[3px] text-accent">
              {[0, 1, 2, 3, 4].map((i) => (
                <i key={i} className="sound-bar is-on w-[3px] rounded-full bg-current" style={{ animationDelay: `${i * -0.18}s` }} />
              ))}
            </span>
          </div>
          {/* A spinning record */}
          <div className="relative mx-auto aspect-square w-[min(70%,220px)]">
            <div className="record absolute inset-0 rounded-full border border-line" />
            <div className="absolute inset-[34%] grid place-items-center rounded-full bg-accent font-display text-[clamp(18px,2vw,26px)] font-bold text-bg">
              空
            </div>
          </div>
          <div className="grid gap-1">
            <span lang="ja" className="font-mono text-xs text-accent-2">
              {track.jp}
            </span>
            <span className="font-display text-[clamp(26px,2.6vw,38px)] leading-tight font-bold">{track.title}</span>
            <span className="flex items-center justify-between text-muted">
              {track.artist}
              <span className="font-mono text-xs transition-transform group-hover:translate-x-1">Écouter ↗</span>
            </span>
          </div>
        </motion.a>
      </div>
    </Section>
  )
}
