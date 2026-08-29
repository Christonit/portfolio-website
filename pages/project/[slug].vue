<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { isArticle } from "~/utils/projects";
import { projectCanonicalUrl, projectWorkNode } from "~/utils/projectSchema";
import { buildProjectGallery, type GalleryFrame } from "~/utils/projectGallery";
import { formatProjectName, pageTitle } from "~/utils/site";

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const hudKey = useHudNav();
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

const frames = ref<GalleryFrame[]>(
  buildProjectGallery(
    current.value.slug,
    current.value.name,
    current.value.image,
  ),
);

const demoVideo = ref<HTMLVideoElement | null>(null);
const videoFailed = ref(false);

const hasVideo = computed(
  () => Boolean(current.value.video) && !videoFailed.value,
);

const dossierCopy = computed(() => {
  if (current.value.dossier?.length) return current.value.dossier;
  return current.value.description
    ? [current.value.description]
    : ["No dossier payload on record."];
});

const dossierBeats = computed(() =>
  dossierCopy.value.map((text, index) => ({
    index,
    text,
  })),
);

const visitUrl = computed(() => current.value.link?.trim() || "");
const galleryCount = computed(() => frames.value.length);

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

const pageRef = ref<HTMLElement | null>(null);
const activeIndex = ref(0);

const counter = computed(
  () => `${activeIndex.value + 1}/${galleryCount.value}`,
);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function goToFrame(index: number) {
  const total = galleryCount.value;
  if (total <= 0) return;

  activeIndex.value = ((index % total) + total) % total;
}

function prevFrame() {
  goToFrame(activeIndex.value - 1);
}

function nextFrame() {
  goToFrame(activeIndex.value + 1);
}

function onFrameError(frame: GalleryFrame) {
  if (frame.isPlaceholder) return;
  frames.value = buildProjectGallery(current.value.slug, current.value.name);
}

function onVideoError() {
  videoFailed.value = true;
}

type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

async function expandDemo() {
  const el = demoVideo.value as WebkitVideo | null;
  if (!el) return;
  try {
    if (typeof el.webkitEnterFullscreen === "function") {
      el.webkitEnterFullscreen();
      return;
    }
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    }
  } catch {
    /* Fullscreen can be blocked outside a user gesture. */
  }
}

async function playDemo() {
  const el = demoVideo.value;
  if (!el) return;
  try {
    await el.play();
  } catch {
    /* Autoplay can be blocked; the reel stays muted and silent. */
  }
}

function pauseDemo() {
  demoVideo.value?.pause();
}

