<script setup lang="ts">
import {
  openProjectSheet,
  type SheetStep,
} from "~/composables/useProjectSheet";

/**
 * Modal shell for the project dossier: a near-fullscreen panel over the
 * projects board. It never runs edge to edge — the dim frame of board around
 * it, and the scrim you can click, are what say the page is still back there.
 *
 * `role="dialog"` without `aria-modal`: the board is inert, but the site nav
 * and the project pager either side of the panel are meant to stay reachable,
 * and `aria-modal` would hide them from assistive tech.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    closing?: boolean;
    /** Direction the pager travelled to get here, if it was the pager. */
    step?: SheetStep | null;
  }>(),
  { closing: false, step: null },
);

const emit = defineEmits<{ close: [] }>();

// Read before first paint, not in onMounted: stepping through the pager
// remounts this component, and the panel must not zoom in again.
const enter = openProjectSheet() ? "instant" : "animate";

// A direction only reads as a pager step if a sheet was already on screen —
// the first dossier of a session opens, it doesn't travel.
const step = computed(() => (enter === "instant" ? props.step : null));

const panelRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

// Capture phase, and swallowed: the layout binds Escape to "go home", which
// would blow past the board the sheet is stacked on.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || props.closing) return;
  event.preventDefault();
  event.stopPropagation();
  emit("close");
}

onMounted(() => {
  previouslyFocused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  panelRef.value?.focus({ preventScroll: true });
  window.addEventListener("keydown", onKeydown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown, true);
  previouslyFocused?.focus?.({ preventScroll: true });
});

// The HUD arrow pad scrolls the dossier now that the sheet, not the page,
// owns the scroll container.
const hudKey = useHudNav();

