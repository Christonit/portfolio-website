# Christopher Santana — Portfolio

Personal portfolio site for [chsantana.com](https://chsantana.com). Nuxt 3 app with a retro HUD-style UI, project case studies, bio, and SEO tooling.

## Stack

- [Nuxt 3](https://nuxt.com/) + Vue 3 + TypeScript
- Tailwind CSS
- Three.js (3D model viewer)
- `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`
- Google Analytics 4 (production only)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run generate` | Static site generation |
| `npm run preview` | Preview production build |

## Environment

Copy `.env.example` to `.env` if you need to override the GA measurement ID:

```bash
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Analytics is disabled in dev by default.

## Project data

Case studies and metadata live in `data/projects.json`. Site-wide constants (URL, social links) are in `utils/site.ts`.
