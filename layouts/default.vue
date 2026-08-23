<script setup lang="ts">
import { useAudio } from '~/composables/useAudio';

const router = useRouter();
const route = useRoute();
const hudKey = useHudNav();
const { isMuted, initAudio, toggleMute, playHover, playClick, playHaptic } = useAudio();

const pages = ["/", "/projects", "/bio", "/contact"];

const currentIndex = computed(() => {
  if (route.path.startsWith("/project/")) return pages.indexOf("/projects");
  const i = pages.indexOf(route.path);
  return i === -1 ? 0 : i;
});

// ── Tab / page navigation ────────────────────────────────────────
function prevPage() {
  router.push(pages[(currentIndex.value - 1 + pages.length) % pages.length]);
}
function nextPage() {
  router.push(pages[(currentIndex.value + 1) % pages.length]);
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

// ── Global keyboard handler ──────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  switch (e.key) {
    case "l":
    case "L":
    case "[":
    case "PageUp":
      e.preventDefault();
      flash("ArrowLeft");
      prevPage();
      break;
    case "r":
    case "R":
    case "]":
    case "PageDown":
      e.preventDefault();
      flash("ArrowRight");
      nextPage();
      break;
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      e.preventDefault();
      flash(e.key);
      hudKey.value = e.key as typeof hudKey.value;
      nextTick(() => {
        hudKey.value = null;
      });
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

// ── Animated CRT displacement warp (SVG filter) ──────────────────
const turbEl = ref<SVGFETurbulenceElement | null>(null);
const dispEl = ref<SVGFEDisplacementMapElement | null>(null);
let warpRaf = 0;
let warpStart = 0;

function animateWarp(now: number) {
  if (!warpStart) warpStart = now;
  const t = (now - warpStart) / 1000;

  // Slow vertical "swim" — the picture gently wobbles like bad sync.
  const fy = 0.0006 + 0.0006 * (0.5 + 0.5 * Math.sin(t * 0.9));
  turbEl.value?.setAttribute("baseFrequency", `0 ${fy.toFixed(5)}`);

  // Mostly tiny displacement, with brief horizontal "tears".
  const chaos = Math.sin(t * 13.0) * Math.sin(t * 7.3);
  const scale = chaos > 0.92 ? 16 : 2.5;
  dispEl.value?.setAttribute("scale", String(scale));

  warpRaf = requestAnimationFrame(animateWarp);
}

let lastHoveredElement: HTMLElement | null = null;

function onGlobalMouseOver(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest(
    'a, button, [role="button"], .cursor-pointer, [class*="cursor-pointer"], [data-sound-hover]'
  ) as HTMLElement | null;

  if (target) {
    if (target !== lastHoveredElement) {
      lastHoveredElement = target;
      playHover();
    }
  } else {
    lastHoveredElement = null;
  }
}

function onGlobalMouseOut(e: MouseEvent) {
  if (lastHoveredElement && !lastHoveredElement.contains(e.relatedTarget as Node)) {
    lastHoveredElement = null;
  }
}

function onGlobalClick(e: MouseEvent) {
  playClick();

  // Trigger brief vibration on tapping links, buttons, and navigation elements
  const target = (e.target as HTMLElement).closest(
    'a, button, [role="button"], .cursor-pointer, [class*="cursor-pointer"], [data-sound-hover]'
  );
  if (target) {
    playHaptic();
  }
}

onMounted(() => {
  initAudio();
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("click", onGlobalClick);
  window.addEventListener("mouseover", onGlobalMouseOver);
  window.addEventListener("mouseout", onGlobalMouseOut);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) warpRaf = requestAnimationFrame(animateWarp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", onGlobalClick);
  window.removeEventListener("mouseover", onGlobalMouseOver);
  window.removeEventListener("mouseout", onGlobalMouseOut);
  cancelAnimationFrame(warpRaf);
});

// ── Desktop nav items ─────────────────────────────────────────────
const navItems = [
  { label: "STATS", path: "/" },
  { label: "PROJECTS", path: "/projects" },
  { label: "BIO", path: "/bio" },
  { label: "GET_IN_TOUCH", path: "https://www.linkedin.com/in/chrisalesant/" },
];

// ── Mobile bottom nav items ───────────────────────────────────────
const mobileNavItems = [
  { label: "STATS", path: "/", icon: "analytics" },
  { label: "PROJECTS", path: "/projects", icon: "grid_view" },
  { label: "BIO", path: "/bio", icon: "fingerprint" },
  {
    label: "CONNECT",
    path: "https://www.linkedin.com/in/chrisalesant/",
    iconSrc: "/images/paper-airplane-svgrepo-com.svg",
  },
];

const isActive = (path: string) => {
  if (path === "/projects") {
    return route.path === "/projects" || route.path.startsWith("/project/");
  }
  return route.path === path;
};

const mainRef = ref<HTMLElement | null>(null);

function scrollMainToTopOnMobile() {
  if (window.innerWidth >= 1280) return;
  nextTick(() => {
    mainRef.value?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

watch(() => route.path, scrollMainToTopOnMobile);
</script>

<template>
  <div class="relative h-screen overflow-hidden bg-[#131313] text-[#e2e2e2]">
    <!-- CRT displacement filter (animated via JS, applied to <main>) -->
    <svg class="crt-svg-filter" aria-hidden="true" focusable="false">
      <filter
        id="crt-distort"
        x="-5%"
        y="-5%"
        width="110%"
        height="110%"
        color-interpolation-filters="sRGB"
      >
        <feTurbulence
          ref="turbEl"
          type="fractalNoise"
          baseFrequency="0 0.0007"
          numOctaves="1"
          seed="7"
          result="noise"
        />
        <feDisplacementMap
          ref="dispEl"
          in="SourceGraphic"
          in2="noise"
          scale="2.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <div class="fixed inset-0 grid-bg opacity-[0.12] z-0 pointer-events-none" />

    <!-- ── Animated CRT / old-TV overlay ─────────────────────── -->
    <div class="crt-overlay fixed inset-0 z-[999]">
      <div class="absolute inset-0 crt-scanlines" />
      <div class="absolute inset-0 overflow-hidden crt-roll" />
      <div class="absolute inset-0 crt-flicker" />
    </div>

    <!-- ── TOP NAVIGATION ──────────────────────────────────── -->
    <nav
      class="site-nav fixed top-0 inset-x-0 h-14 z-50 flex items-center px-4 xl:px-8 bg-[#131313]/95 backdrop-blur-sm border-b border-white/10"
    >
      <!-- Logo: always visible -->
      <NuxtLink
        to="/"
        class="text-white font-semibold text-sm xl:text-lg tracking-tighter uppercase select-none mr-auto"
      >
        CH_SANTANA_OS_V3
      </NuxtLink>

      <!-- L button (desktop only) -->

      <div
        class="flex flex-row mx-auto absolute left-0 right-0"
        style="width: fit-content"
      >
        <button
          class="hidden xl:block mr-6 transition-all duration-100 focus:outline-none"
          :class="
            isPressed('ArrowLeft')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Previous tab"
          @click="prevPage"
        >
          <img
            src="/images/left-btn-icon.png"
            alt="L"
            class="w-[21px] h-[21px]"
            draggable="false"
          />
        </button>

        <!-- Page links (desktop only — mobile uses bottom nav) -->
        <ul class="hidden xl:flex items-center gap-10">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              :class="[
                'font-mono text-xs tracking-[0.2em] uppercase transition-colors duration-150',
                isActive(item.path)
                  ? 'text-white border-b border-white pb-px'
                  : 'text-[#919191] hover:text-white',
              ]"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <!-- R button (desktop only) -->
        <button
          class="hidden xl:block ml-6 transition-all duration-100 focus:outline-none"
          :class="
            isPressed('ArrowRight')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Next tab"
          @click="nextPage"
        >
          <img
            src="/images/right-btn-icon.png"
            alt="R"
            class="w-[21px] h-[21px]"
            draggable="false"
          />
        </button>
      </div>

      <div class="flex items-center gap-2 shrink-0 z-10">
        <span class="wip-badge" role="status" aria-label="Work in progress">
          WORK_IN_PROGRESS
        </span>
        <button
          class="flex p-2 text-[#919191] hover:text-white hover:bg-[#353535] transition-all focus:outline-none"
          :aria-label="isMuted ? 'Unmute Audio' : 'Mute Audio'"
          @click.stop="toggleMute"
        >
          <span class="material-symbols-outlined text-xl">
            {{ isMuted ? 'volume_off' : 'volume_up' }}
          </span>
        </button>
        <button
          class="hidden xl:flex p-2 text-[#919191] hover:text-white hover:bg-[#353535] transition-all"
          aria-label="Terminal"
        >
          <span class="material-symbols-outlined text-xl">terminal</span>
        </button>
      </div>
    </nav>

    <!-- ── MAIN CONTENT ────────────────────────────────────── -->
    <!-- Mobile : scrollable, sits between top nav and mobile bottom nav -->
    <!-- Desktop: overflow-hidden, sits between top nav and keyboard+footer bars -->
    <main
      ref="mainRef"
      class="hud-page crt-warp absolute lg:relative inset-x-0 top-14 z-10 bottom-16 flex flex-col overflow-x-hidden overflow-y-auto xl:bottom-[72px] xl:h-[calc(100vh-132px)] xl:overflow-hidden"
    >
      <slot />
    </main>

    <!-- ── MOBILE BOTTOM NAVIGATION ───────────────────────── -->
    <nav
      class="xl:hidden fixed bottom-0 inset-x-0 z-50 flex h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]"
    >
      <NuxtLink
        v-for="item in mobileNavItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'group flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150',
          isActive(item.path)
            ? 'bg-white text-black'
            : 'text-[#919191] hover:text-white hover:bg-[#1f1f1f]',
        ]"
      >
        <img
          v-if="item.iconSrc"
          :src="item.iconSrc"
          :alt="item.label"
          class="h-4 w-4 shrink-0"
          :class="
            isActive(item.path)
              ? 'brightness-0'
              : 'brightness-0 invert opacity-60 group-hover:opacity-100'
          "
          draggable="false"
        />
        <span v-else class="material-symbols-outlined text-xl leading-none">{{
          item.icon
        }}</span>
        <span
          class="font-mono text-[8px] uppercase tracking-widest font-bold"
          >{{ item.label }}</span
        >
      </NuxtLink>
    </nav>

    <!-- ── KEYBOARD NAVIGATION BAR (desktop only) ─────────── -->
    <div
      class="hidden xl:flex fixed bottom-10 inset-x-0 h-9 z-50 items-center gap-4 px-8 bg-black border-t border-white/5"
    >
      <span class="hud-label !text-[8px] shrink-0">NAVIGATION</span>

      <div class="flex items-center gap-0.5">
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="
            isPressed('ArrowLeft')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Focus left"
          @click="
            () => {
              hudKey = 'ArrowLeft';
              nextTick(() => {
                hudKey = null;
              });
            }
          "
        >
          <img
            src="/images/left-arrow.png"
            alt="←"
            class="h-7 w-auto"
            draggable="false"
          />
        </button>
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="
            isPressed('ArrowUp')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Focus up"
          @click="
            () => {
              hudKey = 'ArrowUp';
              nextTick(() => {
                hudKey = null;
              });
            }
          "
        >
          <img
            src="/images/top-arrow.png"
            alt="↑"
            class="h-7 w-auto"
            draggable="false"
          />
        </button>
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="
            isPressed('ArrowDown')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Focus down"
          @click="
            () => {
              hudKey = 'ArrowDown';
              nextTick(() => {
                hudKey = null;
              });
            }
          "
        >
          <img
            src="/images/down-arrow.png"
            alt="↓"
            class="h-7 w-auto"
            draggable="false"
          />
        </button>
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="
            isPressed('ArrowRight')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Focus right"
          @click="
            () => {
              hudKey = 'ArrowRight';
              nextTick(() => {
                hudKey = null;
              });
            }
          "
        >
          <img
            src="/images/right-arrow.png"
            alt="→"
            class="h-7 w-auto"
            draggable="false"
          />
        </button>
      </div>

      <div class="w-px h-5 bg-[#474747] shrink-0" />

      <span class="hud-label !text-[8px] shrink-0">INTERACT</span>

      <button
        class="transition-all duration-100 focus:outline-none leading-none"
        :class="
          isPressed('Enter')
            ? 'opacity-100 scale-90'
            : 'opacity-60 hover:opacity-100'
        "
        aria-label="Interact"
      >
        <svg
          width="64"
          height="28"
          viewBox="0 0 64 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="26.5"
            rx="4.5"
            stroke="white"
            stroke-opacity="0.75"
            stroke-width="1.5"
          />
          <text
            x="32"
            y="18"
            text-anchor="middle"
            font-family="monospace"
            font-size="8.5"
            fill="white"
            fill-opacity="0.75"
            letter-spacing="0.3"
          >
            ↵ return
          </text>
        </svg>
      </button>

      <div class="w-px h-5 bg-[#474747] shrink-0" />

      <button
        class="transition-all duration-100 focus:outline-none leading-none"
        :class="
          isPressed('Escape')
            ? 'opacity-100 scale-90'
            : 'opacity-60 hover:opacity-100'
        "
        aria-label="Go to STATS"
        @click="router.push('/')"
      >
        <img
          src="/images/esc-key.png"
          alt="Esc"
          class="h-7 w-auto"
          draggable="false"
        />
      </button>
    </div>

    <!-- ── BOTTOM STATUS BAR (desktop only) ──────────────────── -->
    <footer
      class="hidden xl:flex fixed bottom-0 inset-x-0 h-10 z-50 items-center justify-between px-8 bg-black border-t border-white/10"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-white animate-pulse" />
          <span
            class="font-mono text-[8px] text-white uppercase tracking-[0.15em]"
            >SYSTEM SYNCHRONIZED</span
          >
        </div>
        <span class="font-mono text-[8px] text-[#919191]"
          >LOC: 40.7128° N, 74.0060° W</span
        >
      </div>
      <div class="flex items-center gap-4">
        <span class="font-mono text-[8px] text-[#919191]"
          >RAM: 128GB // NEURAL_LINK: 1.2TBPS</span
        >
        <div class="w-32 h-1.5 bg-[#353535] relative">
          <div class="absolute inset-y-0 left-0 bg-white" style="width: 70%" />
        </div>
      </div>
    </footer>
  </div>
</template>
