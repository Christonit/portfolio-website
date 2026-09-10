import { definePerson } from "nuxt-schema-org/schema";
import portfolio from "./public/data/portfolio.json";
import { injectNotFoundFallback } from "./utils/notFoundFallback";
import {
  GA_MEASUREMENT_ID,
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./utils/site";

type SnapshotDocument = {
  _updatedAt?: string;
};

type SnapshotWork = SnapshotDocument & {
  _type: "project" | "article";
  slug: string;
};

const works = portfolio.works as SnapshotWork[];
const projectPaths = works
  .filter((work) => work._type === "project")
  .map((project) => `/project/${project.slug}/`);

const internalToolRoutes = new Set(["/og-export", "/design-system"]);

function latestUpdated(documents: SnapshotDocument[]) {
  return documents
    .map((document) => document._updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
}

const contentDocuments = [
  portfolio.settings,
  portfolio.about,
  ...portfolio.techStack,
  ...portfolio.works,
  ...portfolio.experience,
] as SnapshotDocument[];

const sitemapUrls = [
  { loc: "/", lastmod: latestUpdated(contentDocuments) },
  { loc: "/bio/", lastmod: portfolio.about?._updatedAt },
  { loc: "/projects/", lastmod: latestUpdated(works) },
  ...works
    .filter((work) => work._type === "project")
    .map((work) => ({
      loc: `/project/${work.slug}/`,
      lastmod: work._updatedAt,
    })),
];

const gaMeasurementId =
  process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || GA_MEASUREMENT_ID;

/**
 * A missing Sanity projectId does not fail on its own: the client comes up
 * without a project, the fetch in plugins/sanity-portfolio.ts throws, and the
 * catch there falls back to the build-time Sanity snapshot. That is the right behaviour for
 * a transient API failure and the wrong one for a misconfigured deploy — it
 * would ship a green build serving whatever the JSON file last said.
 *
 * Checked in `build:before` rather than at module scope because the CLI loads
 * this file once for its version banner before it injects .env, so a top-level
 * throw would reject a correctly configured build.
 */
function assertSanityEnv() {
  // `nuxt prepare` fires the same build hooks, and it runs from postinstall —
  // throwing there would leave a fresh clone unable to install dependencies
  // before it had a chance to write a .env.
  if (process.argv.includes("prepare")) return;

  const missing = [
    "NUXT_PUBLIC_SANITY_PROJECT_ID",
    "NUXT_PUBLIC_SANITY_DATASET",
  ].filter((name) => !process.env[name]);

  if (!missing.length) return;

  throw new Error(
    `Sanity is not configured: ${missing.join(", ")} unset. Set them in .env locally (see .env.example) or in the deploy environment.`,
  );
}

// Official gtag snippet in the prerendered <head> so Google's tag checker
// (and any crawler that does not wait for Nuxt hydration) can see it.
const gaHeadScripts =
  process.env.NODE_ENV === "production" && gaMeasurementId
    ? [
        {
          key: "gtag-js",
          src: `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
          async: true,
          tagPriority: "high" as const,
        },
        {
          key: "gtag-init",
          innerHTML: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaMeasurementId}');`,
          tagPriority: "high" as const,
        },
      ]
    : [];

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // A build and a running `nuxt dev` share `.nuxt`, and the dev server rewrites
  // the SSR entry there while the build is bundling it. The built server then
  // boots into Vite's dev renderer and 500s on anything it renders on demand —
  // the 404 page, mainly. The e2e suite builds into its own directory (see
  // playwright.config.ts) so both can run at once.
  buildDir: process.env.NUXT_BUILD_DIR || ".nuxt",

  // The Sanity Studio is a separate app that happens to sit in this directory.
  // Its own node_modules is ~48k files, and the dev watcher opening a handle on
  // every one of them exhausts the process's file descriptors (EMFILE).
  ignore: ["studio-personal-web/**"],

  watchers: {
    chokidar: {
      ignored: ["**/studio-personal-web/**"],
    },
  },

  vite: {
    server: {
      watch: {
        ignored: ["**/studio-personal-web/**"],
      },
    },
  },

  experimental: {
    viewTransition: true,
    defaults: {
      nuxtLink: {
        // Netlify Pretty URLs 301 /bio → /bio/. Links must declare the slash
        // Google actually lands on, or canonicals and the sitemap disagree.
        trailingSlash: "append",
      },
    },
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "nuxt-schema-org",
    "@nuxtjs/sanity",
  ],

  hooks: {
    "build:before": assertSanityEnv,

    // Nitro's prerender ignore list only suppresses route HTML after Vite has
    // already bundled every page. Remove internal tools from the production
    // route graph so their page code and heavy dependencies are not deployed.
    "pages:extend"(pages) {
      if (process.env.NODE_ENV !== "production") return;
      for (let index = pages.length - 1; index >= 0; index -= 1) {
        if (internalToolRoutes.has(pages[index].path)) pages.splice(index, 1);
      }
    },
  },

  site: {
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    defaultLocale: "en",
    trailingSlash: true,
  },

  schemaOrg: {
    identity: definePerson({
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      image: "/images/og-image.webp",
      sameAs: [LINKEDIN_URL, GITHUB_URL],
    }),
  },

  robots: {
    disallow: ["/og-export", "/design-system"],
    // Default runtime handler is a Netlify function. Googlebot times that
    // out and Search Console reports "robots.txt not fetched", which blocks
    // indexing of the whole site.
    cacheControl: "public, max-age=86400, must-revalidate",
  },

  sitemap: {
    exclude: ["/og-export", "/design-system"],
    // URLs and `lastmod` values come from the published Sanity snapshot.
    urls: sitemapUrls,
    discoverImages: false,
    discoverVideos: false,
    zeroRuntime: true,
  },

  routeRules: {
    "/robots.txt": { prerender: true },
    "/sitemap.xml": { prerender: true },
    "/og-export": { robots: false },
    "/design-system": { robots: false },
    "/videos/**": {
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Disposition": "inline",
      },
    },
    "/resume.pdf": {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'inline; filename="Christopher-Santana-Resume.pdf"',
      },
    },
    // Heal a bad www→apex rule that captured the hostname as a path:
    // www.chsantana.com → https://chsantana.com/chsantana.com/
    "/chsantana.com": { redirect: { to: "/", statusCode: 301 } },
    "/chsantana.com/**": { redirect: { to: "/**", statusCode: 301 } },
  },

  runtimeConfig: {
    public: {
      gaMeasurementId,
      googleSiteVerification:
        process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },

  sanity: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2026-09-09",
    useCdn: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/sitemap.xml", "/robots.txt", ...projectPaths],
    },
    hooks: {
      // See utils/notFoundFallback.ts — Nuxt renders /404.html as an empty
      // SPA shell no matter what, so the static 404 has to be written in here.
      "prerender:generate"(route) {
        if (route.route !== "/404.html" || typeof route.contents !== "string") {
          return;
        }
        route.contents = injectNotFoundFallback(route.contents);
      },
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "dark",
    fallback: "dark",
  },

  tailwindcss: {
    cssPath: "~/assets/css/globals.css",
    configPath: "~/tailwind.config.ts",
  },

  typescript: {
    strict: true,
    shim: false,
  },

  app: {
    head: {
      title: SITE_TITLE,
      // `site.defaultLocale` feeds the sitemap and schema, not the document.
      // Without this every page shipped a bare <html> and assistive tech had
      // to guess the language (WCAG 3.1.1).
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: SITE_DESCRIPTION,
        },
        { name: "theme-color", content: "#131313" },
        ...(process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION
          ? [
              {
                name: "google-site-verification",
                content: process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
              },
            ]
          : []),
        { property: "og:type", content: "website" },
        { property: "og:title", content: SITE_TITLE },
        {
          property: "og:description",
          content: SITE_DESCRIPTION,
        },
        { property: "og:image", content: `${SITE_URL}/images/og-image.webp` },
        { property: "og:image:type", content: "image/webp" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `${SITE_URL}/images/og-image.webp` },
      ],
      script: gaHeadScripts,
      // Every face is self-hosted and declared in assets/css/globals.css, so
      // there is no third-party stylesheet in front of first paint any more.
      // Preloaded here: the three the first screen always needs. The latin-ext
      // cuts of Tomorrow are declared but not preloaded — their unicode-range
      // means the browser only fetches them if the copy calls for them.
      link: [
        { rel: "icon", type: "image/x-icon", href: "/images/favicon.ico" },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/Tomorrow-600-latin.woff2",
          crossorigin: "",
        },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/Tomorrow-400-latin.woff2",
          crossorigin: "",
        },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/DepartureMono-Regular.woff2",
          crossorigin: "",
        },
        { rel: "preconnect", href: "https://www.googletagmanager.com" },
      ],
    },
  },
});
