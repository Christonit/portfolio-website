type ProjectLink = {
  category: string;
  slug: string;
  link?: string;
};

type ProjectMediaAlt = {
  name: string;
  description?: string;
  imageAlt?: string;
};

export function projectMediaAlt(project: ProjectMediaAlt): string {
  return project.imageAlt?.trim() || project.description?.trim() || project.name;
}

/* Tags ship as one "A // B // C" string; every card renders them as the same
   underscored badges, so the split lives here rather than in each card. */
export function projectBadges(project: { tags?: string }): string[] {
  return (project.tags ?? "")
    .split("//")
    .map((tag) => tag.trim().replace(/\s+/g, "_"))
    .filter(Boolean);
}

export function isArticle(project: Pick<ProjectLink, "category">): boolean {
  return project.category.toLowerCase() === "article";
}

export function projectHref(project: ProjectLink): string {
  if (isArticle(project) && project.link?.trim()) {
    return project.link.trim();
  }
  return `/project/${project.slug}/`;
}

export function isExternalProjectHref(project: ProjectLink): boolean {
  return isArticle(project) && Boolean(project.link?.trim());
}

export function openProject(project: ProjectLink) {
  const href = projectHref(project);
  if (isExternalProjectHref(project)) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  return navigateTo(href);
}