function scrollPage(direction: 1 | -1) {
  pageRef.value?.scrollBy({
    top: direction * 140,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

watch(hudKey, (key) => {
  if (!key) return;
  if (key === "ArrowLeft") prevFrame();
  if (key === "ArrowRight") nextFrame();
  if (key === "ArrowDown") scrollPage(1);
  if (key === "ArrowUp") scrollPage(-1);
});

onMounted(async () => {
  await nextTick();
  if (hasVideo.value && !prefersReducedMotion()) {
    void playDemo();
  }
});

onBeforeUnmount(() => {
  pauseDemo();
});
</script>

<template>
  <div
    ref="pageRef"
    class="project-page flex min-h-0 flex-col gap-3 overflow-visible py-4 xl:flex-1 xl:gap-4 xl:overflow-y-auto xl:py-5"
  >
    <div class="flex shrink-0 items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <!-- The breadcrumb is the only way back out; the global nav covers the rest. -->
        <nav class="min-w-0" aria-label="Breadcrumb">
          <ol
            class="flex min-h-11 min-w-0 items-center gap-2 font-mono text-2xs uppercase tracking-[0.18em] text-[#919191]"
          >
            <li>
              <NuxtLink
                to="/projects"
                data-nav-back
                class="transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
              >
                PROJECTS
              </NuxtLink>
            </li>
            <li aria-hidden="true">/</li>
            <li class="truncate text-white">{{ current.name }}</li>
          </ol>
        </nav>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <a
          v-if="visitUrl"
          :href="visitUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="font-mono text-2xs uppercase tracking-[0.18em] text-[#67F57A] hover:text-white xl:text-2xs"
        >
          VISIT_PROJECT
        </a>

        <!-- The dossier sits on top of /projects as a sheet, so it also gets
             the dismiss affordance a sheet is expected to have. -->
        <NuxtLink
          to="/projects"
          data-nav-back
          class="flex h-11 w-11 items-center justify-center border border-white/25 text-[#919191] transition-colors hover:border-[#67F57A] hover:text-[#67F57A] focus-visible:border-[#67F57A] focus-visible:text-[#67F57A] focus-visible:outline-none xl:h-10 xl:w-10"
          aria-label="Close project"
        >
          <span
            class="material-symbols-outlined icon-md leading-none"
            aria-hidden="true"
            >close</span
          >
        </NuxtLink>
      </div>
    </div>

    <div
      class="project-shell relative flex flex-col overflow-visible border border-white/25"
    >
      <div class="corner-tl-w" />
      <div class="corner-tr-w" />
      <div class="corner-bl-w" />
      <div class="corner-br-w" />

      <section
        class="relative flex flex-col border-b border-white/15"
        :aria-roledescription="hasVideo ? undefined : 'carousel'"
        :aria-label="hasVideo ? 'Project demo video' : 'Project image gallery'"
      >
        <div
          class="project-gallery-stage relative bg-black"
          :class="
            hasVideo
              ? 'project-gallery-stage--video overflow-hidden'
              : 'project-gallery-stage--images overflow-hidden'
          "
        >
          <video
            v-if="hasVideo"
            ref="demoVideo"
            class="project-demo-video"
            :poster="current.image"
            muted
            loop
            playsinline
            preload="none"
            :aria-label="`${current.name} product demo`"
            @error="onVideoError"
          >
            <source :src="current.video" type="video/webm" />
          </video>
          <button
            v-if="hasVideo"
            type="button"
            class="project-demo-expand flex"
            aria-label="Maximize video"
            @click="expandDemo"
          >
            <span class="material-symbols-outlined icon-md leading-none"
              >fullscreen</span
            >
            <span>MAX</span>
          </button>
          <div
            v-else
            class="project-gallery-track"
            :style="{ '--active-i': activeIndex }"
          >
            <figure
              v-for="frame in frames"
              :key="`${current.slug}-${frame.index}`"
              class="project-gallery-slide"
            >
              <img
                :src="frame.src"
                :alt="`${current.name} ${frame.label}`"
                draggable="false"
                @error="onFrameError(frame)"
              />
            </figure>
          </div>
          <div
            v-if="!hasVideo"
            class="pointer-events-none absolute inset-0 scanline-overlay opacity-40"
          />
        </div>

        <div
          v-if="!hasVideo"
          class="flex shrink-0 items-stretch border-t border-white/20"
        >
          <button
            type="button"
            class="flex min-h-11 min-w-11 items-center justify-center border-r border-white/20 text-lg text-white transition-colors hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none xl:min-h-12 xl:min-w-12"
            aria-label="Previous image"
            @click="prevFrame"
          >
            &lt;
          </button>
          <button
            type="button"
            class="flex min-h-11 min-w-11 items-center justify-center border-r border-white/20 text-lg text-white transition-colors hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none xl:min-h-12 xl:min-w-12"
            aria-label="Next image"
            @click="nextFrame"
          >
            &gt;
          </button>
          <div
            class="flex min-w-0 flex-1 items-center justify-between gap-3 px-3"
          >
            <span
              class="font-mono text-2xs uppercase tracking-[0.28em] text-[#919191]"
            >
              IMAGES
            </span>
            <span
              class="font-mono text-xs tabular-nums tracking-[0.18em] text-white"
              aria-live="polite"
            >
              {{ counter }}
            </span>
          </div>
        </div>
      </section>

      <section
        class="project-dossier-panel relative flex flex-col"
        aria-label="Project dossier"
      >
        <header
          class="flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-white/10 px-4 py-4 xl:px-5"
        >
          <h1
            class="font-mono text-sm uppercase leading-snug tracking-[0.12em] text-white xl:text-sm"
          >
            // {{ current.name }}
          </h1>
          <p
            v-if="current.role"
            class="flex min-w-0 items-baseline gap-2 font-mono text-2xs uppercase leading-snug tracking-[0.18em]"
          >
            <span class="shrink-0 text-[#919191]">ROLE</span>
            <span class="text-[#67F57A]">{{ current.role }}</span>
          </p>
        </header>

        <div class="project-dossier px-4 py-4 xl:px-5">
          <div class="project-dossier-inner flex flex-col">
            <article
              v-for="beat in dossierBeats"
              :key="`${current.slug}-beat-${beat.index}`"
              class="project-dossier-beat flex flex-col gap-4"
            >
              <p
                class="project-dossier-copy text-base leading-relaxed text-[#c6c6c6]"
              >
                {{ beat.text }}
              </p>
            </article>

            <section
              v-if="current.tasks.length"
              class="project-dossier-beat flex flex-col gap-3"
              aria-label="Tasks"
            >
              <h2 class="hud-label">Tasks</h2>
              <ul class="flex flex-col gap-2" role="list">
                <li
                  v-for="task in current.tasks"
                  :key="task"
                  class="flex items-start gap-2 font-mono text-sm uppercase leading-relaxed tracking-wide text-[#e2e2e2]"
                >
                  <span class="mt-px text-[#67F57A]" aria-hidden="true"
                    >&gt;</span
                  >
                  <span>{{ task }}</span>
                </li>
              </ul>
            </section>

            <section
              v-if="current.tech.length"
              class="project-dossier-beat flex flex-col gap-3"
              aria-label="Tech stack"
            >
              <h2 class="hud-label">Tech</h2>
              <ul class="flex flex-wrap gap-1.5" role="list">
                <li v-for="(item, ti) in current.tech" :key="item">
                  <span
                    class="inline-flex items-center border px-1.5 py-1 font-mono text-2xs uppercase tracking-[0.14em]"
                    :class="
                      ti === 0
                        ? 'border-[#67F57A] text-[#67F57A]'
                        : 'border-[#3a3a3a] text-[#e2e2e2]'
                    "
                  >
                    {{ item }}
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </div>

    <!-- Phones and tablets keep the inline bar at the end of the dossier. -->
    <nav
      v-if="prevProject && nextProject"
      class="project-pager mb-8 flex shrink-0 items-stretch border border-white/25 xl:hidden"
      aria-label="Project navigation"
    >
      <NuxtLink
        :to="`/project/${prevProject.slug}`"
        data-nav-direction="back"
        class="project-pager-arrow border-r border-white/20"
        :aria-label="`Previous project: ${prevProject.name}`"
      >
        &lt;
      </NuxtLink>
      <div class="flex min-w-0 flex-1 items-center justify-between gap-3 px-3">
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
        class="project-pager-arrow border-l border-white/20"
        :aria-label="`Next project: ${nextProject.name}`"
      >
        &gt;
      </NuxtLink>
    </nav>

    <!-- Desktop floats the pager in the empty gutters either side of the
         800px rail, so both destinations and the current slot stay on
         screen without scrolling to the bottom of the dossier. -->
    <div v-if="prevProject && nextProject" class="hidden xl:block">
      <nav class="project-pager-float" aria-label="Project navigation">
        <NuxtLink
          :to="`/project/${prevProject.slug}`"
          data-nav-direction="back"
          class="project-pager-card project-pager-card--prev"
          :aria-label="`Previous project: ${prevProject.name}`"
        >
          <span class="project-pager-card-arrow" aria-hidden="true">&lt;</span>
          <span class="project-pager-card-meta">
            <span class="project-pager-card-kicker">PREV</span>
            <span class="project-pager-card-name">{{ prevProject.name }}</span>
          </span>
        </NuxtLink>

        <NuxtLink
          :to="`/project/${nextProject.slug}`"
          class="project-pager-card project-pager-card--next"
          :aria-label="`Next project: ${nextProject.name}`"
        >
          <span class="project-pager-card-meta">
            <span class="project-pager-card-kicker">NEXT</span>
            <span class="project-pager-card-name">{{ nextProject.name }}</span>
          </span>
          <span class="project-pager-card-arrow" aria-hidden="true">&gt;</span>
        </NuxtLink>
      </nav>

      <p class="project-pager-status" aria-hidden="true">
        <span class="project-pager-status-name">{{ current.name }}</span>
        <span class="project-pager-status-count">{{ projectCounter }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Same rail width as the home, projects, and bio pages. */
.project-page {
  width: min(800px, calc(100% - 32px));
  margin-inline: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.project-page::-webkit-scrollbar {
  display: none;
}

@media (max-width: 639px) {
  .project-page {
    width: min(800px, calc(100% - 24px));
  }
}

.project-pager-arrow {
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

.project-pager-arrow:hover,
.project-pager-arrow:focus-visible {
  background: #fff;
  color: #000;
  outline: none;
}

@media (min-width: 1280px) {
  .project-pager-arrow {
    min-height: 48px;
    min-width: 48px;
  }
}

/* ── Desktop floating pager ──────────────────────────────────────
   Fixed to the viewport gutters (240px+ of dead space either side of
   the 800px rail at 1280px), vertically centred so both destinations
   read at a glance instead of hiding below the fold. */
.project-pager-float > .project-pager-card {
  position: fixed;
  top: 50%;
  z-index: 40;
  display: flex;
  max-width: 172px;
  transform: translateY(-50%);
  align-items: center;
  gap: 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(11, 11, 11, 0.82);
  padding: 0.6rem 0.7rem;
  backdrop-filter: blur(6px);
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.project-pager-card--prev {
  left: 1.25rem;
}

.project-pager-card--next {
  right: 1.25rem;
  text-align: right;
}

.project-pager-card:hover,
.project-pager-card:focus-visible {
  border-color: #fff;
  background: #fff;
  outline: none;
}

.project-pager-card-arrow {
  flex-shrink: 0;
  min-width: 24px;
  color: #fff;
  font-size: var(--text-lg);
  line-height: 1;
  text-align: center;
}

.project-pager-card-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.2rem;
}

.project-pager-card-kicker {
  color: #919191;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.22em;
  line-height: 1;
  text-transform: uppercase;
}

.project-pager-card-name {
  color: #fff;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  line-height: 1.25;
  text-transform: uppercase;
}

.project-pager-card:hover .project-pager-card-arrow,
.project-pager-card:hover .project-pager-card-kicker,
.project-pager-card:hover .project-pager-card-name,
.project-pager-card:focus-visible .project-pager-card-arrow,
.project-pager-card:focus-visible .project-pager-card-kicker,
.project-pager-card:focus-visible .project-pager-card-name {
  color: #000;
}

/* Current slot readout — parked in the right gutter so it never sits on
   top of the reading column. Informational only, never intercepts clicks. */
.project-pager-status {
  position: fixed;
  right: 1.25rem;
  bottom: 1.5rem;
  z-index: 40;
  display: flex;
  max-width: 190px;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(11, 11, 11, 0.82);
  padding: 0.4rem 0.6rem;
  backdrop-filter: blur(6px);
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.18em;
  line-height: 1;
  text-transform: uppercase;
}

.project-pager-status-name {
  overflow: hidden;
  color: #e2e2e2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-pager-status-count {
  flex-shrink: 0;
  color: #919191;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .project-pager-float > .project-pager-card {
    transition: none;
  }
}

.project-dossier-panel {
  background-color: #0c0c0c;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.035) 0.5px, transparent 0.5px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 40%);
  background-size:
    3px 3px,
    100% 100%;
}

/* Cap the measure now that the dossier spans the full page width.
   ~70 characters at the 16px reading size. */
.project-dossier-inner {
  max-width: 620px;
}

.project-dossier-beat {
  padding-bottom: 1.75rem;
}

/* Full-bleed media band: capped so the dossier stays reachable below it. */
.project-gallery-stage--images {
  aspect-ratio: 16 / 9;
}

/* Phones get the reel at its native aspect; the wide crop is a desktop-only cap. */
.project-gallery-stage--video {
  aspect-ratio: 960 / 690;
}

@media (min-width: 1280px) {
  .project-gallery-stage--video {
    aspect-ratio: 16 / 9;
  }
}

.project-gallery-stage--images,
.project-gallery-stage--video {
  max-height: min(70vh, 620px);
}

.project-gallery-track {
  display: flex;
  flex-direction: column;
  height: 100%;
  will-change: transform;
  transform: translateY(calc(var(--active-i, 0) * -100%));
  transition: transform var(--duration-fast, 250ms)
    var(--ease-smooth-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.project-gallery-slide {
  flex: 0 0 100%;
  height: 100%;
  margin: 0;
}

.project-gallery-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.project-demo-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  background: #000;
  pointer-events: none;
}

.project-demo-video:fullscreen,
.project-demo-video:-webkit-full-screen {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  pointer-events: auto;
}

.project-demo-expand {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  z-index: 2;
  min-height: 44px;
  min-width: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(0, 0, 0, 0.72);
  padding: 0 0.7rem;
  color: #e2e2e2;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--text-2xs);
  font-weight: 600;
  letter-spacing: 0.18em;
  line-height: 1;
}

.project-demo-expand:hover,
.project-demo-expand:focus-visible {
  background: #fff;
  color: #000;
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .project-gallery-track {
    transition: none;
  }
}
</style>
