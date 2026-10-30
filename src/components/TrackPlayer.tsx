import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { inspirations } from '../data/site'
import { useT } from '../i18n'
import { setExternalPlaying, useSoundEnabled } from '../sound'
import { ease } from './ui'

// The record is the play/pause button for a royalty-free MP3 hosted with the site.
// While it plays, the site soundtrack pauses; when it is paused or ends, the soundtrack comes back.

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

export default function TrackPlayer() {
  const { track } = inspirations
  const card = useRef<HTMLDivElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const siteSound = useSoundEnabled()
  const t = useT()
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [started, setStarted] = useState(false)

  // Start downloading the file once the card is getting close, so the first click plays at once
  const nearby = useInView(card, { once: true, margin: '800px' })
  useEffect(() => {
    if (nearby && audio.current) audio.current.preload = 'auto'
  }, [nearby])

  useEffect(() => {
    const a = audio.current!
    const onPlay = () => {
      setPlaying(true)
      setStarted(true)
      setExternalPlaying(true)
    }
    const onStop = () => {
      setPlaying(false)
      setExternalPlaying(false)
    }
    const onTime = () => setTime(a.currentTime)
    const onMeta = () => setDuration(a.duration)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onStop)
    a.addEventListener('ended', onStop)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onStop)
      a.removeEventListener('ended', onStop)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      setExternalPlaying(false)
    }
  }, [])

  const toggle = () => {
    const a = audio.current!
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    const a = audio.current!
    if (!duration) return
    if ('key' in e) {
      if (e.key === 'ArrowRight') a.currentTime = Math.min(duration, a.currentTime + 5)
      else if (e.key === 'ArrowLeft') a.currentTime = Math.max(0, a.currentTime - 5)
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - r.left) / r.width) * duration
  }

  const label = playing ? t(`Mettre ${track.title} en pause`, `Pause ${track.title}`) : t(`Écouter ${track.title}`, `Play ${track.title}`)

  return (
    <motion.div
      ref={card}
      className="group relative grid min-h-[320px] content-between gap-6 overflow-hidden rounded-[18px] border border-line bg-vis p-[clamp(20px,2.4vw,32px)] transition-colors hover:border-accent"
      initial={{ opacity: 0.35, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease }}
    >
      <audio ref={audio} src={track.src} preload="metadata" />

      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span>{playing ? t('En lecture', 'Now playing') : t('En boucle', 'On repeat')}</span>
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
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing}
        title={label}
        className="group/rec relative mx-auto aspect-square w-[min(64%,210px)] rounded-full transition-transform duration-500 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <span
          aria-hidden="true"
          className={`record absolute inset-0 rounded-full border border-line ${playing ? 'shadow-[0_0_48px_color-mix(in_srgb,var(--accent)_35%,transparent)]' : 'record-paused'}`}
        />
        <span
          aria-hidden="true"
          className="absolute inset-[34%] grid place-items-center rounded-full bg-accent font-display text-[clamp(18px,2vw,26px)] font-bold text-bg"
        >
          <span className="transition-opacity group-hover/rec:opacity-0">花</span>
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
          <span className="font-display text-[clamp(24px,2.4vw,34px)] leading-tight font-bold">{track.title}</span>
          <span className="text-muted">{track.artist}</span>
        </div>

        {/* Progress: click (or arrow keys) to move in the song */}
        <div className="grid gap-1.5">
          <div
            role="slider"
            tabIndex={0}
            aria-label={t('Position dans le morceau', 'Position in the track')}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} ${t('sur', 'of')} ${fmt(duration)}`}
            onClick={seek}
            onKeyDown={seek}
            className="group/bar relative h-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line" />
            <span
              className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-accent"
              style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
            />
            <span
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-opacity group-hover/bar:opacity-100"
              style={{ left: `${duration ? (time / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-muted tabular-nums">
            <span>{fmt(time)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted">
          <a href={track.source} target="_blank" rel="noopener" className="transition-colors hover:text-fg">
            {t('Musique', 'Music')} : {track.artist} · Pixabay ↗
          </a>
          {started && (
            <span>
              {playing
                ? siteSound
                  ? t('Musique du site en pause', 'Site music paused')
                  : t('Lecture en cours', 'Playing')
                : siteSound
                  ? t('Musique du site reprise', 'Site music back on')
                  : t('En pause', 'Paused')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
