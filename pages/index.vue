<script setup lang="ts">
useSeoMeta({
  title: "CH_SANTANA_OS_V3 // STATS",
  description: "Christopher Santana — Full Stack Engineer. STATS page.",
});

const hudKey = useHudNav();

interface Upgrade {
  icon: string;
  label: string;
  tooltip: string[];
}

// ── PERMANENT UPGRADES ───────────────────────────────────────────
const upgrades: Upgrade[] = [
  {
    icon: "school",
    label: "EDUCATION",
    tooltip: [
      "MS INFORMATION SYSTEMS",
      "// BARUCH COLLEGE",
      "AS MULTIMEDIA TECH",
      "// ITLA",
    ],
  },
  {
    icon: "design_services",
    label: "UI_UX_DESIGN",
    tooltip: [
      "FIGMA PROTOTYPING",
      "DESIGN SYSTEMS",
      "INTERFACE ARCHITECTURE",
      "COMPONENT LIBRARIES",
    ],
  },
  {
    icon: "layers",
    label: "FRONTEND",
    tooltip: ["HEADLESS CMS", "MICRO-FRONTENDS", "PERFORMANCE OPS"],
  },
  {
    icon: "phone_iphone",
    label: "MOBILE_DEV",
    tooltip: ["iOS // SWIFT", "SWIFTUI", "APP STORE PUBLISHING"],
  },
  {
    icon: "cloud",
    label: "CLOUD_OPS",
    tooltip: [
      "AWS INFRASTRUCTURE",
      "CI/CD PIPELINES",
      "WEBSOCKETS",
      "SERVERLESS",
      "WORDPRESS",
    ],
  },
  {
    icon: "storage",
    label: "DATABASES",
    tooltip: ["SQL // POSTGRESQL", "DYNAMODB", "FIRESTORE", "NOSQL DATABASES"],
  },
  {
    icon: "translate",
    label: "BILINGUAL_OPS",
    tooltip: ["ENGLISH // FLUENT", "SPANISH // NATIVE"],
  },
  {
    icon: "security",
    label: "CYBERSECURITY",
    tooltip: ["MS CONCENTRATION"],
  },
];

// ── AUGMENTS ─────────────────────────────────────────────────────
const skills = [
  {
    iconSrc: "/images/typescript-svgrepo-com.svg",
    name: "TYPESCRIPT",
    active: true,
    metadata: "javascript, typescript",
  },
  {
    iconSrc: "/images/react-svgrepo-com.svg",
    name: "REACT",
    metadata: "react",
  },
  {
    iconSrc: "/images/nextjs-svgrepo-com.svg",
    name: "NEXT JS",
    metadata: "nextjs",
  },
  {
    iconSrc: "/images/vuejs-svgrepo-com.svg",
    name: "VUEJS",
    metadata: "vuejs",
  },
  {
    iconSrc: "/images/nuxt-js-svgrepo-com.svg",
    name: "NUXT",
    metadata: "nuxt",
  },
  {
    iconSrc: "/images/nodejs-svgrepo-com.svg",
    name: "NODE_JS_RUNTIME",
    metadata: "node.js, rest api, supabase",
  },
  {
    iconSrc: "/images/aws-lambda-svgrepo-com.svg",
    name: "AWS_CLOUD",
    metadata: "aws, dynamodb, s3, lambdas, ec2",
  },
  {
    iconSrc: "/images/google-cloud-svgrepo-com.svg",
    name: "GOOGLE_GLOUD_PLATFORM",
    metadata: "gcp, firebase",
  },
  {
    iconSrc: "/images/figma-svgrepo-com.svg",
    name: "FIGMA_UI_DESIGN",
    metadata: "figma",
  },
  {
    iconSrc: "/images/graphql-svgrepo-com.svg",
    name: "GRAPHQL_REST_APIs",
    metadata: "graphql",
  },
  {
    iconSrc: "/images/python-127-svgrepo-com.svg",
    name: "PYTHON",
    metadata: "python",
  },
  {
    iconSrc: "/images/database-svgrepo-com.svg",
    name: "DATABASE_SYSTEMS",
    metadata: "database",
  },
  {
    iconSrc: "/images/headless.svg",
    name: "WORDPRESS_HEADLESS_CMS",
    metadata: "wordpress, headless cms",
  },
  {
    iconSrc: "/images/css.svg",
    name: "CSS_TAILWIND",
    metadata: "css, sass, tailwind",
  },
  {
    iconSrc: "/images/swift-svgrepo-com.svg",
    name: "SWIFT_SWIFTUI",
    metadata: "swift, ios development",
  },
];

