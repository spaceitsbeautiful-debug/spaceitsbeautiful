import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { siSpotify } from 'simple-icons'
import { inspirations } from '../data/site'
import { setExternalPlaying, useSoundEnabled } from '../sound'
import { ease } from './ui'

// Plays the track through Spotify's official embedded player, kept out of sight: the record is
// the play/pause button, and a small "Spotify" credit links to the track. While it plays, the
// site soundtrack pauses; when it is paused or ends, the soundtrack comes back.
// Visitors logged in to Spotify in their browser hear the whole song, others a 30 s preview.

type PlaybackUpdate = { data: { isPaused: boolean; isBuffering: boolean; position: number; duration: number } }
type SpotifyController = {
  addListener: (event: 'ready' | 'playback_update', cb: (e: PlaybackUpdate) => void) => void
  togglePlay: () => void
  destroy: () => void
}
type SpotifyIFrameAPI = {
  createController: (
    el: HTMLElement,
    opts: { uri: string; width?: string | number; height?: string | number; theme?: 'dark' | 'light' },
    cb: (controller: SpotifyController) => void,
  ) => void
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void
  }
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null
/** Loads Spotify's iFrame API once. Rejects if it cannot load (blocked by the host, offline...). */
function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api)
    const s = document.createElement('script')
    s.src = 'https://open.spotify.com/embed/iframe-api/v1'
    s.async = true
    s.onerror = () => {
      apiPromise = null
      reject(new Error('Spotify API blocked'))
    }
    document.head.appendChild(s)
    setTimeout(() => reject(new Error('Spotify API timeout')), 8000)
  })
  return apiPromise
}

type Status = 'loading' | 'ready' | 'playing' | 'paused' | 'blocked'

