# 影 Portfolio · Gounteni David

Portfolio personnel de Gounteni David, développeur full-stack.

**En ligne : https://gounteni.vercel.app** (aussi sur https://spaceitsbeautiful-debug.github.io/spaceitsbeautiful/)

## Stack

- React + TypeScript, Vite
- Tailwind CSS
- React Three Fiber (Three.js) pour les particules 3D
- Framer Motion pour les animations, Lenis pour le défilement fluide
- Web Audio API pour le son (aucun fichier audio)

## Lancer le projet

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:5173.

## Modifier le contenu

- `src/data/projects.ts` : les projets (textes, technos, captures, liens)
- `src/data/site.ts` : contact, stack, parcours, inspirations, kanji de l'en-tête, avatar
- `public/` : images (avatar, captures dans `public/projects/`)

## Mise en ligne

Le site est hébergé sur **Vercel** (projet `gounteni`) et sur GitHub Pages.


Chaque push sur `main` déploie le site sur GitHub Pages
(`.github/workflows/deploy.yml`). Dans les réglages du dépôt :
Settings > Pages > Source = « GitHub Actions ».

## Licence

© 2026 Gounteni David. Tous droits réservés : voir [LICENSE](LICENSE).
Le code est public pour être consulté, pas pour être réutilisé.
