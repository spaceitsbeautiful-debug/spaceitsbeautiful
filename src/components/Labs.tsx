import ImageLab from './labs/ImageLab'
import KanjiLab from './labs/KanjiLab'
import TypingLab from './labs/TypingLab'
import { useT } from '../i18n'
import { Section } from './ui'

const labs = [
  {
    title: 'Ombre interactive',
    text: "Mon avatar recomposé à partir de milliers de particules, une par zone claire de l'image. Passe la souris pour les écarter, clique pour les faire exploser, et regarde-les revenir à leur place. En mode ASCII, l'image devient du texte, et des katakana apparaissent sous le curseur.",
    tech: 'Canvas 2D · échantillonnage d’image · physique à ressorts',
    titleEn: 'Interactive shadow',
    textEn:
      'My avatar rebuilt from thousands of particles, one for each light area of the picture. Move the mouse to push them away, click to make them burst, and watch them find their place again. In ASCII mode the picture turns into text, and katakana appear under the cursor.',
    techEn: 'Canvas 2D · image sampling · spring physics',
    Demo: ImageLab,
    wide: true,
  },
  {
    title: 'Kanji en particules',
    text: 'Choisis un kanji : 1 400 particules se réorganisent pour le dessiner. Passe la souris dessus pour les disperser.',
    tech: 'Canvas 2D · physique à ressorts',
    titleEn: 'Kanji in particles',
    textEn: 'Pick a kanji: 1,400 particles rearrange themselves to draw it. Hover it to scatter them.',
    techEn: 'Canvas 2D · spring physics',
    Demo: KanjiLab,
  },
  {
    title: 'Test de frappe',
    text: "15, 30 ou 60 secondes. Le test repère chaque faute (même corrigée) et les touches que tu rates, trace ta vitesse seconde par seconde, puis te donne des conseils adaptés. Inspiré de Monkeytype, qui m'a vraiment aidé à taper plus vite.",
    tech: 'React · statistiques en temps réel',
    titleEn: 'Typing test',
    textEn:
      '15, 30 or 60 seconds. The test catches every mistake (even corrected ones) and the keys you miss, plots your speed second by second, then gives you tips that fit your results. Inspired by Monkeytype, which really helped me type faster.',
    techEn: 'React · live statistics',
    Demo: TypingLab,
  },
]

/** Small interactive experiments, in the spirit of a studio "labs" page. */
export default function Labs() {
  const t = useT()
  return (
    <Section id="labs" title="Labs" note={t('petites expériences interactives', 'small interactive experiments')}>
      <div className="grid gap-[clamp(16px,2vw,28px)] lg:grid-cols-2">
        {labs.map(({ title, text, tech, titleEn, textEn, techEn, Demo, wide }) => (
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
              {wide && <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">{t('Nouveau', 'New')}</span>}
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className={`m-0 font-display font-bold ${wide ? 'text-[clamp(28px,3.4vw,52px)] leading-none' : 'text-[clamp(22px,2vw,30px)]'}`}>
                  {t(title, titleEn)}
                </h3>
                {!wide && <span className="font-mono text-xs text-muted">{t(tech, techEn)}</span>}
              </div>
              <p className={`m-0 max-w-[40em] text-muted ${wide ? 'text-[clamp(16px,1.2vw,18px)]' : ''}`}>{t(text, textEn)}</p>
              {wide && <span className="font-mono text-xs text-muted">{t(tech, techEn)}</span>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
