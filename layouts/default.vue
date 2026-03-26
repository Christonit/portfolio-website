<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const hudKey = useHudNav()

const pages = ['/', '/bio', '/contact']

const currentIndex = computed(() => {
  const i = pages.indexOf(route.path)
  return i === -1 ? 0 : i
})

// ── Tab / page navigation ────────────────────────────────────────
function prevPage() {
  router.push(pages[(currentIndex.value - 1 + pages.length) % pages.length])
}
function nextPage() {
  router.push(pages[(currentIndex.value + 1) % pages.length])
}

// ── Pressed-key flash for visual feedback ────────────────────────
const pressed = ref<string | null>(null)
function flash(key: string) {
  pressed.value = key
  setTimeout(() => { pressed.value = null }, 160)
}
const isPressed = (key: string) => pressed.value === key

// ── Global keyboard handler ──────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  switch (e.key) {
    case 'l':
    case 'L':
    case '[':
    case 'PageUp':
      e.preventDefault()
      flash('ArrowLeft')
      prevPage()
      break
    case 'r':
    case 'R':
    case ']':
    case 'PageDown':
      e.preventDefault()
      flash('ArrowRight')
      nextPage()
      break
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      e.preventDefault()
      flash(e.key)
      hudKey.value = e.key as typeof hudKey.value
      nextTick(() => { hudKey.value = null })
      break
    case 'Escape':
      flash('Escape')
      router.push('/')
      break
    case 'Enter':
      flash('Enter')
      break
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// ── Nav items ────────────────────────────────────────────────────
const navItems = [
  { label: 'STATS', path: '/' },
  { label: 'BIO', path: '/bio' },
  { label: 'GET_IN_TOUCH', path: '/contact' },
]
const isActive = (path: string) => route.path === path
</script>

