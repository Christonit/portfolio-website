<script setup lang="ts">
// import { useAudio } from '~/composables/useAudio';
import { LINKEDIN_URL } from "~/utils/site";

const router = useRouter();
const route = useRoute();
const hudKey = useHudNav();
// Audio temporarily disabled
// const { isMuted, initAudio, toggleMute, playHover, playClick, playHaptic } = useAudio();
const playHaptic = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(15);
  }
};

const pages = ["/", "/projects", "/bio"];

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
    case "a":
    case "A":
      e.preventDefault();
      flash("A");
      prevPage();
      break;
    case "d":
    case "D":
      e.preventDefault();
      flash("D");
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

// let lastHoveredElement: HTMLElement | null = null;

// Audio temporarily disabled
// function onGlobalMouseOver(e: MouseEvent) {
//   const target = (e.target as HTMLElement).closest(
//     'a, button, [role="button"], .cursor-pointer, [class*="cursor-pointer"], [data-sound-hover]'
//   ) as HTMLElement | null;
//
//   if (target) {
//     if (target !== lastHoveredElement) {
//       lastHoveredElement = target;
//       playHover();
//     }
//   } else {
//     lastHoveredElement = null;
//   }
// }
//
// function onGlobalMouseOut(e: MouseEvent) {
//   if (lastHoveredElement && !lastHoveredElement.contains(e.relatedTarget as Node)) {
//     lastHoveredElement = null;
//   }
// }

function onGlobalClick(e: MouseEvent) {
  // playClick();

  // Trigger brief vibration on tapping links, buttons, and navigation elements
  const target = (e.target as HTMLElement).closest(
    'a, button, [role="button"], .cursor-pointer, [class*="cursor-pointer"], [data-sound-hover]',
  );
  if (target) {
    playHaptic();
  }
}

onMounted(() => {
  // initAudio();
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("click", onGlobalClick);
  // window.addEventListener("mouseover", onGlobalMouseOver);
  // window.addEventListener("mouseout", onGlobalMouseOut);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", onGlobalClick);
  // window.removeEventListener("mouseover", onGlobalMouseOver);
  // window.removeEventListener("mouseout", onGlobalMouseOut);
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
    <div class="fixed inset-0 grid-bg opacity-[0.12] z-0 pointer-events-none" />

    <!-- ── TOP NAVIGATION ──────────────────────────────────── -->
    <nav
      class="site-nav fixed top-0 inset-x-0 h-14 z-50 flex items-center px-4 xl:px-8 bg-[#131313]/95 backdrop-blur-sm border-b border-white/10"
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
          class="site-nav-key mr-6 hidden items-center justify-center transition-all duration-100 xl:inline-flex"
          :class="
            isPressed('A')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Previous page (A)"
          aria-keyshortcuts="A"
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
        <ul class="hidden xl:flex items-center gap-10">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              :class="[
                'text-label-data inline-flex h-8 items-center px-1 tracking-[0.2em] uppercase transition-colors duration-150',
                isActive(item.path)
                  ? 'text-white'
                  : 'text-[#919191] hover:text-white',
              ]"
            >
              <span
                :class="
                  isActive(item.path)
                    ? 'relative pb-1 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-[calc(100%-0.2em)] after:-translate-x-1/2 after:bg-white'
                    : ''
                "
              >
                {{ item.label }}
              </span>
            </NuxtLink>
          </li>
        </ul>

        <!-- Next-page keyboard control (desktop only) -->
        <button
          class="site-nav-key ml-6 hidden items-center justify-center transition-all duration-100 xl:inline-flex"
          :class="
            isPressed('D')
              ? 'opacity-100 scale-90'
              : 'opacity-60 hover:opacity-100'
          "
          aria-label="Next page (D)"
          aria-keyshortcuts="D"
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
        <!-- Audio temporarily disabled
        <button
          class="flex p-2 text-[#919191] hover:text-white hover:bg-[#353535] transition-all focus:outline-none"
          :aria-label="isMuted ? 'Unmute Audio' : 'Mute Audio'"
          @click.stop="toggleMute"
        >
          <span class="material-symbols-outlined text-xl">
            {{ isMuted ? 'volume_off' : 'volume_up' }}
          </span>
        </button>
        -->
        <a
          :href="LINKEDIN_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-8 items-center justify-center px-1 text-[#919191] transition-all hover:bg-[#353535] hover:text-white"
          aria-label="LinkedIn profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            class="h-[20px] w-[20px] shrink-0"
            aria-hidden="true"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        </a>
      </div>
    </nav>

    <!-- ── MAIN CONTENT ────────────────────────────────────── -->
    <!-- Mobile : scrollable, sits between top nav and mobile bottom nav -->
    <!-- Desktop: uses the full viewport below the top navigation -->
    <main
      ref="mainRef"
      class="hud-page absolute inset-x-0 top-14 z-10 bottom-16 flex flex-col overflow-x-hidden overflow-y-auto xl:bottom-0 xl:overflow-hidden"
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
        <span class="text-label-data uppercase tracking-widest">{{
          item.label
        }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
