// Hidden authorship marks. None of this is visible on the page:
//  1. an invisible signature made of zero-width characters, slipped into some texts
//     (it survives copy-paste, so copied text still carries it);
//  2. a signature on the <html> element and a styled message in the browser console;
//  3. window.kage.verify(text) to read the hidden signature back out of any pasted text.
// Anyone can delete these from public code: the real proof of authorship is the LICENSE
// file and the git history. These marks just make a copy easy to spot and prove.

export const SIGNATURE = 'Gounteni David · gounteni.dev · 2026 · 影 · GD-KAGE-7F3A'

// Two invisible characters encode the bits, a third wraps the message
const ZERO = '​' // zero width space
const ONE = '‌' // zero width non-joiner
const WRAP = '⁠' // word joiner

/** Turns a message into a string of invisible characters. */
export function encodeInvisible(message: string): string {
  const bytes = new TextEncoder().encode(message)
  let bits = ''
  for (const b of bytes) bits += b.toString(2).padStart(8, '0')
  return WRAP + bits.replace(/0/g, ZERO).replace(/1/g, ONE) + WRAP
}

/** Reads the hidden message back out of a text, or returns null if there is none. */
export function decodeInvisible(text: string): string | null {
  const match = text.match(new RegExp(`${WRAP}([${ZERO}${ONE}]+)${WRAP}`))
  if (!match) return null
  const bits = match[1].replace(new RegExp(ZERO, 'g'), '0').replace(new RegExp(ONE, 'g'), '1')
  const bytes = new Uint8Array(bits.length / 8)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2)
  return new TextDecoder().decode(bytes)
}

/** The signature as invisible characters, ready to drop inside any text. */
export const INVISIBLE_SIGNATURE = encodeInvisible(SIGNATURE)

export function installWatermark() {
  document.documentElement.dataset.author = 'Gounteni David'
  document.documentElement.dataset.signature = btoa(unescape(encodeURIComponent(SIGNATURE)))

  const w = window as unknown as { kage?: object }
  w.kage = {
    signature: SIGNATURE,
    verify: (text: string) => decodeInvisible(text) ?? 'Aucune signature trouvée dans ce texte.',
  }

  console.log(
    '%c影%c Gounteni David %c\nPortfolio conçu et développé par Gounteni David · 2026\nCode protégé : voir le fichier LICENSE du dépôt.\nCurieux ? Essaie Ctrl+K, ou tape « kage ».',
    'font: 800 32px serif; color: #c4b5e8;',
    'font: 700 16px sans-serif; color: #e9e6ef; background: #1a1b22; padding: 4px 8px; border-radius: 4px;',
    'font: 12px monospace; color: #9895a6;',
  )
}
