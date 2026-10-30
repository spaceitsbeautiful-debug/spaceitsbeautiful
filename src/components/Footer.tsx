import { INVISIBLE_SIGNATURE } from '../watermark'

export default function Footer() {
  return (
    <footer className="flex flex-wrap justify-between gap-4 border-t border-line pt-7 pb-10 font-mono text-xs text-muted">
      <span>© 2026 Gounteni{INVISIBLE_SIGNATURE} David</span>
      <span>影 · fait avec soin</span>
    </footer>
  )
}
