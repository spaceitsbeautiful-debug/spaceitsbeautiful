import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from './ui'

type Toast = { id: number; text: string }
let push: ((text: string) => void) | null = null

/** Shows a short message at the bottom of the screen. */
export function toast(text: string) {
  push?.(text)
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([])
  useEffect(() => {
    let id = 0
    push = (text) => {
      const t = { id: ++id, text }
      setItems((list) => [...list, t])
      setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 3200)
    }
    return () => {
      push = null
    }
  }, [])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[80] grid justify-items-center gap-2 px-4"
      style={{ bottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="rounded-full border border-line bg-surface px-5 py-2.5 font-mono text-[13px] shadow-lg"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
