<script setup lang="ts">
import projectsJson from "~/data/projects.json";

/**
 * The backdrop behind a dossier sheet — and only that.
 *
 * The sheet itself is `ProjectDossierOverlay`, mounted at app level, because a
 * dossier is a layer over the page you opened it from rather than a page of
 * its own. On a client-side open this component never mounts at all: `app.vue`
 * holds `<NuxtPage>` on the page underneath for as long as the sheet is up.
 *
 * It renders for a cold load of a dossier URL, where there is no page behind
 * the sheet to keep. The board is the backdrop then, not a second copy of the
 * page: inert, so focus and clicks stay inside the sheet, and marking nothing —
 * the card behind the panel used to light up green, which the dismissal then
 * uncovered for a moment before the route swap wiped it.
 */
definePageMeta({
  validate: (route) => {
    const slug = Array.isArray(route.params.slug)
      ? route.params.slug[0]
      : route.params.slug;
    return (projectsJson as { slug: string; category: string }[]).some(
      (project) =>
        project.slug === slug && project.category.toLowerCase() !== "article",
    );
  },
});
</script>

<template>
  <div class="project-route">
    <ProjectsBoard :interactive="false" inert />
  </div>
</template>

<style scoped>
/* The board has to be a direct flex child of <main> for its xl:h-full
   scroll container to resolve, so this wrapper carries no box of its own. */
.project-route {
  display: contents;
}
</style>
