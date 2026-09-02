<script setup lang="ts">
import {
  openProjectSheet,
  settleProjectPagerStep,
  SHEET_ENTERED,
  type SheetStep,
} from "~/composables/useProjectSheet";

/**
 * Modal shell for the project dossier: a near-fullscreen panel over the
 * projects board. It never runs edge to edge — the dim frame of board around
 * it, and the scrim you can click, are what say the page is still back there.
 *
 * Teleported to document.body so position:fixed is viewport-relative. Inside
 * hud-page, Safari treats overflow + view-transition-name as a containing
 * block and clips the chrome that is supposed to cover the site header.
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

/** `closed` fires when the dismissal animation has actually finished. */
const emit = defineEmits<{ close: []; closed: [] }>();

// Read before first paint, not in onMounted: stepping through the pager
// remounts this component, and the panel must not zoom in again.
const enter = openProjectSheet() ? "instant" : "animate";

// A direction only reads as a pager step if a sheet was already on screen —
// the first dossier of a session opens, it doesn't travel.
const step = computed(() => (enter === "instant" ? props.step : null));

const panelRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const payloadRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

/**
 * Entrance/dismissal bookkeeping, driven off the panel's own animationend
 * rather than a timer: a duplicated duration is always a frame or two out of
 * step with the CSS, and on the way out that difference is the route swapping
 * while the panel is still mid-flight — the cut at the end of the dismissal.
 *
 * animationend bubbles, so every handler filters on the panel itself; the
 * payload runs animations of its own on a pager step.
 */
const ENTRANCE_TIMEOUT_MS = 1000;
const entered = ref(enter === "instant");
let enteredFallback: number | undefined;
provide(
  SHEET_ENTERED,
  computed(() => entered.value),
);

// The panel runs its travel and its fade on separate clocks, and only the
// travel says the motion is over. Scoped styles suffix keyframe names with the
// component's scope id, so match on a fragment rather than the whole name.
const TRAVEL_ANIMATION = /sheet-(rise|zoom)-(in|out)/;

// The payload's own travel, on the same principle: the slide is the step, the
// fade only tidies up after it.
const STEP_ANIMATION = /sheet-step-slide/;

function isPanelTravel(event: AnimationEvent) {
  return (
    event.target === panelRef.value &&
    TRAVEL_ANIMATION.test(event.animationName)
  );
}

function onPanelAnimationEnd(event: AnimationEvent) {
  // The pager holds the next step until this one has stopped moving, so the
  // arrival has to say when that is. Nothing else can: the sheet the press
  // started in has already unmounted by the time the slide lands.
  if (
    event.target === payloadRef.value &&
    STEP_ANIMATION.test(event.animationName)
  ) {
    settleProjectPagerStep();
    return;
  }

  if (!isPanelTravel(event)) return;
  if (props.closing) {
    emit("closed");
    return;
  }
  clearTimeout(enteredFallback);
  entered.value = true;
}

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

  // An arrival that doesn't animate — reduced motion, or a hop the pager
  // didn't ask for — has no animationend to release the gate, so it releases
  // it here instead of leaving the pager stuck until the backstop fires.
  if (!payloadRef.value?.getAnimations?.().length) {
    settleProjectPagerStep();
  }

  // Nothing to wait for when the panel isn't animating — a pager step, or
  // reduced motion, where the CSS zeroes the animation out entirely.
  if (!panelRef.value?.getAnimations?.().length) {
    entered.value = true;
    return;
  }

  // The payload holds back its heaviest work on this flag, so it can't be
  // allowed to hang on an animationend that never arrives.
  enteredFallback = window.setTimeout(() => {
    entered.value = true;
  }, ENTRANCE_TIMEOUT_MS);
});

