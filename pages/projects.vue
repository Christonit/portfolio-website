<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import { useDossierOpen } from "~/composables/useDossierBackground";
import projectsJson from "~/data/projects.json";
import { projectListItems } from "~/utils/projectSchema";
import { pageTitle, pageUrl } from "~/utils/site";

const PROJECTS_LIST_ID = `${pageUrl("/projects")}#itemlist`;
const projects = projectsJson as ProjectPreview[];

usePageSeo({
  title: pageTitle("Selected Work"),
  description:
    "Selected work by Christopher Santana — high-traffic Nuxt platforms, Cloudflare and AWS infrastructure, and technical writing on performance and automation.",
  pageType: "CollectionPage",
  mainEntity: { "@id": PROJECTS_LIST_ID },
  extraSchema: () => [
    defineBreadcrumb({
      itemListElement: [{ name: "Home", item: "/" }, { name: "Selected Work" }],
    }),
    defineItemList({
      "@id": PROJECTS_LIST_ID,
      name: "Selected work",
      itemListOrder: "Unordered",
      numberOfItems: projects.length,
      itemListElement: projectListItems(projects),
    }),
  ],
});

/* The board keeps rendering under an open dossier — that is what makes the
   sheet a sheet — so while one is up it hands over the focus ring, the arrow
   keys and every pointer target to it. */
const sheetIsUp = useDossierOpen();
</script>

<template>
  <ProjectsBoard :interactive="!sheetIsUp" :inert="sheetIsUp || undefined" />
</template>
