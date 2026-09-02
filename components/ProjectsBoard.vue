<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import {
  rememberBoardScroll,
  takeBoardScroll,
} from "~/composables/useProjectSheet";

/**
 * The selected-work grid. Owns the arrow-key focus ring when it is the page
 * you are on, and renders inert and unmarked when it is only sitting behind an
 * open dossier sheet. Cards never reveal on their own — the page transition
 * already carries them in.
 */
const props = withDefaults(
  defineProps<{
    interactive?: boolean;
  }>(),
  {
    interactive: true,
  },
);

const projects = projectsJson as ProjectPreview[];
const totalWork = projects.length;

const hudKey = useHudNav();
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
  if (!key || !props.interactive) return;

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

// ── Scroll continuity across the dossier sheet ────────────────────
// Opening a project swaps /projects for /project/[slug], and both render this
// component — as two different instances. Left alone the rail remounts at the
// top, so the backdrop jerks up to the first card while the scrim is still
// fading in, and dismissing the sheet lands you at the top of the list instead
// of on the card you opened. Only the board ↔ dossier hop is carried over;
// arriving from anywhere else still starts at the top.
const railRef = ref<HTMLElement | null>(null);
const router = useRouter();

function isProjectsFamily(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized === "/projects" || normalized.startsWith("/project/");
}

onMounted(() => {
  const saved = takeBoardScroll();
  if (saved) {
    railRef.value?.scrollTo({ top: saved, behavior: "auto" });
    // Card previews size themselves from their image's natural ratio, so the
    // rail can grow taller a frame or two after mount. Re-apply once that has
    // settled or a restore near the bottom of the list falls short.
    requestAnimationFrame(() => {
      railRef.value?.scrollTo({ top: saved, behavior: "auto" });
    });
  }

  if (!props.interactive) return;

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

// Before unmount, not after: the element is still in the document and the
// router has already resolved where we are headed.
onBeforeUnmount(() => {
  const top = railRef.value?.scrollTop ?? 0;
  if (top > 0 && isProjectsFamily(router.currentRoute.value.path)) {
    rememberBoardScroll(top);
  }
});

onUnmounted(() => {
  cleanupListeners?.();
});
</script>

<template>
  <div
    ref="railRef"
    class="projects-rail flex flex-col gap-8 py-5 pb-24 xl:h-full xl:overflow-y-auto"
  >
    <header class="flex max-w-3xl flex-col gap-3 pt-2">
      <span class="hud-label">// PROJECTS</span>
      <h1 class="hud-title">SELECTED WORK</h1>
      <p class="max-w-xl text-sm leading-relaxed text-[#a8a8a8]">
        A collection of web apps and projects I've collaborated on over the
        years, along with technical articles I'm proud of.
      </p>
    </header>

    <section aria-label="Selected work">
      <ul class="grid grid-cols-1 gap-5 md:grid-cols-2" role="list">
        <li
          v-for="(project, i) in projects"
          :key="project.slug"
          class="min-h-0"
          :ref="(el) => bindCard(el as Element | null, i)"
        >
          <ProjectsCard
            :project="project"
            :index="i"
            :total="totalWork"
            :focused="interactive && focusedIndex === i"
          />
        </li>
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
