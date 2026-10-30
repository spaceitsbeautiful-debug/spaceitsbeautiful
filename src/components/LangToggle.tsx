import { toggleLang, useLang } from '../i18n'

/** FR / EN switch: the active language is highlighted. */
export default function LangToggle() {
  const lang = useLang()
  const label = lang === 'fr' ? 'Switch to English' : 'Passer en français'
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={label}
      title={label}
      className="flex h-9 items-center gap-1 rounded-full border border-line px-3 font-mono text-[11px] tracking-[0.08em] transition-colors hover:border-accent"
    >
      <span className={lang === 'fr' ? 'text-fg' : 'text-muted'}>FR</span>
      <span aria-hidden="true" className="text-muted">
        /
      </span>
      <span className={lang === 'en' ? 'text-fg' : 'text-muted'}>EN</span>
    </button>
  )
}
