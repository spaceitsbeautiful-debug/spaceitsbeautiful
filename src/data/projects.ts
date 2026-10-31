// To add a project: add an entry here. **text** is shown in bold.
// `slug` is the link to its detail page (#kitsune, #echo...): letters, digits and dashes only.
// `confidential` projects show a code name, a blurred visual and no details.
// `showcase` projects are public demos you can use right on their page (see src/showcase/).
// Texts are in French; `en` holds the English version of the texts that change.

import type { Lang } from '../i18n'

export type Category = 'demo' | 'web' | 'ia' | 'python' | 'jeux' | 'systemes' | 'design'

export type ShowcaseId = 'focus' | 'kanji' | 'palette' | 'lueur'

export const categories: { id: Category | 'all'; label: string; en: string }[] = [
  { id: 'all', label: 'Tous', en: 'All' },
  { id: 'demo', label: 'À tester', en: 'Try it' },
  { id: 'web', label: 'Web', en: 'Web' },
  { id: 'ia', label: 'IA', en: 'AI' },
  { id: 'python', label: 'Python', en: 'Python' },
  { id: 'jeux', label: 'Jeux', en: 'Games' },
  { id: 'systemes', label: 'Systèmes', en: 'Systems' },
  { id: 'design', label: 'Design', en: 'Design' },
]

type Texts = {
  name: string
  kind: string
  description: string
  summary: string
  features: string[]
  role: string
  tags: string[]
}

export type Project = Texts & {
  slug: string
  categories: Category[]
  size: 'wide' | 'half' | 'third'
  featured?: boolean
  /** Code name only, blurred visual, no features or links */
  confidential?: boolean
  /** Public demo shown live on the project page */
  showcase?: ShowcaseId
  /** Buttons on the detail page, shown only when filled in */
  links?: { code?: string; demo?: string }
  /** Screenshots for the detail page: put the files in public/projects/ and list them here, e.g. 'projects/demo-1.png' */
  images?: string[]
  en: Partial<Texts>
}

/** The project with its texts in the given language. */
export function localize(p: Project, lang: Lang): Project {
  return lang === 'en' ? { ...p, ...p.en } : p
}

