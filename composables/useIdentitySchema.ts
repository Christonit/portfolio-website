import { IDENTITY_ID, LINKEDIN_URL } from "~/utils/site";

export function useIdentitySchema() {
  useSchemaOrg([
    definePerson({
      "@id": IDENTITY_ID,
      givenName: "Christopher",
      familyName: "Santana",
      jobTitle: "Senior Full Stack Engineer",
      knowsLanguage: [
        { "@type": "Language", name: "English", alternateName: "en" },
        { "@type": "Language", name: "Spanish", alternateName: "es" },
      ],
      alumniOf: [
        { "@type": "CollegeOrUniversity", name: "Baruch College" },
        { "@type": "CollegeOrUniversity", name: "APEC University" },
        { "@type": "CollegeOrUniversity", name: "ITLA" },
      ],
      worksFor: {
        "@type": "Organization",
        name: "StocksToTrade",
        url: "https://stockstotrade.com/",
      },
      homeLocation: {
        "@type": "Place",
        name: "New York City",
        address: {
          "@type": "PostalAddress",
          addressLocality: "New York City",
          addressRegion: "NY",
          addressCountry: "US",
        },
      },
      knowsAbout: [
        "TypeScript",
        "JavaScript",
        "React",
        "Next.js",
        "Vue.js",
        "Nuxt",
        "Node.js",
        "AWS",
        "Cloudflare",
        "UI/UX Design",
        "Web Performance",
      ],
      award:
        "1st Place — Branding Design Contest, Ministry of Foreign Affairs, Dominican Republic, 2017",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "professional",
        url: LINKEDIN_URL,
      },
    }),
  ]);
}
