// A round seal: text running around the edge turns slowly, "GD" stays upright in the middle.
// It speeds up on hover. Decorative only.

const RING = 'GOUNTENI DAVID · 影 · PORTFOLIO · 2026 · '

export default function RotatingBadge({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`badge group relative size-[132px] flex-none select-none ${className}`}>
      {/* Rotating ring of text and ticks */}
      <svg viewBox="0 0 200 200" className="badge-ring absolute inset-0 size-full">
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 5" />
        {Array.from({ length: 60 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="4"
            x2="100"
            y2={i % 5 === 0 ? 12 : 8}
            stroke={i % 5 === 0 ? 'var(--accent)' : 'var(--line)'}
            strokeWidth="1"
            transform={`rotate(${i * 6} 100 100)`}
          />
        ))}
        <text className="fill-muted font-mono" fontSize="13" letterSpacing="3.2">
          <textPath href="#badge-circle">{RING}</textPath>
        </text>
      </svg>
      {/* Fixed centre */}
      <div className="absolute inset-[28%] grid place-items-center rounded-full border border-line bg-surface shadow-[0_0_30px_-8px_var(--accent)] transition-transform duration-500 group-hover:scale-110">
        <span className="font-display text-[30px] leading-none font-extrabold tracking-[-0.04em] text-accent">GD</span>
      </div>
    </div>
  )
}
