import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { inspirations } from '../data/site'
import { setExternalPlaying, useSoundEnabled } from '../sound'
import { ease } from './ui'

// Plays the track through YouTube's official embedded player (the video stays visible, as
// YouTube requires). While it plays, the site soundtrack pauses; when it is paused or ends,
// the soundtrack comes back.

type YTPlayer = { destroy: () => void; playVideo: () => void }
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      host?: string
      videoId: string
      playerVars?: Record<string, number | string>
      events?: { onReady?: (e: { target: YTPlayer }) => void; onStateChange?: (e: { data: number }) => void }
    },
  ) => YTPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null
/** Loads the YouTube IFrame API once. Rejects if it cannot load (blocked by the host, offline...). */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    s.onerror = () => {
      apiPromise = null
      reject(new Error('YouTube API blocked'))
    }
    document.head.appendChild(s)
    setTimeout(() => reject(new Error('YouTube API timeout')), 8000)
  })
  return apiPromise
}

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked'

export default function TrackPlayer() {
  const { track } = inspirations
  const mount = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const siteSound = useSoundEnabled()
  const watchUrl = `https://www.youtube.com/watch?v=${track.youtubeId}`

  useEffect(
    () => () => {
      player.current?.destroy()
      setExternalPlaying(false)
    },
    [],
  )

  const start = async () => {
    if (player.current) {
      player.current.playVideo()
      return
    }
    setStatus('loading')
    try {
      const YT = await loadYouTubeApi()
      const el = document.createElement('div')
      mount.current!.appendChild(el)
      player.current = new YT.Player(el, {
        host: 'https://www.youtube-nocookie.com',
        videoId: track.youtubeId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              setStatus('playing')
              setExternalPlaying(true)
            } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
              setStatus('paused')
              setExternalPlaying(false)
            }
          },
        },
      })
    } catch {
      // The page is shown somewhere that blocks embedded players (e.g. a claude.ai preview)
      setStatus('blocked')
    }
  }

  const started = status === 'loading' || status === 'playing' || status === 'paused'

  return (
    <motion.div
      className="group relative grid min-h-[320px] content-between gap-6 overflow-hidden rounded-[18px] border border-line bg-vis p-[clamp(20px,2.4vw,32px)] transition-colors hover:border-accent"
      initial={{ opacity: 0.35, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span>{status === 'playing' ? 'En lecture' : 'En boucle'}</span>
        <span aria-hidden="true" className="flex h-4 items-end gap-[3px] text-accent">
          {[0, 1, 2, 3, 4].map((i) => (
            <i
              key={i}
              className={`sound-bar w-[3px] rounded-full bg-current ${status === 'playing' ? 'is-on' : ''}`}
              style={{ animationDelay: `${i * -0.18}s`, height: status === 'playing' ? undefined : '3px' }}
            />
          ))}
        </span>
      </div>

      {/* Before playing: a record. Once started: the official video. */}
      <div className="relative">
        <div ref={mount} className={`yt-mount aspect-video w-full overflow-hidden rounded-[12px] bg-bg ${started ? '' : 'hidden'}`} />
        {!started && (
          <div className="relative mx-auto aspect-square w-[min(70%,220px)]">
            <div className="record record-paused absolute inset-0 rounded-full border border-line" />
            <div className="absolute inset-[34%] grid place-items-center rounded-full bg-accent font-display text-[clamp(18px,2vw,26px)] font-bold text-bg">
              炎
            </div>
          </div>
        )}
      </div>

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
        {status === 'blocked' ? (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener"
            className="w-fit rounded-full border border-line px-4 py-2 font-mono text-xs transition-colors hover:border-accent"
          >
            Écouter sur YouTube ↗
          </a>
        ) : (
          !started && (
            <button
              type="button"
              onClick={start}
              className="flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-xs text-bg transition-transform hover:-translate-y-px"
            >
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
                <path d="M0 0l10 6-10 6z" fill="currentColor" />
              </svg>
              Écouter ici
            </button>
          )
        )}
        {started && (
          <span className="font-mono text-[11px] text-muted">
            {status === 'playing'
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
