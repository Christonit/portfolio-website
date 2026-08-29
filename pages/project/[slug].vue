<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { isArticle } from "~/utils/projects";
import { projectCanonicalUrl, projectWorkNode } from "~/utils/projectSchema";
import { closeProjectSheet } from "~/composables/useProjectSheetMode";
import { formatProjectName, pageTitle } from "~/utils/site";

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const router = useRouter();
const projects = projectsJson as ProjectPreview[];

const slug = computed(() => {
  const param = route.params.slug;
  return Array.isArray(param) ? param[0] : param;
});

const project = computed(() =>
  projects.find((item) => item.slug === slug.value && !isArticle(item)),
);

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Project not found",
  });
}

const current = computed(() => project.value as ProjectPreview);

usePageSeo({
  title: () => pageTitle(formatProjectName(current.value.name)),
  description: () =>
    current.value.description ||
    `${formatProjectName(current.value.name)} — a project by Christopher Santana.`,
  pageType: "ItemPage",
  image: () => current.value.image || "/images/og-image.webp",
  mainEntity: () => ({
    "@id": `${projectCanonicalUrl(current.value)}#work`,
  }),
  extraSchema: () => [
    defineBreadcrumb({
      itemListElement: [
        { name: "Home", item: "/" },
        { name: "Selected Work", item: "/projects" },
        { name: formatProjectName(current.value.name) },
      ],
    }),
    projectWorkNode(current.value),
  ],
});

const visitUrl = computed(() => current.value.link?.trim() || "");

/* Articles live off-site, so the pager only walks the case-study pages. */
const siblings = computed(() => projects.filter((item) => !isArticle(item)));
const siblingIndex = computed(() =>
  siblings.value.findIndex((item) => item.slug === current.value.slug),
);

function siblingAt(offset: number) {
  const list = siblings.value;
  if (list.length < 2 || siblingIndex.value < 0) return null;
  const total = list.length;
  return list[(siblingIndex.value + offset + total) % total];
}

const prevProject = computed(() => siblingAt(-1));
const nextProject = computed(() => siblingAt(1));
const projectCounter = computed(() =>
  siblingIndex.value < 0
    ? ""
    : `${siblingIndex.value + 1}/${siblings.value.length}`,
);

// ── Dismissal ─────────────────────────────────────────────────────
// The sheet has to finish sliding away before the route swaps the board
// back in, so every exit — button, scrim, Escape, breadcrumb, browser
// back — is funnelled through the same leave guard.
const SHEET_EXIT_MS = 240;
const closing = ref(false);

function close() {
  if (closing.value) return;
  router.push("/projects");
}

onBeforeRouteLeave(async (to) => {
  // The pager stays inside the sheet; only leaving the dossier dismisses it.
  if (to.path.startsWith("/project/")) return true;

  closeProjectSheet();

  const reduced =
    import.meta.client &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (import.meta.client && !reduced && !closing.value) {
    closing.value = true;
    await new Promise((resolve) => setTimeout(resolve, SHEET_EXIT_MS));
  }

  return true;
});
</script>

<template>
  <div class="project-route">
    <!-- The board is the backdrop, not a second copy of the page: inert so
         focus and clicks stay inside the sheet, and un-revealed so it does
         not re-animate every time a dossier opens. -->
    <ProjectsBoard :interactive="false" :active-slug="current.slug" inert />

    <ProjectSheet
      :label="`${current.name} — project dossier`"
      :closing="closing"
      @close="close"
    >
      <template #title>
        <nav class="min-w-0" aria-label="Breadcrumb">
          <ol
            class="flex min-w-0 items-center gap-2 font-mono text-2xs uppercase tracking-[0.18em] text-[#919191]"
          >
            <li>
              <NuxtLink
                to="/projects"
                class="transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
              >
                PROJECTS
              </NuxtLink>
            </li>
            <li aria-hidden="true">/</li>
            <li class="truncate text-white">{{ current.name }}</li>
          </ol>
        </nav>
      </template>

      <template #actions>
        <a
          v-if="visitUrl"
          :href="visitUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-1 font-mono text-2xs uppercase tracking-[0.18em] text-[#67F57A] transition-colors hover:text-white"
        >
          VISIT_PROJECT
        </a>
      </template>

      <ProjectDossier :project="current" />

      <template v-if="prevProject && nextProject" #footer>
        <nav class="project-pager" aria-label="Project navigation">
          <NuxtLink
            :to="`/project/${prevProject.slug}`"
            class="project-pager__arrow border-r border-white/20"
            :aria-label="`Previous project: ${prevProject.name}`"
          >
            &lt;
          </NuxtLink>
          <div
            class="flex min-w-0 flex-1 items-center justify-between gap-3 px-3"
          >
            <span
              class="truncate font-mono text-2xs uppercase tracking-[0.18em] text-[#919191]"
            >
              <span class="hidden sm:inline">NEXT:&nbsp;</span>
              <span class="text-white">{{ nextProject.name }}</span>
            </span>
            <span
              class="shrink-0 font-mono text-xs tabular-nums tracking-[0.18em] text-[#919191]"
            >
              {{ projectCounter }}
            </span>
          </div>
          <NuxtLink
            :to="`/project/${nextProject.slug}`"
            class="project-pager__arrow border-l border-white/20"
            :aria-label="`Next project: ${nextProject.name}`"
          >
            &gt;
          </NuxtLink>
        </nav>
      </template>
    </ProjectSheet>
  </div>
</template>

<style scoped>
/* The board has to be a direct flex child of <main> for its xl:h-full
   scroll container to resolve, so this wrapper carries no box of its own. */
.project-route {
  display: contents;
}

.project-pager {
  display: flex;
  align-items: stretch;
}

.project-pager__arrow {
  display: flex;
  min-height: 44px;
  min-width: 44px;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--text-lg);
  line-height: 1;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.project-pager__arrow:hover,
.project-pager__arrow:focus-visible {
  background: #fff;
  color: #000;
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .project-pager__arrow {
    transition: none;
  }
}
</style>
