# CV Builder

Builder de CV personnel : un CV de base + des variantes nommées par cible (ex. `vuejs-2026`), éditées dans un formulaire avec préview A4 live.

- **Stack** : Nuxt 4 · TypeScript · TailwindCSS v4 · Supabase (`@nuxtjs/supabase`)
- **Déploiement** : Cloudflare Workers (`wrangler`)

> La génération de PDF (Puppeteer + Cloudflare R2) est développée séparément sur la branche `feature/pdf-r2`, en attendant que le bucket R2 et les clés associées soient prêts.

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

Le contenu du CV de base (`app/utils/base-cv-content.ts`) reproduit `franck-lebas-vuejs-2026.pdf`. Les bullets acceptent `**gras**`.

Les colonnes `pdf_key` / `pdf_generated_at` existent déjà dans la table `cvs` mais ne sont pas utilisées tant que la génération de PDF n'est pas fusionnée depuis `feature/pdf-r2`.

## Déploiement (Cloudflare Workers)

```bash
bun run deploy   # build preset cloudflare_module + wrangler deploy
```
