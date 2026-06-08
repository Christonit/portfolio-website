export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/color-mode", "shadcn-nuxt"],

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
      title: "CH_SANTANA_OS_V3 // OPERATOR PROFILE",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Christopher Santana — Full Stack Engineer. Portfolio OS.",
        },
        { name: "theme-color", content: "#131313" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "CH_SANTANA_OS_V3 // OPERATOR PROFILE" },
        {
          property: "og:description",
          content: "Christopher Santana — Full Stack Engineer. Portfolio OS.",
        },
        { property: "og:image", content: "/images/og-image.webp" },
        { property: "og:image:type", content: "image/webp" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/images/og-image.webp" },
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
