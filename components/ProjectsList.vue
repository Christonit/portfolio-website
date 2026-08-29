<script setup lang="ts">
import type { ProjectPreview } from "./ProjectTooltip.vue";
import {
  isArticle,
  isExternalProjectHref,
  projectHref,
} from "~/utils/projects";

export type Mission = ProjectPreview;

const props = defineProps<{
  missions: Mission[];
  focusedMission: number | null;
  refOffset: number;
  setItemRef: (el: HTMLElement | null, i: number) => void;
}>();

const CARD_WIDTH = 352;
const GAP = 12;
const VIEW_MARGIN = 12;
const HIDE_DELAY_MS = 200;

const isDesktop = ref(false);
const hoveredIndex = ref<number | null>(null);
const rowRefs = ref<(HTMLElement | null)[]>([]);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref<Record<string, string>>({
  left: "0px",
  top: "0px",
  width: `${CARD_WIDTH}px`,
  transformOrigin: "100% 50%",
});

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let resizeObserver: ResizeObserver | null = null;
let mediaQuery: MediaQueryList | null = null;
let applyMediaQuery: (() => void) | null = null;

const floatingIndex = computed(() => {
  if (!isDesktop.value) return null;
  if (hoveredIndex.value !== null) return hoveredIndex.value;
  return props.focusedMission;
});

const floatingMission = computed(() =>
  floatingIndex.value !== null ? props.missions[floatingIndex.value] : null,
);

const highlightedIndex = computed(() => {
  if (isDesktop.value) return floatingIndex.value;
  return null;
});

function objectId(i: number) {
  return `OBJ_${String(i + 1).padStart(3, "0")}`;
}

function rowAriaLabel(mission: Mission) {
  return isArticle(mission)
    ? `Read article ${mission.name} (opens in a new tab)`
    : `Open project ${mission.name}`;
}

function bindRow(el: Element | null, i: number) {
  const node = el instanceof HTMLElement ? el : null;
  rowRefs.value[i] = node;
  props.setItemRef(node, props.refOffset + i);
}

