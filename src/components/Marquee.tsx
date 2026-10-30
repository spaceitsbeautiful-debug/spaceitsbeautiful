import { stack } from '../data/site'
import { useT } from '../i18n'

/** Full-width band of technologies scrolling in a loop (pauses on hover). */
export default function Marquee() {
  const t = useT()
  const items = stack.flatMap((g) => g.items)
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="m-0 flex list-none items-center p-0">
      {items.map((it) => (
        <li key={it.name} className="flex items-center gap-[clamp(20px,3vw,44px)] pr-[clamp(20px,3vw,44px)]">
          <span className="flex items-center gap-3 whitespace-nowrap font-display text-[clamp(24px,3.4vw,48px)] font-bold">
            {it.icon && (
              <svg viewBox="0 0 24 24" className="size-[.7em] fill-current text-accent" aria-hidden="true">
                <path d={it.icon.path} />
              </svg>
            )}
            {it.name}
          </span>
          <span aria-hidden="true" className="font-display text-[clamp(16px,2vw,26px)] text-muted">
            影
          </span>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="marquee-wrap relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-line py-[clamp(18px,2.4vw,32px)]">
      <span className="sr-only">{t('Technologies', 'Technologies')} : {items.map((i) => i.name).join(', ')}</span>
      <div className="marquee" aria-hidden="true">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
