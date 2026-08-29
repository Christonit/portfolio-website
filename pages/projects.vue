<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
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
      itemListElement: [
        { name: "Home", item: "/" },
        { name: "Selected Work" },
      ],
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
</script>

<template>
  <ProjectsBoard />
</template>
