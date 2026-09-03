<script setup lang="ts">
import {
  dossierControlsAreBlocked,
  isDossierPath,
  useDossierBackground,
  useDossierClosing,
} from "~/composables/useDossierBackground";
import {
  projectPagerIsWalkable,
  useProjectPager,
} from "~/composables/useProjectSheet";
import { EMAIL_URL, LINKEDIN_URL } from "~/utils/site";

const router = useRouter();
const route = useRoute();
const hudKey = useHudNav();

const playHaptic = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(15);
  }
};

const pages = ["/", "/projects", "/bio"];

const background = useDossierBackground();
const dossierClosing = useDossierClosing();

/* The dossier URL when a sheet is up, so the header can tell "a modal is
   open" from "we are on the projects board". */
const sheetPath = computed(() =>
  isDossierPath(route.path) ? route.path : null,
);

/**
 * The page the header is really showing: the one under the sheet when a
 * dossier is open over it. Opening a project from the home page must not slide
 * the underline over to PROJECTS — you have not left home, a panel opened on
 * top of it. A cold load of a dossier URL has no page underneath, so it falls
 * back to the dossier's own path and lights PROJECTS as before.
 */
const normalizedPath = computed(
  () => (background.value?.path ?? route.path).replace(/\/+$/, "") || "/",
);

const currentIndex = computed(() => {
  if (normalizedPath.value.startsWith("/project/"))
    return pages.indexOf("/projects");
  const i = pages.indexOf(normalizedPath.value);
  return i === -1 ? 0 : i;
});

const usesInPageArrows = computed(() => {
  const path = normalizedPath.value;
  return (
    path === "/" ||
    path === "/projects" ||
    path.startsWith("/project/") ||
    sheetPath.value !== null
  );
});

/**
 * With a dossier open, left/right steps to the next project rather than the
 * next tab: the sheet is the thing you are looking at, so the arrows either
 * side of it — the header keys and the physical arrow keys alike — should move
 * through the work, not walk out of it.
 *
 * The step itself belongs to the pager, not to this layout: the rails inside
 * the sheet drive the same motion, and the gate that keeps a spammed press
 * from outrunning the animation only works if every control goes through it.
 */
const { step: stepProject } = useProjectPager();

// What the header keys actually do from here, so the labels don't promise a
// page change while the dossier is open.
const arrowTarget = computed(() =>
  sheetPath.value && projectPagerIsWalkable
    ? { prev: "Previous project", next: "Next project" }
    : { prev: "Previous page", next: "Next page" },
);

// ── Tab / page navigation ────────────────────────────────────────
/**
 * One tab hop at a time.
 *
 * `currentIndex` reads the route, and the route only moves once the incoming
 * page has resolved — so a second press inside that window stepped off the
 * same "current" as the first. Both aimed at the same tab, and the router
 * dropped the second as a duplicate: press right twice quickly from ABOUT and
 * you stayed on ABOUT instead of wrapping round to HOME, with only the
 * re-push's flicker to show for it. Same failure, and the same gate, as the
 * dossier pager in `useProjectSheet`.
 *
 * Presses that land mid-hop keep exactly one, latest wins, so holding an arrow
 * walks the tabs at the speed the swap can carry and letting go stops one hop
 * later rather than playing out a run you can no longer call back.
 */
const TAB_HOP_TIMEOUT_MS = 900;
let tabHopInFlight = false;
let tabHopTimer: ReturnType<typeof setTimeout> | undefined;
let queuedTabHop: -1 | 1 | null = null;

function commitTabHop(offset: -1 | 1) {
  tabHopInFlight = true;
  clearTimeout(tabHopTimer);
  tabHopTimer = setTimeout(settleTabHop, TAB_HOP_TIMEOUT_MS);
  router.push(
    pages[(currentIndex.value + offset + pages.length) % pages.length],
  );
}

/**
 * Opens the gate once the page has rendered — the first moment `currentIndex`
 * reports where we actually are, which is what the queued hop steps from. The
 * timer above is the backstop for the arrivals that never fire `page:finish`.
 */
function settleTabHop() {
  if (!tabHopInFlight) return;
  clearTimeout(tabHopTimer);
  tabHopInFlight = false;

  const queued = queuedTabHop;
  queuedTabHop = null;
  if (queued) commitTabHop(queued);
}

function stepTab(offset: -1 | 1) {
  if (tabHopInFlight) {
    queuedTabHop = offset;
    return;
  }
  commitTabHop(offset);
}

