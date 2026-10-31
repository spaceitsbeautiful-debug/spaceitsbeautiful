import { useCallback, useEffect, useRef, useState } from 'react'
import { avatar } from '../data/site'
import { useT } from '../i18n'

// Drop an image: its pixels are grouped with k-means into 6 colours, shown from dark to light.
// Click a colour to copy its HEX code, or copy the whole palette as CSS variables.
// Everything happens in the browser: the image is never uploaded.

type Rgb = [number, number, number]
const K = 6

const toHex = ([r, g, b]: Rgb) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const saturation = ([r, g, b]: Rgb) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}

/** k-means on a sample of the pixels; returns K colours sorted from dark to light. */
function extractPalette(img: HTMLImageElement): Rgb[] {
  const S = 80
  const c = document.createElement('canvas')
  const ratio = img.naturalWidth / img.naturalHeight
  c.width = ratio >= 1 ? S : Math.round(S * ratio)
  c.height = ratio >= 1 ? Math.round(S / ratio) : S
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0, c.width, c.height)
  const data = g.getImageData(0, 0, c.width, c.height).data
  const px: Rgb[] = []
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 128) px.push([data[i], data[i + 1], data[i + 2]])
  if (!px.length) return []
  // Start from colours spread along the brightness range
  const sorted = [...px].sort((a, b) => luminance(a) - luminance(b))
  let centers: Rgb[] = Array.from({ length: K }, (_, i) => sorted[Math.floor(((i + 0.5) / K) * sorted.length)])
  for (let iter = 0; iter < 12; iter++) {
    const sums = centers.map(() => [0, 0, 0, 0])
    for (const p of px) {
      let best = 0, bestD = Infinity
      centers.forEach((c2, j) => {
        const d = (p[0] - c2[0]) ** 2 + (p[1] - c2[1]) ** 2 + (p[2] - c2[2]) ** 2
        if (d < bestD) (bestD = d), (best = j)
      })
      const s = sums[best]
      s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++
    }
    centers = sums.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : centers[j]) as Rgb)
  }
  return centers.sort((a, b) => luminance(a) - luminance(b))
}

export default function PaletteTool() {
  const t = useT()
  const [src, setSrc] = useState(avatar)
  const [palette, setPalette] = useState<Rgb[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<'dark' | 'light'>('dark')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setPalette(extractPalette(img))
    img.src = src
  }, [src])

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setSrc(String(reader.result))
    reader.readAsDataURL(file)
  }

  const copy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1400)
    } catch {
      /* the codes stay visible and selectable */
    }
  }, [])

  const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${toHex(c)};`).join('\n')}\n}`

  // Preview roles: darkest / lightest as background and text, most saturated as accent
  const dark = palette[0] ?? [18, 19, 24]
  const light = palette[palette.length - 1] ?? [240, 240, 240]
  // A grey image has no real accent colour: then take a light-mid tone that stands out on the dark one
  const mostSaturated = [...palette].sort((a, b) => saturation(b) - saturation(a))[0]
  const accent = (mostSaturated && saturation(mostSaturated) > 0.18 ? mostSaturated : palette[Math.floor(palette.length * 0.7)]) ?? [196, 181, 232]
  const bg = preview === 'dark' ? dark : light
  const fg = preview === 'dark' ? light : dark

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* Image drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          loadFile(e.dataTransfer.files[0])
        }}
        className={`relative grid gap-3 rounded-[16px] border-2 border-dashed p-3 transition-colors ${dragging ? 'border-accent bg-accent/10' : 'border-line bg-vis'}`}
      >
        <img src={src} alt={t('Image analysée', 'Analysed image')} className="aspect-square w-full rounded-[10px] object-cover" />
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
          <span className="font-mono text-xs text-muted">{t('Glisse une image ici', 'Drop an image here')}</span>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="rounded-full border border-line px-4 py-1.5 font-mono text-xs transition-colors hover:border-accent"
          >
            {t('Choisir une image', 'Choose an image')}
          </button>
          <input ref={input} id="palette-file" type="file" accept="image/*" className="hidden" onChange={(e) => loadFile(e.target.files?.[0])} />
        </div>
      </div>

      <div className="grid content-start gap-4">
        {/* Swatches */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {palette.map((c) => {
            const hex = toHex(c)
            return (
              <button
                key={hex}
                type="button"
                onClick={() => copy(hex, hex)}
                title={t('Copier', 'Copy')}
                className="group grid overflow-hidden rounded-[12px] border border-line text-left"
              >
                <span className="block aspect-[3/4] transition-transform group-hover:scale-105" style={{ background: hex }} />
                <span className="bg-surface px-2 py-1.5 font-mono text-[11px] uppercase">{copied === hex ? t('Copié', 'Copied') : hex}</span>
              </button>
            )
          })}
        </div>

        {/* Live preview with the palette */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <span>{t('Aperçu', 'Preview')}</span>
            <div className="flex gap-1.5">
              {(['dark', 'light'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={preview === m}
                  onClick={() => setPreview(m)}
                  className={`rounded-full border px-3 py-0.5 ${preview === m ? 'border-accent text-fg' : 'border-line'}`}
                >
                  {m === 'dark' ? t('Sombre', 'Dark') : t('Clair', 'Light')}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 rounded-[14px] p-5" style={{ background: toHex(bg), color: toHex(fg) }}>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: toHex(accent) }}>
              {t('Ta palette', 'Your palette')}
            </span>
            <span className="font-display text-2xl font-bold">{t('Un titre avec tes couleurs', 'A heading in your colours')}</span>
            <span className="text-sm opacity-75">
              {t('Le fond, le texte et l’accent viennent de ton image.', 'The background, text and accent come from your image.')}
            </span>
            <span className="w-fit rounded-full px-4 py-1.5 font-mono text-xs" style={{ background: toHex(accent), color: toHex(dark) }}>
              {t('Bouton', 'Button')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => copy(css, 'css')}
          className="w-fit rounded-full bg-accent px-5 py-2 font-mono text-[13px] text-bg transition-transform hover:-translate-y-px"
        >
          {copied === 'css' ? t('CSS copié !', 'CSS copied!') : t('Copier en variables CSS', 'Copy as CSS variables')}
        </button>
      </div>
    </div>
  )
}
