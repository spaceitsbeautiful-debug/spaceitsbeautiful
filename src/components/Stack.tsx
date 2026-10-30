import { stack } from '../data/site'
import { Section } from './ui'

export default function Stack() {
  return (
    <Section id="stack" title="Stack" note="ce que j'utilise au quotidien">
      <div className="grid gap-[clamp(32px,4vw,56px)]">
        {stack.map(({ group, items }) => (
          <div key={group} className="grid gap-4 md:grid-cols-[minmax(160px,1fr)_minmax(0,4fr)] md:gap-[clamp(24px,4vw,64px)]">
            <h3 className="m-0 pt-1 font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-accent-2">{group}</h3>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-0">
              {items.map((it) => (
                <li
                  key={it.name}
                  className="group flex items-center gap-3 rounded-[12px] border border-line bg-surface px-4 py-3.5 transition-colors hover:border-accent"
                >
                  {it.icon && (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 flex-none fill-current text-muted transition-colors group-hover:text-accent">
                      <path d={it.icon.path} />
                    </svg>
                  )}
                  <span className="grid min-w-0">
                    <span className="truncate font-medium">{it.name}</span>
                    <span className="font-mono text-[11.5px] text-muted">{it.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div aria-label="Exemple de terminal" className="mt-12 overflow-x-auto rounded-[10px] border border-line bg-surface font-mono text-[13.5px] leading-[1.8]">
        <div className="flex gap-[7px] border-b border-line px-4 py-3">
          <i className="size-2.5 rounded-full bg-line" />
          <i className="size-2.5 rounded-full bg-line" />
          <i className="size-2.5 rounded-full bg-line" />
        </div>
        <pre className="m-0 px-5 py-[18px] whitespace-pre">
          <span className="text-accent-2">david@matrix</span> <span className="text-muted">~/projets</span> $ ls{'\n'}
          nativia/  kurumi/  optimus-save/  portail-matrix/{'\n'}
          <span className="text-accent-2">david@matrix</span> <span className="text-muted">~/projets</span> $ cd nativia && npm run dev{'\n'}
          <span className="text-muted">  VITE ready in 412 ms</span>{'\n'}
          <span className="text-muted">  ➜  Local:</span> <span className="text-accent">http://localhost:5173/</span>
        </pre>
      </div>
    </Section>
  )
}
