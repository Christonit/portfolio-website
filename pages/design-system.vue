<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { pageTitle } from "~/utils/site";
import { typography, type TypographyStyleKey } from "~/utils/typography";

useSeoMeta({
  robots: "noindex, nofollow",
});

usePageSeo({
  title: pageTitle("Design System"),
  description:
    "The typography, color, space, layout, stacking, and motion tokens used across Christopher Santana's portfolio.",
  pageType: "CollectionPage",
});

/**
 * Every table on this page lists token *names* only — values are read back off
 * the live stylesheet at mount (see `resolved`). The page used to restate the
 * hex codes in its own array, which is a documentation page that can quietly
 * disagree with the thing it documents. Swatches and bars paint from
 * `var(--token)` directly, so they are correct even before the script runs.
 */

const sections = [
  { id: "type", label: "TYPE" },
  { id: "color", label: "COLOR" },
  { id: "space", label: "SPACE" },
  { id: "radius", label: "RADIUS" },
  { id: "layout", label: "LAYOUT" },
  { id: "icons", label: "ICONS" },
  { id: "stacking", label: "STACKING" },
  { id: "motion", label: "MOTION" },
  { id: "parts", label: "PARTS" },
];

/* The raw step scale. Distinct from the semantic scale below it: these are the
   six sizes anything may be, `typography.ts` is the named roles built on them. */
const typeSteps = [
  { name: "2XS", token: "--text-2xs", usage: "Micro labels and tags. Mono only." },
  { name: "XS", token: "--text-xs", usage: "Labels, metadata, captions." },
  { name: "SM", token: "--text-sm", usage: "Compact body, list rows." },
  { name: "BASE", token: "--text-base", usage: "Long-form reading copy." },
  { name: "LG", token: "--text-lg", usage: "Card and section titles." },
  { name: "HERO", token: "--text-hero", usage: "Home hero only — the one fluid size." },
];

const colorGroups = [
  {
    label: "FILLS",
    note: "Surfaces, recessed to raised.",
    swatches: [
      { name: "PANEL", token: "--color-panel", usage: "Recessed panels, wells, letterbox." },
      { name: "CANVAS", token: "--color-canvas", usage: "The page; inverse ink." },
      { name: "SURFACE", token: "--color-surface", usage: "Raised fills, key faces, hovers." },
    ],
  },
  {
    label: "LINES",
    note: "Borders, rules, corner marks, key edges. Never text — 2.6:1 on the canvas.",
    swatches: [{ name: "RULE", token: "--color-rule", usage: "Every border in the app." }],
  },
  {
    label: "TEXT",
    note: "MUTED is the darkest tier clearing WCAG AA (5.9:1) — the floor for anything readable.",
    swatches: [
      { name: "MUTED", token: "--color-muted", usage: "Labels, metadata." },
      { name: "PROSE", token: "--color-prose", usage: "Long-form reading copy." },
      { name: "BODY", token: "--color-body", usage: "UI strings." },
      { name: "INK", token: "--color-ink", usage: "Headings, emphasis." },
    ],
  },
  {
    label: "ACCENT",
    note: "The only chromatic value in the system.",
    swatches: [{ name: "SIGNAL", token: "--color-signal", usage: "Live state, hover, links." }],
  },
];

const colors = colorGroups.flatMap((group) => group.swatches);

/* The whole scale. N x 4px, matching the Tailwind utility number: --space-3
   and p-3 are both 12px. It doubles every two steps, so adjacent values are
   far enough apart to be a choice rather than a coin flip. */
const spaceSteps = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32];

const layout = [
  { name: "DOSSIER MAX", token: "--dossier-max-w", usage: "Sheet panel width ceiling." },
  { name: "DOSSIER GUTTER", token: "--dossier-gutter", usage: "Space either side; the pager rails centre in it." },
];

