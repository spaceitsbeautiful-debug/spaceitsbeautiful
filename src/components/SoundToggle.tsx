import { toggleSound, useSoundEnabled } from '../sound'

/** Sound on/off. The bars move while sound is on. */
export default function SoundToggle() {
  const on = useSoundEnabled()
  const label = on ? 'Couper le son' : 'Activer le son'
  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className="flex h-9 items-center gap-2 rounded-full border border-line px-3 text-fg transition-colors hover:border-accent"
    >
      <span aria-hidden="true" className="flex h-3.5 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <i
            key={i}
            className={`sound-bar w-[2px] rounded-full bg-current ${on ? 'is-on' : ''}`}
            style={{ animationDelay: `${i * -0.22}s`, height: on ? undefined : '3px' }}
          />
        ))}
      </span>
      <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] sm:inline">{on ? 'Son' : 'Muet'}</span>
    </button>
  )
}