const missions = [
  {
    name: "CANOPY SUPER APP",
    tags: "FRONT END ARCHITECTURE // WEB3",
    link: "https://testnet.app.canopynetwork.org/",
  },
  // { name: "SLATEMARK", tags: "iOS APP" },
  {
    name: "TIMOTHY SYKES",
    tags: "NUXT // AWS // NODE.JS // AI",
    link: "https://www.timothysykes.com/",
  },
  {
    name: "STOCKSTOTRADE",
    tags: "NUXT // AWS // NODE.JS // AI",
    link: "https://stockstotrade.com/",
  },
  // { name: "ENCORO", tags: "iOS APP // NODE.JS // AI" },
  {
    name: "HOW TO IMPROVE YOUR WEBSITES PERFORMANCE",
    tags: "ARTICLE",
    link: "https://www.linkedin.com/posts/chrisalesant_how-to-improve-page-load-times-and-web-core-activity-7165369185630425088-arOu?utm_source=share&utm_medium=member_desktop&rcm=ACoAABeuFBAB5t8zhgkSJO8kmWvEE1MK-4WMRqs",
  },
];

// ── Mobile / breakpoint state ─────────────────────────────────────
const isMobile = ref(false);

// ── Desktop mouse-following tooltip ──────────────────────────────
const tooltipIndex = ref<number | null>(null);
const mouseX = ref(0);
const mouseY = ref(0);

// The HUD is uniformly scaled via CSS `zoom` on large displays (see
// globals.css). Pointer coords are in real viewport px, but a fixed
// element's left/top are interpreted in the zoomed coordinate space,
// so we divide by the active zoom to keep the tooltip under the cursor.
const rootZoom = ref(1);
function readRootZoom() {
  const z = parseFloat(getComputedStyle(document.documentElement).zoom);
  rootZoom.value = Number.isFinite(z) && z > 0 ? z : 1;
}

const activeUpgrade = computed(() =>
  tooltipIndex.value !== null ? upgrades[tooltipIndex.value] : null,
);

function showTooltip(i: number) {
  if (isMobile.value) return;
  tooltipIndex.value = i;
}
function hideTooltip() {
  tooltipIndex.value = null;
}
function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
}

const tooltipStyle = computed(() => {
  const zoom = rootZoom.value;
  const gap = 14;
  const w = 190;
  // Convert real-viewport coords into the zoomed coordinate space.
  const mx = mouseX.value / zoom;
  const my = mouseY.value / zoom;
  const viewportW = window.innerWidth / zoom;
  const x = mx + gap + w > viewportW ? mx - gap - w : mx + gap;
  return {
    left: x + "px",
    top: my - 8 + "px",
    minWidth: w + "px",
  };
});

// ── Mobile expand state for upgrades ─────────────────────────────
const expandedUpgradeIndex = ref<number | null>(null);

const expandedUpgrade = computed(() =>
  expandedUpgradeIndex.value !== null
    ? upgrades[expandedUpgradeIndex.value]
    : null,
);

function toggleUpgrade(i: number) {
  if (!isMobile.value) return;
  expandedUpgradeIndex.value = expandedUpgradeIndex.value === i ? null : i;
}

// ── Upgrades scroll state (desktop fade hint) ─────────────────────
const upgradesRef = ref<HTMLElement | null>(null);
const upgradesAtBottom = ref(false);

function onUpgradesScroll() {
  if (!upgradesRef.value) return;
  const { scrollTop, scrollHeight, clientHeight } = upgradesRef.value;
  upgradesAtBottom.value = scrollTop + clientHeight >= scrollHeight - 2;
}

// ── Keyboard focus within right column ───────────────────────────
const UPGRADE_COUNT = upgrades.length;
const SKILL_COUNT = skills.length;
const MISSION_COUNT = missions.length;
const TOTAL = UPGRADE_COUNT + SKILL_COUNT + MISSION_COUNT;