const stopTabHopSettle = useNuxtApp().hook("page:finish", settleTabHop);
onUnmounted(() => stopTabHopSettle());

// The header key only flashes for the presses it actually owns — a step
// through the dossier pager lights the rails instead. It flashes for a press
// the gate absorbs, though: a control that looks dead is worse than one that
// answers a beat late.
function prevPage() {
  if (dossierControlsAreBlocked(dossierClosing.value)) return;
  if (stepProject("prev")) return;
  flash("ArrowLeft");
  stepTab(-1);
}
function nextPage() {
  if (dossierControlsAreBlocked(dossierClosing.value)) return;
  if (stepProject("next")) return;
  flash("ArrowRight");
  stepTab(1);
}

// ── Pressed-key flash for visual feedback ────────────────────────
const pressed = ref<string | null>(null);
function flash(key: string) {
  pressed.value = key;
  setTimeout(() => {
    pressed.value = null;
  }, 160);
}
const isPressed = (key: string) => pressed.value === key;

function emitHudKey(key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") {
  flash(key);
  hudKey.value = key;
  nextTick(() => {
    hudKey.value = null;
  });
}

// ── Global keyboard handler ──────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (dossierControlsAreBlocked(dossierClosing.value)) {
    if (e.key.startsWith("Arrow") || e.key === "Escape") e.preventDefault();
    return;
  }

  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      prevPage();
      break;
    case "ArrowRight":
      e.preventDefault();
      nextPage();
      break;
    case "ArrowUp":
    case "ArrowDown":
      if (!usesInPageArrows.value) break;
      e.preventDefault();
      emitHudKey(e.key);
      break;
    case "Escape":
      flash("Escape");
      router.push("/");
      break;
    case "Enter":
      flash("Enter");
      break;
  }
}

function onGlobalClick(e: MouseEvent) {
  // Trigger brief vibration on tapping links, buttons, and navigation elements
  const target = (e.target as HTMLElement).closest(
    'a, button, [role="button"], .cursor-pointer, [class*="cursor-pointer"], [data-sound-hover]',
  );
  if (target) {
    playHaptic();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("click", onGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", onGlobalClick);
});

// ── Desktop nav items ─────────────────────────────────────────────
const navItems = [
  { label: "HOME", path: "/" },
  { label: "PROJECTS", path: "/projects" },
  { label: "ABOUT", path: "/bio" },
];

// ── Mobile bottom nav items ───────────────────────────────────────
const mobileNavItems = [
  { label: "HOME", path: "/", icon: "analytics" },
  { label: "PROJECTS", path: "/projects", icon: "grid_view" },
  { label: "ABOUT", path: "/bio", icon: "fingerprint" },
  {
    label: "CONNECT",
    path: LINKEDIN_URL,
    iconSrc: "/images/paper-airplane-svgrepo-com.svg",
    // Opens a new tab, like the LinkedIn icon in the header does. It used to
    // navigate away in-tab on mobile only.
    external: true,
  },
];

// Routes resolve with a trailing slash (`nuxtLink.trailingSlash: "append"` in
// nuxt.config.ts), so comparing against the raw `route.path` never matches
// "/projects" or "/bio" — only "/" survives untouched. Compare against the
// already-normalized path instead.
const isActive = (path: string) => {
  if (path === "/projects") {
    return (
      normalizedPath.value === "/projects" ||
      normalizedPath.value.startsWith("/project/")
    );
  }
  return normalizedPath.value === path;
};

/**
 * The link you just clicked goes dark for the two or three frames between the
 * click and the incoming page resolving. Neither half of its lit state
 * survives that window: the view transition's snapshot sits under the pointer
 * instead of the anchor, so `:hover` stops matching, and the route hasn't
 * changed yet, so the active styles haven't landed either. The transition then
 * freezes that unlit frame on screen for as long as the page takes to resolve,
 * and the label reads as blinking out and back — the `transition-colors` fade
 * that would normally soften it runs invisibly beneath the snapshot.
 *
 * Light the target from the click itself. Every capture of the header — the
 * one taken before the swap and the one taken after — then paints that link
 * the same way, so there is no frame left to blink.
 */
const pendingPath = ref<string | null>(null);
const isPending = (path: string) => pendingPath.value === path;

// A modified click opens a tab and leaves this document where it is, and an
// off-site href never comes back through the router — neither would ever clear
// the pending state, so neither sets it.
function markPending(event: MouseEvent, path: string) {
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!path.startsWith("/")) return;
  pendingPath.value = path;
}