watch(hudKey, (key) => {
  if (key !== "ArrowUp" && key !== "ArrowDown") return;
  bodyRef.value?.scrollBy({
    top: key === "ArrowDown" ? 140 : -140,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
});
</script>

<template>
  <div
    class="project-sheet"
    :data-enter="enter"
    :data-step="step"
    :data-state="closing ? 'closing' : 'open'"
  >
    <div
      class="project-sheet__scrim"
      aria-hidden="true"
      @click="emit('close')"
    />

    <div
      ref="panelRef"
      class="project-sheet__panel"
      role="dialog"
      :aria-label="label"
      tabindex="-1"
    >
      <div class="corner-tl-w" />
      <div class="corner-tr-w" />
      <div class="corner-bl-w" />
      <div class="corner-br-w" />

      <header class="project-sheet__chrome">
        <div class="min-w-0 flex-1">
          <slot name="title" />
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <slot name="actions" />

          <button
            type="button"
            class="project-sheet__close"
            aria-label="Close project"
            @click="emit('close')"
          >
            <span
              class="material-symbols-outlined icon-md leading-none"
              aria-hidden="true"
              >close</span
            >
          </button>
        </div>
      </header>

      <div ref="bodyRef" class="project-sheet__body">
        <!-- The payload moves on a pager step while the body stays put, so the
             travel is clipped by the scroll container rather than spilling
             over the panel border. -->
        <div class="project-sheet__payload">
          <slot />
        </div>
      </div>
    </div>

    <!-- Pager rails. Outside the panel so they sit in the board gutters, and
         after it in the reading order so the dossier comes first. -->
    <slot name="nav" />
  </div>
</template>

<style scoped>
/* Both layers sit under the site chrome (z-50) on purpose — the nav stays
   lit and usable, which is what keeps this reading as a layer rather than a
   new page. */
.project-sheet__scrim {
  position: fixed;
  inset: 3.5rem 0 0 0;
  z-index: 40;
  background: rgba(6, 6, 6, 0.74);
  animation: sheet-scrim-in var(--sheet-in-dur) var(--sheet-ease) both;
}

/* Phones and small tablets: the scrim (and panel, below) rise above the site
   chrome entirely, so the dossier reads as a full-screen layer rather than
   one that's still boxed in by the header. */
@media (max-width: 1279.98px) {
  .project-sheet__scrim {
    inset: 0;
  }
}

.project-sheet {
  --sheet-in-dur: 420ms;
  --sheet-out-dur: 240ms;
  --sheet-ease: cubic-bezier(0.32, 0.72, 0, 1);
}

.project-sheet__panel {
  position: fixed;
  z-index: 45;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(10, 10, 10, 0.95);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  outline: none;

  /* Phones and small tablets: the panel rises all the way to the top edge,
     covering the site header, so the dossier reads as a full-height layer
     rather than one still boxed in by the top nav. It stops short of the
     mobile bottom nav (also fixed, z-50) so that stays reachable, which is
     why the panel needs to sit above the top nav in the stacking order. */
  inset: 0 0 4rem 0;
  z-index: 55;
  animation: sheet-rise-in var(--sheet-in-dur) var(--sheet-ease) both;
}

.project-sheet__panel
  :is(.corner-tl-w, .corner-tr-w, .corner-bl-w, .corner-br-w) {
  z-index: 3;
  width: 14px;
  height: 14px;
  border-color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

/* ── Chrome ─────────────────────────────────────────────────────── */
.project-sheet__chrome {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 8, 8, 0.9);
  padding: 0.5rem 0.75rem;
}

.project-sheet__close {
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #919191;
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.project-sheet__close:hover,
.project-sheet__close:focus-visible {
  border-color: #67f57a;
  color: #67f57a;
  outline: none;
}

/* ── Body ───────────────────────────────────────────────────────── */
.project-sheet__body {
  container: dossier / inline-size;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Clears the pager rails, which float over the bottom corners until the
     desktop breakpoint moves them out into the gutters. */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.project-sheet__body::-webkit-scrollbar {
  display: none;
}

/* ── Desktop ────────────────────────────────────────────────────── */
@media (min-width: 1280px) {
  .project-sheet__chrome {
    padding: 0.5rem 1rem;
  }

  .project-sheet__close {
    height: 2.25rem;
    width: 2.25rem;
  }

  .project-sheet__body {
    padding-bottom: 1rem;
  }

  /* The 5rem floor keeps a gutter wide enough for the pager rails even when
     the viewport is narrower than the panel's natural max width. */
  .project-sheet__panel {
    top: 4.5rem;
    right: max(5rem, calc((100vw - 1160px) / 2));
    bottom: 1.5rem;
    left: max(5rem, calc((100vw - 1160px) / 2));
    animation-name: sheet-zoom-in;
  }
}

/* ── Dismissal ──────────────────────────────────────────────────── */
.project-sheet[data-state="closing"] .project-sheet__scrim {
  animation: sheet-scrim-out var(--sheet-out-dur) var(--sheet-ease) both;
}

.project-sheet[data-state="closing"] .project-sheet__panel {
  animation: sheet-rise-out var(--sheet-out-dur) var(--sheet-ease) both;
}

@media (min-width: 1280px) {
  .project-sheet[data-state="closing"] .project-sheet__panel {
    animation-name: sheet-zoom-out;
  }
}

/* Pager step: the shell is already in place, so only the payload changes. */
.project-sheet[data-enter="instant"] .project-sheet__scrim,
.project-sheet[data-enter="instant"] .project-sheet__panel {
  animation: none;
}

.project-sheet[data-enter="instant"]:not([data-step]) .project-sheet__body {
  animation: sheet-body-in 220ms var(--sheet-ease) both;
}

/* Stepping through the pager is a page change in miniature, so it borrows the
   site's page-navigation motion: the dossier arrives from the side it was
   headed, on the same slide and fade clocks. */
.project-sheet[data-step] .project-sheet__payload {
  animation:
    sheet-step-slide var(--page-slide-dur) var(--page-slide-ease) both,
    sheet-step-fade var(--page-fade-dur) var(--page-fade-ease) both;
}

.project-sheet[data-step="forward"] {
  --sheet-step-from: var(--vt-slide-distance);
}

.project-sheet[data-step="back"] {
  --sheet-step-from: calc(var(--vt-slide-distance) * -1);
}

@keyframes sheet-body-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes sheet-step-slide {
  from {
    transform: translateX(var(--sheet-step-from));
  }
}

@keyframes sheet-step-fade {
  from {
    opacity: 0;
    filter: blur(var(--page-blur));
  }
}

@keyframes sheet-scrim-in {
  from {
    opacity: 0;
  }
}

@keyframes sheet-scrim-out {
  to {
    opacity: 0;
  }
}

@keyframes sheet-rise-in {
  from {
    transform: translateY(100%);
  }
}

@keyframes sheet-rise-out {
  to {
    transform: translateY(100%);
  }
}

@keyframes sheet-zoom-in {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.985);
  }
}

@keyframes sheet-zoom-out {
  to {
    opacity: 0;
    transform: translateY(22px) scale(0.985);
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-sheet__scrim,
  .project-sheet__panel,
  .project-sheet[data-state="closing"] .project-sheet__scrim,
  .project-sheet[data-state="closing"] .project-sheet__panel,
  .project-sheet[data-enter="instant"] .project-sheet__body,
  .project-sheet[data-step] .project-sheet__payload {
    animation: none !important;
  }

  .project-sheet__close {
    transition: none;
  }
}
</style>