function readRootZoom() {
  const z = parseFloat(getComputedStyle(document.documentElement).zoom);
  return Number.isFinite(z) && z > 0 ? z : 1;
}

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function positionTooltip() {
  const i = floatingIndex.value;
  const row = i !== null ? rowRefs.value[i] : null;
  const card = tooltipRef.value;
  if (i === null || !row || !card) return;

  const zoom = readRootZoom();
  const rowRect = row.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardW = (cardRect.width || CARD_WIDTH) / zoom;
  const cardH = (cardRect.height || 480) / zoom;
  const vw = window.innerWidth / zoom;
  const vh = window.innerHeight / zoom;

  const rowLeft = rowRect.left / zoom;
  const rowRight = rowRect.right / zoom;
  const rowTop = rowRect.top / zoom;
  const rowH = rowRect.height / zoom;

  let left = rowLeft - GAP - cardW;
  let origin = "100% 50%";

  if (left < VIEW_MARGIN) {
    left = rowRight + GAP;
    origin = "0% 50%";
    if (left + cardW > vw - VIEW_MARGIN) {
      left = Math.max(VIEW_MARGIN, vw - cardW - VIEW_MARGIN);
    }
  }

  const maxTop = Math.max(VIEW_MARGIN, vh - cardH - VIEW_MARGIN);
  const top = Math.min(
    Math.max(VIEW_MARGIN, rowTop + rowH / 2 - cardH / 2),
    maxTop,
  );

  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${CARD_WIDTH}px`,
    transformOrigin: origin,
  };
}

function scheduleShow(i: number) {
  if (!isDesktop.value) return;
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (hoveredIndex.value === i) return;
  if (showTimer) clearTimeout(showTimer);

  const token = getComputedStyle(document.documentElement)
    .getPropertyValue("--tt-delay")
    .trim();
  const delay =
    hoveredIndex.value !== null || props.focusedMission !== null
      ? 0
      : parseFloat(token) || 80;

  showTimer = setTimeout(() => {
    hoveredIndex.value = i;
    showTimer = null;
  }, delay);
}

function scheduleHide() {
  if (!isDesktop.value) return;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  hideTimer = setTimeout(() => {
    hoveredIndex.value = null;
    hideTimer = null;
  }, HIDE_DELAY_MS);
}

function onEnterCard() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

watch(floatingIndex, async (i) => {
  if (i === null) return;
  await nextTick();
  positionTooltip();
});

watch(tooltipRef, (el) => {
  resizeObserver?.disconnect();
  if (!el) return;
  resizeObserver = new ResizeObserver(() => positionTooltip());
  resizeObserver.observe(el);
  positionTooltip();
});

onMounted(() => {
  mediaQuery = window.matchMedia("(min-width: 1280px)");
  applyMediaQuery = () => {
    if (!mediaQuery) return;
    isDesktop.value = mediaQuery.matches;
    if (!mediaQuery.matches) hoveredIndex.value = null;
  };
  applyMediaQuery();
  mediaQuery.addEventListener("change", applyMediaQuery);
  window.addEventListener("resize", positionTooltip);
  window.addEventListener("scroll", positionTooltip, true);
});

onUnmounted(() => {
  if (mediaQuery && applyMediaQuery) {
    mediaQuery.removeEventListener("change", applyMediaQuery);
  }
  window.removeEventListener("resize", positionTooltip);
  window.removeEventListener("scroll", positionTooltip, true);
  resizeObserver?.disconnect();
  clearTimers();
});
</script>

<template>
  <div
    class="order-1 xl:order-3 xl:flex xl:flex-col xl:flex-1 xl:min-h-0 lg:mb-0"
  >
    <h3 class="hud-label mb-2 xl:flex-shrink-0">
      PROJECTS
    </h3>
    <div class="xl:flex-1 xl:overflow-y-auto">
      <article
        v-for="(mission, i) in missions"
        :key="mission.slug"
        :ref="(el) => bindRow(el as Element | null, i)"
        :class="[
          'border-b border-[#474747]/20 lg:px-1 transition-colors group',
          highlightedIndex === i ? 'bg-[#2a2a2a]' : 'hover:bg-[#1f1f1f]/60',
        ]"
        @mouseenter="scheduleShow(i)"
        @mouseleave="scheduleHide"
        @focusin="scheduleShow(i)"
        @focusout="scheduleHide"
      >
        <NuxtLink
          :to="projectHref(mission)"
          :external="isExternalProjectHref(mission)"
          :target="isExternalProjectHref(mission) ? '_blank' : undefined"
          :rel="isExternalProjectHref(mission) ? 'noopener noreferrer' : undefined"
          :aria-label="rowAriaLabel(mission)"
          :aria-describedby="
            highlightedIndex === i ? `project-tt-${mission.slug}` : undefined
          "
          class="flex gap-2 lg:gap-3 py-2.5 no-underline cursor-pointer"
        >
          <div
            class="w-[2px] shrink-0 self-stretch transition-colors"
            :class="
              highlightedIndex === i
                ? 'bg-white'
                : 'bg-white/40 group-hover:bg-white'
            "
          />
          <div class="flex flex-col gap-1">
            <span
              class="text-title-ui block uppercase tracking-wider transition-colors"
              :class="
                highlightedIndex === i
                  ? 'text-white'
                  : 'text-[#e2e2e2] group-hover:text-white'
              "
            >
              {{ mission.name }}
            </span>
            <span
              class="text-label-data mt-0.5 uppercase text-[#919191]"
            >
              // {{ mission.tags }}
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>

    <Teleport to="body">
      <Transition name="project-tt">
        <div
          v-if="floatingMission && isDesktop"
          :id="`project-tt-${floatingMission.slug}`"
          :key="floatingMission.slug"
          ref="tooltipRef"
          class="project-tt-float fixed z-[9999] max-h-[90vh]"
          :style="tooltipStyle"
          @mouseenter="onEnterCard"
          @mouseleave="scheduleHide"
        >
          <ProjectTooltip
            :project="floatingMission"
            :object-id="objectId(floatingIndex ?? 0)"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.project-tt-enter-active {
  transition:
    opacity var(--tt-in-dur) var(--tt-in-ease),
    transform var(--tt-in-dur) var(--tt-in-ease);
  will-change: opacity, transform;
}

.project-tt-leave-active {
  transition:
    opacity var(--tt-out-dur) var(--tt-out-ease),
    transform var(--tt-out-dur) var(--tt-out-ease);
}

.project-tt-enter-from,
.project-tt-leave-to {
  opacity: 0;
  transform: scale(var(--tt-scale));
}

@media (prefers-reduced-motion: reduce) {
  .project-tt-enter-active,
  .project-tt-leave-active {
    transition: none !important;
  }
}
</style>
