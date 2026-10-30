// To add a project: add an entry here. **text** is shown in bold.
// `visual` picks the illustration drawn in components/Mocks.tsx.
// `slug` is the link to its detail page (#nativia, #kurumi...): letters, digits and dashes only.

export type Visual = 'nativia' | 'kurumi' | 'portal' | 'optimus' | 'queue' | 'kuro'

export type Category = 'web' | 'ia' | 'python' | 'systemes' | 'design'

export const categories: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'web', label: 'Web' },
  { id: 'ia', label: 'IA' },
  { id: 'python', label: 'Python' },
  { id: 'systemes', label: 'Systèmes' },
  { id: 'design', label: 'Design' },
]

export type Project = {
  slug: string
  categories: Category[]
  name: string
  kind: string
  description: string
  summary: string
  features: string[]
  role: string
  tags: string[]
  visual: Visual
  size: 'wide' | 'half' | 'third'
  featured?: boolean
  /** Buttons on the detail page, shown only when filled in */
  links?: { code?: string; demo?: string }
  /** Screenshots for the detail page: put the files in public/projects/ and list them here, e.g. 'projects/nativia-1.png' */
  images?: string[]
}

export const projects: Project[] = [
  {
    slug: 'nativia',
    categories: ['web', 'ia', 'python'],
    name: 'Nativia',
    kind: 'Appli web · IA',
    description:
      "Une application pour **apprendre l'éwé**, avec Mochi, un compagnon IA qui accompagne l'élève. Traduction par un modèle **Google mT5** entraîné dans un pipeline Python, et prononciation par synthèse vocale.",
    summary:
      "Nativia aide à apprendre l'éwé, une langue parlée au Togo et au Ghana, avec des leçons, la prononciation de chaque mot et un compagnon IA nommé Mochi.",
    features: [
      "Mochi, un compagnon IA qui accompagne l'élève pendant les leçons",
      "Traduction de l'éwé par un modèle Google mT5, entraîné dans un pipeline Python",
      'Prononciation des mots et des phrases par synthèse vocale ElevenLabs',
      'Frontend React + TypeScript, API Express avec Prisma et SQLite',
    ],
    role: 'Conception et développement full-stack',
    tags: ['React', 'TypeScript', 'Express', 'Prisma', 'SQLite', 'ElevenLabs', 'mT5'],
    visual: 'nativia',
    size: 'wide',
    featured: true,
  },
  {
    slug: 'kurumi',
    categories: ['ia', 'python'],
    name: 'Kurumi',
    kind: 'Assistant vocal · Bureau',
    description:
      'Un assistant vocal pour Windows : il écoute, comprend la demande grâce à **Google GenAI** et répond à voix haute, dans une interface sombre en CustomTkinter.',
    summary:
      'Kurumi est un assistant vocal pour le bureau Windows : on lui parle, il comprend la demande et répond à voix haute.',
    features: [
      'Reconnaissance de la voix avec SpeechRecognition',
      'Compréhension des demandes et réponses générées par Google GenAI',
      'Voix de synthèse avec Edge-TTS, sons joués avec Pygame',
      'Interface de bureau sombre en CustomTkinter',
    ],
    role: 'Conception et développement',
    tags: ['Python', 'CustomTkinter', 'Edge-TTS', 'SpeechRecognition', 'Pygame'],
    visual: 'kurumi',
    size: 'half',
  },
  {
    slug: 'portail-matrix',
    categories: ['web'],
    name: 'Portail client Matrix',
    kind: 'Pro · Frontend',
    description: "L'espace client de Matrix Industrie : tableau de bord, suivi des demandes et gestion de compte.",
    summary: 'Le portail où les clients de Matrix Industrie retrouvent leurs informations et suivent leurs demandes.',
    features: [
      'Application React + TypeScript, construite avec Vite',
      'Interface stylée avec Tailwind CSS',
      'Développée dans le cadre de mon travail chez Matrix Industrie',
    ],
    role: 'Développement frontend',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    visual: 'portal',
    size: 'half',
  },
  {
    slug: 'optimus-save',
    categories: ['web', 'systemes'],
    name: 'Optimus Save',
    kind: 'Outil · Cloud',
    description: 'Gestion du stockage cloud avec **sauvegardes automatiques** programmées, pour ne plus jamais perdre un fichier.',
    summary: 'Optimus Save gère un espace de stockage cloud et lance les sauvegardes tout seul, sans avoir à y penser.',
    features: [
      'Gestion des fichiers stockés dans le cloud',
      'Sauvegardes automatiques programmées',
      'Suivi de chaque sauvegarde, dossier par dossier',
    ],
    role: 'Conception et développement',
    tags: ['Node.js', 'PostgreSQL'],
    links: { code: 'https://github.com/spaceitsbeautiful-debug/optimus-save' },
    visual: 'optimus',
    size: 'third',
  },
  {
    slug: 'file-attente',
    categories: ['systemes'],
    name: "File d'attente bancaire",
    kind: 'Spécification',
    description:
      "Un système de gestion de file d'attente pour agence bancaire : tickets à **QR code**, impression thermique et appel des clients aux guichets.",
    summary:
      "La spécification complète d'un système de file d'attente pour agence bancaire, du ticket remis au client jusqu'à l'appel au guichet.",
    features: [
      'Billetterie avec QR code sur chaque ticket',
      'Impression des tickets sur imprimante thermique',
      'Appel des clients aux guichets',
      'Document de spécification complet, prêt pour le développement',
    ],
    role: 'Conception et spécification',
    tags: ['Architecture', 'QR code', 'Impression thermique'],
    visual: 'queue',
    size: 'third',
  },
  {
    slug: 'kuro-talk',
    categories: ['design'],
    name: 'Kuro-Talk',
    kind: 'Messagerie · Identité',
    description: "Une application de messagerie, pour laquelle j'ai travaillé le nom et l'identité visuelle.",
    summary: "Kuro-Talk est une application de messagerie. Sur ce projet, j'ai travaillé le nom et l'identité visuelle.",
    features: [
      'Recherche et choix du nom',
      'Identité visuelle : logo et univers graphique',
      'Une ambiance sombre, en lien avec « kuro », qui veut dire noir en japonais',
    ],
    role: 'Naming et identité visuelle',
    tags: ['Branding', 'UI'],
    visual: 'kuro',
    size: 'third',
  },
]
