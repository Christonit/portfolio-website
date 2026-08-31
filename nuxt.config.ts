import { definePerson } from "nuxt-schema-org/schema";
import projects from "./data/projects.json";
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
    "shadcn-nuxt",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "nuxt-schema-org",
  ],

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
    urls: projectPaths,
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
      gaMeasurementId:
        process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || GA_MEASUREMENT_ID,
      googleSiteVerification:
        process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/sitemap.xml", "/robots.txt", ...projectPaths],
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "dark",
    fallback: "dark",
  },

  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
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
      link: [
        { rel: "icon", type: "image/x-icon", href: "/images/favicon.ico" },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/DepartureMono-Regular.woff2",
          crossorigin: "",
        },
        { rel: "preconnect", href: "https://www.googletagmanager.com" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Tomorrow:wght@400;600&display=swap",
        },
        // Subset to only the icons we actually render. The unsubsetted
        // request (every axis at full range) ships a 3.9 MB variable font.
        // NOTE: adding a new icon to a template requires adding its name to
        // `icon_names` below, or it will render as literal text.
        // @24,300,0,0 matches the fixed font-variation-settings in globals.css.
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0" +
            "&icon_names=add,analytics,article,auto_awesome,candlestick_chart,close,deployed_code,fingerprint,fullscreen,grid_view,hexagon" +
            "&display=block",
        },
      ],
    },
  },
});
