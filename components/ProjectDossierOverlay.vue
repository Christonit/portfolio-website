<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { isArticle } from "~/utils/projects";
import { projectCanonicalUrl, projectWorkNode } from "~/utils/projectSchema";
import {
  dossierDismissalNavigation,
  isDossierPath,
  restoreDossierFocus,
  useDossierBackground,
  useDossierClosing,
} from "~/composables/useDossierBackground";
import {
  closeProjectSheet,
  projectPagerNeighbour,
  projectSheetStepFor,
  useProjectPager,
  type PagerDirection,
} from "~/composables/useProjectSheet";
import { formatProjectName, pageTitle } from "~/utils/site";

/**
 * The dossier sheet, mounted at app level rather than as a page.
 *
 * The sheet is a layer over whatever page you were on — `app.vue` keeps that
 * page rendered underneath (see `useDossierBackground`) — so the thing that
 * draws the sheet cannot be a page component, or opening one would swap the
 * page it is supposed to be sitting on top of.
 *
 * Mounted only while the URL is a dossier, so its head — title, canonical,
 * schema — is scoped to exactly that window and the page underneath gets its
 * own back the moment the sheet goes.
 */
const route = useRoute();
const router = useRouter();
const projects = projectsJson as ProjectPreview[];
const background = useDossierBackground();
const closing = useDossierClosing();
closing.value = false;
const previouslyFocused =
  import.meta.client && document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;

const slug = computed(() => {
  const match = /^\/project\/([^/]+)\/?$/.exec(route.path);
  return match ? match[1] : null;
});

const project = computed(() =>
  projects.find((item) => item.slug === slug.value && !isArticle(item)),
);

/* Unknown slugs are turned away by the page's `validate`, so by the time this
   renders there is always a project. The guard is for the frame between a
   rejected navigation and the error page taking over. */
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

const visitUrl = computed(() => current.value?.link?.trim() || "");

/* The rails read their neighbours off the pager itself, so the href a rail
   advertises and the destination a click actually lands on can't drift apart. */
const prevProject = computed(() =>
  current.value ? projectPagerNeighbour(current.value.slug, -1) : null,
);
const nextProject = computed(() =>
  current.value ? projectPagerNeighbour(current.value.slug, 1) : null,
);

/* Which way the pager was heading when it sent us here, so the dossier can
   arrive from that side on the site's page-navigation motion. Recomputed per
   slug rather than read once: this component outlives a pager step, and the
   sheet it keys open reads the direction as it mounts. */
const pagerStep = computed(() =>
  current.value ? projectSheetStepFor(current.value.slug) : null,
);

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
// The sheet has to finish sliding away before the URL leaves the dossier, so
// every exit — button, scrim, Escape, breadcrumb, browser back — is funnelled
// through the same leave guard.
//
// A global guard rather than `onBeforeRouteLeave`: this component is mounted
// beside the router view, not inside it, so it has no route record of its own
// to hang a leave hook on. It unregisters with the sheet.
//
// The guard waits on the sheet's own `closed` event rather than a duration
// copied from the CSS: the animation only starts once Vue has flushed the
// `closing` flag to the DOM, so a matching timer always fires a frame or two
// early and cuts the tail off the dismissal. The timeout is a backstop for
// the case where the animation never runs at all.
const SHEET_EXIT_TIMEOUT_MS = 600;
let resolveExit: (() => void) | null = null;

/* Dismissal lands back on the page the sheet was opened over — the home page
   when that is where you clicked the card, and the board otherwise. */
function close() {
  if (closing.value) return;
  const navigation = dossierDismissalNavigation(background.value);
  if (navigation.type === "back") {
    router.back();
    return;
  }
  router.replace(navigation.to);
}

function onSheetClosed() {
  resolveExit?.();
  resolveExit = null;
}

if (import.meta.client) {
  const stopGuard = router.beforeEach(async (to, from) => {
    // The pager stays inside the sheet; only leaving the dossier dismisses it.
    if (!isDossierPath(from.path) || isDossierPath(to.path)) return true;

    closeProjectSheet();
    closing.value = true;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!reduced) {
      await new Promise<void>((resolve) => {
        resolveExit = resolve;
        setTimeout(resolve, SHEET_EXIT_TIMEOUT_MS);
      });
      resolveExit = null;
    }

    return true;
  });

  onBeforeUnmount(() => {
    stopGuard();
    closing.value = false;
    void restoreDossierFocus(previouslyFocused, nextTick);
  });
}
</script>

<template>
  <ProjectSheet
    v-if="current"
    :key="current.slug"
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
</template>

<style scoped>
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
   pager rekeys the sheet on every step, and without the guard the arrows
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

  /* Centred in the gutter beside the panel, off the same tokens the panel
     sizes from. Percentages track the fixed-position containing block, so the
     rails stay aligned without depending on viewport-unit centring math. */
  .project-nav--prev {
    left: max(
      calc(var(--dossier-gutter) / 2 - 1.375rem),
      calc((100% - var(--dossier-max-w)) / 4 - 1.375rem)
    );
  }

  .project-nav--next {
    right: max(
      calc(var(--dossier-gutter) / 2 - 1.375rem),
      calc((100% - var(--dossier-max-w)) / 4 - 1.375rem)
    );
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
