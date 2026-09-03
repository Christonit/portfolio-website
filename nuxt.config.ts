import { definePerson } from "nuxt-schema-org/schema";
import projects from "./data/projects.json";
import { injectNotFoundFallback } from "./utils/notFoundFallback";
import { withGitLastmod } from "./utils/sitemapLastmod";
import {
  GA_MEASUREMENT_ID,
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./utils/site";

const projectPaths = (projects as { slug: string; category: string }[])
  .filter((project) => project.category.toLowerCase() !== "article")
  .map((project) => `/project/${project.slug}/`);

const internalToolRoutes = new Set(["/og-export", "/design-system"]);

const sitemapUrls = ["/", "/bio/", "/projects/", ...projectPaths].map((loc) =>
  withGitLastmod({ loc }),
);

const gaMeasurementId =
  process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || GA_MEASUREMENT_ID;

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
  ],

  hooks: {
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
    // Every URL listed explicitly so each one can carry a `lastmod` derived
    // from the commits that actually changed its content — see
    // utils/sitemapLastmod.ts for why not the build clock.
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
