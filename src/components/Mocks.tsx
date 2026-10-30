import { useMemo, type CSSProperties } from 'react'
import type { Visual } from '../data/projects'

// Illustrations drawn in HTML/CSS for each project card (styles in visuals.css).

function Nativia() {
  return (
    <div className="m-nativia">
      <div className="nv-tiles">
        {['Ɖ', 'Ɛ', 'Ƒ', 'Ɣ', 'Ŋ', 'Ɔ', 'Ʋ'].map((l) => (
          <span key={l} className={l === 'Ɛ' ? 'on' : undefined}>
            {l}
          </span>
        ))}
      </div>
      <div className="nv-chat">
        <span className="mochi">
          <i />
          <i />
        </span>
        <p>
          On répète ensemble&nbsp;? Écoute bien le son <b>Ɛ</b>.
        </p>
      </div>
      <div className="nv-progress">
        <small>Leçon 3 · L'alphabet éwé · 68 %</small>
        <div className="bar">
          <i style={{ width: '68%' }} />
        </div>
      </div>
    </div>
  )
}

function Kurumi() {
  const bars = useMemo(() => {
    const n = 30
    return Array.from({ length: n }, (_, i) => {
      const env = Math.sin((i / (n - 1)) * Math.PI)
      const h = Math.round(20 + env * 75 * (0.55 + 0.45 * Math.abs(Math.sin(i * 2.3))))
      return { '--h': `${h}%`, '--d': `${(-(i * 0.13) % 1.1).toFixed(2)}s` } as CSSProperties
    })
  }, [])
  return (
    <div className="m-kurumi">
      <div className="orb" />
      <div className="wave">
        {bars.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <p className="kr-cmd">« Kurumi, ouvre VS Code »</p>
      <p className="kr-reply">D'accord, j'ouvre VS Code.</p>
    </div>
  )
}

function Portal() {
  return (
    <div className="m-portal">
      <div className="pt-side">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="pt-main">
        <b>Tableau de bord</b>
        <div className="pt-stats">
          {[['Demandes', 12], ['En cours', 3], ['Résolues', 9]].map(([k, v]) => (
            <div key={k}>
              <small>{k}</small>
              <b>{v}</b>
            </div>
          ))}
        </div>
        <div className="pt-chart">
          {[35, 55, 42, 70, 60, 82, 95].map((h, i) => (
            <i key={i} style={{ '--h': `${h}%` } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Optimus() {
  const rows: [string, number][] = [['projets/', 100], ['photos/', 100], ['documents/', 62]]
  return (
    <div className="m-optimus">
      <div className="op-head">
        <b>Optimus Save</b>
        <small>Auto · 03:00</small>
      </div>
      <ul>
        {rows.map(([name, pct]) => (
          <li key={name}>
            <span>{name}</span>
            <div className="bar">
              <i style={{ width: `${pct}%` }} />
            </div>
            <em>{pct === 100 ? '✓' : `${pct}%`}</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 11×11 QR-looking grid with the three corner finder squares, fixed seed so it never changes. */
function qrCells() {
  const S = 11
  let seed = 42
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [S - 4, 0], [0, S - 4]]) {
      const dx = x - fx, dy = y - fy
      if (dx >= 0 && dx < 4 && dy >= 0 && dy < 4) {
        return dx === 0 || dy === 0 || dx === 3 || dy === 3 || ((dx === 1 || dx === 2) && (dy === 1 || dy === 2))
      }
    }
    return null
  }
  const cells: boolean[] = []
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const f = finder(x, y)
      cells.push(f === null ? rand() > 0.52 : f)
    }
  }
  return cells
}

function Queue() {
  const cells = useMemo(qrCells, [])
  return (
    <div className="m-queue">
      <div className="ticket">
        <small>Votre ticket</small>
        <b>A-042</b>
        <span>Guichet 3 · 4 personnes avant vous</span>
        <div className="qr">
          {cells.map((on, i) => (
            <i key={i} className={on ? 'on' : undefined} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Kuro() {
  return (
    <div className="m-kuro">
      <div className="kt-head">
        <span className="kt-logo">黒</span>
        <b>Kuro-Talk</b>
      </div>
      <div className="kt-msg in">On se retrouve à 18h&nbsp;?</div>
      <div className="kt-msg out">Ça marche, j'arrive.</div>
      <div className="kt-msg in typing">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

const mocks: Record<Visual, () => React.JSX.Element> = {
  nativia: Nativia,
  kurumi: Kurumi,
  portal: Portal,
  optimus: Optimus,
  queue: Queue,
  kuro: Kuro,
}

export default function Mock({ visual }: { visual: Visual }) {
  const Component = mocks[visual]
  return <Component />
}