const focusedIndex = ref<number | null>(null);

const focusedUpgrade = computed(() =>
  focusedIndex.value !== null && focusedIndex.value < UPGRADE_COUNT
    ? focusedIndex.value
    : null,
);
const focusedSkill = computed(() =>
  focusedIndex.value !== null &&
  focusedIndex.value >= UPGRADE_COUNT &&
  focusedIndex.value < UPGRADE_COUNT + SKILL_COUNT
    ? focusedIndex.value - UPGRADE_COUNT
    : null,
);
const focusedMission = computed(() =>
  focusedIndex.value !== null &&
  focusedIndex.value >= UPGRADE_COUNT + SKILL_COUNT
    ? focusedIndex.value - UPGRADE_COUNT - SKILL_COUNT
    : null,
);

const rightColRef = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);

function setItemRef(el: HTMLElement | null, i: number) {
  if (el) itemRefs.value[i] = el;
}

function scrollItemIntoView(i: number) {
  const el = itemRefs.value[i];
  if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

watch(hudKey, (key) => {
  if (!key) return;

  if (key === "ArrowDown") {
    if (focusedIndex.value === null) {
      focusedIndex.value = 0;
    } else {
      focusedIndex.value = Math.min(focusedIndex.value + 1, TOTAL - 1);
    }
    scrollItemIntoView(focusedIndex.value);
  }

  if (key === "ArrowUp") {
    if (focusedIndex.value === null) {
      focusedIndex.value = TOTAL - 1;
    } else {
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
    }
    scrollItemIntoView(focusedIndex.value);
  }

  if (key === "ArrowLeft" && focusedUpgrade.value !== null) {
    focusedIndex.value = Math.max(focusedIndex.value! - 1, 0);
  }
  if (key === "ArrowRight" && focusedUpgrade.value !== null) {
    focusedIndex.value = Math.min(focusedIndex.value! + 1, UPGRADE_COUNT - 1);
  }
});

// ── Lifecycle ────────────────────────────────────────────────────
let cleanupListeners: (() => void) | undefined;

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1200;
    if (!isMobile.value) expandedUpgradeIndex.value = null;
    readRootZoom();
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
  window.addEventListener("mousemove", onMouseMove);

  cleanupListeners = () => {
    window.removeEventListener("resize", checkMobile);
    window.removeEventListener("mousemove", onMouseMove);
  };
});

onUnmounted(() => {
  cleanupListeners?.();
});
</script>