<template>
  <div class="relative h-screen overflow-hidden bg-[#131313] text-[#e2e2e2]">

    <div class="fixed inset-0 grid-bg opacity-[0.12] z-0 pointer-events-none" />
    <div class="fixed inset-0 scanline-overlay z-[999] pointer-events-none" />

    <!-- ── TOP NAVIGATION ──────────────────────────────────── -->
    <nav class="fixed top-0 inset-x-0 h-14 z-50 flex items-center px-4 xl:px-8 bg-[#131313]/95 backdrop-blur-sm border-b border-white/10">

      <div class="text-white font-semibold text-sm xl:text-lg tracking-tighter uppercase select-none mr-auto">
        CH_SANTANA_OS_V2
      </div>

      <!-- L button → previous tab (desktop only) -->
      <button
        class="hidden xl:block mr-6 transition-all duration-100 focus:outline-none"
        :class="isPressed('ArrowLeft') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
        aria-label="Previous tab"
        @click="prevPage"
      >
        <img src="/images/left-btn-icon.png" alt="L" class="w-[21px] h-[21px]" draggable="false" />
      </button>

      <!-- Page links -->
      <ul class="flex items-center gap-5 xl:gap-10">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :class="[
              'font-mono text-[10px] xl:text-xs tracking-[0.15em] xl:tracking-[0.2em] uppercase transition-colors duration-150',
              isActive(item.path)
                ? 'text-white border-b border-white pb-px'
                : 'text-[#919191] hover:text-white',
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- R button → next tab (desktop only) -->
      <button
        class="hidden xl:block ml-6 transition-all duration-100 focus:outline-none"
        :class="isPressed('ArrowRight') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
        aria-label="Next tab"
        @click="nextPage"
      >
        <img src="/images/right-btn-icon.png" alt="R" class="w-[21px] h-[21px]" draggable="false" />
      </button>

      <button class="hidden xl:flex ml-6 p-2 text-[#919191] hover:text-white hover:bg-[#353535] transition-all" aria-label="Terminal">
        <span class="material-symbols-outlined text-xl">terminal</span>
      </button>
    </nav>

    <!-- ── MAIN CONTENT ────────────────────────────────────── -->
    <!-- Mobile: scrollable, stops above footer only -->
    <!-- Desktop: overflow-hidden, stops above both keyboard bar + footer -->
    <main class="absolute inset-x-0 top-14 z-10 bottom-10 overflow-y-auto xl:bottom-[72px] xl:overflow-hidden">
      <slot />
    </main>

    <!-- ── KEYBOARD NAVIGATION BAR (desktop only) ─────────── -->
    <div class="hidden xl:flex fixed bottom-10 inset-x-0 h-9 z-50 items-center gap-4 px-8 bg-black border-t border-white/5">

      <span class="hud-label !text-[8px] shrink-0">NAVIGATION</span>

      <div class="flex items-center gap-0.5">
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="isPressed('ArrowLeft') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
          aria-label="Focus left"
          @click="() => { hudKey = 'ArrowLeft'; nextTick(() => { hudKey = null }) }"
        >
          <img src="/images/left-arrow.png" alt="←" class="h-7 w-auto" draggable="false" />
        </button>
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="isPressed('ArrowUp') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
          aria-label="Focus up"
          @click="() => { hudKey = 'ArrowUp'; nextTick(() => { hudKey = null }) }"
        >
          <img src="/images/top-arrow.png" alt="↑" class="h-7 w-auto" draggable="false" />
        </button>
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="isPressed('ArrowDown') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
          aria-label="Focus down"
          @click="() => { hudKey = 'ArrowDown'; nextTick(() => { hudKey = null }) }"
        >
          <img src="/images/down-arrow.png" alt="↓" class="h-7 w-auto" draggable="false" />
        </button>
        <button
          class="transition-all duration-100 focus:outline-none leading-none"
          :class="isPressed('ArrowRight') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
          aria-label="Focus right"
          @click="() => { hudKey = 'ArrowRight'; nextTick(() => { hudKey = null }) }"
        >
          <img src="/images/right-arrow.png" alt="→" class="h-7 w-auto" draggable="false" />
        </button>
      </div>

      <div class="w-px h-5 bg-[#474747] shrink-0" />

      <span class="hud-label !text-[8px] shrink-0">INTERACT</span>

      <button
        class="transition-all duration-100 focus:outline-none leading-none"
        :class="isPressed('Enter') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
        aria-label="Interact"
      >
        <svg width="64" height="28" viewBox="0 0 64 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="0.75" width="62.5" height="26.5" rx="4.5" stroke="white" stroke-opacity="0.75" stroke-width="1.5" />
          <text x="32" y="18" text-anchor="middle" font-family="monospace" font-size="8.5" fill="white" fill-opacity="0.75" letter-spacing="0.3">↵ return</text>
        </svg>
      </button>

      <div class="w-px h-5 bg-[#474747] shrink-0" />

      <button
        class="transition-all duration-100 focus:outline-none leading-none"
        :class="isPressed('Escape') ? 'opacity-100 scale-90' : 'opacity-60 hover:opacity-100'"
        aria-label="Go to STATS"
        @click="router.push('/')"
      >
        <img src="/images/esc-key.png" alt="Esc" class="h-7 w-auto" draggable="false" />
      </button>
    </div>

    <!-- ── BOTTOM STATUS BAR ──────────────────────────────── -->
    <footer class="fixed bottom-0 inset-x-0 h-10 z-50 flex items-center justify-between px-4 xl:px-8 bg-black border-t border-white/10">
      <div class="flex items-center gap-3 xl:gap-6">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-white animate-pulse" />
          <span class="font-mono text-[8px] text-white uppercase tracking-[0.15em]">SYSTEM SYNCHRONIZED</span>
        </div>
        <span class="hidden xl:block font-mono text-[8px] text-[#919191]">LOC: 40.7128° N, 74.0060° W</span>
      </div>
      <div class="hidden xl:flex items-center gap-4">
        <span class="font-mono text-[8px] text-[#919191]">RAM: 128GB // NEURAL_LINK: 1.2TBPS</span>
        <div class="w-32 h-1.5 bg-[#353535] relative">
          <div class="absolute inset-y-0 left-0 bg-white" style="width: 70%" />
        </div>
      </div>
      <!-- Mobile: current page indicator -->
      <span class="xl:hidden font-mono text-[8px] text-[#919191] uppercase tracking-widest">
        {{ navItems[currentIndex]?.label }}
      </span>
    </footer>

  </div>
</template>