/* Each row renders the icon that actually uses that size, at that size. Both
   rows used to draw `fingerprint`, which made LG look like a size nothing
   asked for — it is the project-card thumbnail, and it draws `deployed_code`. */
const icons = [
  {
    name: "MD",
    token: "--icon-md",
    icon: "fingerprint",
    usage: "Inline with a control or label — the bottom nav, the dossier close.",
  },
  {
    name: "LG",
    token: "--icon-lg",
    icon: "deployed_code",
    usage: "Standalone, card-scale — a project card with no preview image.",
  },
];

const layers = [
  { name: "SHEET SCRIM", token: "--z-sheet-scrim", usage: "Dossier backdrop." },
  { name: "NAV", token: "--z-nav", usage: "Site header." },
  { name: "SHEET", token: "--z-sheet", usage: "Dossier panel." },
  { name: "SHEET RAIL", token: "--z-sheet-rail", usage: "Project pager rails." },
  { name: "NAV MOBILE", token: "--z-nav-mobile", usage: "Bottom nav." },
  { name: "SKIP LINK", token: "--z-skip-link", usage: "First Tab target." },
  { name: "TOOLTIP", token: "--z-tooltip", usage: "Cursor-following card." },
];

const motionGroups = [
  {
    label: "PRIMITIVES",
    note: "The vocabulary. A sequence below is built from these, never from a new number.",
    rows: [
      { name: "MICRO", token: "--duration-micro", usage: "Colour and opacity nudges." },
      { name: "QUICK", token: "--duration-quick", usage: "Hover and focus states." },
      { name: "FAST", token: "--duration-fast", usage: "Element-level travel." },
      { name: "VERY SLOW", token: "--duration-very-slow", usage: "Scroll reveals." },
      { name: "STAGGER", token: "--duration-stagger", usage: "Per-item offset in a list." },
      { name: "OUT", token: "--ease-out", usage: "Default curve." },
      { name: "SMOOTH OUT", token: "--ease-smooth-out", usage: "Travel that settles." },
      { name: "MICRO DIST", token: "--distance-micro", usage: "Corner marks, hover nudges." },
    ],
  },
  {
    label: "PAGE",
    note: "Link-to-link navigation. The fade runs on a shorter clock than the slide, so neither page waits on its travel.",
    rows: [
      { name: "SLIDE", token: "--page-slide-dur", usage: "Travel." },
      { name: "FADE", token: "--page-fade-dur", usage: "Crossfade — deliberately shorter." },
      { name: "DISTANCE", token: "--vt-slide-distance", usage: "A hint of direction, not a journey." },
      { name: "BLUR", token: "--page-blur", usage: "Applied through the fade." },
      { name: "SLIDE EASE", token: "--page-slide-ease", usage: "Travel curve." },
      { name: "FADE EASE", token: "--page-fade-ease", usage: "Opacity curve." },
    ],
  },
  {
    label: "MODAL",
    note: "The project dossier rising over the page that launched it, which recedes behind it.",
    rows: [
      { name: "TRAVEL", token: "--page-modal-dur", usage: "Rise and recede." },
      { name: "FADE IN", token: "--page-modal-fade-in-dur", usage: "Short, so the pages do not stack legibly." },
      { name: "FADE OUT", token: "--page-modal-fade-out-dur", usage: "Shorter still." },
      { name: "RISE", token: "--page-modal-rise", usage: "How far the sheet travels." },
      { name: "SCALE", token: "--page-modal-scale", usage: "How far the backdrop recedes." },
      { name: "BLUR", token: "--page-modal-blur", usage: "On the receding page." },
    ],
  },
  {
    label: "TOOLTIP",
    note: "Opens on a delay so a cursor crossing the row does not flash it; closes almost instantly.",
    rows: [
      { name: "DELAY", token: "--tt-delay", usage: "Intent filter before opening." },
      { name: "IN", token: "--tt-in-dur", usage: "Open." },
      { name: "OUT", token: "--tt-out-dur", usage: "Close — fast, it is already read." },
      { name: "SCALE", token: "--tt-scale", usage: "Entrance scale." },
    ],
  },
  {
    label: "REVEAL",
    note: "Scroll-triggered slide-up. Slow on purpose — it plays once, under reading.",
    rows: [
      { name: "DURATION", token: "--scroll-reveal-dur", usage: "Full travel." },
      { name: "DISTANCE", token: "--scroll-reveal-distance", usage: "Rise from rest." },
      { name: "EASE", token: "--scroll-reveal-ease", usage: "Settling curve." },
    ],
  },
];

