import { definePerson } from "nuxt-schema-org/schema";
import projects from "./data/projects.json";
import {
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./utils/site";

const projectPaths = (projects as { slug: string; category: string }[])
  .filter((project) => project.category !== "ARTICLE")
  .map((project) => `/project/${project.slug}`);

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  experimental: {
    viewTransition: true,
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
    trailingSlash: false,
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
    disallow: ["/og-export"],
  },

  sitemap: {
    exclude: ["/og-export"],
    urls: projectPaths,
    discoverImages: false,
    discoverVideos: false,
    zeroRuntime: true,
  },

  routeRules: {
    "/og-export": { robots: false },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", ...projectPaths],
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
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Tomorrow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        },
      ],
    },
  },
});
