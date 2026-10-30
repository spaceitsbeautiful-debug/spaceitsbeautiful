import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { journey } from '../data/site'
import { Section, ease } from './ui'

/** "Parcours": a vertical timeline whose line fills as you scroll through it. */
export default function Journey() {
  const list = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 70%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <Section id="parcours" title="Parcours" note="du premier script à aujourd'hui" reveal={false}>
      <ol ref={list} className="relative m-0 grid list-none gap-[clamp(28px,4vw,56px)] p-0 pl-8 sm:pl-12">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[5px] w-px bg-line sm:left-[9px]" />
        <motion.span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-accent sm:left-[9px]"
          style={{ scaleY: fill }}
        />
        {journey.map((step, i) => (
          <motion.li
            key={step.title}
            className="relative grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-[clamp(24px,5vw,96px)]"
            initial={{ opacity: 0.35, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease }}
          >
            <span
              aria-hidden="true"
              className={`absolute top-[.55em] -left-8 size-[11px] rounded-full border-2 sm:-left-12 sm:size-[19px] ${
                i === journey.length - 1 ? 'border-accent bg-accent' : 'border-accent bg-bg'
              }`}
            />
            <h3 className="m-0 font-display text-[clamp(22px,2.4vw,34px)] leading-tight font-bold">{step.title}</h3>
            <div className="grid gap-3">
              <p className="m-0 max-w-[38em] text-[clamp(16px,1.2vw,18px)] text-muted">{step.text}</p>
              <div className="flex flex-wrap gap-1.5">
                {step.tags.map((t) => (
                  <span key={t} className="rounded-full border border-line px-[9px] py-[3px] font-mono text-xs text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </Section>
  )
}
