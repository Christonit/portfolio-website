type ProjectLink = {
  category: string;
  slug: string;
  link?: string;
};

export function isArticle(project: Pick<ProjectLink, "category">): boolean {
  return project.category.toLowerCase() === "article";
}

export function projectHref(project: ProjectLink): string {
  if (isArticle(project) && project.link?.trim()) {
    return project.link.trim();
  }
  return `/project/${project.slug}`;
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
