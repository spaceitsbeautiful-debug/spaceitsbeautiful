// To add a project: add an entry here. **text** is shown in bold.
// `slug` is the link to its detail page (#kitsune, #echo...): letters, digits and dashes only.
// `confidential` projects show a code name, a blurred visual and no details.
// Texts are in French; `en` holds the English version of the texts that change.

import type { Lang } from '../i18n'

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
  size: 'wide' | 'half' | 'third'
  featured?: boolean
  /** Code name only, blurred visual, no features or links */
  confidential?: boolean
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
    size: 'third',
    en: {
      name: 'Project Noir',
      kind: 'Design · Identity',
      description: 'Naming and **visual identity** work for an app.',
      summary: 'Naming and visual identity work for an app. The details stay secret for now.',
      role: 'Naming and visual identity',
    },
  },
]
