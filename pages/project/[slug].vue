<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { isArticle } from "~/utils/projects";
import { projectCanonicalUrl, projectWorkNode } from "~/utils/projectSchema";
import {
  closeProjectSheet,
  projectPagerNeighbour,
  projectSheetStepFor,
  useProjectPager,
  type PagerDirection,
} from "~/composables/useProjectSheet";
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

/* The rails read their neighbours off the pager itself, so the href a rail
   advertises and the destination a click actually lands on can't drift apart. */
const prevProject = computed(() =>
  projectPagerNeighbour(current.value.slug, -1),
);
const nextProject = computed(() =>
  projectPagerNeighbour(current.value.slug, 1),
);

/* Which way the pager was heading when it sent us here, so the dossier can
   arrive from that side on the site's page-navigation motion. */
const pagerStep = projectSheetStepFor(current.value.slug);

/* The rails show the press for every control that steps the pager, including
   the header keys — so a click on the rail has to announce itself the same
   way rather than relying on :active, which the route change cuts short. */
const { pressed: pagerPressed, step: stepPager } = useProjectPager();

/**
 * The rails stay real links — crawlable, and still openable in a new tab — but
 * a plain click is handed to the pager rather than followed, because the href
 * is only ever right for the dossier currently on screen. Spam it and the
 * later presses are still aiming at a page you have already left; the pager is
 * the thing that knows where "next" actually is by then.
 */
function onRailClick(event: MouseEvent, direction: PagerDirection) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  stepPager(direction);
}

// ── Dismissal ─────────────────────────────────────────────────────
// The sheet has to finish sliding away before the route swaps the board
// back in, so every exit — button, scrim, Escape, breadcrumb, browser
// back — is funnelled through the same leave guard.
//
// The guard waits on the sheet's own `closed` event rather than a duration
// copied from the CSS: the animation only starts once Vue has flushed the
// `closing` flag to the DOM, so a matching timer always fires a frame or two
// early and cuts the tail off the dismissal. The timeout is a backstop for
// the case where the animation never runs at all.
const SHEET_EXIT_TIMEOUT_MS = 600;
const closing = ref(false);
let resolveExit: (() => void) | null = null;

function close() {
  if (closing.value) return;
  router.push("/projects");
}

function onSheetClosed() {
  resolveExit?.();
  resolveExit = null;
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
    await new Promise<void>((resolve) => {
      resolveExit = resolve;
      setTimeout(resolve, SHEET_EXIT_TIMEOUT_MS);
    });
    resolveExit = null;
  }

  return true;
});
</script>

<template>
  <div class="project-route">
    <!-- The board is the backdrop, not a second copy of the page: inert, so
         focus and clicks stay inside the sheet. It marks nothing — the card
         behind the panel used to light up green, which the dismissal then
         uncovered for a moment before the route swap wiped it. -->
    <ProjectsBoard :interactive="false" inert />

    <ProjectSheet
      :label="`${current.name} — project dossier`"
      :closing="closing"
      :step="pagerStep"
      @close="close"
      @closed="onSheetClosed"
    >
      <template #title>
        <h1
          class="truncate font-mono text-xs uppercase tracking-[0.14em] text-white"
        >
          // {{ current.name }}
        </h1>
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

      <!-- Project navigation lives in the gutters either side of the panel,
           so stepping through the work never costs a scroll to the bottom. -->
      <template v-if="prevProject && nextProject" #nav="{ entering }">
        <NuxtLink v-slot="{ href }" :to="`/project/${prevProject.slug}`" custom>
          <a
            :href="href"
            class="project-nav project-nav--prev"
            :class="{
              'is-closing': closing,
              'is-entering': entering,
              'is-pressed': pagerPressed === 'prev',
            }"
            :aria-label="`Previous project: ${prevProject.name}`"
            @click="onRailClick($event, 'prev')"
          >
            &lt;
          </a>
        </NuxtLink>
        <NuxtLink v-slot="{ href }" :to="`/project/${nextProject.slug}`" custom>
          <a
            :href="href"
            class="project-nav project-nav--next"
            :class="{
              'is-closing': closing,
              'is-entering': entering,
              'is-pressed': pagerPressed === 'next',
            }"
            :aria-label="`Next project: ${nextProject.name}`"
            @click="onRailClick($event, 'next')"
          >
            &gt;
          </a>
        </NuxtLink>
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

.project-nav {
  position: fixed;
  /* Above the sheet panel (z-55), which on mobile rises to the top edge and
     would otherwise paint over these rails. */
  z-index: 56;
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(11, 11, 11, 0.82);
  color: #fff;
  font-size: var(--text-lg);
  line-height: 1;
  /* Carried as a variable because the desktop rails also hold a centring
     translate, and the press has to compose with it rather than replace it. */
  --nav-press-scale: 1;
  transform: scale(var(--nav-press-scale));
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 100ms ease,
    opacity var(--sheet-out-fade-dur, 160ms) var(--sheet-fade-ease, ease);
}

/* The press flash, on the same clock and the same squeeze as the header keys.
   It fires for a click on the rail and for the header keys and arrow keys
   alike — whatever you press, the arrows that mean "next project" are what
   move. */
.project-nav.is-pressed {
  --nav-press-scale: 0.9;
  border-color: #fff;
}

/* The rails belong to the sheet's entrance, so they run on its clock and land
   after the panel has settled. Only when the sheet is actually arriving: the
   pager remounts this page on every step, and without the guard the arrows
   would blink each time the dossier under them changed. */
.project-nav.is-entering {
  animation: project-nav-in var(--sheet-in-fade-dur, 200ms)
    var(--sheet-fade-ease, ease) var(--sheet-in-fade-dur, 200ms) both;
}

/* Below the desktop breakpoint the panel is full-bleed, so the rails drop to
   the bottom corners rather than sitting on top of the reading column. */
.project-nav--prev {
  bottom: 5rem;
  left: 0.75rem;
}

.project-nav--next {
  right: 0.75rem;
  bottom: 5rem;
}

@media (min-width: 1280px) {
  .project-nav {
    top: 50%;
    bottom: auto;
    transform: translateY(-50%) scale(var(--nav-press-scale));
  }

  .project-nav--prev {
    left: max(1.25rem, calc((100vw - 1160px) / 4 - 1.375rem));
  }

  .project-nav--next {
    right: max(1.25rem, calc((100vw - 1160px) / 4 - 1.375rem));
  }
}

.project-nav:hover,
.project-nav:focus-visible {
  border-color: #fff;
  background: #fff;
  color: #000;
  outline: none;
}

/* The rails belong to the sheet, so they leave with it. */
.project-nav.is-closing {
  opacity: 0;
  pointer-events: none;
}

@keyframes project-nav-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-nav,
  .project-nav.is-entering {
    transition: none;
    animation: none;
  }

  /* The press keeps its border change, drops the squeeze. */
  .project-nav.is-pressed {
    --nav-press-scale: 1;
  }
}
</style>
