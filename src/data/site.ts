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
// French texts first; the English version sits next to them (`en`, `meaningEn`...).

/** Profile picture: put the image in public/ (e.g. public/avatar.png) and write its name here. Empty = 影 monogram. */
export const avatar = 'avatar.webp'

/** Kanji the hero particles cycle through, with their reading and meaning. */
export const heroGlyphs = [
  { kanji: '影', reading: 'kage', meaning: "l'ombre", meaningEn: 'shadow' },
  { kanji: '夢', reading: 'yume', meaning: 'le rêve', meaningEn: 'dream' },
  { kanji: '炎', reading: 'honō', meaning: 'la flamme', meaningEn: 'flame' },
  { kanji: '創', reading: 'sō', meaning: 'créer', meaningEn: 'to create' },
  { kanji: '黒', reading: 'kuro', meaning: 'le noir', meaningEn: 'black' },
  { kanji: '心', reading: 'kokoro', meaning: "le cœur, l'esprit", meaningEn: 'heart, mind' },
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

export type StackItem = { name: string; role: string; roleEn?: string; icon?: SimpleIcon }

export const stack: { group: string; groupEn?: string; items: StackItem[] }[] = [
  {
    group: 'Frontend',
    items: [
      { name: 'React', role: 'UI', icon: siReact },
      { name: 'TypeScript', role: 'typage', roleEn: 'typing', icon: siTypescript },
      { name: 'Vite', role: 'build', icon: siVite },
      { name: 'Tailwind CSS', role: 'style', icon: siTailwindcss },
    ],
  },
  {
    group: 'Backend',
    items: [
      { name: 'Node.js', role: 'serveur', roleEn: 'server', icon: siNodedotjs },
      { name: 'Express', role: 'API', icon: siExpress },
      { name: 'NestJS', role: 'API', icon: siNestjs },
      { name: 'Prisma', role: 'ORM', icon: siPrisma },
      { name: 'PostgreSQL', role: 'BDD', roleEn: 'database', icon: siPostgresql },
      { name: 'SQLite', role: 'BDD', roleEn: 'database', icon: siSqlite },
    ],
  },
  {
    group: 'Python & IA',
    groupEn: 'Python & AI',
    items: [
      { name: 'Python', role: 'outils', roleEn: 'tools', icon: siPython },
      { name: 'Google GenAI', role: 'LLM', icon: siGooglegemini },
      { name: 'mT5', role: 'traduction', roleEn: 'translation', icon: siHuggingface },
      { name: 'ElevenLabs', role: 'voix', roleEn: 'voice', icon: siElevenlabs },
    ],
  },
]

/** "Inspirations" section: anime, characters and music. */
export const inspirations = {
  anime: [
    { title: 'Fire Force', jp: '炎炎ノ消防隊', note: 'Benimaru Shinmon, mon personnage préféré. Et le travail sonore de David Production.', noteEn: 'Benimaru Shinmon, my favourite character. And the sound work of David Production.' },
    { title: 'The Eminence in Shadow', jp: '陰の実力者になりたくて！', note: "Shadow, et toute l'esthétique de l'ombre qui a inspiré ce site.", noteEn: 'Shadow, and the whole aesthetic of darkness that inspired this site.' },
    { title: 'Naruto', jp: 'ナルト', note: 'Madara Uchiha et Minato Namikaze.', noteEn: 'Madara Uchiha and Minato Namikaze.' },
    { title: 'One Piece', jp: 'ワンピース', note: "L'aventure au long cours.", noteEn: 'The long-haul adventure.' },
    { title: 'Sword Art Online', jp: 'ソードアート・オンライン', note: 'Kirito, et des mondes virtuels à construire.', noteEn: 'Kirito, and virtual worlds to build.' },
    { title: 'Saga of Tanya the Evil', jp: '幼女戦記', note: 'Stratégie, discipline, personnage hors norme.', noteEn: 'Strategy, discipline, an extraordinary lead.' },
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
export const journey: { title: string; titleEn: string; text: string; textEn: string; tags: string[]; tagsEn?: string[] }[] = [
  {
    title: 'Les débuts',
    titleEn: 'The beginning',
    textEn: 'I started my software development training. First scripts, first basics: variables, loops, functions.',
    tagsEn: ['Python', 'Algorithms'],
    text: 'Début de ma formation en développement logiciel. Premiers scripts, premières bases : variables, boucles, fonctions.',
    tags: ['Python', 'Algorithmique'],
  },
  {
    title: 'Python et IA',
    titleEn: 'Python and AI',
    textEn: 'My first AI projects in Python: voice recognition, AI-generated answers, speech synthesis.',
    text: "Mes premiers projets d'IA en Python : reconnaissance de la voix, réponses générées par l'IA, synthèse vocale.",
    tags: ['Python', 'Google GenAI', 'CustomTkinter'],
  },
  {
    title: 'Le passage au full-stack',
    titleEn: 'Going full-stack',
    textEn: 'React, TypeScript, Node and databases, then my first machine learning pipeline to bring AI into a web app.',
    text: "React, TypeScript, Node et les bases de données, puis mon premier pipeline de machine learning pour mettre de l'IA dans une appli web.",
    tags: ['React', 'Express', 'Prisma', 'mT5'],
  },
  {
    title: 'Développeur chez Matrix Industrie',
    titleEn: 'Developer at Matrix Industrie',
    textEn: "I work on the company's interfaces, databases and internal tools.",
    text: "Je travaille sur les interfaces, les bases de données et les outils internes de l'entreprise.",
    tags: ['React', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: "Aujourd'hui",
    titleEn: 'Today',
    textEn:
      '影OS, a retro-futuristic operating system in the browser with a cyberpunk ambience generator, confidential projects in progress, and this portfolio built with React and Three.js.',
    text: "影OS, un système d'exploitation rétro-futuriste dans le navigateur avec un générateur d'ambiance cyberpunk, des projets confidentiels en cours, et ce portfolio en React et Three.js.",
    tags: ['影OS', 'Web Audio', 'Three.js', 'Framer Motion'],
  },
]
