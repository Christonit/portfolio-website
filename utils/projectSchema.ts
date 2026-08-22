import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import { isArticle } from "~/utils/projects";
import { IDENTITY_ID, SITE_URL } from "~/utils/site";

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, `${SITE_URL}/`).href;
}

export function projectCanonicalUrl(project: ProjectPreview) {
  if (isArticle(project) && project.link?.trim()) {
    return project.link.trim();
  }
  return `${SITE_URL}/project/${project.slug}`;
}

export function projectWorkNode(project: ProjectPreview, pageUrl?: string) {
  const url = pageUrl || projectCanonicalUrl(project);
  const liveUrl = project.link?.trim();

  return {
    "@type": isArticle(project) ? "SocialMediaPosting" : "CreativeWork",
    "@id": `${url}#work`,
    name: project.name,
    description: project.description,
    url,
    image: project.image ? absoluteUrl(project.image) : undefined,
    keywords: project.tech?.join(", "),
    creator: { "@id": IDENTITY_ID },
    author: { "@id": IDENTITY_ID },
    ...(liveUrl && liveUrl !== url ? { sameAs: liveUrl } : {}),
  };
}

export function projectListItems(projects: ProjectPreview[]) {
  return projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: projectCanonicalUrl(project),
    item: projectWorkNode(project),
  }));
}
