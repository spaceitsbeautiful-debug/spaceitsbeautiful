import {
  siElevenlabs,
  siExpress,
  siGooglegemini,
  siHuggingface,
  siNestjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siVite,
  type SimpleIcon,
} from 'simple-icons'

// Everything about the site that is not a project lives here.

/** Profile picture: put the image in public/ (e.g. public/avatar.png) and write its name here. Empty = 影 monogram. */
export const avatar = 'avatar.webp'

/** Kanji the hero particles cycle through, with their reading and meaning. */
export const heroGlyphs = [
  { kanji: '影', reading: 'kage', meaning: "l'ombre" },
  { kanji: '夢', reading: 'yume', meaning: 'le rêve' },
  { kanji: '炎', reading: 'honō', meaning: 'la flamme' },
  { kanji: '創', reading: 'sō', meaning: 'créer' },
  { kanji: '黒', reading: 'kuro', meaning: 'le noir' },
  { kanji: '心', reading: 'kokoro', meaning: "le cœur, l'esprit" },
]

/** Contact channels: leave a value empty ('') to hide it. */
export const contact = {
  /**
   * Contact form: create a free access key on web3forms.com (it is tied to the email that
   * receives the messages) and paste it here. Empty = no form. Works once the site is on
   * GitHub Pages; claude.ai previews block sending.
   */
  formKey: '',
  instagram: '_shadow.concept',
  github: 'spaceitsbeautiful-debug',
  email: '', // une adresse dédiée au portfolio, pas ton mail perso
}

export type StackItem = { name: string; role: string; icon?: SimpleIcon }

export const stack: { group: string; items: StackItem[] }[] = [
  {
    group: 'Frontend',
    items: [
      { name: 'React', role: 'UI', icon: siReact },
      { name: 'TypeScript', role: 'typage', icon: siTypescript },
      { name: 'Vite', role: 'build', icon: siVite },
      { name: 'Tailwind CSS', role: 'style', icon: siTailwindcss },
    ],
  },
  {
    group: 'Backend',
    items: [
      { name: 'Node.js', role: 'serveur', icon: siNodedotjs },
      { name: 'Express', role: 'API', icon: siExpress },
      { name: 'NestJS', role: 'API', icon: siNestjs },
      { name: 'Prisma', role: 'ORM', icon: siPrisma },
      { name: 'PostgreSQL', role: 'BDD', icon: siPostgresql },
      { name: 'SQLite', role: 'BDD', icon: siSqlite },
    ],
  },
  {
    group: 'Python & IA',
    items: [
      { name: 'Python', role: 'outils', icon: siPython },
      { name: 'Google GenAI', role: 'LLM', icon: siGooglegemini },
      { name: 'mT5', role: 'traduction', icon: siHuggingface },
      { name: 'ElevenLabs', role: 'voix', icon: siElevenlabs },
    ],
  },
]

/** "Inspirations" section: anime, characters and music. */
export const inspirations = {
  anime: [
    { title: 'Fire Force', jp: '炎炎ノ消防隊', note: 'Benimaru Shinmon, mon personnage préféré. Et le travail sonore de David Production.' },
    { title: 'The Eminence in Shadow', jp: '陰の実力者になりたくて！', note: "Shadow, et toute l'esthétique de l'ombre qui a inspiré ce site." },
    { title: 'Naruto', jp: 'ナルト', note: 'Madara Uchiha et Minato Namikaze.' },
    { title: 'One Piece', jp: 'ワンピース', note: "L'aventure au long cours." },
    { title: 'Sword Art Online', jp: 'ソードアート・オンライン', note: 'Kirito, et des mondes virtuels à construire.' },
    { title: 'Saga of Tanya the Evil', jp: '幼女戦記', note: 'Stratégie, discipline, personnage hors norme.' },
  ],
  /**
   * The track behind the record. Royalty-free (Pixabay Content License): the file lives in
   * public/music/. To change it, drop another MP3 there and update these lines.
   */
  track: {
    title: 'Petals on the Water',
    context: 'Japanese fusion lo-fi',
    jp: '水面の花びら',
    artist: 'kaazoom',
    src: 'music/petals-on-the-water.mp3',
    source: 'https://pixabay.com/music/search/kaazoom%20petals%20on%20the%20water/',
  },
}

/** Steps of the "Parcours" timeline, oldest first. */
export const journey = [
  {
    title: 'Les débuts',
    text: 'Début de ma formation en développement logiciel. Premiers scripts, premières bases : variables, boucles, fonctions.',
    tags: ['Python', 'Algorithmique'],
  },
  {
    title: 'Python et IA',
    text: "Kurumi, mon assistant vocal de bureau : reconnaissance de la voix, réponses générées par l'IA, synthèse vocale.",
    tags: ['Python', 'Google GenAI', 'CustomTkinter'],
  },
  {
    title: 'Le passage au full-stack',
    text: "React, TypeScript, Node et les bases de données. Nativia réunit tout ça, avec en plus un pipeline de machine learning pour traduire l'éwé.",
    tags: ['React', 'Express', 'Prisma', 'mT5'],
  },
  {
    title: 'Développeur chez Matrix Industrie',
    text: "Je travaille sur les interfaces, les bases de données et les outils internes de l'entreprise, dont le portail client.",
    tags: ['React', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: "Aujourd'hui",
    text: 'Optimus Save, la spécification d\'un système de file d\'attente bancaire, et ce portfolio en React et Three.js.',
    tags: ['Node.js', 'Three.js', 'Framer Motion'],
  },
]
