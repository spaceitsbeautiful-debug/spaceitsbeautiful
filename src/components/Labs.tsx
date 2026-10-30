import ImageLab from './labs/ImageLab'
import KanjiLab from './labs/KanjiLab'
import TypingLab from './labs/TypingLab'
import { Section } from './ui'

const labs = [
  {
    title: 'Ombre interactive',
    text: "Mon avatar recomposé à partir de milliers de particules, une par zone claire de l'image. Passe la souris pour les écarter, clique pour les faire exploser, et regarde-les revenir à leur place. En mode ASCII, l'image devient du texte, et des katakana apparaissent sous le curseur.",
    tech: 'Canvas 2D · échantillonnage d’image · physique à ressorts',
    Demo: ImageLab,
    wide: true,
  },
  {
    title: 'Kanji en particules',
    text: 'Choisis un kanji : 1 400 particules se réorganisent pour le dessiner. Passe la souris dessus pour les disperser.',
    tech: 'Canvas 2D · physique à ressorts',
    Demo: KanjiLab,
  },
  {
    title: 'Test de frappe',
    text: "30 secondes pour taper le plus de mots possible. Un clin d'œil à Monkeytype, sur lequel je m'entraîne.",
    tech: 'React · état en temps réel',
    Demo: TypingLab,
  },
]

/** Small interactive experiments, in the spirit of a studio "labs" page. */
export default function Labs() {
  return (
    <Section id="labs" title="Labs" note="petites expériences interactives">
      <div className="grid gap-[clamp(16px,2vw,28px)] lg:grid-cols-2">
        {labs.map(({ title, text, tech, Demo, wide }) => (
          <article
            key={title}
            className={`grid min-w-0 content-start gap-5 rounded-[18px] border border-line bg-surface p-[clamp(16px,2vw,24px)] ${
              wide ? 'lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(32px,4vw,64px)]' : ''
            }`}
          >
            <div className={wide ? 'mx-auto w-full max-w-[560px]' : ''}>
              <Demo />
            </div>
            <div className={`grid gap-2 px-1 pb-1 ${wide ? 'lg:gap-4 lg:pr-[clamp(8px,2vw,32px)]' : ''}`}>
              {wide && <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">Nouveau</span>}
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className={`m-0 font-display font-bold ${wide ? 'text-[clamp(28px,3.4vw,52px)] leading-none' : 'text-[clamp(22px,2vw,30px)]'}`}>
                  {title}
                </h3>
                {!wide && <span className="font-mono text-xs text-muted">{tech}</span>}
              </div>
              <p className={`m-0 max-w-[40em] text-muted ${wide ? 'text-[clamp(16px,1.2vw,18px)]' : ''}`}>{text}</p>
              {wide && <span className="font-mono text-xs text-muted">{tech}</span>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
