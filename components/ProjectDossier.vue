<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import { buildProjectGallery, type GalleryFrame } from "~/utils/projectGallery";

/**
 * The dossier payload — demo reel or image gallery, then the written record.
 * Presentation-only: whatever shell it sits in (sheet, page) owns the chrome.
 */
const props = defineProps<{ project: ProjectPreview }>();

const hudKey = useHudNav();

const frames = ref<GalleryFrame[]>([]);
const videoFailed = ref(false);
const activeIndex = ref(0);
const demoVideo = ref<HTMLVideoElement | null>(null);

const hasVideo = computed(() => Boolean(props.project.video) && !videoFailed.value);
const galleryCount = computed(() => frames.value.length);
const counter = computed(() => `${activeIndex.value + 1}/${galleryCount.value}`);

const dossierCopy = computed(() => {
  if (props.project.dossier?.length) return props.project.dossier;
  return props.project.description
    ? [props.project.description]
    : ["No dossier payload on record."];
});

const dossierBeats = computed(() =>
  dossierCopy.value.map((text, index) => ({ index, text })),
);

function resetForProject() {
  frames.value = buildProjectGallery(
    props.project.slug,
    props.project.name,
    props.project.image,
  );
  videoFailed.value = false;
  activeIndex.value = 0;
}

resetForProject();

// The sheet keeps this component alive across the pager, so every piece of
// per-project state has to be rebuilt by hand when the slug changes.
watch(() => props.project.slug, resetForProject);

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
  frames.value = buildProjectGallery(props.project.slug, props.project.name);
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

async function startDemoIfReady() {
  await nextTick();
  if (hasVideo.value && !prefersReducedMotion()) void playDemo();
}

watch(hudKey, (key) => {
  if (key === "ArrowLeft") prevFrame();
  if (key === "ArrowRight") nextFrame();
});

watch(() => props.project.slug, startDemoIfReady);

onMounted(startDemoIfReady);

onBeforeUnmount(pauseDemo);
</script>

<template>
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
          :poster="project.image"
          muted
          loop
          playsinline
          preload="none"
          :aria-label="`${project.name} product demo`"
          @error="onVideoError"
        >
          <source :src="project.video" type="video/webm" />
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
            :key="`${project.slug}-${frame.index}`"
            class="project-gallery-slide"
          >
            <img
              :src="frame.src"
              :alt="`${project.name} ${frame.label}`"
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
        <div class="flex min-w-0 flex-1 items-center justify-between gap-3 px-3">
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
          // {{ project.name }}
        </h1>
        <p
          v-if="project.role"
          class="flex min-w-0 items-baseline gap-2 font-mono text-2xs uppercase leading-snug tracking-[0.18em]"
        >
          <span class="shrink-0 text-[#919191]">ROLE</span>
          <span class="text-[#67F57A]">{{ project.role }}</span>
        </p>
      </header>

      <div class="project-dossier px-4 py-4 xl:px-5">
        <div class="project-dossier-inner">
          <div class="project-dossier-main">
            <article
              v-for="beat in dossierBeats"
              :key="`${project.slug}-beat-${beat.index}`"
              class="project-dossier-beat flex flex-col gap-4"
            >
              <p
                class="project-dossier-copy text-base leading-relaxed text-[#c6c6c6]"
              >
                {{ beat.text }}
              </p>
            </article>
          </div>

          <div class="project-dossier-meta">
            <section
              v-if="project.tasks.length"
              class="project-dossier-beat flex flex-col gap-3"
              aria-label="Tasks"
            >
              <h2 class="hud-label">Tasks</h2>
              <ul class="flex flex-col gap-2" role="list">
                <li
                  v-for="task in project.tasks"
                  :key="task"
                  class="flex items-start gap-2 font-mono text-sm uppercase leading-relaxed tracking-wide text-[#e2e2e2]"
                >
                  <span class="mt-px text-[#67F57A]" aria-hidden="true">&gt;</span>
                  <span>{{ task }}</span>
                </li>
              </ul>
            </section>

            <section
              v-if="project.tech.length"
              class="project-dossier-beat flex flex-col gap-3"
              aria-label="Tech stack"
            >
              <h2 class="hud-label">Tech</h2>
              <ul class="flex flex-wrap gap-1.5" role="list">
                <li v-for="(item, ti) in project.tech" :key="item">
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
      </div>
    </section>
  </div>
</template>

<style scoped>
.project-dossier-panel {
  background-color: #0c0c0c;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.035) 0.5px, transparent 0.5px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 40%);
  background-size:
    3px 3px,
    100% 100%;
}

/* ~70 characters at the 16px reading size. The sheet body is a query
   container, so a wide panel (full mode) splits the record into prose plus a
   metadata rail instead of leaving half the sheet empty. */
.project-dossier-inner {
  display: flex;
  flex-direction: column;
  max-width: 620px;
}

.project-dossier-main,
.project-dossier-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

@container dossier (min-width: 860px) {
  .project-dossier-inner {
    display: grid;
    max-width: none;
    align-items: start;
    gap: 0 3rem;
    grid-template-columns: minmax(0, 620px) minmax(200px, 1fr);
  }
}

.project-dossier-beat {
  padding-bottom: 1.75rem;
}

/* Media band: capped so the written record stays reachable below it. */
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
  max-height: min(52vh, 520px);
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
