import type { FeaturedSkill } from "~/components/StackIndex.vue";
import type { ExperienceOrg } from "~/components/ExperienceTimeline.vue";
import type { ProjectLink, ProjectPreview } from "~/components/ProjectTooltip.vue";

type PortableSpan = { text?: string | null };
type PortableBlock = {
  _type?: string;
  children?: PortableSpan[] | null;
};

type SanityWork = {
  _id?: string | null;
  _type?: string | null;
  _updatedAt?: string | null;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  role?: string | null;
  link?: string | null;
  externalUrl?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageTone?: string | null;
  videoUrl?: string | null;
  icon?: string | null;
  cardDescription?: string | null;
  tags?: string[] | null;
  tasks?: string[] | null;
  dossier?: string[] | null;
  tech?: (string | null)[] | null;
  links?: ({
    label?: string | null;
    url?: string | null;
  } | null)[] | null;
  metric?: {
    label?: string | null;
    value?: string | null;
    progress?: number | null;
  } | null;
};

export type PortfolioQueryData = {
  settings?: {
    _updatedAt?: string | null;
    displayName?: string | null;
    role?: string | null;
    location?: string | null;
    mission?: string | null;
    employerLabel?: string | null;
    employerUrl?: string | null;
    featuredProjects?: (SanityWork | null)[] | null;
  } | null;
  about?: {
    _updatedAt?: string | null;
    subtitle?: string | null;
    body?: unknown;
    education?: {
      degree?: string | null;
      school?: string | null;
      period?: string | null;
      isCurrent?: boolean | null;
      status?: string | null;
      note?: string | null;
    }[] | null;
    awards?: {
      title?: string | null;
      org?: string | null;
      location?: string | null;
      period?: string | null;
    }[] | null;
  } | null;
  techStack?: {
    _updatedAt?: string | null;
    name?: string | null;
    iconUrl?: string | null;
  }[] | null;
  works?: (SanityWork | null)[] | null;
  experience?: {
    _updatedAt?: string | null;
    company?: string | null;
    period?: string | null;
    isCurrent?: boolean | null;
    location?: string | null;
    logoUrl?: string | null;
    roles?: {
      role?: string | null;
      period?: string | null;
      employmentType?: string | null;
      isCurrent?: boolean | null;
      tags?: string[] | null;
      note?: string | null;
      projects?: (string | null)[] | null;
    }[] | null;
  }[] | null;
};

export type SiteSettingsContent = {
  displayName: string;
  role: string;
  location: string;
  mission: string;
  employerLabel: string;
  employerUrl: string;
};

export type AboutContent = {
  subtitle: string;
  paragraphs: string[];
  education: {
    degree: string;
    school: string;
    year: string;
    active: boolean;
    status: string;
    note: string;
  }[];
  awards: {
    title: string;
    detail: string;
  }[];
};

export type Portfolio = {
  source: "sanity" | "json";
  settings: SiteSettingsContent;
  about: AboutContent;
  techStack: FeaturedSkill[];
  works: ProjectPreview[];
  featured: ProjectPreview[];
  experience: ExperienceOrg[];
};

function joinTags(tags?: string[] | null) {
  return (tags ?? []).filter(Boolean).join(" // ");
}

function portableParagraphs(body: unknown): string[] {
  if (!Array.isArray(body)) return [];
  return (body as PortableBlock[])
    .filter((block) => block?._type === "block")
    .map((block) =>
      (block.children ?? [])
        .map((span) => span.text ?? "")
        .join("")
        .trim(),
    )
    .filter(Boolean);
}

/** A link with no URL has nothing to point at; one with no label borrows it. */
function mapLinks(links: SanityWork["links"]): ProjectLink[] {
  return (links ?? []).flatMap((link) => {
    const url = link?.url?.trim();
    if (!url) return [];
    return [{ label: link?.label?.trim() || url, url }];
  });
}