const typographyUtilities = {
  display: "text-display",
  "heading-lg": "text-heading-lg",
  "heading-section": "text-heading-section",
  "title-ui": "text-title-ui",
  "body-compact": "text-body-compact",
  "body-prose": "text-body-prose",
  "label-ui": "text-label-ui",
  "label-data": "text-label-data",
} satisfies Record<TypographyStyleKey, string>;

const typeScale = (Object.keys(typography) as TypographyStyleKey[]).map((key) => ({
  key,
  utility: typographyUtilities[key],
  ...typography[key],
}));

const familyName = (familyRole: (typeof typography)[TypographyStyleKey]["familyRole"]) =>
  familyRole === "mono" ? "Departure Mono" : "Tomorrow";

const swatchCount = String(colors.length).padStart(2, "0");

/* PARTS mounts the real card against the real first project rather than a
   fixture, so a change to the card or to its data shows up here the same way
   it shows up on the board. */
const sampleProject = (projectsJson as ProjectPreview[])[0];

/* ── Live values ─────────────────────────────────────────────── */

const resolved = ref<Record<string, string>>({});

// Colour tokens resolve to `rgb(19 19 19)` — the honest computed value, but not
// the form anyone types. Hex for colours, raw for everything else.
const toHex = (value: string) => {
  const channels = value.match(/-?[\d.]+/g);
  if (!value.startsWith("rgb") || !channels || channels.length < 3) return value;
  return `#${channels
    .slice(0, 3)
    .map((channel) => Number(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
};

/* ── Scroll spy ──────────────────────────────────────────────── */

const railRef = ref<HTMLElement | null>(null);
const activeSection = ref(sections[0].id);

/**
 * Deterministic rather than IntersectionObserver: the active entry is the last
 * heading that has passed the read line. An observer would have to arbitrate
 * between two sections that are both on screen, and flickers between them at
 * the boundary. This cannot — there is exactly one answer for any scroll top.
 *
 * The scroller is `.system-page`, not the window, so every offset is measured
 * against it.
 */
function syncActiveSection() {
  const rail = railRef.value;
  if (!rail) return;

  const readLine = rail.getBoundingClientRect().top + rail.clientHeight * 0.25;
  let current = sections[0].id;

  for (const section of sections) {
    const element = document.getElementById(section.id);
    if (element && element.getBoundingClientRect().top <= readLine) current = section.id;
  }

  // The last section is usually too short to reach the read line, so it would
  // never light up. If the rail is scrolled to the end, it is the answer.
  if (rail.scrollTop + rail.clientHeight >= rail.scrollHeight - 2) {
    current = sections[sections.length - 1].id;
  }

  activeSection.value = current;
}

let frame = 0;
function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    syncActiveSection();
  });
}

onMounted(() => {
  const computed = getComputedStyle(document.documentElement);
  const read = (token: string) => computed.getPropertyValue(token).trim();
  const plain = [
    ...typeSteps,
    ...layout,
    ...icons,
    ...layers,
    ...motionGroups.flatMap((group) => group.rows),
  ];

  resolved.value = {
    ...Object.fromEntries(colors.map(({ token }) => [token, toHex(read(token))])),
    ...Object.fromEntries(plain.map(({ token }) => [token, read(token)])),
    ...Object.fromEntries(spaceSteps.map((step) => [`--space-${step}`, read(`--space-${step}`)])),
  };

  railRef.value?.addEventListener("scroll", onScroll, { passive: true });
  syncActiveSection();
});

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame);
  railRef.value?.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div ref="railRef" class="system-page">
    <div class="system-shell">
      <!-- Sticky within .system-page, which is the scroller. -->
      <nav class="system-toc" aria-label="Design system sections">
        <span class="hud-label system-toc__title">// INDEX</span>
        <ul role="list">
          <li v-for="section in sections" :key="section.id">
            <a
              :href="`#${section.id}`"
              class="system-toc__link text-label-data uppercase tracking-[0.14em]"
              :class="{ 'is-active': activeSection === section.id }"
              :aria-current="activeSection === section.id ? 'true' : undefined"
            >
              {{ section.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="system-body">
        <header class="system-hero">
          <span class="hud-label">// DESIGN SYSTEM</span>
          <h1 class="text-display">SYSTEM INDEX</h1>
          <p class="text-body-compact">
            A working inventory of the visual language used across the portfolio.
            Two families, six sizes, two weights. Every value on this page is read
            from the live stylesheet at load, so it cannot drift from the code.
          </p>
        </header>

        <!-- ── TYPE ─────────────────────────────────────────────── -->
        <section id="type" class="system-section" aria-labelledby="type-heading">
          <header class="system-section__header">
            <h2 id="type-heading" class="text-heading-section">TYPE</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">TOMORROW + DEPARTURE MONO</span>
          </header>

          <div class="font-specimens">
            <div class="font-card">
              <span class="font-card__meta text-label-data uppercase tracking-[0.1em]">PRIMARY FAMILY</span>
              <strong class="text-display">TOMORROW</strong>
              <p class="text-body-compact">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            </div>
            <div class="font-card">
              <span class="font-card__meta text-label-data uppercase tracking-[0.1em]">DATA FAMILY</span>
              <strong class="text-label-data uppercase tracking-[0.1em]">DEPARTURE MONO</strong>
              <p class="text-label-data tabular-nums">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            </div>
          </div>

          <h3 class="group-label text-label-data uppercase tracking-[0.14em]">
            STEPS
            <span class="group-label__note">Six sizes site-wide. Anything that does not fit rounds to the nearest.</span>
          </h3>
          <ul class="token-table" role="list">
            <li v-for="step in typeSteps" :key="step.token" class="token-row">
              <strong class="text-label-data">{{ step.name }}</strong>
              <span class="text-label-data tabular-nums">{{ resolved[step.token] || "—" }}</span>
              <code class="text-label-data">{{ step.token }}</code>
              <span class="text-label-data">{{ step.usage }}</span>
            </li>
          </ul>

          <h3 class="group-label text-label-data uppercase tracking-[0.14em]">
            ROLES
            <span class="group-label__note">The named styles built on those steps.</span>
          </h3>
          <ul class="type-scale" role="list">
            <li v-for="style in typeScale" :key="style.key">
              <div class="type-scale__meta">
                <strong class="text-label-data">{{ style.semanticName }}</strong>
                <span class="text-label-data">{{ style.size }} / {{ style.lineHeight }}</span>
                <span class="text-label-data">{{ familyName(style.familyRole) }} / {{ style.weight }}</span>
              </div>
              <div class="type-scale__sample">
                <p :class="style.utility">{{ style.sample }}</p>
                <span class="text-label-data">{{ style.usage }}</span>
              </div>
            </li>
          </ul>
        </section>

        <!-- ── COLOR ────────────────────────────────────────────── -->
        <section id="color" class="system-section" aria-labelledby="color-heading">
          <header class="system-section__header">
            <h2 id="color-heading" class="text-heading-section">COLOR</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">{{ swatchCount }} CORE VALUES</span>
          </header>

          <p class="section-intro text-body-compact">
            Eight neutrals and one accent. The neutrals roughly double in
            channel value each step &mdash; 11, 19, 38, 71, 145, 198, 226, 255
            &mdash; which is what lets any two of them be told apart on a
            screen. Values are read live off the stylesheet, so this table
            cannot drift from <code>globals.css</code>.
          </p>

          <template v-for="group in colorGroups" :key="group.label">
            <h3 class="group-label text-label-data uppercase tracking-[0.14em]">
              {{ group.label }}
              <span class="group-label__note">{{ group.note }}</span>
            </h3>
            <ul class="token-table" role="list">
              <li v-for="color in group.swatches" :key="color.token" class="token-row has-chip">
                <span class="color-chip" :style="{ backgroundColor: `var(${color.token})` }" />
                <strong class="text-label-data">{{ color.name }}</strong>
                <span class="text-label-data tabular-nums">{{ resolved[color.token] || "—" }}</span>
                <code class="text-label-data">{{ color.token }}</code>
                <span class="text-label-data">{{ color.usage }}</span>
              </li>
            </ul>
          </template>
        </section>

        <!-- ── SPACE ────────────────────────────────────────────── -->
        <section id="space" class="system-section" aria-labelledby="space-heading">
          <header class="system-section__header">
            <h2 id="space-heading" class="text-heading-section">SPACE</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">{{ spaceSteps.length }} STEPS &middot; 4PT GRID</span>
          </header>

          <p class="section-intro text-body-compact">
            Every step is N x 4px, and N is the Tailwind number —
            <code>--space-3</code> and <code>p-3</code> are both 12px. The grid
            is 4pt but the scale is not every multiple of it: it grows by
            alternating 1.5x and 1.33x, so it doubles every two steps. Anything
            between (<code>p-5</code>, <code>p-1.5</code>) is removed from the
            scale rather than discouraged, and does not compile. Sizing draws on
            the same map, which is why the header and the mobile nav are both
            <code>h-16</code>.
          </p>

          <ul class="token-table" role="list">
            <li v-for="step in spaceSteps" :key="step" class="token-row">
              <strong class="text-label-data">{{ step }}</strong>
              <span class="text-label-data tabular-nums">{{ resolved[`--space-${step}`] || "—" }}</span>
              <code class="text-label-data">p-{{ step }}</code>
              <span class="space-bar" :style="{ width: `var(--space-${step})` }" />
            </li>
          </ul>
        </section>

        <!-- ── RADIUS ───────────────────────────────────────────── -->
        <section id="radius" class="system-section" aria-labelledby="radius-heading">
          <header class="system-section__header">
            <h2 id="radius-heading" class="text-heading-section">RADIUS</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">ONE VALUE</span>
          </header>

          <p class="section-intro text-body-compact">
            Zero, everywhere. The scale is replaced rather than extended, so
            <code>rounded</code> is the only step that exists and it is
            <code>0px</code> — <code>rounded-lg</code> and the rest do not
            compile at all. They used to be enumerated as <code>0px</code>
            each, which read as the same rule but left <code>rounded-3xl</code>
            — the one key nobody thought to list — still resolving to
            Tailwind's 1.5rem. The single exception is
            <code>rounded-full</code>, kept for circular avatars and dots.
          </p>

          <div class="radius-demo">
            <span class="radius-demo__box" />
            <span class="text-label-data">rounded — 0px</span>
          </div>
        </section>

        <!-- ── LAYOUT ───────────────────────────────────────────── -->
        <section id="layout" class="system-section" aria-labelledby="layout-heading">
          <header class="system-section__header">
            <h2 id="layout-heading" class="text-heading-section">LAYOUT</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">DOSSIER GEOMETRY</span>
          </header>

          <p class="section-intro text-body-compact">
            The sheet panel and the project pager rails read the same two values.
            Keeping both off one pair is what stops the rails drifting out of the
            gutters when the panel width changes.
          </p>

          <ul class="token-table" role="list">
            <li v-for="row in layout" :key="row.token" class="token-row">
              <strong class="text-label-data">{{ row.name }}</strong>
              <span class="text-label-data tabular-nums">{{ resolved[row.token] || "—" }}</span>
              <code class="text-label-data">{{ row.token }}</code>
              <span class="text-label-data">{{ row.usage }}</span>
            </li>
          </ul>
        </section>

        <!-- ── ICONS ────────────────────────────────────────────── -->
        <section id="icons" class="system-section" aria-labelledby="icons-heading">
          <header class="system-section__header">
            <h2 id="icons-heading" class="text-heading-section">ICONS</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">MATERIAL SYMBOLS — SUBSET</span>
          </header>

          <p class="section-intro text-body-compact">
            Sized on their own axis, not the type scale — an icon answers to the
            control it sits in, not the text beside it. The face is subset to the
            icons actually rendered; add one to a template and run
            <code>npm run fonts:icons</code>, or it ships as its ligature name.
          </p>

          <ul class="token-table" role="list">
            <li v-for="row in icons" :key="row.token" class="token-row has-chip">
              <span
                class="material-symbols-outlined icon-sample"
                :class="row.name === 'MD' ? 'icon-md' : 'icon-lg'"
                aria-hidden="true"
              >{{ row.icon }}</span>
              <strong class="text-label-data">{{ row.name }}</strong>
              <span class="text-label-data tabular-nums">{{ resolved[row.token] || "—" }}</span>
              <code class="text-label-data">{{ row.token }}</code>
              <span class="text-label-data">{{ row.usage }}</span>
            </li>
          </ul>
        </section>

        <!-- ── STACKING ─────────────────────────────────────────── -->
        <section id="stacking" class="system-section" aria-labelledby="stacking-heading">
          <header class="system-section__header">
            <h2 id="stacking-heading" class="text-heading-section">STACKING</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">LOW TO HIGH</span>
          </header>

          <p class="section-intro text-body-compact">
            Only the layers that have to agree across components. Stacking inside
            a component — a label over its own backdrop — stays local and is not
            listed here.
          </p>

          <ul class="token-table" role="list">
            <li v-for="layer in layers" :key="layer.token" class="token-row">
              <strong class="text-label-data">{{ layer.name }}</strong>
              <span class="text-label-data tabular-nums">{{ resolved[layer.token] || "—" }}</span>
              <code class="text-label-data">{{ layer.token }}</code>
              <span class="text-label-data">{{ layer.usage }}</span>
            </li>
          </ul>
        </section>

        <!-- ── MOTION ───────────────────────────────────────────── -->
        <section id="motion" class="system-section" aria-labelledby="motion-heading">
          <header class="system-section__header">
            <h2 id="motion-heading" class="text-heading-section">MOTION</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">PRIMITIVES + SEQUENCES</span>
          </header>

          <p class="section-intro text-body-compact">
            Every sequence below is switched off wholesale under
            <code>prefers-reduced-motion</code>.
          </p>

          <template v-for="group in motionGroups" :key="group.label">
            <h3 class="group-label text-label-data uppercase tracking-[0.14em]">
              {{ group.label }}
              <span class="group-label__note">{{ group.note }}</span>
            </h3>
            <ul class="token-table" role="list">
              <li v-for="row in group.rows" :key="row.token" class="token-row">
                <strong class="text-label-data">{{ row.name }}</strong>
                <span class="text-label-data tabular-nums">{{ resolved[row.token] || "—" }}</span>
                <code class="text-label-data">{{ row.token }}</code>
                <span class="text-label-data">{{ row.usage }}</span>
              </li>
            </ul>
          </template>
        </section>

        <!-- ── PARTS ────────────────────────────────────────────── -->
        <section id="parts" class="system-section" aria-labelledby="parts-heading">
          <header class="system-section__header">
            <h2 id="parts-heading" class="text-heading-section">PARTS</h2>
            <span class="text-label-data uppercase tracking-[0.14em]">LIVE SAMPLES</span>
          </header>

          <p class="section-intro text-body-compact">
            The real components, mounted — not lookalikes styled to match. The
            page used to carry a <code>.system-button</code> and a
            <code>.system-badge</code> that existed nowhere else in the app: the
            button had no counterpart at all, and the badge had already drifted
            from the card tag it was imitating. Anything that cannot be shown by
            mounting the shipped thing is not shown.
          </p>

          <h3 class="group-label text-label-data uppercase tracking-[0.14em]">
            CARD
            <span class="group-label__note">ProjectsCard — the board tile, and the only place a tag or a call to action appears.</span>
          </h3>
          <div class="card-demo">
            <ProjectsCard :project="sampleProject" :index="0" :total="1" />
          </div>

          <h3 class="group-label text-label-data uppercase tracking-[0.14em]">
            CHROME
            <span class="group-label__note">The shared marks. Global classes from globals.css, used across components.</span>
          </h3>
          <div class="component-row">
            <span class="hud-label">// SECTION LABEL</span>
            <kbd class="hud-key text-label-data inline-flex h-8 min-w-8 items-center justify-center">A</kbd>
            <span class="hud-corner-demo text-label-data">
              <HudCorners variant="muted" />CORNERS
            </span>
            <span class="hud-corner-demo text-label-data">
              <HudCorners />CORNERS / WHITE
            </span>
          </div>

          <div class="surface-row">
            <span class="surface-demo grid-bg text-label-data">.grid-bg</span>
            <span class="surface-demo text-label-data">
              <span class="scanline-overlay surface-demo__fill" />.scanline-overlay
            </span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-page {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.system-page::-webkit-scrollbar {
  display: none;
}

.system-shell {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: var(--space-8);
  width: min(60rem, calc(100% - var(--space-8)));
  margin-inline: auto;
  padding: var(--space-6) 0 var(--space-16);
}

/* ── Index ──────────────────────────────────────────────────── */

.system-toc {
  position: sticky;
  top: var(--space-6);
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.system-toc__title {
  color: var(--color-muted);
}

.system-toc ul {
  display: flex;
  flex-direction: column;
}

.system-toc__link {
  display: block;
  padding: var(--space-1) 0 var(--space-1) var(--space-3);
  border-left: 1px solid var(--color-surface);
  color: var(--color-muted);
  transition: color var(--duration-quick) var(--ease-out),
    border-color var(--duration-quick) var(--ease-out);
}

.system-toc__link:hover,
.system-toc__link:focus-visible {
  color: var(--color-body);
  border-left-color: var(--color-rule);
}

.system-toc__link.is-active {
  color: var(--color-signal);
  border-left-color: var(--color-signal);
}

/* ── Sections ───────────────────────────────────────────────── */

.system-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
}

.system-hero p {
  max-width: 60ch;
  color: var(--color-prose);
}

.system-section {
  padding-top: var(--space-8);
  /* Clears the sticky index's own top offset when jumped to. */
  scroll-margin-top: var(--space-6);
}

.system-section__header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-rule);
  color: var(--color-muted);
}

.section-intro {
  max-width: 66ch;
  margin: var(--space-4) 0 var(--space-2);
  color: var(--color-prose);
}

.section-intro code,
.system-hero code {
  color: var(--color-body);
}

.group-label {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  align-items: baseline;
  margin-top: var(--space-6);
  color: var(--color-ink);
}

.group-label__note {
  color: var(--color-muted);
  letter-spacing: normal;
  text-transform: none;
}

/* ── The one token table ────────────────────────────────────── */

.token-table {
  display: grid;
  margin-top: var(--space-2);
}

.token-row {
  display: grid;
  grid-template-columns: 9rem 6rem 13rem minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-surface);
  color: var(--color-muted);
}

.token-row.has-chip {
  grid-template-columns: 2.5rem 9rem 6rem 13rem minmax(0, 1fr);
}

.token-row strong {
  color: var(--color-ink);
}

.token-row code {
  color: var(--color-body);
}

.color-chip {
  width: var(--space-6);
  height: var(--space-6);
  border: 1px solid var(--color-rule);
}

.icon-sample {
  color: var(--color-body);
}

.space-bar {
  height: var(--space-2);
  background: var(--color-signal);
}

/* ── Type specimens ─────────────────────────────────────────── */

.font-specimens {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  padding-top: var(--space-4);
}

.font-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-surface);
}

