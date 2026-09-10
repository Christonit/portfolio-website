import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The expected values, written out rather than imported from `utils/site.ts`.
 *
 * A test that re-derives its expectation from the module it is checking passes
 * no matter what that module says. Titles, descriptions and canonical hosts are
 * a published contract — Google has them indexed — so they are spelled out here
 * and a change to either side has to be made twice, on purpose.
 *
 * Project content is the exception: it turns over as work ships, so the specs
 * read the build-time Sanity snapshot and assert on shape instead of copy.
 */

export const SITE_URL = "https://chsantana.com";
export const SITE_NAME = "Christopher Santana";
export const SITE_TITLE = "Christopher Santana - Full Stack Engineer";
export const SITE_DESCRIPTION =
  "Senior Full Stack Engineer in NYC, from Punta Cana. I build systems and user interfaces for high-traffic web apps and real-time quote systems used by 1M+ monthly users.";
export const OG_IMAGE = `${SITE_URL}/images/og-image.webp`;

export const LINKEDIN_URL = "https://www.linkedin.com/in/chrisalesant/";
export const EMAIL_URL = "mailto:hello@chsantana.com";
export const RESUME_PATH = "/resume.pdf";

export type Project = {
  name: string;
  slug: string;
  tags: string;
  category: string;
  role?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
  video?: string;
  description?: string;
  dossier: string[];
  tasks: string[];
  tech: string[];
};

const portfolioPath = fileURLToPath(
  new URL("../../public/data/portfolio.json", import.meta.url),
);

type SanityWork = {
  _type: "project" | "article";
  name?: string;
  title?: string;
  slug: string;
  category?: string;
  role?: string;
  link?: string;
  externalUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  cardDescription?: string;
  tags?: string[];
  dossier?: string[];
  tasks?: string[];
  tech?: string[];
};

type SanitySnapshot = {
  settings: {
    displayName: string;
    role: string;
    location: string;
    mission: string;
    employerLabel: string;
    employerUrl: string;
    featuredProjects?: SanityWork[];
  };
  techStack: { name: string }[];
  works: SanityWork[];
};

const snapshot = JSON.parse(
  readFileSync(portfolioPath, "utf8"),
) as SanitySnapshot;

const mapProject = (work: SanityWork): Project => ({
  name: work._type === "article" ? work.title! : work.name!,
  slug: work.slug,
  tags: (work.tags ?? []).join(" // "),
  category: work._type === "article" ? "Article" : (work.category ?? "Web"),
  role: work.role,
  link: work._type === "article" ? work.externalUrl : work.link,
  image: work.imageUrl,
  imageAlt: work.imageAlt,
  video: work.videoUrl,
  description: work.cardDescription,
  dossier: work.dossier ?? [],
  tasks: work.tasks ?? [],
  tech: work.tech ?? [],
});

export const allProjects = snapshot.works.map(mapProject);
export const SITE_SETTINGS = snapshot.settings;

const isArticle = (project: Project) =>
  project.category.toLowerCase() === "article";

/** The four with a dossier of their own at `/project/<slug>/`. */
export const caseStudies = allProjects.filter((p) => !isArticle(p));

/** Articles link straight out to dev.to — `pages/project/[slug].vue` rejects
 *  their slugs, so they have no route on this site. */
export const articles = allProjects.filter(isArticle);

/** The curated reference order from Sanity's Site settings document. */
export const featuredProjects = (snapshot.settings.featuredProjects ?? []).map(
  mapProject,
);

/** `utils/projects.ts` — "A // B // C" becomes three underscored badges. */
export const projectBadges = (project: Project) =>
  project.tags
    .split("//")
    .map((tag) => tag.trim().replace(/\s+/g, "_"))
    .filter(Boolean);

export const projectPath = (project: Project) => `/project/${project.slug}/`;

/** Netlify serves a trailing slash on every path but the origin root, and the
 *  canonicals and sitemap were written to match. */
export const canonicalUrl = (path: string) =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path.replace(/\/+$/, "")}/`;

export type PageUnderTest = {
  path: string;
  title: string;
  description: string;
  /** The `@type` `usePageSeo` gives the WebPage node in the JSON-LD graph. */
  schemaType: string;
  /** Breadcrumb trail in the JSON-LD, or null where the page defines none. */
  breadcrumb: string[] | null;
  ogImage: string;
};

export const HOME: PageUnderTest = {
  path: "/",
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  schemaType: "ProfilePage",
  breadcrumb: null,
  ogImage: OG_IMAGE,
};

export const PROJECTS: PageUnderTest = {
  path: "/projects/",
  title: "Christopher Santana - Selected Work",
  description:
    "Selected work by Christopher Santana — high-traffic Nuxt platforms, Cloudflare and AWS infrastructure, and technical writing on performance and automation.",
  schemaType: "CollectionPage",
  breadcrumb: ["Home", "Selected Work"],
  ogImage: OG_IMAGE,
};

export const BIO: PageUnderTest = {
  path: "/bio/",
  title: "Christopher Santana - About",
  description:
    "Christopher Santana — from Punta Cana to Manhattan. Senior Full Stack Engineer behind real-time news and quote systems used by 1M+ monthly users.",
  schemaType: "AboutPage",
  breadcrumb: ["Home", "About"],
  ogImage: OG_IMAGE,
};

export const staticPages = [HOME, PROJECTS, BIO];

/** A dossier swaps in the project's own share image and its own page title. */
export const dossierPage = (project: Project): PageUnderTest => ({
  path: projectPath(project),
  title: `${SITE_NAME} - ${project.name.replace(/_/g, " ")}`,
  description: project.description!,
  schemaType: "ItemPage",
  breadcrumb: ["Home", "Selected Work", project.name.replace(/_/g, " ")],
  ogImage: project.image ? `${SITE_URL}${project.image}` : OG_IMAGE,
});

/** Every URL the site publishes, in the order `nuxt.config.ts` lists them. */
export const sitemapPaths = [
  "/",
  "/bio/",
  "/projects/",
  ...caseStudies.map(projectPath),
];

/** The published Sanity order matters; the grid renders it top to bottom. */
export const TECH_STACK = snapshot.techStack.map((item) => item.name);