// afterEach also fires for navigations that fail or get redirected, so the
// pending link can't stay lit after a hop that never lands. The route ref has
// already moved by the time it runs, so the active styles take over in the
// same render that drops the pending ones.
router.afterEach(() => {
  pendingPath.value = null;
});

// A pending link wears the hover look rather than the active one: the underline
// still belongs to the page you are on until the new one is actually up.
function navLinkTone(path: string) {
  if (isActive(path)) return "text-white after:bg-white";
  if (isPending(path)) return "text-white bg-[#1f1f1f] after:bg-transparent";
  return "text-[#919191] hover:text-white hover:bg-[#1f1f1f] after:bg-transparent";
}

function mobileNavTone(path: string) {
  if (isActive(path)) return "bg-white text-black";
  if (isPending(path)) return "text-white bg-[#1f1f1f]";
  return "text-[#919191] hover:text-white hover:bg-[#1f1f1f]";
}

const mainRef = ref<HTMLElement | null>(null);

function scrollMainToTopOnMobile() {
  if (window.innerWidth >= 1280) return;
  nextTick(() => {
    mainRef.value?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

// Below xl this element is the scroller for the page under the sheet, and it
// outlives a dossier opening over it. Watching the path *under* the sheet is
// what keeps it still: opening or dismissing a dossier doesn't move it, so the
// backdrop can't jerk to the top on the way in or drop you there on the way
// out. A cold load of a dossier still reports the dossier's own path, so the
// board it draws as a backdrop and the real board it dismisses to count as one
// place.
const isProjectsFamily = (path: string) => {
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized === "/projects" || normalized.startsWith("/project/");
};

watch(normalizedPath, (to, from) => {
  if (isProjectsFamily(to) && isProjectsFamily(from)) return;
  scrollMainToTopOnMobile();
});
</script>

<template>
  <!-- h-dvh, not h-screen: on mobile `100vh` is the *large* viewport (browser
       chrome hidden), so the shell measured taller than the screen and pushed
       `.hud-page`'s bottom edge under the fixed bottom nav and off-screen. That
       overlap is invisible normally (the nav is z-[1000]) but a view transition
       composites by group z-index instead, painting the page snapshot over the
       nav. Sizing to the dynamic viewport removes the overlap at the source. -->
  <div class="relative h-dvh overflow-hidden bg-[#131313] text-[#e2e2e2]">
    <!-- Off-screen until focused. Without it the first Tab on every page walks
         the logo, both arrow keys, the three tabs and two social links before
         reaching any content. -->
    <a href="#main" class="skip-link">Skip to content</a>

    <div class="fixed inset-0 grid-bg opacity-[0.12] z-0 pointer-events-none" />

    <!-- ── TOP NAVIGATION ──────────────────────────────────── -->
    <nav
      class="site-nav sticky top-0 inset-x-0 h-14 z-50 flex items-center px-4 xl:px-8 bg-[#131313]/95 backdrop-blur-sm border-b border-white/10"
      :inert="dossierClosing || undefined"
    >
      <!-- Logo: always visible -->
      <NuxtLink
        to="/"
        class="text-title-ui mr-auto inline-flex h-8 items-center px-1 select-none uppercase tracking-tighter text-white"
      >
        CHRISTOPHER SANTANA
      </NuxtLink>

      <!-- Previous-page keyboard control (desktop only) -->

      <div
        class="flex flex-row mx-auto absolute left-0 right-0"
        style="width: fit-content"
      >
        <button
          class="site-nav-key mr-6 self-center hidden items-center justify-center transition-all duration-100 xl:inline-flex"
          :class="
            isPressed('ArrowLeft')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          :aria-label="`${arrowTarget.prev} (Left arrow)`"
          aria-keyshortcuts="ArrowLeft"
          :disabled="dossierClosing"
          @click="prevPage"
        >
          <kbd
            class="text-label-data flex h-6 min-w-7 items-center justify-center text-white"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              width="12"
              height="12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10.25 3.25 5.5 8l4.75 4.75"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="square"
              />
            </svg>
          </kbd>
        </button>

        <!-- Page links (desktop only — mobile uses bottom nav) -->
        <ul class="hidden xl:flex items-stretch">
          <li v-for="item in navItems" :key="item.path" class="flex">
            <NuxtLink
              :to="item.path"
              :class="[
                'relative inline-flex h-14 items-center px-4 text-label-ui tracking-[0.2em] uppercase transition-colors duration-150',
                'after:absolute after:bottom-0 after:left-4 after:right-[calc(1rem+0.2em)] after:h-px',
                navLinkTone(item.path),
              ]"
              @click="markPending($event, item.path)"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Next-page keyboard control (desktop only) -->
        <button
          class="site-nav-key ml-6 self-center hidden items-center justify-center transition-all duration-100 xl:inline-flex"
          :class="
            isPressed('ArrowRight')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          :aria-label="`${arrowTarget.next} (Right arrow)`"
          aria-keyshortcuts="ArrowRight"
          :disabled="dossierClosing"
          @click="nextPage"
        >
          <kbd
            class="text-label-data flex h-6 min-w-7 items-center justify-center text-white"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              width="12"
              height="12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5.75 3.25 10.5 8l-4.75 4.75"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="square"
              />
            </svg>
          </kbd>
        </button>
      </div>

      <div class="flex items-center gap-2 shrink-0 z-10">
        <a
          :href="EMAIL_URL"
          class="inline-flex h-9 w-9 items-center justify-center text-[#919191] transition-all hover:bg-[#353535] hover:text-white"
          aria-label="Email Christopher Santana"
        >
          <!-- Icons share an h-6 w-6 box; each viewBox is padded so the glyphs
               inside it land on the same optical size (see X / LinkedIn below). -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0.15 0.15 23.7 23.7"
            fill="currentColor"
            class="h-6 w-6 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M2 4h20a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm18.238 2H3.762L12 12.29 20.238 6zM21 8.443l-8.386 6.4a1 1 0 0 1-1.228 0L3 8.443V18h18V8.443z"
            />
          </svg>
        </a>
        <!--
        <a
          :href="X_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center text-[#919191] transition-all hover:bg-[#353535] hover:text-white"
          aria-label="X profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-0.31 -0.19 24.375 24.375"
            fill="currentColor"
            class="h-6 w-6 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"
            />
          </svg>
        </a>
        -->
        <a
          :href="LINKEDIN_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 w-9 items-center justify-center text-[#919191] transition-all hover:bg-[#353535] hover:text-white"
          aria-label="LinkedIn profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-4 -4 32 32"
            fill="currentColor"
            class="h-6 w-6 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        </a>
      </div>
    </nav>

    <!-- <ClientOnly> -->
    <!-- ── MOBILE BOTTOM NAVIGATION ───────────────────────── -->
    <nav
      class="xl:hidden fixed bottom-0 inset-x-0 z-[1000] flex h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]"
      :inert="dossierClosing || undefined"
    >
      <NuxtLink
        v-for="item in mobileNavItems"
        :key="item.path"
        :to="item.path"
        :target="item.external ? '_blank' : undefined"
        :rel="item.external ? 'noopener noreferrer' : undefined"
        :aria-label="item.external ? `${item.label} (opens in a new tab)` : undefined"
        :class="[
          'group flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150',
          mobileNavTone(item.path),
        ]"
        @click="markPending($event, item.path)"
      >
        <!-- alt="" — the label below it already says CONNECT, and naming the
             icon too had screen readers announce the link twice. -->
        <img
          v-if="item.iconSrc"
          :src="item.iconSrc"
          alt=""
          class="h-4 w-4 shrink-0"
          :class="
            isActive(item.path)
              ? 'brightness-0'
              : isPending(item.path)
                ? 'brightness-0 invert opacity-100'
                : 'brightness-0 invert opacity-60 group-hover:opacity-100'
          "
          draggable="false"
        />
        <span v-else class="material-symbols-outlined icon-md leading-none">{{
          item.icon
        }}</span>
        <span class="text-label-ui uppercase tracking-widest">{{
          item.label
        }}</span>
      </NuxtLink>
    </nav>
    <!-- </ClientOnly> -->
    <!-- ── MAIN CONTENT ────────────────────────────────────── -->
    <!-- Mobile : scrollable, sits between top nav and mobile bottom nav -->
    <!-- Desktop: uses the full viewport below the top navigation -->
    <main
      id="main"
      ref="mainRef"
      tabindex="-1"
      class="hud-page absolute inset-x-0 top-14 z-10 bottom-16 lg:pb-0 flex flex-col overflow-x-hidden overflow-y-auto xl:bottom-0 xl:overflow-hidden"
    >
      <slot />
    </main>
  </div>
</template>
