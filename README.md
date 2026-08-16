# CV Builder

Builder de CV personnel : un CV de base + des variantes nommées par cible (ex. `vuejs-2026`), éditées dans un formulaire avec préview A4 live.

- **Stack** : Nuxt 4 · TypeScript · TailwindCSS v4 · Supabase (`@nuxtjs/supabase`)
- **Déploiement** : Cloudflare Workers (`wrangler`)

## Infra

| Ressource | Valeur |
|---|---|
| Projet Supabase | `resumes` (`ogtrvjzqfgbooidskbav`, eu-north-1) |
| Table | `public.cvs` (RLS owner-only, `user_id default auth.uid()`) |
| Worker | `resumes` (voir `wrangler.jsonc`) |

## Setup

```bash
bun install
cp .env.example .env   # puis remplir, voir ci-dessous
bun dev
```

Premier lancement : créer son compte via « S'inscrire » sur `/login` (confirmer l'email), puis désactiver les inscriptions dans le dashboard Supabase (Authentication → Sign In / Up).

## Fonctionnement

- `/` — liste des CV : éditer, dupliquer en variante, supprimer
- `/editor/[slug]` — formulaire par section + préview A4 live (composant `CvDocument`), autosave
- `/cvs/[slug]/download` — export PDF à la volée via Cloudflare Browser Rendering (`server/utils/browser.ts`), soumis au quota d'usage

Le contenu du CV de base (`app/utils/base-cv-content.ts`) reproduit `franck-lebas-vuejs-2026.pdf`. Les bullets acceptent `**gras**`.

Le PDF est régénéré à chaque téléchargement (pas de stockage). Les colonnes `pdf_key` / `pdf_generated_at` existent dans la table `cvs` pour un futur cache R2 du dernier PDF généré, mais ne sont pas encore utilisées — optimisation de coût, pas un blocage fonctionnel.

## Déploiement (Cloudflare Workers)

```bash
bun run deploy   # build preset cloudflare_module + wrangler deploy
```
