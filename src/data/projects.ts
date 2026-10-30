// To add a project: add an entry here. **text** is shown in bold.
// `visual` picks the illustration drawn in components/Mocks.tsx.
// `slug` is the link to its detail page (#nativia, #kurumi...): letters, digits and dashes only.
// Texts are in French; `en` holds the English version of the texts that change.

import type { Lang } from '../i18n'

export type Visual = 'nativia' | 'kurumi' | 'portal' | 'optimus' | 'queue' | 'kuro'

export type Category = 'web' | 'ia' | 'python' | 'systemes' | 'design'

export const categories: { id: Category | 'all'; label: string; en: string }[] = [
  { id: 'all', label: 'Tous', en: 'All' },
  { id: 'web', label: 'Web', en: 'Web' },
  { id: 'ia', label: 'IA', en: 'AI' },
  { id: 'python', label: 'Python', en: 'Python' },
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
  visual: Visual
  size: 'wide' | 'half' | 'third'
  featured?: boolean
  /** Buttons on the detail page, shown only when filled in */
  links?: { code?: string; demo?: string }
  /** Screenshots for the detail page: put the files in public/projects/ and list them here, e.g. 'projects/nativia-1.png' */
  images?: string[]
  en: Partial<Texts>
}

/** The project with its texts in the given language. */
export function localize(p: Project, lang: Lang): Project {
  return lang === 'en' ? { ...p, ...p.en } : p
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
    en: {
      kind: 'Web app · AI',
      description:
        'An app to **learn Ewe**, with Mochi, an AI companion that guides the learner. Translation by a **Google mT5** model trained in a Python pipeline, and pronunciation through speech synthesis.',
      summary:
        'Nativia helps people learn Ewe, a language spoken in Togo and Ghana, with lessons, the pronunciation of every word and an AI companion called Mochi.',
      features: [
        'Mochi, an AI companion that guides the learner through the lessons',
        'Ewe translation by a Google mT5 model, trained in a Python pipeline',
        'Pronunciation of words and sentences with ElevenLabs speech synthesis',
        'React + TypeScript frontend, Express API with Prisma and SQLite',
      ],
      role: 'Full-stack design and development',
    },
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
    en: {
      kind: 'Voice assistant · Desktop',
      description:
        'A voice assistant for Windows: it listens, understands the request with **Google GenAI** and answers out loud, in a dark CustomTkinter interface.',
      summary: 'Kurumi is a voice assistant for the Windows desktop: you talk to it, it understands and answers out loud.',
      features: [
        'Voice recognition with SpeechRecognition',
        'Requests understood and answered by Google GenAI',
        'Synthesized voice with Edge-TTS, sounds played with Pygame',
        'Dark desktop interface built with CustomTkinter',
      ],
      role: 'Design and development',
    },
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
    en: {
      name: 'Matrix client portal',
      kind: 'Work · Frontend',
      description: "Matrix Industrie's client area: dashboard, request tracking and account management.",
      summary: 'The portal where Matrix Industrie clients find their information and follow their requests.',
      features: [
        'React + TypeScript app, built with Vite',
        'Interface styled with Tailwind CSS',
        'Built as part of my job at Matrix Industrie',
      ],
      role: 'Frontend development',
    },
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
    en: {
      kind: 'Tool · Cloud',
      description: 'Cloud storage management with scheduled **automatic backups**, so no file is ever lost.',
      summary: 'Optimus Save manages cloud storage and runs the backups on its own, without you having to think about it.',
      features: ['Management of files stored in the cloud', 'Scheduled automatic backups', 'Tracking of every backup, folder by folder'],
      role: 'Design and development',
    },
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
    en: {
      name: 'Bank queue system',
      kind: 'Specification',
      description:
        'A queue management system for a bank branch: **QR code** tickets, thermal printing and calling customers to the counters.',
      summary: 'The full specification of a queue system for a bank branch, from the ticket handed to the customer to the call at the counter.',
      features: [
        'Ticketing with a QR code on every ticket',
        'Tickets printed on a thermal printer',
        'Customers called to the counters',
        'Complete specification document, ready for development',
      ],
      role: 'Design and specification',
      tags: ['Architecture', 'QR code', 'Thermal printing'],
    },
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
    en: {
      kind: 'Messaging · Identity',
      description: 'A messaging app, for which I worked on the name and the visual identity.',
      summary: 'Kuro-Talk is a messaging app. On this project, I worked on the name and the visual identity.',
      features: [
        'Research and choice of the name',
        'Visual identity: logo and graphic world',
        'A dark mood, tied to "kuro", which means black in Japanese',
      ],
      role: 'Naming and visual identity',
    },
  },
]