export function mapWork(doc: SanityWork | null | undefined): ProjectPreview | null {
  if (!doc?.slug) return null;
  const article = doc._type === "article";
  const name = article ? doc.title : doc.name;
  if (!name) return null;

  return {
    name,
    slug: doc.slug,
    category: article ? "Article" : doc.category || "Web",
    role: doc.role ?? undefined,
    tags: joinTags(doc.tags),
    link: (article ? doc.externalUrl : doc.link) ?? undefined,
    image: doc.imageUrl ?? undefined,
    imageAlt: doc.imageAlt ?? undefined,
    imageWidth: doc.imageWidth ?? undefined,
    imageHeight: doc.imageHeight ?? undefined,
    imageTone: doc.imageTone === "light" ? "light" : doc.imageTone === "dark" ? "dark" : undefined,
    video: doc.videoUrl ?? undefined,
    icon: doc.icon ?? undefined,
    description: doc.cardDescription ?? undefined,
    tasks: doc.tasks ?? [],
    tech: (doc.tech ?? []).filter((item): item is string => Boolean(item)),
    dossier: doc.dossier ?? undefined,
    links: mapLinks(doc.links),
    metric: doc.metric
      ? {
          label: doc.metric.label ?? "",
          value: doc.metric.value ?? "",
          progress: doc.metric.progress ?? 0,
        }
      : undefined,
  };
}

export function mapPortfolio(data: PortfolioQueryData | null): Portfolio | null {
  if (!data?.settings || !data.works?.length) return null;

  const works = data.works
    .map((work) => mapWork(work))
    .filter((work): work is ProjectPreview => Boolean(work));

  const featured = (data.settings.featuredProjects ?? [])
    .map((work) => mapWork(work))
    .filter((work): work is ProjectPreview => Boolean(work));

  return {
    source: "sanity",
    settings: {
      displayName: data.settings.displayName ?? "CHRISTOPHER SANTANA",
      role: data.settings.role ?? "FULL_STACK_ENGINEER",
      location: data.settings.location ?? "NYC",
      mission:
        data.settings.mission ??
        "AI SYSTEMS, FRONTEND ARCHITECTURE, SEO & DATA PIPELINES",
      employerLabel: data.settings.employerLabel ?? "@STOCKSTOTRADE",
      employerUrl: data.settings.employerUrl ?? "https://stockstotrade.com/",
    },
    about: {
      subtitle: data.about?.subtitle ?? "",
      paragraphs: portableParagraphs(data.about?.body),
      education: (data.about?.education ?? []).map((entry) => ({
        degree: entry.degree ?? "",
        school: entry.school ?? "",
        year: entry.period ?? "",
        active: Boolean(entry.isCurrent),
        status: entry.status ?? "",
        note: entry.note ?? "",
      })),
      awards: (data.about?.awards ?? []).map((award) => ({
        title: award.title ?? "",
        detail: [award.org, award.location, award.period]
          .filter(Boolean)
          .join(" // "),
      })),
    },
    techStack: (data.techStack ?? []).map((item) => ({
      name: item.name ?? "",
      iconSrc: item.iconUrl ?? "",
    })),
    works,
    featured: featured.length ? featured : works.filter((work) => work.category !== "Article").slice(0, 4),
    experience: (data.experience ?? []).map((org) => ({
      company: org.company ?? "",
      span: org.period ?? "",
      logo: org.logoUrl ?? undefined,
      location: org.location ?? undefined,
      active: Boolean(org.isCurrent),
      roles: (org.roles ?? []).map((role) => ({
        period: role.period ?? "",
        role: role.role ?? "",
        type: role.employmentType ?? undefined,
        tags: role.tags?.length ? joinTags(role.tags) : undefined,
        note: role.note ?? undefined,
        current: Boolean(role.isCurrent),
        projects: (role.projects ?? []).filter(
          (slug): slug is string => Boolean(slug),
        ),
      })),
    })),
  };
}
