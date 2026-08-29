<script setup lang="ts">
import {
  PROJECT_SHEET_MODES,
  openProjectSheet,
} from "~/composables/useProjectSheetMode";

/**
 * Modal shell for the project dossier. Two presentations share one skeleton:
 *
 *   side — right-hand drawer, board still readable in the left gutter
 *   full — near-fullscreen dialog, board reduced to a dim frame
 *
 * Both deliberately leave the page underneath visible: the exposed board is
 * the dismiss affordance, and clicking it closes the sheet.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    closing?: boolean;
  }>(),
  { closing: false },
);

const emit = defineEmits<{ close: [] }>();

const { mode, setMode } = useProjectSheetMode();

// Read before first paint, not in onMounted: stepping through the pager
// remounts this component, and the panel must not slide in again.
const enter = openProjectSheet() ? "instant" : "animate";

const panelRef = ref<HTMLElement | null>(null);
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
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
const bodyRef = ref<HTMLElement | null>(null);

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
    :data-mode="mode"
    :data-enter="enter"
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
      aria-modal="true"
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

        <div class="flex shrink-0 items-center gap-2">
          <slot name="actions" />

          <div
            class="project-sheet__modes"
            role="group"
            aria-label="Dossier presentation"
          >
            <button
              v-for="option in PROJECT_SHEET_MODES"
              :key="option"
              type="button"
              class="project-sheet__mode"
              :class="{ 'is-active': mode === option }"
              :aria-pressed="mode === option"
              @click="setMode(option)"
            >
              {{ option }}
            </button>
          </div>

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
        <slot />
      </div>

      <footer v-if="$slots.footer" class="project-sheet__footer">
        <slot name="footer" />
      </footer>
    </div>
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
  background: rgba(6, 6, 6, var(--sheet-scrim, 0.62));
  animation: sheet-scrim-in var(--sheet-in-dur) var(--sheet-ease) both;
}

.project-sheet__panel {
  position: fixed;
  z-index: 45;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(10, 10, 10, 0.95);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(14px);
  outline: none;

  /* Phones and small tablets: one presentation for both modes — a sheet that
     rises from the bottom and stops short of the board so the strip of
     cards above it reads as "tap here to get out". */
  inset: 6.25rem 0 4rem 0;
  animation: sheet-rise-in var(--sheet-in-dur) var(--sheet-ease) both;
}

.project-sheet {
  --sheet-in-dur: 420ms;
  --sheet-out-dur: 240ms;
  --sheet-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --sheet-scrim: 0.62;
}

.project-sheet[data-mode="side"] {
  --sheet-scrim: 0.45;
}

.project-sheet[data-mode="full"] {
  --sheet-scrim: 0.74;
}

.project-sheet__panel :is(.corner-tl-w, .corner-tr-w, .corner-bl-w, .corner-br-w) {
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

@media (min-width: 1280px) {
  .project-sheet__chrome {
    padding: 0.5rem 1rem;
  }
}

.project-sheet__modes {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.project-sheet__mode {
  min-height: 28px;
  padding: 0 0.55rem;
  color: #919191;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.18em;
  line-height: 1;
  text-transform: uppercase;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.project-sheet__mode + .project-sheet__mode {
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.project-sheet__mode:hover,
.project-sheet__mode:focus-visible {
  color: #fff;
  outline: none;
}

.project-sheet__mode.is-active {
  background: #67f57a;
  color: #000;
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

@media (min-width: 1280px) {
  .project-sheet__close {
    height: 2.25rem;
    width: 2.25rem;
  }
}

/* ── Body / footer ──────────────────────────────────────────────── */
.project-sheet__body {
  container: dossier / inline-size;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem 0.75rem 1.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.project-sheet__body::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1280px) {
  .project-sheet__body {
    padding: 1.25rem 1.25rem 2rem;
  }
}

.project-sheet__footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 8, 8, 0.9);
}

/* ── Desktop: side drawer ───────────────────────────────────────── */
@media (min-width: 1280px) {
  .project-sheet[data-mode="side"] .project-sheet__panel {
    inset: 3.5rem 0 0 auto;
    width: clamp(520px, 54vw, 780px);
    border-right: 0;
    animation-name: sheet-slide-in;
  }

  /* Near-fullscreen, but never edge-to-edge: the sliver of board around it
     is what says the page is still back there. */
  .project-sheet[data-mode="full"] .project-sheet__panel {
    top: 4.75rem;
    right: max(1.5rem, calc((100vw - 1160px) / 2));
    bottom: 1.5rem;
    left: max(1.5rem, calc((100vw - 1160px) / 2));
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
  .project-sheet[data-mode="side"][data-state="closing"] .project-sheet__panel {
    animation-name: sheet-slide-out;
  }

  .project-sheet[data-mode="full"][data-state="closing"] .project-sheet__panel {
    animation-name: sheet-zoom-out;
  }
}

/* Pager step: the shell is already in place, so only the payload changes. */
.project-sheet[data-enter="instant"] .project-sheet__scrim,
.project-sheet[data-enter="instant"] .project-sheet__panel {
  animation: none;
}

.project-sheet[data-enter="instant"] .project-sheet__body {
  animation: sheet-body-in 220ms var(--sheet-ease) both;
}

@keyframes sheet-body-in {
  from {
    opacity: 0;
    transform: translateY(8px);
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

@keyframes sheet-slide-in {
  from {
    transform: translateX(100%);
  }
}

@keyframes sheet-slide-out {
  to {
    transform: translateX(100%);
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
  .project-sheet[data-state="closing"] .project-sheet__panel {
    animation: none !important;
  }

  .project-sheet[data-enter="instant"] .project-sheet__body {
    animation: none !important;
  }

  .project-sheet__mode,
  .project-sheet__close {
    transition: none;
  }
}
</style>