<template>
  <!--
    Mobile  (<xl): flex-col, no height cap — scrolls inside layout's <main>
    Desktop (xl+): calc(100vh - 132px) grid, overflow-hidden — matches header + footer
  -->
  <div
    class="flex flex-col gap-5 px-4 py-4 xl:h-[calc(100vh-132px)] xl:grid xl:grid-cols-12 xl:gap-6 xl:px-8 xl:py-5 xl:overflow-hidden"
  >
    <!-- ════════════════════════════════════════════════════════
         LEFT SECTION
         Mobile : stacks first (identity → photo → service → biometrics)
         Desktop: col 1–3, flex-col
    ════════════════════════════════════════════════════════ -->
    <section
      class="flex flex-col gap-4 xl:gap-5 xl:overflow-y-auto xl:min-h-0 xl:col-span-4"
    >
      <!-- Identity card -->
      <div
        class="relative border-l-[3px] border-white pl-5 pr-3 py-2 flex-shrink-0"
      >
        <div class="corner-tr-w" />
        <div class="corner-br-w" />

        <span class="hud-label mb-2">IDENTITY_DATABASE</span>
        <h1
          class="font-semibold uppercase tracking-tighter leading-[0.88] text-white mt-1"
          style="font-size: clamp(2rem, 3.5vw, 3.2rem)"
        >
          CHRISTOPHER<br />SANTANA
        </h1>

        <div class="mt-5 space-y-3">
          <div>
            <span class="hud-label">EQUIPPED CLASS</span>
            <h2
              class="text-white font-bold uppercase tracking-widest mt-0.5"
              style="font-size: clamp(0.65rem, 1.1vw, 0.85rem)"
            >
              FULL_STACK_ENGINEER
            </h2>
          </div>
          <div>
            <h3 class="hud-label">LATEST MISSION</h3>
            <h4
              class="hidden lg:block mt-1 text-[#c6c6c6] leading-snug text-xs"
            >
              <span class="text-white">
                AI, FRONTEND, DATA_PIPELINES & STUFF</span
              >
              //<br />@STOCKS_TO_TRADE
            </h4>
            <h4 class="lg:hidden mt-1 text-[#c6c6c6] leading-snug text-xs">
              <span class="text-white">
                AI / FRONTEND / DATA_PIPELINES & STUFF</span
              >
              //<br />@ STOCKS_TO_TRADE
            </h4>
          </div>
        </div>
      </div>

      <!-- ── MOBILE-ONLY 3D MODEL ── (desktop version is in center section) -->
      <div
        class="xl:hidden relative border border-white/10 bg-black/50 overflow-hidden h-80 sm:h-96 flex-shrink-0"
      >
        <div
          class="absolute top-2 left-2 z-10 border-l border-t border-white/15 px-2 py-0.5"
        >
          <span class="font-mono text-[8px] text-[#919191] uppercase"
            >SCAN_LOCK: TARGET_ACQUIRED</span
          >
        </div>

        <div class="absolute inset-0 grid-bg opacity-[0.15] z-0" />

        <ClientOnly>
          <ModelViewer class="absolute inset-0 z-[5]" />
        </ClientOnly>

        <div class="absolute inset-0 scanline-overlay z-10" />

        <div
          class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-3 text-center z-20"
        >
          <div
            class="font-mono text-[9px] text-[#919191] uppercase tracking-widest"
          >
            SUIT INTEGRITY HIGH
          </div>
          <div
            class="font-mono text-[7px] text-[#474747] uppercase tracking-widest mt-0.5"
          >
            OPTIMAL_V_2.4
          </div>
        </div>

        <div class="corner-tl-w" />
        <div class="corner-tr-w" />
        <div class="corner-bl-w" />
        <div class="corner-br-w" />
      </div>

      <ProfileStatsPanel />
    </section>

    <!-- ════════════════════════════════════════════════════════
         CENTER SECTION — DESKTOP ONLY photo (col 4–6)
         Hidden on mobile; mobile photo lives in the left section above
    ════════════════════════════════════════════════════════ -->
    <section
      id="3d-model-area"
      class="hidden lg:flex lg:col-span-4 lg:flex-col lg:min-h-0 lg:relative"
    >
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-white/20 z-10"
      />
      <div
        class="absolute top-2 left-2 z-10 border-l border-t border-white/15 px-2 py-0.5"
      >
        <span class="font-mono text-[8px] text-[#919191] uppercase"
          >SCAN_LOCK: TARGET_ACQUIRED</span
        >
      </div>

      <div
        class="relative flex-1 border border-white/10 bg-black/50 overflow-hidden"
      >
        <!-- Faint holo-grid backdrop -->
        <div class="absolute inset-0 grid-bg opacity-[0.15] z-0" />

        <!-- THREE.js holographic 3D model -->
        <ClientOnly>
          <ModelViewer class="absolute inset-0 z-[5]" />
        </ClientOnly>

        <div class="absolute inset-0 scanline-overlay z-10" />

        <div
          class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-3 text-center z-20"
        >
          <div class="flex justify-center mb-1.5">
            <div
              class="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[11px] border-l-transparent border-r-transparent border-b-white/25"
            />
          </div>
          <div
            class="font-mono text-[9px] text-[#919191] uppercase tracking-widest"
          >
            SUIT INTEGRITY HIGH
          </div>
          <div
            class="font-mono text-[7px] text-[#474747] uppercase tracking-widest mt-0.5"
          >
            OPTIMAL_V_2.4
          </div>
        </div>

        <div class="corner-tl-w" />
        <div class="corner-tr-w" />
        <div class="corner-bl-w" />
        <div class="corner-br-w" />
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         RIGHT SECTION — upgrades / augments / missions
         Mobile : stacks after left section
         Desktop: col 7–12, flex-col with internal scrollable lists
    ════════════════════════════════════════════════════════ -->
    <section
      ref="rightColRef"
      class="flex flex-col gap-5 xl:col-span-4 xl:gap-4 xl:overflow-hidden xl:min-h-0"
    >
      <!-- ── PERMANENT UPGRADES ── -->
      <div class="flex-shrink-0">
        <h3 class="hud-label mb-2 font-semibold lg:font-normal">
          CORE_COMPETENCIES
        </h3>

        <div class="relative">
          <!-- Desktop: scrollable with max-height; Mobile: plain grid (no cap) -->
          <div
            ref="upgradesRef"
            class="xl:overflow-y-auto xl:max-h-[28vh]"
            @scroll="onUpgradesScroll"
          >
            <div class="grid lg:grid-cols-4 grid-cols-3 gap-2">
              <div
                v-for="(upgrade, i) in upgrades"
                :key="upgrade.label"
                :ref="(el) => setItemRef(el as HTMLElement, i)"
                :class="[
                  'relative border flex flex-col h-[112px] lg:h-auto items-center justify-center cursor-pointer transition-all duration-150 group',
                  'py-3 gap-1 xl:aspect-square xl:py-0 xl:gap-0',
                  focusedUpgrade === i ||
                  (isMobile && expandedUpgradeIndex === i)
                    ? 'bg-white text-black border-white'
                    : 'bg-[#353535]/30 border-white/10 hover:bg-white hover:text-black',
                ]"
                :aria-label="upgrade.label"
                @mouseenter="showTooltip(i)"
                @mouseleave="hideTooltip"
                @click="toggleUpgrade(i)"
              >
                <span
                  class="material-symbols-outlined text-[24px] leading-none"
                  >{{ upgrade.icon }}</span
                >

                <!-- Label: mobile only, hidden on desktop (tooltip handles it) -->
                <span
                  class="xl:hidden font-mono text-[12px] lg:text-[6px] uppercase tracking-normal text-center leading-tight px-0.5 mt-0.5"
                  :class="
                    isMobile && expandedUpgradeIndex === i
                      ? 'text-black'
                      : 'text-[#919191]'
                  "
                >
                  {{ upgrade.label.replace(/_/g, " ") }}
                </span>
              </div>
            </div>
          </div>

          <!-- Desktop scroll fade gradient -->
          <Transition name="fade">
            <div
              v-if="!upgradesAtBottom"
              class="hidden xl:block absolute bottom-0 inset-x-0 h-12 pointer-events-none"
              style="
                background: linear-gradient(
                  to top,
                  #131313 0%,
                  transparent 100%
                );
              "
            />
          </Transition>
        </div>

        <!-- Mobile expand panel: appears below the grid when an upgrade is tapped -->
        <Transition name="expand">
          <div
            v-if="expandedUpgrade && isMobile"
            class="mt-2 border border-white/20 p-3 bg-[#1a1a1a] xl:hidden"
          >
            <p class="hud-label !text-[10px] mb-2">
              {{ expandedUpgrade.label }}
            </p>
            <div
              v-for="item in expandedUpgrade.tooltip"
              :key="item"
              class="font-mono text-[10px] text-[#e2e2e2] leading-relaxed"
            >
              {{ item }}
            </div>
          </div>
        </Transition>
      </div>

      <TechStackList
        :skills="skills"
        :focused-skill="focusedSkill"
        :ref-offset="UPGRADE_COUNT"
        :set-item-ref="setItemRef"
      />

      <ProjectsList
        :missions="missions"
        :focused-mission="focusedMission"
        :ref-offset="UPGRADE_COUNT + SKILL_COUNT"
        :set-item-ref="setItemRef"
      />
    </section>
  </div>

  <!-- ── Desktop tooltip — rendered at body level, follows mouse ── -->
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-if="activeUpgrade && !isMobile"
        class="fixed z-[9999] pointer-events-none bg-[#131313] border border-[#474747] p-3 shadow-2xl"
        :style="tooltipStyle"
      >
        <p class="hud-label !text-[12px] mb-2">{{ activeUpgrade.label }}</p>
        <div
          v-for="item in activeUpgrade.tooltip"
          :key="item"
          class="font-mono text-[12px] text-[#e2e2e2] leading-relaxed"
        >
          {{ item }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(calc(-100% - 4px));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile expand panel for upgrades */
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.2s ease,
    max-height 0.25s ease;
  overflow: hidden;
  max-height: 200px;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
