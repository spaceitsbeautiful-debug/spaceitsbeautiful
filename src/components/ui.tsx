import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Scramble from './Scramble'

export const ease = [0.2, 0.8, 0.2, 1] as const

/** Turns "**bold**" segments of a string into <strong>. */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-accent-2">
      <span className="size-[7px] rounded-full bg-accent-2" />
      {children}
    </div>
  )
}

/**
 * Page section. On entering the screen the top rule draws from left to right,
 * the title lifts out of its line and the content rises (unless `reveal` is off,
 * for sections whose children animate themselves).
 */
export function Section({
  id,
  title,
  note,
  reveal = true,
  extra,
  children,
}: {
  id: string
  title: string
  note?: string
  reveal?: boolean
  /** Shown between the title and the note (e.g. a badge) */
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="relative py-[clamp(56px,8vw,120px)]">
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
      />
      <div className="mb-[clamp(32px,4vw,56px)] flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 overflow-hidden pb-[.08em] font-display text-[clamp(30px,4vw,56px)] font-bold tracking-[-0.01em]">
          <motion.span
            className="inline-block"
            initial={{ y: '60%', opacity: 0.3 }}
            whileInView={{ y: 0, opacity: 1 }}
            // Low threshold: the h2 clips the shifted title, so only ~40% of it can ever be visible before it moves
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease }}
          >
            <Scramble text={title} />
          </motion.span>
        </h2>
        {extra}
        {note && (
          <motion.span
            className="font-mono text-[12.5px] text-muted"
            initial={{ opacity: 0.3 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {note}
          </motion.span>
        )}
      </div>
      {reveal ? (
        <motion.div
          initial={{ opacity: 0.4, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </section>
  )
}
