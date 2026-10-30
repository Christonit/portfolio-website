# Christopher Santana — Portfolio

Personal portfolio site for [chsantana.com](https://chsantana.com). A Nuxt 3 app with a retro HUD-style UI, project case studies, bio, and SEO tooling. Copy, projects, experience, and related content are edited in [Sanity](https://www.sanity.io/) and rendered by the site at build and request time.

## How it works

The public site is a Nuxt 3 frontend. Before development and production builds, `scripts/sync-sanity.ts` fetches the published dataset into `public/data/portfolio.json`. Nuxt uses that snapshot for route generation, sitemap URLs and modification dates, tests, and its offline fallback. On the server it also loads the same GROQ query (`sanity/queries.ts`) through `@nuxtjs/sanity`, maps the result into the UI shape (`sanity/mapPortfolio.ts`), and stores it in Nuxt shared state via `usePortfolio()`.

If a runtime Sanity request fails, the plugin falls back to the generated snapshot through `sanity/localPortfolio.ts`. The sync fails instead of replacing a valid snapshot when Sanity returns incomplete data. A missing project ID or dataset is treated as a misconfiguration and fails the build — see `nuxt.config.ts`.

Site-wide constants that are not editorial (canonical URL, social links, analytics IDs) still live in `utils/site.ts`.

## CMS (Sanity)

The editor is a standalone [Sanity Studio](https://www.sanity.io/studio) in `studio-personal-web/`. It is a separate app from the Nuxt site (ignored by the Nuxt watcher so Studio’s `node_modules` does not exhaust file descriptors). Content types include site settings, the about page, projects, articles, tech stack items, and experience.

A CMS keeps writing and shipping separate. Project write-ups, bio copy, and role history can be updated in Studio without a code change, review, or deploy for every typo. The frontend stays responsible for layout, routing, and performance; Sanity stores structured documents the site queries rather than HTML pages.

From the site root:

```bash
npm run studio
```

Or `npm run dev` inside `studio-personal-web/`. Studio talks to project `s0w6jpzs`, dataset `production`.

## Stack

- [Nuxt 3](https://nuxt.com/) + Vue 3 + TypeScript
- [Sanity](https://www.sanity.io/) (`@nuxtjs/sanity`) for content
- Tailwind CSS
- Three.js (3D model viewer)
- `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`
- Google Analytics 4 (production only)

## Development

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sanity project ID and dataset are required for a production build; see `.env.example`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Nuxt dev server |
| `npm run studio` | Start Sanity Studio |
| `npm run sync:sanity` | Refresh `public/data/portfolio.json` from published Sanity content |
| `npm run build` | Production build |
| `npm run generate` | Static site generation |
| `npm run preview` | Preview production build |
| `npm test` | Unit tests, design audits, typecheck |
| `npm run test:e2e` | Playwright end-to-end suite |
| `npm run test:e2e:ui` | Playwright in watch mode |

## End-to-end tests

`e2e/` covers navigation, content integrity and SEO, and every spec runs twice —
once at 1440px, where the header owns the tabs, and once on an emulated Pixel 5,
where the fixed bottom bar does.

```bash
npx playwright install chromium   # first run only
npm run test:e2e
```

The suite refreshes the Sanity snapshot, builds the site, and serves it on port 3100 rather than testing
`nuxt dev`, because robots, the sitemap and the stripped `/design-system` and
`/og-export` routes only exist in build output. It uses its own `.nuxt-e2e`
build directory so it can run alongside a dev server on port 3000.

To skip the build and point at a server that is already up:

```bash
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

The specs that assert on build artifacts skip themselves when `E2E_BASE_URL` is
set. The same variable will run the suite against production.

## Environment

Copy `.env.example` to `.env`. Sanity values are required for `nuxt build` / `nuxt generate` (not for `nuxt prepare` / `npm install`):

```bash
NUXT_PUBLIC_SANITY_PROJECT_ID=
NUXT_PUBLIC_SANITY_DATASET=production
NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_TO_EMAIL=hello@chsantana.com
CONTACT_FROM_EMAIL=Christopher Santana <hello@chsantana.com>
```

Analytics is disabled in dev by default. The three contact variables are
server-only; add them to the Netlify environment after verifying the sending
domain in Resend.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

If you clone, fork, or reuse this code, you must keep the copyright notice,
include a copy of the license, and preserve the attribution in [`NOTICE`](NOTICE)
(Christopher Santana / [chsantana.com](https://chsantana.com)).
