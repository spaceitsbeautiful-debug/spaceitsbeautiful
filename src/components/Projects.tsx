import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { categories, localize, projects, type Category, type Project } from '../data/projects'
import { useLang, useT } from '../i18n'
import Mock from './Mocks'
import { Rich, Section, ease } from './ui'

// 6-column grid: the wide card takes a full row, halves take 3, thirds take 2
const spans: Record<Project['size'], string> = {
  wide: 'col-span-6 lg:flex-row',
  half: 'col-span-6 sm:col-span-3',
  third: 'col-span-6 sm:col-span-3 lg:col-span-2',
}

function ProjectCard({ project, index, size }: { project: Project; index: number; size: Project['size'] }) {
  const t = useT()
  const p = localize(project, useLang())
  const ref = useRef<HTMLElement>(null)
  const wide = size === 'wide'

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <motion.article
      ref={ref}
      layout
      data-cursor="card"
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
      onPointerMove={onPointerMove}
      initial={{ opacity: 0.35, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease, delay: (index % 3) * 0.08 }}
      className={`card card-hover group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition-[translate,border-color] duration-500 hover:-translate-y-1 ${spans[size]}`}
    >
      {/* Shares its layoutId with the big visual of the detail page, so it grows into it */}
      <motion.div
        layoutId={`visual-${p.slug}`}
        aria-hidden="true"
        style={{ borderRadius: 0 }}
        className={`visual relative grid aspect-[16/10] max-w-full place-items-center overflow-hidden border-b border-line ${
          wide ? 'visual-wide lg:aspect-auto lg:min-h-[400px] lg:flex-[1.35] lg:border-r lg:border-b-0' : ''
        }`}
      >
        <div className="mock w-[78%] transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]">
          <Mock visual={p.visual} />
        </div>
      </motion.div>

      <div
        className={`flex min-w-0 flex-1 flex-col gap-3 px-[26px] pt-6 pb-7 ${
          wide ? 'lg:justify-center lg:gap-4 lg:p-[clamp(28px,3.5vw,56px)]' : ''
        }`}
      >
        {p.featured && (
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">{t('Projet phare', 'Main project')}</span>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
          <h3
            className={`m-0 font-display font-bold tracking-[-0.01em] ${
              wide ? 'text-[clamp(34px,4vw,64px)] leading-none' : 'text-[clamp(22px,2vw,30px)]'
            }`}
          >
            {p.name}
          </h3>
          <span className="whitespace-nowrap font-mono text-xs text-muted">{p.kind}</span>
        </div>
        <p
          className={`m-0 max-w-[40em] text-muted [&_strong]:font-semibold [&_strong]:text-fg ${
            wide ? 'text-[clamp(16px,1.2vw,18px)]' : ''
          }`}
        >
          <Rich text={p.description} />
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
          {p.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border px-[9px] py-[3px] font-mono text-xs ${
                wide ? 'tag-accent text-fg' : 'border-line text-muted'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        {/* The link covers the whole card through its ::after */}
        <a
          href={`#${p.slug}`}
          className="mt-2 inline-flex w-fit items-center gap-2 font-mono text-[13px] text-fg after:absolute after:inset-0 after:z-[3] after:content-['']"
        >
          {t('Voir le projet', 'View project')}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </motion.article>
  )
}

/** Card sizes for a filtered list: one wide card when the count is odd, the rest in pairs. */
function sizesFor(list: Project[], all: boolean): Project['size'][] {
  if (all) return list.map((p) => p.size)
  return list.map((_, i) => (list.length % 2 === 1 && i === 0 ? 'wide' : 'half'))
}

export default function Projects() {
  const t = useT()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const list = useMemo(() => (filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter))), [filter])
  const sizes = sizesFor(list, filter === 'all')
  const count = (id: Category | 'all') => (id === 'all' ? projects.length : projects.filter((p) => p.categories.includes(id)).length)

  return (
    <Section
      id="projets"
      title={t('Projets', 'Projects')}
      note={`${projects.length} ${t('projets', 'projects')} · 2025–2026`}
      reveal={false}
    >
      <div role="group" aria-label={t('Filtrer les projets', 'Filter projects')} className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
            className={`relative rounded-full border px-4 py-2 font-mono text-[13px] transition-colors ${
              filter === c.id ? 'border-accent text-bg' : 'border-line text-muted hover:border-accent hover:text-fg'
            }`}
          >
            {filter === c.id && (
              <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-accent" transition={{ duration: 0.4, ease }} />
            )}
            {t(c.label, c.en)} <span className="opacity-60">{count(c.id)}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="relative isolate grid grid-cols-6 gap-[clamp(16px,2vw,28px)]">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} size={sizes[i]} />
          ))}
        </AnimatePresence>
      </motion.div>
    </Section>
  )
}
