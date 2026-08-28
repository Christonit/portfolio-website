<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { projectListItems } from "~/utils/projectSchema";
import { SITE_URL, pageTitle } from "~/utils/site";

const PROJECTS_LIST_ID = `${SITE_URL}/projects#itemlist`;
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

const hudKey = useHudNav();
const totalWork = projects.length;

const focusedIndex = ref<number | null>(null);
const cardRefs = ref<(HTMLElement | null)[]>([]);
const columns = ref(1);

function bindCard(el: Element | null, i: number) {
  cardRefs.value[i] = el instanceof HTMLElement ? el : null;
}

function readColumns() {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function scrollCardIntoView(i: number) {
  cardRefs.value[i]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function activateCard(i: number) {
  const el = cardRefs.value[i];
  const link = el instanceof HTMLAnchorElement ? el : el?.querySelector("a");
  link?.click();
}

watch(hudKey, (key) => {
  if (!key) return;

  const cols = columns.value;
  const last = totalWork - 1;

  if (focusedIndex.value === null) {
    focusedIndex.value = 0;
    scrollCardIntoView(0);
    return;
  }

  const i = focusedIndex.value;

  if (key === "ArrowRight") {
    focusedIndex.value = Math.min(i + 1, last);
  } else if (key === "ArrowLeft") {
    focusedIndex.value = Math.max(i - 1, 0);
  } else if (key === "ArrowDown") {
    focusedIndex.value = Math.min(i + cols, last);
  } else if (key === "ArrowUp") {
    focusedIndex.value = Math.max(i - cols, 0);
  }

  scrollCardIntoView(focusedIndex.value);
});

function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key !== "Enter" || focusedIndex.value === null) return;
  e.preventDefault();
  activateCard(focusedIndex.value);
}

let cleanupListeners: (() => void) | undefined;

onMounted(() => {
  columns.value = readColumns();
  const onResize = () => {
    columns.value = readColumns();
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeydown);
  cleanupListeners = () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeydown);
  };
});

onUnmounted(() => {
  cleanupListeners?.();
});
</script>

<template>
  <div
    class="projects-rail flex flex-col gap-8 py-5 pb-8 xl:h-full xl:overflow-y-auto"
  >
    <header class="flex max-w-3xl flex-col gap-3 pt-2">
      <span class="hud-label">// PROJECTS</span>
      <h1
        class="font-semibold uppercase tracking-tighter text-white"
        style="font-size: clamp(2.1rem, 4.4vw, 3.6rem); line-height: 0.92"
      >
        SELECTED WORK
      </h1>
      <p class="max-w-xl font-mono text-xs leading-relaxed text-[#919191] xl:text-sm">
        A collection of web apps and projects I've collaborated on over the
        years, along with technical articles I'm proud of.
      </p>
    </header>

    <section aria-label="Selected work">
      <ul
        class="grid grid-cols-1 gap-5 md:grid-cols-2"
        role="list"
      >
        <li
          v-for="(project, i) in projects"
          :key="project.slug"
          class="min-h-0"
          :ref="(el) => bindCard(el as Element | null, i)"
          v-reveal="(i % 2) * 60"
        >
          <ProjectsCard
            :project="project"
            :index="i"
            :total="totalWork"
            :focused="focusedIndex === i"
          />
        </li>
        <!--
        <li
          class="min-h-0"
          :ref="(el) => bindCard(el as Element | null, totalWork)"
        >
          <ProjectsCard
            variant="mission"
            :focused="focusedIndex === totalWork"
          />
        </li>
        -->
      </ul>
    </section>
  </div>
</template>

<style scoped>
.projects-rail {
  width: min(800px, calc(100% - 32px));
  margin-inline: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.projects-rail::-webkit-scrollbar {
  display: none;
}

@media (max-width: 639px) {
  .projects-rail {
    width: min(800px, calc(100% - 24px));
  }
}
</style>
