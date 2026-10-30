import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '../data/projects'
import { contact } from '../data/site'
import { toggleSound } from '../sound'
import { toggleTheme } from '../theme'
import { kanjiRain, shadowMode } from './EasterEggs'
import { ease } from './ui'

type Command = { id: string; group: string; label: string; hint?: string; run: () => void }

const go = (hash: string) => () => {
  location.hash = hash
}

function buildCommands(): Command[] {
  const sections: [string, string][] = [
    ['hero', 'Accueil'],
    ['projets', 'Projets'],
    ['parcours', 'Parcours'],
    ['labs', 'Labs'],
    ['inspirations', 'Inspirations'],
    ['stack', 'Stack'],
    ['apropos', 'À propos'],
    ['contact', 'Contact'],
  ]
  const list: Command[] = [
    ...sections.map(([id, label]) => ({ id: `s-${id}`, group: 'Aller à', label, run: go(id) })),
    ...projects.map((p) => ({ id: `p-${p.slug}`, group: 'Projets', label: p.name, hint: p.kind, run: go(p.slug) })),
    { id: 'theme', group: 'Réglages', label: 'Changer de thème (clair / sombre)', run: () => toggleTheme() },
    { id: 'sound', group: 'Réglages', label: 'Activer / couper le son', run: toggleSound },
    { id: 'rain', group: 'Secrets', label: 'Pluie de kanji', hint: 'ou tape « kage »', run: kanjiRain },
    { id: 'shadow', group: 'Secrets', label: 'Mode Shadow', hint: '↑↑↓↓←→←→BA', run: shadowMode },
  ]
  if (contact.instagram)
    list.push({
      id: 'insta',
      group: 'Liens',
      label: 'Instagram',
      hint: `@${contact.instagram}`,
      run: () => window.open(`https://www.instagram.com/${contact.instagram}/`, '_blank', 'noopener'),
    })
  if (contact.github)
    list.push({
      id: 'github',
      group: 'Liens',
      label: 'GitHub',
      hint: contact.github,
      run: () => window.open(`https://github.com/${contact.github}`, '_blank', 'noopener'),
    })
  return list
}

/** Ctrl+K (or ⌘K) opens a searchable list of everything you can do on the site. */
export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const commands = useMemo(buildCommands, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    if (!q) return commands
    return commands.filter((c) =>
      `${c.group} ${c.label} ${c.hint ?? ''}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(q),
    )
  }, [query, commands])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-palette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-palette', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => input.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const run = (c: Command) => {
    setOpen(false)
    setTimeout(c.run, 120)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) run(results[active])
  }

  let lastGroup = ''
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] grid items-start justify-items-center bg-bg/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            initial={{ y: -16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="w-full max-w-[560px] overflow-hidden rounded-[16px] border border-line bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <span aria-hidden="true" className="font-display text-lg text-accent">
                影
              </span>
              <input
                ref={input}
                id="palette-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher une section, un projet, un réglage…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                autoComplete="off"
                className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">Échap</kbd>
            </div>
            <ul id="palette-list" role="listbox" data-lenis-prevent className="m-0 max-h-[50vh] list-none overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Aucun résultat pour « {query} »</li>}
              {results.map((c, i) => {
                const header = c.group !== lastGroup ? c.group : null
                lastGroup = c.group
                return (
                  <li key={c.id} role="presentation">
                    {header && <div className="px-3 pt-3 pb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{header}</div>}
                    <div
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(c)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-[10px] px-3 py-2.5 text-[14px] ${
                        i === active ? 'bg-accent text-bg' : 'text-fg'
                      }`}
                    >
                      <span>{c.label}</span>
                      {c.hint && <span className={`font-mono text-[11px] ${i === active ? 'text-bg/75' : 'text-muted'}`}>{c.hint}</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="flex gap-4 border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
              <span>↑↓ naviguer</span>
              <span>↵ ouvrir</span>
              <span className="ml-auto">Ctrl K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
