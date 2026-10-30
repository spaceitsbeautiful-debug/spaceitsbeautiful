import { useEffect, useMemo, useRef, useState } from 'react'

const WORDS =
  'code projet écran clavier souris fichier dossier réseau serveur client données base table requête page bouton menu image texte police couleur ombre lumière nuit jour rêve flamme vent pluie route ville monde temps vite lent calme fort libre simple propre rapide neuf ancien petit grand haut bas avant après jamais toujours souvent encore déjà ensemble seul nous vous elle lui faire voir dire aller venir prendre donner trouver penser croire savoir pouvoir vouloir'.split(
    ' ',
  )
const SECONDS = 30

const makeText = () => Array.from({ length: 45 }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ')

/** A 30-second typing test, a nod to Monkeytype. */
export default function TypingLab() {
  const [text, setText] = useState(makeText)
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const elapsed = startedAt ? Math.min((now - startedAt) / 1000, SECONDS) : 0
  const done = !!startedAt && (elapsed >= SECONDS || typed.length >= text.length)

  useEffect(() => {
    if (!startedAt || done) return
    const id = setInterval(() => setNow(performance.now()), 100)
    return () => clearInterval(id)
  }, [startedAt, done])

  const stats = useMemo(() => {
    let correct = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++
    const minutes = Math.max(elapsed, 1) / 60
    return {
      wpm: Math.round(correct / 5 / minutes),
      accuracy: typed.length ? Math.round((correct / typed.length) * 100) : 100,
    }
  }, [typed, text, elapsed])

  const onChange = (value: string) => {
    if (done) return
    if (!startedAt && value.length) {
      const t = performance.now()
      setStartedAt(t)
      setNow(t)
    }
    setTyped(value.slice(0, text.length))
  }

  const reset = () => {
    setText(makeText())
    setTyped('')
    setStartedAt(null)
    setNow(0)
    input.current?.focus()
  }

  // Show a window of the text around the caret so it never overflows the box
  const from = Math.max(0, text.lastIndexOf(' ', Math.max(0, typed.length - 60)) + 1)
  const visible = text.slice(from, from + 170)

  return (
    <div className="grid gap-4">
      <div
        onClick={() => input.current?.focus()}
        className={`relative grid aspect-[4/3] max-w-full content-center overflow-hidden rounded-[14px] border bg-vis p-[clamp(16px,3vw,32px)] transition-colors ${
          focused ? 'border-accent' : 'border-transparent'
        }`}
      >
        <input
          ref={input}
          id="typing-input"
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Zone de frappe"
          className="absolute inset-0 opacity-0"
        />
        <p className="m-0 font-mono text-[clamp(15px,1.6vw,20px)] leading-relaxed break-words" aria-hidden="true">
          {visible.split('').map((ch, j) => {
            const i = from + j
            const state = i < typed.length ? (typed[i] === ch ? 'ok' : 'bad') : i === typed.length ? 'caret' : 'todo'
            return (
              <span
                key={i}
                className={
                  state === 'ok'
                    ? 'text-fg'
                    : state === 'bad'
                      ? 'text-bad underline decoration-bad'
                      : state === 'caret'
                        ? 'text-muted shadow-[inset_2px_0_0_var(--accent)]'
                        : 'text-muted/60'
                }
              >
                {ch}
              </span>
            )
          })}
        </p>
        {!focused && !startedAt && (
          <span className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-xs text-muted">
            Clique ici et commence à taper
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[13px]">
        <div className="flex gap-5 tabular-nums" aria-live="polite">
          <span>
            <span className="text-muted">Temps </span>
            {Math.ceil(SECONDS - elapsed)} s
          </span>
          <span>
            <span className="text-muted">Vitesse </span>
            {startedAt ? stats.wpm : 0} mots/min
          </span>
          <span>
            <span className="text-muted">Précision </span>
            {stats.accuracy} %
          </span>
        </div>
        <button type="button" onClick={reset} className="rounded-full border border-line px-3.5 py-1.5 transition-colors hover:border-accent">
          {done ? 'Rejouer' : 'Recommencer'}
        </button>
      </div>
    </div>
  )
}