.font-card__meta {
  color: var(--color-muted);
}

.font-card p {
  color: var(--color-prose);
}

.type-scale {
  display: grid;
  margin-top: var(--space-2);
}

.type-scale li {
  display: grid;
  grid-template-columns: 12rem minmax(0, 1fr);
  gap: var(--space-6);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-surface);
}

.type-scale__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  color: var(--color-muted);
}

.type-scale__meta strong {
  color: var(--color-ink);
}

.type-scale__sample {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  color: var(--color-body);
}

.type-scale__sample span {
  color: var(--color-muted);
}

/* ── Parts ──────────────────────────────────────────────────── */

.radius-demo {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-4);
  color: var(--color-muted);
}

.radius-demo__box {
  width: var(--space-12);
  height: var(--space-12);
  border: 1px solid var(--color-rule);
  background: var(--color-surface);
}

.component-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-6) 0;
}

/* The card is a full board tile; the board gives it a column, so this does
   too. Left to the section width it stretches into a shape that ships nowhere. */
.card-demo {
  width: min(24rem, 100%);
  padding-top: var(--space-4);
}

.hud-corner-demo {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  color: var(--color-muted);
}

.surface-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  padding-bottom: var(--space-4);
}

.surface-demo {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: var(--space-24);
  padding: var(--space-3);
  border: 1px solid var(--color-surface);
  background: var(--color-panel);
  color: var(--color-muted);
  overflow: hidden;
}

