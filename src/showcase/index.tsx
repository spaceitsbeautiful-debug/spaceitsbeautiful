import type { ComponentType } from 'react'
import type { ShowcaseId } from '../data/projects'
import FocusTimer from './FocusTimer'
import KanjiQuiz from './KanjiQuiz'
import Lueur from './Lueur'
import PaletteTool from './PaletteTool'

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
  focus: { Demo: FocusTimer, Cover: FocusCover },
  kanji: { Demo: KanjiQuiz, Cover: KanjiCover },
  palette: { Demo: PaletteTool, Cover: PaletteCover },
  lueur: { Demo: Lueur, Cover: LueurCover },
}