export default function TrackPlayer() {
  const { track } = inspirations
  const card = useRef<HTMLDivElement>(null)
  const mount = useRef<HTMLDivElement>(null)
  const controller = useRef<SpotifyController | null>(null)
  // Start loading well before the card is reached: when it's within ~1.5 screens,
  // or a few seconds after the page has loaded, whichever comes first
  const nearby = useInView(card, { once: true, margin: '1200px' })
  const [idle, setIdle] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const wantsPlay = useRef(false) // the record was clicked before the player was ready
  const siteSound = useSoundEnabled()
  const openUrl = `https://open.spotify.com/track/${track.spotifyId}`

  useEffect(() => {
    const start = () => setIdle(true)
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    const id = window.setTimeout(() => (ric ? ric(start, { timeout: 2000 }) : start()), 3500)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!(nearby || idle) || controller.current) return
    let cancelled = false
    loadSpotifyApi()
      .then((api) => {
        if (cancelled || !mount.current) return
        const el = document.createElement('div')
        mount.current.appendChild(el)
        api.createController(el, { uri: `spotify:track:${track.spotifyId}`, width: '100%', height: 80, theme: 'dark' }, (c) => {
          controller.current = c
          // Dev only: lets automated tests drive the player (clicks can't reach inside the iframe)
          if (import.meta.env.DEV) (window as unknown as { __spotify?: SpotifyController }).__spotify = c
          c.addListener('ready', () => {
            setStatus('ready')
            if (wantsPlay.current) {
              wantsPlay.current = false
              c.togglePlay()
            }
          })
          c.addListener('playback_update', (e) => {
            const { isPaused, position, duration } = e.data
            const ended = duration > 0 && position >= duration - 300
            if (!isPaused && !ended) {
              setStatus('playing')
              setExternalPlaying(true)
            } else {
              setStatus('paused')
              setExternalPlaying(false)
            }
          })
        })
      })
      .catch(() => !cancelled && setStatus('blocked'))
    return () => {
      cancelled = true
    }
  }, [nearby, idle, track.spotifyId])

  useEffect(
    () => () => {
      controller.current?.destroy()
      setExternalPlaying(false)
    },
    [],
  )

  const playing = status === 'playing'
  const ready = status === 'ready' || status === 'playing' || status === 'paused'

  const onRecord = () => {
    if (status === 'blocked') window.open(openUrl, '_blank', 'noopener')
    else if (ready) controller.current?.togglePlay()
    else {
      // Not ready yet: remember the click, the song starts as soon as the player is ready
      wantsPlay.current = !wantsPlay.current
      setQueued(wantsPlay.current)
    }
  }
  const [queued, setQueued] = useState(false)
  useEffect(() => {
    if (ready) setQueued(false)
  }, [ready])
  const recordLabel =
    status === 'blocked'
      ? 'Écouter veil sur Spotify'
      : !ready
        ? queued
          ? 'Lancement dès que le lecteur est prêt…'
          : 'Écouter veil'
        : playing
          ? 'Mettre veil en pause'
          : 'Écouter veil'

  return (
    <motion.div
      ref={card}
      className="group relative grid min-h-[320px] content-between gap-6 overflow-hidden rounded-[18px] border border-line bg-vis p-[clamp(20px,2.4vw,32px)] transition-colors hover:border-accent"
      initial={{ opacity: 0.35, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span>{playing ? 'En lecture' : 'En boucle'}</span>
        <span aria-hidden="true" className="flex h-4 items-end gap-[3px] text-accent">
          {[0, 1, 2, 3, 4].map((i) => (
            <i
              key={i}
              className={`sound-bar w-[3px] rounded-full bg-current ${playing ? 'is-on' : ''}`}
              style={{ animationDelay: `${i * -0.18}s`, height: playing ? undefined : '3px' }}
            />
          ))}
        </span>
      </div>

      {/* The record is the button: it spins while the song plays, the label shows play/pause on hover */}
      <button
        type="button"
        onClick={onRecord}
        aria-label={recordLabel}
        aria-pressed={playing}
        title={recordLabel}
        className={`group/rec relative mx-auto aspect-square w-[min(64%,210px)] rounded-full transition-transform duration-500 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${queued ? 'cursor-wait' : ''}`}
      >
        <span
          aria-hidden="true"
          className={`record absolute inset-0 rounded-full border border-line ${playing ? 'shadow-[0_0_48px_color-mix(in_srgb,var(--accent)_35%,transparent)]' : 'record-paused'}`}
        />
        <span
          aria-hidden="true"
          className="absolute inset-[34%] grid place-items-center rounded-full bg-accent font-display text-[clamp(18px,2vw,26px)] font-bold text-bg"
        >
          <span className={`transition-opacity ${queued ? 'animate-pulse' : 'group-hover/rec:opacity-0'}`}>炎</span>
          <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover/rec:opacity-100">
            {playing ? (
              <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
                <rect x="1" y="0" width="5" height="18" rx="1" />
                <rect x="10" y="0" width="5" height="18" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
                <path d="M2 0l14 9-14 9z" />
              </svg>
            )}
          </span>
        </span>
      </button>

      <div className="grid gap-3">
        <div className="grid gap-1">
          <span lang="ja" className="font-mono text-xs text-accent-2">
            {track.jp} · {track.context}
          </span>
          <span className="font-display text-[clamp(26px,2.6vw,38px)] leading-tight font-bold">{track.title}</span>
          <span className="text-muted">
            {track.artist} <span lang="ja">({track.artistJp})</span>
          </span>
        </div>

        {/* The Spotify player itself, out of sight (the record drives it) */}
        {status !== 'blocked' && <div ref={mount} aria-hidden="true" className="spotify-mount" />}

        <a
          href={openUrl}
          target="_blank"
          rel="noopener"
          className="flex w-fit items-center gap-2 font-mono text-[11px] text-muted transition-colors hover:text-fg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={siSpotify.path} />
          </svg>
          {queued ? 'Chargement du lecteur…' : status === 'blocked' ? 'Écouter sur Spotify ↗' : 'Clique sur le disque · via Spotify ↗'}
        </a>

        {(status === 'playing' || status === 'paused') && (
          <span className="font-mono text-[11px] text-muted">
            {playing
              ? siteSound
                ? 'La musique du site est en pause pendant l’écoute.'
                : 'Lecture en cours.'
              : siteSound
                ? 'En pause : la musique du site reprend.'
                : 'En pause.'}
          </span>
        )}
      </div>
    </motion.div>
  )
}
