import type { ComponentType } from 'react'
import type { ShowcaseId } from '../data/projects'
import FocusTimer from './FocusTimer'
import KanjiQuiz from './KanjiQuiz'
import Lueur from './Lueur'
import PaletteTool from './PaletteTool'
import { useT } from '../i18n'

const KAGE_OS_URL = 'https://kage-os-phi.vercel.app'

/** 影OS runs on its own site: shown here in a frame, with a link to open it full screen. */
function KageOsDemo() {
  const t = useT()
  return (
    <div className="grid gap-3">
      <iframe
        src={KAGE_OS_URL}
        title="影OS"
        loading="lazy"
        allow="autoplay"
        className="aspect-[16/10] w-full max-w-full rounded-[14px] border border-line bg-black"
      />
      <a
        href={KAGE_OS_URL}
        target="_blank"
        rel="noopener"
        className="w-fit rounded-full border border-line px-4 py-2 font-mono text-xs transition-colors hover:border-accent"
      >
        {t('Ouvrir 影OS en plein écran', 'Open 影OS full screen')} ↗
      </a>
    </div>
  )
}

/** A tiny desktop: two windows, a taskbar, the 影 start button. */
function KageOsCover() {
  return (
    <div className="relative h-[13em] w-[88%] overflow-hidden rounded-[.8em] border border-line bg-bg">
      <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_60%)]" />
      <span className="absolute right-[6%] bottom-[14%] font-display text-[6em] leading-none font-extrabold text-accent/10">影</span>
      {/* icons */}
      <span className="absolute top-[8%] left-[4%] grid gap-[.5em]">
        {['音', '端', '光'].map((k) => (
          <span key={k} className="grid size-[2em] place-items-center rounded-[.4em] border border-line bg-surface font-display text-[.9em] font-bold text-accent">
            {k}
          </span>
        ))}
      </span>
      {/* ambience window with a waveform */}
      <span className="absolute top-[10%] left-[22%] h-[52%] w-[50%] rounded-[.5em] border border-accent/60 bg-surface shadow-[0_0_2em_-.5em_var(--accent)]">
        <span className="block h-[1.4em] border-b border-line" />
        <svg viewBox="0 0 100 40" className="h-[70%] w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 20 Q 8 4 16 20 T 32 20 T 48 20 T 64 20 T 80 20 T 100 20" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M0 22 Q 6 34 12 22 T 24 22 T 36 22 T 48 22 T 60 22 T 72 22 T 84 22 T 100 22" fill="none" stroke="currentColor" className="text-fg/40" strokeWidth="1" />
        </svg>
      </span>
      {/* terminal window */}
      <span className="absolute top-[38%] left-[52%] grid h-[42%] w-[40%] content-start gap-[.3em] rounded-[.5em] border border-line bg-black/80 p-[.5em] font-mono text-[.6em] text-accent">
        <span>$ neofetch</span>
        <span className="text-fg/60">OS : 影OS 1.0</span>
        <span className="text-fg/60">Shell : kage-sh</span>
      </span>
      {/* taskbar */}
      <span className="absolute inset-x-0 bottom-0 flex h-[12%] items-center gap-[.4em] border-t border-line bg-surface/90 px-[.6em]">
        <span className="font-display text-[.9em] font-extrabold text-accent">影</span>
        <span className="h-[50%] w-[2.4em] rounded-[.2em] bg-line" />
        <span className="h-[50%] w-[2.4em] rounded-[.2em] bg-line" />
      </span>
    </div>
  )
}

// Public demo projects: the live app (shown on the project page) and the cover of its card.
// Covers are sized in em so they scale with the card.

function FocusCover() {
  const R = 40, C = 2 * Math.PI * R
  return (
    <div className="grid justify-items-center gap-[.6em]">
      <div className="relative size-[11em]">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="3" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * 0.32} />
        </svg>
        <div className="absolute inset-0 grid place-content-center justify-items-center">
          <span lang="ja" className="font-display text-[1em] text-accent">
            集中
          </span>
          <span className="font-mono text-[2.4em] leading-none">17:00</span>
        </div>
      </div>
    </div>
  )
}

function KanjiCover() {
  return (
    <div className="grid grid-cols-3 gap-[.7em]">
      {['日', '月', '火', '水', '木', '花'].map((k, i) => (
        <span
          key={k}
          lang="ja"
          className={`grid size-[4.4em] place-items-center rounded-[.4em] border font-display text-[1.1em] font-bold ${
            i === 4 ? 'border-accent bg-accent text-bg' : 'border-line bg-surface'
          }`}
        >
          <span className="text-[2.2em]">{k}</span>
        </span>
      ))}
    </div>
  )
}

function PaletteCover() {
  const colors = ['#121318', '#3b3554', '#6f6299', '#c4b5e8', '#a9c9b8', '#e9e6ef']
  return (
    <div className="flex h-[10em] w-[80%] overflow-hidden rounded-[.8em] border border-line">
      {colors.map((c) => (
        <span key={c} className="flex flex-1 items-end justify-center pb-[.6em] font-mono text-[.75em]" style={{ background: c, color: c === '#e9e6ef' || c === '#c4b5e8' || c === '#a9c9b8' ? '#121318' : '#e9e6ef' }}>
          {c.slice(1, 4)}
        </span>
      ))}
    </div>
  )
}

function LueurCover() {
  return (
    <div className="relative h-[11em] w-[85%] overflow-hidden rounded-[.8em] bg-bg">
      <span className="absolute top-1/2 left-1/2 size-[9em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[1.4em]" />
      <span className="absolute top-1/2 left-1/2 size-[1.4em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg" />
      {[
        ['12%', '20%', '3em'],
        ['78%', '18%', '2.2em'],
        ['70%', '70%', '3.6em'],
        ['18%', '72%', '2.6em'],
      ].map(([l, t, s], i) => (
        <span key={i} className="absolute rounded-full bg-black/80 shadow-[0_0_1.2em_.2em_rgba(0,0,0,.7)]" style={{ left: l, top: t, width: s, height: s }} />
      ))}
      <span className="absolute top-[30%] left-[62%] font-display text-[1.6em] text-accent">✿</span>
      <span className="absolute top-[64%] left-[34%] font-display text-[1.3em] text-accent">✿</span>
    </div>
  )
}

export const showcases: Record<ShowcaseId, { Demo: ComponentType; Cover: ComponentType }> = {
  kageos: { Demo: KageOsDemo, Cover: KageOsCover },
  focus: { Demo: FocusTimer, Cover: FocusCover },
  kanji: { Demo: KanjiQuiz, Cover: KanjiCover },
  palette: { Demo: PaletteTool, Cover: PaletteCover },
  lueur: { Demo: Lueur, Cover: LueurCover },
}
