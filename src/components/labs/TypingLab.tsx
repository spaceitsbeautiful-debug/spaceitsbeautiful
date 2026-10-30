import { useEffect, useMemo, useRef, useState } from 'react'

// A typing test inspired by Monkeytype: it counts every wrong keystroke (even corrected ones),
// remembers which keys you miss, plots your speed second by second, and ends with tips
// based on what it saw.

const WORDS =
  'code projet écran clavier souris fichier dossier réseau serveur client données base table requête page bouton menu image texte police couleur ombre lumière nuit jour rêve flamme vent pluie route ville monde temps vite lent calme fort libre simple propre rapide neuf ancien petit grand haut bas avant après jamais toujours souvent encore déjà ensemble seul nous vous elle lui faire voir dire aller venir prendre donner trouver penser croire savoir pouvoir vouloir être avoir mettre parler passer suivre vivre écrire lire jouer chercher garder'.split(
    ' ',
  )
const DURATIONS = [15, 30, 60] as const
type Duration = (typeof DURATIONS)[number]

const GENERAL_TIPS = [
  'Garde les index sur F et J : les petites bosses servent à les retrouver sans regarder.',
  'Sur un clavier AZERTY, la rangée de repos est Q S D F pour la main gauche, J K L M pour la droite.',
  'La précision d’abord : une faute corrigée coûte plus cher qu’une lettre tapée lentement.',
  'Regarde l’écran, pas le clavier. C’est dur au début, puis ça devient naturel.',
  'Tape au même rythme, comme un métronome, plutôt que par rafales.',
  'Lis le mot suivant pendant que tu finis celui en cours.',
  'Quelques minutes par jour valent mieux qu’une heure une fois par semaine.',
]

const makeText = () => Array.from({ length: 70 }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ')

type Stats = {
  keystrokes: number // every character typed, corrections included
  errors: number // wrong characters at the moment they were typed
  corrections: number // characters erased
  misses: Record<string, number> // expected character -> times missed
  errorSeconds: number[]
  perSecond: number[] // keystrokes in each second
}
const emptyStats = (): Stats => ({ keystrokes: 0, errors: 0, corrections: 0, misses: {}, errorSeconds: [], perSecond: [] })

type Result = {
  wpm: number
  raw: number
  accuracy: number
  errors: number
  corrections: number
  correctChars: number
  wrongChars: number
  consistency: number
  topMisses: [string, number][]
  speedCurve: number[]
  errorSeconds: number[]
  duration: number
}

function readBest(d: Duration): number {
  try {
    return Number(localStorage.getItem(`typing-best-${d}`)) || 0
  } catch {
    return 0
  }
}

/** Advice picked from the numbers of the run. */
function tipsFor(r: Result): string[] {
  const tips: string[] = []
  if (r.accuracy < 92)
    tips.push(`Précision de ${r.accuracy} % : ralentis un peu. Vise 96 % et plus, la vitesse suivra toute seule.`)
  if (r.topMisses.length) {
    const keys = r.topMisses.map(([k]) => (k === ' ' ? 'espace' : k)).join(', ')
    tips.push(`Tes touches à travailler : ${keys}. Tape quelques lignes de mots qui les contiennent, lentement.`)
  }
  if (r.corrections > r.errors * 2 && r.corrections > 6)
    tips.push('Tu effaces beaucoup : finis le mot même avec une faute, puis corrige moins souvent mais mieux.')
  if (r.consistency < 70)
    tips.push(`Régularité de ${r.consistency} % : ton rythme varie beaucoup. Cherche une vitesse que tu peux tenir sans t’arrêter.`)
  if (r.raw - r.wpm > 12) tips.push('Ta vitesse brute est bien plus haute que ta vitesse nette : les fautes te coûtent cher.')
  if (r.wpm < 30) tips.push('Sous 30 mots/min, travaille la position des doigts sur la rangée de repos (Q S D F / J K L M).')
  else if (r.wpm < 55) tips.push('Bonne base ! Pour passer un cap, entraîne-toi sur les mots les plus courants jusqu’à les taper sans réfléchir.')
  else tips.push('Belle vitesse ! Essaie le mode 60 s pour travailler l’endurance et la régularité.')
  return tips.slice(0, 3)
}

/** Speed per second as a small line chart, with red marks where errors happened. */
function SpeedChart({ curve, errorSeconds, duration }: { curve: number[]; errorSeconds: number[]; duration: number }) {
  const W = 300, H = 90, P = 6
  const max = Math.max(30, ...curve) * 1.1
  const x = (i: number) => P + (i / Math.max(1, duration - 1)) * (W - P * 2)
  const y = (v: number) => H - P - (v / max) * (H - P * 2)
  const line = curve.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = curve.length ? `${line} L${x(curve.length - 1).toFixed(1)},${H - P} L${x(0).toFixed(1)},${H - P} Z` : ''
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-full" role="img" aria-label="Vitesse seconde par seconde">
      <line x1={P} x2={W - P} y1={y(max / 1.1 / 2)} y2={y(max / 1.1 / 2)} stroke="var(--line)" strokeDasharray="3 4" />
      <path d={area} fill="color-mix(in srgb, var(--accent) 16%, transparent)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {errorSeconds.map((s, i) => (
        <circle key={i} cx={x(Math.min(s, duration - 1))} cy={H - P} r="2.4" fill="var(--bad)" />
      ))}
    </svg>
  )
}