export const projects: Project[] = [
  {
    slug: 'kitsune',
    categories: ['web', 'ia', 'python'],
    confidential: true,
    name: 'Projet Kitsune',
    kind: 'Appli web · IA',
    description: "Une application web qui mêle **IA** et **machine learning**, du modèle entraîné jusqu'à l'interface.",
    summary: "Une application web full-stack avec de l'IA et un pipeline de machine learning. Les détails restent secrets pour l'instant.",
    features: [],
    role: 'Conception et développement full-stack',
    tags: ['React', 'TypeScript', 'Node.js', 'Python', 'IA'],
    size: 'wide',
    featured: true,
    en: {
      name: 'Project Kitsune',
      kind: 'Web app · AI',
      description: 'A web app that blends **AI** and **machine learning**, from the trained model to the interface.',
      summary: 'A full-stack web app with AI and a machine learning pipeline. The details stay secret for now.',
      role: 'Full-stack design and development',
      tags: ['React', 'TypeScript', 'Node.js', 'Python', 'AI'],
    },
  },
  {
    slug: 'focus',
    categories: ['demo', 'web'],
    showcase: 'focus',
    name: 'Focus lo-fi',
    kind: 'Outil · Productivité',
    description: 'Un minuteur **Pomodoro** avec ambiance **lo-fi**, liste de tâches et statistiques du jour. À tester directement ici.',
    summary: 'Un minuteur Pomodoro pour rester concentré : 25 minutes de travail, une pause, et la musique lo-fi du site en fond.',
    features: [
      'Cycles Pomodoro : 25 min de focus, 5 min de pause, une pause longue toutes les 4 sessions',
      'Anneau de progression animé et temps affiché dans l’onglet du navigateur',
      'Liste de tâches et statistiques du jour, gardées dans le navigateur',
      'Ambiance lo-fi générée en direct avec la Web Audio API',
    ],
    role: 'Conception et développement',
    tags: ['React', 'TypeScript', 'Web Audio'],
    size: 'half',
    en: {
      kind: 'Tool · Productivity',
      description: 'A **Pomodoro** timer with a **lo-fi** ambience, a task list and today’s stats. Try it right here.',
      summary: 'A Pomodoro timer to stay focused: 25 minutes of work, a break, and the site’s lo-fi music in the background.',
      features: [
        'Pomodoro cycles: 25 min of focus, 5 min break, a long break every 4 sessions',
        'Animated progress ring and time shown in the browser tab',
        'Task list and today’s stats, kept in the browser',
        'Lo-fi ambience generated live with the Web Audio API',
      ],
      role: 'Design and development',
    },
  },
  {
    slug: 'lueur',
    categories: ['demo', 'jeux'],
    showcase: 'lueur',
    name: 'Lueur',
    kind: 'Jeu · Arcade',
    description: 'Un mini-jeu d’arcade original : tu es une **lumière dans le noir**, ramasse les pétales et évite les ombres.',
    summary: 'Un petit jeu d’arcade : une lumière doit survivre au milieu des ombres qui se rapprochent, de plus en plus vite.',
    features: [
      'Jouable à la souris, au doigt ou au clavier (flèches, WASD, ZQSD)',
      'Difficulté qui augmente avec le temps, 3 vies et record gardé dans le navigateur',
      'Rendu Canvas 2D avec halo de lumière et explosions de particules',
      'Couleurs reprises du thème du site, en clair comme en sombre',
    ],
    role: 'Game design et développement',
    tags: ['Canvas 2D', 'TypeScript', 'Game design'],
    size: 'half',
    en: {
      kind: 'Game · Arcade',
      description: 'An original little arcade game: you are a **light in the dark**, collect the petals and dodge the shadows.',
      summary: 'A small arcade game: a light has to survive among shadows closing in, faster and faster.',
      features: [
        'Playable with the mouse, a finger or the keyboard (arrows, WASD)',
        'Difficulty rising over time, 3 lives and a best score kept in the browser',
        'Canvas 2D rendering with a light halo and particle bursts',
        'Colours taken from the site theme, in light and dark mode',
      ],
      role: 'Game design and development',
    },
  },
  {
    slug: 'kanji-quiz',
    categories: ['demo', 'jeux', 'web'],
    showcase: 'kanji',
    name: 'Kanji Quiz',
    kind: 'Jeu · Apprentissage',
    description: 'Un quiz pour apprendre **42 kanji** courants, avec séries, niveaux et record.',
    summary: 'Un quiz à choix multiples pour apprendre les kanji les plus courants, dans les deux sens : kanji vers sens, ou sens vers kanji.',
    features: [
      '42 kanji courants, surtout du niveau JLPT N5, avec leur lecture',
      'Deux sens : reconnaître le sens d’un kanji, ou retrouver le kanji d’un sens',
      'Niveaux : de nouveaux kanji arrivent quand le score monte',
      '3 vies, séries, record gardé dans le navigateur, touches 1 à 4',
    ],
    role: 'Conception et développement',
    tags: ['React', 'TypeScript', 'Japonais'],
    size: 'third',
    en: {
      kind: 'Game · Learning',
      description: 'A quiz to learn **42** common **kanji**, with streaks, levels and a best score.',
      summary: 'A multiple-choice quiz to learn the most common kanji, both ways: kanji to meaning, or meaning to kanji.',
      features: [
        '42 common kanji, mostly JLPT N5 level, with their reading',
        'Two directions: recognise the meaning of a kanji, or find the kanji for a meaning',
        'Levels: new kanji appear as the score goes up',
        '3 lives, streaks, best score kept in the browser, keys 1 to 4',
      ],
      role: 'Design and development',
      tags: ['React', 'TypeScript', 'Japanese'],
    },
  },
  {
    slug: 'palette',
    categories: ['demo', 'web', 'design'],
    showcase: 'palette',
    name: 'Palette',
    kind: 'Outil · Design',
    description: 'Dépose une image : l’outil en tire une **palette de 6 couleurs**, prête à copier en CSS.',
    summary: 'Un outil qui extrait une palette de couleurs de n’importe quelle image, directement dans le navigateur.',
    features: [
      'Extraction des 6 couleurs principales avec l’algorithme k-means',
      'Glisser-déposer ou choix de fichier, l’image n’est jamais envoyée',
      'Copie du code HEX en un clic, ou de toute la palette en variables CSS',
      'Aperçu en direct d’une interface avec ces couleurs, en clair et en sombre',
    ],
    role: 'Conception et développement',
    tags: ['Canvas', 'k-means', 'Design'],
    size: 'third',
    en: {
      kind: 'Tool · Design',
      description: 'Drop an image: the tool pulls a **6-colour palette** from it, ready to copy as CSS.',
      summary: 'A tool that extracts a colour palette from any image, right in the browser.',
      features: [
        'Extraction of the 6 main colours with the k-means algorithm',
        'Drag and drop or file picker, the image is never uploaded',
        'One-click copy of a HEX code, or of the whole palette as CSS variables',
        'Live preview of an interface in those colours, light and dark',
      ],
      role: 'Design and development',
    },
  },
  {
    slug: 'echo',
    categories: ['ia', 'python'],
    confidential: true,
    name: 'Projet Echo',
    kind: 'Outil · Bureau',
    description: "Un outil de bureau en **Python**, piloté par la **voix** et l'IA.",
    summary: "Un outil de bureau en Python, piloté par la voix et l'IA. Les détails restent secrets pour l'instant.",
    features: [],
    role: 'Conception et développement',
    tags: ['Python', 'IA', 'Voix'],
    size: 'half',
    en: {
      name: 'Project Echo',
      kind: 'Tool · Desktop',
      description: 'A desktop tool in **Python**, driven by **voice** and AI.',
      summary: 'A desktop tool in Python, driven by voice and AI. The details stay secret for now.',
      role: 'Design and development',
      tags: ['Python', 'AI', 'Voice'],
    },
  },
  {
    slug: 'atlas',
    categories: ['web'],
    confidential: true,
    name: 'Projet Atlas',
    kind: 'Pro · Frontend',
    description: 'Une application **professionnelle** développée dans le cadre de mon travail.',
    summary: 'Une application professionnelle, développée dans le cadre de mon travail. Les détails sont confidentiels.',
    features: [],
    role: 'Développement frontend',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    size: 'half',
    en: {
      name: 'Project Atlas',
      kind: 'Work · Frontend',
      description: 'A **professional** app built as part of my job.',
      summary: 'A professional app, built as part of my job. The details are confidential.',
      role: 'Frontend development',
    },
  },
  {
    slug: 'vault',
    categories: ['web', 'systemes'],
    confidential: true,
    name: 'Projet Vault',
    kind: 'Outil · Cloud',
    description: 'Un outil autour du **stockage** et de la **sauvegarde** dans le cloud.',
    summary: 'Un outil autour du stockage et de la sauvegarde dans le cloud. Les détails restent secrets pour l’instant.',
    features: [],
    role: 'Conception et développement',
    tags: ['Node.js', 'PostgreSQL'],
    size: 'third',
    en: {
      name: 'Project Vault',
      kind: 'Tool · Cloud',
      description: 'A tool around cloud **storage** and **backups**.',
      summary: 'A tool around cloud storage and backups. The details stay secret for now.',
      role: 'Design and development',
    },
  },
  {
    slug: 'relay',
    categories: ['systemes'],
    confidential: true,
    name: 'Projet Relay',
    kind: 'Système · Spécification',
    description: 'La conception complète d’un **système**, du matériel au logiciel.',
    summary: 'La conception complète d’un système, du matériel au logiciel. Les détails sont confidentiels.',
    features: [],
    role: 'Conception et spécification',
    tags: ['Architecture', 'Spécification'],
    size: 'third',
    en: {
      name: 'Project Relay',
      kind: 'System · Specification',
      description: 'The full design of a **system**, from hardware to software.',
      summary: 'The full design of a system, from hardware to software. The details are confidential.',
      role: 'Design and specification',
      tags: ['Architecture', 'Specification'],
    },
  },
  {
    slug: 'noir',
    categories: ['design'],
    confidential: true,
    name: 'Projet Noir',
    kind: 'Design · Identité',
    description: 'Un travail de **naming** et d’**identité visuelle** pour une application.',
    summary: 'Un travail de naming et d’identité visuelle pour une application. Les détails restent secrets pour l’instant.',
    features: [],
    role: 'Naming et identité visuelle',
    tags: ['Branding', 'UI'],
    size: 'wide',
    en: {
      name: 'Project Noir',
      kind: 'Design · Identity',
      description: 'Naming and **visual identity** work for an app.',
      summary: 'Naming and visual identity work for an app. The details stay secret for now.',
      role: 'Naming and visual identity',
    },
  },
]
