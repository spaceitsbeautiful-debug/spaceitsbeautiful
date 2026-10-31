import { useMemo } from 'react'
import { useT } from '../i18n'

// Visual for a confidential project: blurred shapes that hint at an interface without showing
// anything, a lock, and a 機密 ("confidential") stamp. The shapes are derived from the slug,
// so each project gets its own look that never changes.

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export default function Mock({ seed }: { seed: string }) {
  const t = useT()
  const blocks = useMemo(() => {
    let h = hash(seed)
    const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000
    return Array.from({ length: 7 }, () => ({
      left: `${Math.round(rand() * 70)}%`,
      top: `${Math.round(rand() * 70)}%`,
      width: `${Math.round(18 + rand() * 40)}%`,
      height: `${Math.round(10 + rand() * 28)}%`,
      strong: rand() > 0.6,
    }))
  }, [seed])

  return (
    <div className="confidential relative aspect-[16/10] w-full">
      {/* Blurred "interface" */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[.8em] blur-[.9em]">
        {blocks.map((b, i) => (
          <span
            key={i}
            className={`absolute rounded-[.6em] ${b.strong ? 'bg-accent/45' : 'bg-fg/12'}`}
            style={{ left: b.left, top: b.top, width: b.width, height: b.height }}
          />
        ))}
      </div>
      {/* Lock and stamp */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid justify-items-center gap-[.8em]">
          <span className="grid size-[3.6em] place-items-center rounded-full border border-line bg-surface/80 text-accent backdrop-blur">
            <svg viewBox="0 0 24 24" className="size-[1.6em]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <span className="flex items-center gap-[.6em] font-mono text-[.95em] uppercase tracking-[.2em] text-muted">
            <span lang="ja" className="font-display text-[1.3em] font-bold tracking-normal text-accent">
              機密
            </span>
            {t('Confidentiel', 'Confidential')}
          </span>
        </div>
      </div>
    </div>
  )
}
