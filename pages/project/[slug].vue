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
const beatCount = computed(() => dossierBeats.value.length);
const gallerySteps = computed(() => Math.max(galleryCount.value - 1, 1));

const projectPageRef = ref<HTMLElement | null>(null);
const dossierRef = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const cssScrollDriven = ref(false);

const counter = computed(
  () => `${activeIndex.value + 1}/${galleryCount.value}`,
);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function detectCssScrollDriven() {
  if (prefersReducedMotion()) return false;
  const namedTimeline =
    CSS.supports("animation-timeline: --dossier") ||
    CSS.supports("animation-timeline", "--dossier");
  const scope =
    CSS.supports("timeline-scope: --dossier") ||
    CSS.supports("timeline-scope", "--dossier");
  return namedTimeline && scope;
}

function syncIndexFromScroll() {
  const el = dossierRef.value;
  const total = beatCount.value;
  if (!el || total <= 1) {
    activeIndex.value = 0;
    return;
  }

  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) {
    activeIndex.value = 0;
    return;
  }

  const t = el.scrollTop / max;
  const next = Math.min(
    total - 1,
    Math.max(0, Math.floor(t * (total - 1) + 1e-6)),
  );
  activeIndex.value = next;
}

function goToFrame(index: number) {
  const total = beatCount.value;
  if (total <= 0) return;

  const next = ((index % total) + total) % total;
  const el = dossierRef.value;

  if (!el) {
    activeIndex.value = next;
    return;
  }

  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  const top = total <= 1 ? 0 : (next / (total - 1)) * max;
  el.scrollTo({
    top,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  activeIndex.value = next;
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

function scrollDossier(direction: 1 | -1) {
  const page = projectPageRef.value;
  const dossier = dossierRef.value;
  if (!dossier) return;

  const behavior = prefersReducedMotion() ? "auto" : "smooth";

  if (page) {
    const pageRect = page.getBoundingClientRect();
    const dossierRect = dossier.getBoundingClientRect();
    const pageCanScrollDown =
      page.scrollTop + page.clientHeight < page.scrollHeight - 1;
    const pageCanScrollUp = page.scrollTop > 1;
    const dossierExtendsBelowPage = dossierRect.bottom > pageRect.bottom + 1;

    if (
      (direction === 1 && pageCanScrollDown && dossierExtendsBelowPage) ||
      (direction === -1 && dossier.scrollTop <= 1 && pageCanScrollUp)
    ) {
      page.scrollBy({ top: direction * 140, behavior });
      return;
    }
  }

  dossier.scrollBy({
    top: direction * 140,
    behavior,
  });
}

watch(hudKey, (key) => {
  if (!key) return;
  if (key === "ArrowLeft") prevFrame();
  if (key === "ArrowRight") nextFrame();
  if (key === "ArrowDown") scrollDossier(1);
  if (key === "ArrowUp") scrollDossier(-1);
});

onMounted(async () => {
  cssScrollDriven.value = detectCssScrollDriven();
  syncIndexFromScroll();
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
    ref="projectPageRef"
    class="project-page flex min-h-0 flex-col gap-3 overflow-visible px-4 py-4 xl:h-full xl:gap-4 xl:overflow-y-auto xl:px-8 xl:py-5"
    :style="{
      '--gallery-count': galleryCount,
      '--gallery-steps': gallerySteps,
    }"
  >
    <nav
      class="flex shrink-0 items-center justify-between gap-3"
      aria-label="Project navigation"
    >
      <ol
        class="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#919191]"
      >
        <li class="xl:hidden">
          <NuxtLink
            to="/projects"
            data-nav-back
            class="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black"
            aria-label="Back to projects"
          >
            &lt;
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/projects"
            data-nav-back
            class="hidden hover:text-white xl:inline"
          >
            PROJECTS
          </NuxtLink>
        </li>
        <li aria-hidden="true">/</li>
        <li class="truncate text-white">{{ current.name }}</li>
      </ol>

      <div class="flex shrink-0 items-center gap-2">
        <a
          v-if="visitUrl"
          :href="visitUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center font-mono text-[9px] uppercase tracking-[0.18em] text-[#67F57A] hover:text-white focus-visible:text-white focus-visible:underline md:text-[10px]"
          aria-label="Visit project"
        >
          <span class="md:hidden">VISIT</span>
          <span class="hidden md:inline">VISIT_PROJECT</span>
        </a>
        <NuxtLink
          to="/projects"
          data-nav-back
          class="project-close"
          aria-label="Close project and return to projects"
        >
          <span
            class="material-symbols-outlined text-[18px] leading-none"
            aria-hidden="true"
          >
            close
          </span>
          <span class="hidden sm:inline">CLOSE</span>
        </NuxtLink>
      </div>
    </nav>

    <div
      class="project-shell mb-8 relative grid overflow-visible border border-white/25"
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
              ? 'project-gallery-stage--video'
              : 'min-h-[220px] overflow-hidden xl:aspect-video xl:min-h-0'
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
            class="project-demo-expand flex xl:hidden"
            aria-label="Maximize video"
            @click="expandDemo"
          >
            <span class="material-symbols-outlined text-[20px] leading-none"
              >fullscreen</span
            >
            <span>MAX</span>
          </button>
          <div
            v-else
            class="project-gallery-track"
            :class="{ 'is-js-gallery': !cssScrollDriven }"
            :style="{
              '--active-i': activeIndex,
              ...(cssScrollDriven
                ? {
                    animationTimingFunction: `steps(${gallerySteps}, end)`,
                  }
                : {}),
            }"
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
              class="font-mono text-[10px] uppercase tracking-[0.28em] text-[#919191]"
            >
              IMAGES
            </span>
            <span
              class="font-mono text-[11px] tabular-nums tracking-[0.18em] text-white"
              aria-live="polite"
            >
              {{ counter }}
            </span>
          </div>
        </div>
      </section>

      <section
        class="project-dossier-panel relative flex flex-col xl:h-[38vh] xl:max-h-[420px] xl:min-h-[280px]"
        aria-label="Project dossier"
      >
        <header class="shrink-0 border-b border-white/10 px-4 py-4 xl:px-5">
          <h1
            class="font-mono text-[13px] uppercase leading-snug tracking-[0.12em] text-white xl:text-sm"
          >
            // {{ current.name }}
          </h1>
        </header>

        <div
          ref="dossierRef"
          class="project-dossier overflow-visible px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:px-5"
          @scroll.passive="syncIndexFromScroll"
        >
          <div class="project-dossier-inner flex flex-col pr-2">
            <article
              v-for="beat in dossierBeats"
              :key="`${current.slug}-beat-${beat.index}`"
              class="project-dossier-beat flex flex-col gap-4"
            >
              <p
                class="project-dossier-copy font-mono text-base leading-relaxed tracking-wide text-[#c6c6c6]"
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
                  class="flex items-start gap-2 font-mono text-base uppercase leading-relaxed tracking-wide text-[#e2e2e2]"
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
                    class="inline-flex items-center border px-1.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
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
  </div>
</template>

<style scoped>
.project-page {
  width: 100%;
  max-width: 1000px;
  margin-inline: auto;
}

@media (min-width: 1280px) {
  .project-page {
    height: calc(100vh - 132px);
    max-height: calc(100vh - 132px);
  }
}

.project-close {
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding-inline: 0.75rem;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  line-height: 1;
  text-transform: uppercase;
  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    color 150ms ease;
}

.project-close:hover,
.project-close:focus-visible {
  border-color: #67f57a;
  background: #67f57a;
  color: #071008;
  outline: none;
}

.project-shell {
  timeline-scope: --dossier;
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

.project-dossier {
  scroll-timeline-name: --dossier;
  scroll-timeline-axis: block;
  scrollbar-width: auto;
  scrollbar-color: #ffffff #1a1a1a;
}

.project-dossier::-webkit-scrollbar {
  width: 10px;
}

.project-dossier::-webkit-scrollbar-track {
  background: #141414;
  border-left: 1px solid #2a2a2a;
}

.project-dossier::-webkit-scrollbar-thumb {
  background: #ffffff;
}

.project-dossier-inner {
  min-height: auto;
}

.project-dossier-beat {
  min-height: 0;
  padding-bottom: 1.75rem;
}

@media (min-width: 1280px) {
  .project-dossier-inner {
    min-height: 100%;
  }

  .project-dossier-beat {
    min-height: 78%;
  }
}

.project-gallery-track {
  display: flex;
  flex-direction: column;
  height: 100%;
  will-change: transform;
  animation-name: project-gallery-shift;
  animation-duration: 1ms;
  animation-fill-mode: both;
  animation-timeline: --dossier;
  animation-range: 0% 100%;
}

.project-gallery-track.is-js-gallery {
  animation: none;
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

.project-gallery-stage--video {
  flex: 0 0 auto;
  overflow: visible;
}

.project-demo-video {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
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
  font-size: 10px;
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

@keyframes project-gallery-shift {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(calc(var(--gallery-steps) * -100%));
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-gallery-track {
    animation: none !important;
    transition: none !important;
    transform: translateY(calc(var(--active-i, 0) * -100%));
  }
}
</style>