.surface-demo__fill {
  position: absolute;
  inset: 0;
}

/* ── Narrow ─────────────────────────────────────────────────── */

@media (max-width: 899px) {
  .system-shell {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    width: min(60rem, calc(100% - var(--space-6)));
  }

  /* The index stops being a rail and becomes a scrollable strip pinned to
     the top of the page — a sticky sidebar has nowhere to sit at this width. */
  .system-toc {
    top: 0;
    z-index: 1;
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
    margin-inline: calc(var(--space-3) * -1);
    padding: var(--space-2) var(--space-3);
    background: var(--color-canvas);
    border-bottom: 1px solid var(--color-surface);
  }

  .system-toc__title {
    display: none;
  }

  .system-toc ul {
    flex-direction: row;
    gap: var(--space-4);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .system-toc ul::-webkit-scrollbar {
    display: none;
  }

  .system-toc__link {
    padding: var(--space-1) 0;
    border-left: 0;
    border-bottom: 1px solid transparent;
    white-space: nowrap;
  }

  .system-toc__link.is-active {
    border-left-color: transparent;
    border-bottom-color: var(--color-signal);
  }

  .token-row,
  .token-row.has-chip {
    grid-template-columns: 2.5rem minmax(0, 1fr) auto;
    gap: var(--space-1) var(--space-3);
    padding: var(--space-3) 0;
  }

  .token-row > strong {
    grid-column: 2;
  }

  .token-row > code,
  .token-row > span:last-child {
    grid-column: 2 / -1;
  }

  .type-scale li,
  .font-specimens,
  .surface-row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .system-page {
    scroll-behavior: auto;
  }

  .system-toc__link {
    transition: none;
  }
}
</style>