onBeforeUnmount(() => {
  clearTimeout(enteredFallback);
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
  <Teleport to="body">
    <div
      class="project-sheet"
      :data-enter="enter"
      :data-step="step"
      :data-state="closing ? 'closing' : 'open'"
      :data-entered="entered || null"
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
        @animationend="onPanelAnimationEnd"
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
          <div ref="payloadRef" class="project-sheet__payload">
            <slot />
          </div>
        </div>
      </div>

      <!-- Pager rails. Outside the panel so they sit in the board gutters, and
         after it in the reading order so the dossier comes first. The rails
         remount on every pager step, so they only fade in when the sheet
         itself is arriving — otherwise they blink on each step. -->
      <slot name="nav" :entering="enter === 'animate'" />
    </div>
  </Teleport>
</template>

<style scoped>
/* Teleported to body, so these z-indexes compete with the layout chrome
   (site-nav 50, main 10, mobile bottom nav 100) rather than nesting inside
   hud-page's stacking context. */
.project-sheet__scrim {
  position: fixed;
  inset: 3.5rem 0 0 0;
  z-index: 40;
  background: rgba(6, 6, 6, 0.74);
  animation: sheet-scrim-in var(--sheet-scrim-in-dur) var(--sheet-fade-ease)
    both;
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
  /* Travel and fade run on separate clocks, the same split the site's page
     transitions use: the travel is the gesture and wants room to decelerate,
     the fade only has to get the panel out of the way. Fading over the full
     travel is what leaves the panel legible but half-there for a third of a
     second, which reads as a stall followed by a jump. */
  --sheet-in-dur: 380ms;
  --sheet-in-fade-dur: 200ms;
  --sheet-scrim-in-dur: 240ms;

  --sheet-out-dur: 220ms;
  --sheet-out-fade-dur: 160ms;

  --sheet-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --sheet-fade-ease: cubic-bezier(0.4, 0, 0.2, 1);
  /* The dismissal accelerates away instead of borrowing the entrance curve,
     which decelerates to a near standstill — on the way out that reads as the
     panel hanging around and then being cut off. */
  --sheet-out-ease: cubic-bezier(0.4, 0, 1, 1);

  --sheet-rise: 18px;
  --sheet-scale: 0.988;
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
     mobile bottom nav (fixed, z-100) so that stays reachable. */
  inset: 0 0 4rem 0;
  z-index: 55;
  /* A full-bleed sheet rising from the bottom edge doesn't fade — it would
     only muddy the travel. The scrim carries the change in depth. */
  animation: sheet-rise-in var(--sheet-in-dur) var(--sheet-ease) both;
}

/* Promotion for the frames that need it, dropped as soon as the panel is at
   rest: a permanently promoted layer this large (full-bleed, with an 80px
   shadow, wrapping a scroll container and a playing video) costs memory for
   the entire life of the sheet and buys nothing once it stops moving. */
.project-sheet:not([data-entered])
  :is(.project-sheet__panel, .project-sheet__scrim),
.project-sheet[data-state="closing"]
  :is(.project-sheet__panel, .project-sheet__scrim) {
  will-change: transform, opacity;
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

  /* The 5rem floor keeps a gutter wide enough for the pager rails even when
     the viewport is narrower than the panel's natural max width. */
  .project-sheet__panel {
    top: 4.5rem;
    right: max(5rem, calc((100vw - 1160px) / 2));
    bottom: 1.5rem;
    left: max(5rem, calc((100vw - 1160px) / 2));
    animation:
      sheet-zoom-in var(--sheet-in-dur) var(--sheet-ease) both,
      sheet-fade-in var(--sheet-in-fade-dur) var(--sheet-fade-ease) both;
  }
}

/* ── Dismissal ──────────────────────────────────────────────────── */
/* The scrim outlasts the panel by a hair so the board never brightens back up
   underneath a panel that is still on its way out. */
.project-sheet[data-state="closing"] .project-sheet__scrim {
  animation: sheet-scrim-out var(--sheet-out-dur) var(--sheet-fade-ease) both;
}

.project-sheet[data-state="closing"] .project-sheet__panel {
  animation: sheet-rise-out var(--sheet-out-dur) var(--sheet-out-ease) both;
}

@media (min-width: 1280px) {
  .project-sheet[data-state="closing"] .project-sheet__panel {
    animation:
      sheet-zoom-out var(--sheet-out-dur) var(--sheet-out-ease) both,
      sheet-fade-out var(--sheet-out-fade-dur) var(--sheet-fade-ease) both;
  }
}

/* Pager step: the shell is already in place, so only the payload changes.
   Pinned to the open state — this rule and the dismissal above have the same
   specificity, so an unqualified version wins on source order and silently
   takes the exit animation away from every sheet you reached through the
   pager, leaving the dismissal a dead pause followed by a cut. */
.project-sheet[data-enter="instant"][data-state="open"] .project-sheet__scrim,
.project-sheet[data-enter="instant"][data-state="open"] .project-sheet__panel {
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
    transform: translateY(var(--sheet-rise)) scale(var(--sheet-scale));
  }
}

@keyframes sheet-zoom-out {
  to {
    transform: translateY(var(--sheet-rise)) scale(var(--sheet-scale));
  }
}

@keyframes sheet-fade-in {
  from {
    opacity: 0;
  }
}

@keyframes sheet-fade-out {
  to {
    opacity: 0;
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