export default function TypingLab() {
  const [duration, setDuration] = useState<Duration>(30)
  const [text, setText] = useState(makeText)
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [focused, setFocused] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [best, setBest] = useState(() => readBest(30))
  const [tip] = useState(() => GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)])
  const stats = useRef<Stats>(emptyStats())
  const input = useRef<HTMLInputElement>(null)

  const elapsed = startedAt ? Math.min((now - startedAt) / 1000, duration) : 0
  const running = !!startedAt && !result

  const correctChars = useMemo(() => {
    let n = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) n++
    return n
  }, [typed, text])

  const liveWpm = startedAt ? Math.round(correctChars / 5 / (Math.max(elapsed, 1) / 60)) : 0
  const liveAccuracy = stats.current.keystrokes
    ? Math.round(((stats.current.keystrokes - stats.current.errors) / stats.current.keystrokes) * 100)
    : 100

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(performance.now()), 100)
    return () => clearInterval(id)
  }, [running])

  // End of the test: time is up, or the whole text is typed
  useEffect(() => {
    if (!running || (elapsed < duration && typed.length < text.length)) return
    const s = stats.current
    // Count the seconds where nothing was typed too, up to the end of the test
    for (let i = 0; i < Math.ceil(elapsed); i++) s.perSecond[i] ??= 0
    const minutes = Math.max(elapsed, 1) / 60
    const perSecondWpm = s.perSecond.map((k) => k * 12)
    const mean = perSecondWpm.reduce((a, b) => a + b, 0) / Math.max(1, perSecondWpm.length)
    const std = Math.sqrt(perSecondWpm.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, perSecondWpm.length))
    // Cumulative net speed after each second, for the chart
    const curve: number[] = []
    let typedSoFar = 0
    s.perSecond.forEach((k, i) => {
      typedSoFar += k
      curve.push(Math.round((typedSoFar * (correctChars / Math.max(1, typed.length))) / 5 / ((i + 1) / 60)))
    })
    const r: Result = {
      wpm: Math.round(correctChars / 5 / minutes),
      raw: Math.round(s.keystrokes / 5 / minutes),
      accuracy: s.keystrokes ? Math.round(((s.keystrokes - s.errors) / s.keystrokes) * 100) : 100,
      errors: s.errors,
      corrections: s.corrections,
      correctChars,
      wrongChars: typed.length - correctChars,
      consistency: mean ? Math.max(0, Math.round(100 - (std / mean) * 100)) : 0,
      topMisses: Object.entries(s.misses).sort((a, b) => b[1] - a[1]).slice(0, 3),
      speedCurve: curve,
      errorSeconds: s.errorSeconds,
      duration,
    }
    setResult(r)
    if (r.wpm > best) {
      setBest(r.wpm)
      try {
        localStorage.setItem(`typing-best-${duration}`, String(r.wpm))
      } catch {
        /* not saved, no problem */
      }
    }
  }, [running, elapsed, duration, typed, text, correctChars, best])

  const onChange = (value: string) => {
    if (result) return
    const s = stats.current
    let start = startedAt
    if (!start && value.length) {
      start = performance.now()
      setStartedAt(start)
      setNow(start)
    }
    const sec = start ? Math.floor((performance.now() - start) / 1000) : 0
    if (value.length > typed.length) {
      for (let i = typed.length; i < value.length && i < text.length; i++) {
        s.keystrokes++
        s.perSecond[sec] = (s.perSecond[sec] ?? 0) + 1
        if (value[i] !== text[i]) {
          s.errors++
          s.misses[text[i]] = (s.misses[text[i]] ?? 0) + 1
          s.errorSeconds.push(sec)
        }
      }
    } else {
      s.corrections += typed.length - value.length
    }
    // Fill seconds where nothing was typed, so the chart has no holes
    for (let i = 0; i < sec; i++) s.perSecond[i] ??= 0
    setTyped(value.slice(0, text.length))
  }

  const reset = (d: Duration = duration) => {
    setDuration(d)
    setBest(readBest(d))
    setText(makeText())
    setTyped('')
    setStartedAt(null)
    setNow(0)
    setResult(null)
    stats.current = emptyStats()
    setTimeout(() => input.current?.focus(), 0)
  }

  // Window of the text around the caret so it never overflows the box
  const from = Math.max(0, text.lastIndexOf(' ', Math.max(0, typed.length - 60)) + 1)
  const visible = text.slice(from, from + 170)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div role="group" aria-label="Durée du test" className="flex gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={duration === d}
              onClick={() => reset(d)}
              className={`rounded-full border px-3 py-1 transition-colors ${
                duration === d ? 'border-accent bg-accent text-bg' : 'border-line hover:border-accent'
              }`}
            >
              {d} s
            </button>
          ))}
        </div>
        <span className="text-muted">
          Record ({duration} s) : <span className="text-fg tabular-nums">{best || '—'}</span> mots/min
        </span>
      </div>

      {result ? (
        /* ---------- Results ---------- */
        <div className="grid min-h-[280px] content-start gap-5 rounded-[14px] bg-vis p-[clamp(16px,2.4vw,28px)]" aria-live="polite">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <div className="grid">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Vitesse</span>
              <span className="font-display text-[clamp(44px,5vw,64px)] leading-none font-bold tabular-nums text-accent">
                {result.wpm}
                <span className="ml-1.5 font-mono text-sm text-muted">mots/min</span>
              </span>
            </div>
            <div className="grid">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Précision</span>
              <span className="font-display text-[clamp(32px,3.6vw,44px)] leading-none font-bold tabular-nums">{result.accuracy} %</span>
            </div>
            {result.wpm >= best && result.wpm > 0 && (
              <span className="rounded-full border border-accent px-3 py-1 font-mono text-[11px] text-accent">Nouveau record !</span>
            )}
          </div>

          {result.speedCurve.length > 1 && (
            <SpeedChart curve={result.speedCurve} errorSeconds={result.errorSeconds} duration={result.duration} />
          )}

          <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[12px] sm:grid-cols-3">
            {[
              ['Brute', `${result.raw} mots/min`],
              ['Erreurs', `${result.errors}`],
              ['Effacés', `${result.corrections}`],
              ['Régularité', `${result.consistency} %`],
              ['Lettres justes', `${result.correctChars}`],
              ['Lettres fausses', `${result.wrongChars}`],
            ].map(([k, v]) => (
              <div key={k} className="grid">
                <dt className="text-muted">{k}</dt>
                <dd className="m-0 tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {result.topMisses.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 font-mono text-[12px]">
              <span className="text-muted">Touches ratées :</span>
              {result.topMisses.map(([k, n]) => (
                <span key={k} className="rounded-[6px] border border-bad px-2 py-0.5 text-bad">
                  {k === ' ' ? 'espace' : k} <span className="opacity-70">×{n}</span>
                </span>
              ))}
            </div>
          )}

          <div className="grid gap-2 border-t border-line pt-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2">Conseils pour toi</span>
            <ul className="m-0 grid list-none gap-1.5 p-0 text-[14px] text-muted">
              {tipsFor(result).map((t) => (
                <li key={t} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">
                    ↳
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <a
              href="https://monkeytype.com"
              target="_blank"
              rel="noopener"
              className="w-fit font-mono text-[12px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg"
            >
              Pour t’entraîner tous les jours : monkeytype.com ↗
            </a>
          </div>
        </div>
      ) : (
        /* ---------- Typing area ---------- */
        <div
          onClick={() => input.current?.focus()}
          className={`relative grid min-h-[280px] content-center overflow-hidden rounded-[14px] border bg-vis p-[clamp(16px,3vw,32px)] transition-colors ${
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
            autoCorrect="off"
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
                        ? `rounded-[2px] bg-bad/15 text-bad ${ch === ' ' ? 'underline decoration-bad decoration-2' : ''}`
                        : state === 'caret'
                          ? 'text-muted shadow-[inset_2px_0_0_var(--accent)]'
                          : 'text-muted/60'
                  }
                >
                  {state === 'bad' && ch === ' ' ? '·' : ch}
                </span>
              )
            })}
          </p>
          {!focused && !startedAt && (
            <span className="pointer-events-none absolute inset-x-4 bottom-4 text-center font-mono text-xs text-muted">
              Clique ici et commence à taper · le chrono démarre à la première touche
            </span>
          )}
          {/* Progress of the timer */}
          {startedAt && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent"
              style={{ transform: `scaleX(${elapsed / duration})` }}
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[13px]">
        {result ? (
          <span className="text-muted">Test de {result.duration} s terminé</span>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-1 tabular-nums" aria-live="off">
            <span>
              <span className="text-muted">Temps </span>
              {Math.ceil(duration - elapsed)} s
            </span>
            <span>
              <span className="text-muted">Vitesse </span>
              {liveWpm} mots/min
            </span>
            <span>
              <span className="text-muted">Précision </span>
              <span className={liveAccuracy < 92 ? 'text-bad' : ''}>{liveAccuracy} %</span>
            </span>
            <span>
              <span className="text-muted">Erreurs </span>
              <span className={stats.current.errors ? 'text-bad' : ''}>{stats.current.errors}</span>
            </span>
          </div>
        )}
        <button type="button" onClick={() => reset()} className="rounded-full border border-line px-3.5 py-1.5 transition-colors hover:border-accent">
          {result ? 'Rejouer' : 'Recommencer'}
        </button>
      </div>

      {!result && (
        <p className="m-0 flex gap-2 text-[13px] text-muted">
          <span aria-hidden="true" className="text-accent">
            ↳
          </span>
          <span>
            <span className="text-fg">Astuce :</span> {tip}
          </span>
        </p>
      )}
    </div>
  )
}
