<script setup lang="ts">
import { pageTitle } from "~/utils/site";
import { typography, type TypographyStyleKey } from "~/utils/typography";

usePageSeo({
  title: pageTitle("Design System"),
  description:
    "The typography, color, spacing, and interface tokens used across Christopher Santana's portfolio.",
  pageType: "CollectionPage",
});

const colors = [
  { name: "CANVAS", token: "--color-canvas", value: "#131313" },
  { name: "PANEL", token: "--color-panel", value: "#0B0B0B" },
  { name: "SURFACE", token: "--color-surface", value: "#1F1F1F" },
  { name: "RULE", token: "--color-rule", value: "#474747" },
  { name: "MUTED", token: "--color-muted", value: "#919191" },
  { name: "BODY", token: "--color-body", value: "#E2E2E2" },
  { name: "INK", token: "--color-ink", value: "#FFFFFF" },
  { name: "SIGNAL", token: "--color-signal", value: "#67F57A" },
];

const typographyUtilities = {
  display: "text-display",
  "heading-lg": "text-heading-lg",
  "heading-section": "text-heading-section",
  "title-ui": "text-title-ui",
  "body-compact": "text-body-compact",
  "body-prose": "text-body-prose",
  "label-data": "text-label-data",
} satisfies Record<TypographyStyleKey, string>;

const typeScale = (Object.keys(typography) as TypographyStyleKey[]).map((key) => ({
  key,
  utility: typographyUtilities[key],
  ...typography[key],
}));

const familyName = (familyRole: (typeof typography)[TypographyStyleKey]["familyRole"]) =>
  familyRole === "mono" ? "Departure Mono" : "Tomorrow";
</script>

<template>
  <div class="system-rail">
    <header class="system-hero">
      <span class="hud-label text-label-data uppercase tracking-[0.14em]">// DESIGN SYSTEM</span>
      <h1 class="text-display">SYSTEM INDEX</h1>
      <p class="text-body-compact">
        A working inventory of the visual language used across the portfolio.
        The minimum interface type size is 12px.
      </p>
    </header>

    <section class="system-section" aria-labelledby="type-heading">
      <header class="system-section__header">
        <h2 id="type-heading" class="text-heading-section">TYPEFACE + SCALE</h2>
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

      <div class="modifier-demo">
        <span class="text-label-data uppercase tracking-[0.14em]">SYSTEM STATUS</span>
        <span class="text-label-data tabular-nums">BUILD 026 / 14:32:08</span>
      </div>
    </section>

    <section class="system-section" aria-labelledby="color-heading">
      <header class="system-section__header">
        <h2 id="color-heading" class="text-heading-section">COLOR TOKENS</h2>
        <span class="text-label-data uppercase tracking-[0.14em]">08 CORE VALUES</span>
      </header>

      <ul class="color-grid" role="list">
        <li v-for="color in colors" :key="color.token">
          <div class="color-swatch" :style="{ backgroundColor: color.value }" />
          <div class="color-meta">
            <strong class="text-label-data">{{ color.name }}</strong>
            <span class="text-label-data">{{ color.value }}</span>
            <code class="text-label-data">{{ color.token }}</code>
          </div>
        </li>
      </ul>
    </section>

    <section class="system-section" aria-labelledby="ui-heading">
      <header class="system-section__header">
        <h2 id="ui-heading" class="text-heading-section">INTERFACE PARTS</h2>
        <span class="text-label-data uppercase tracking-[0.14em]">LIVE SAMPLES</span>
      </header>

      <div class="component-row">
        <span class="hud-label text-label-data uppercase tracking-[0.14em]">// SECTION LABEL</span>
        <span class="system-badge text-label-data uppercase tracking-[0.1em]">FRONTEND_ARCHITECTURE</span>
        <button class="system-button text-title-ui" type="button">VIEW PROJECT →</button>
        <kbd class="system-key text-label-data">A</kbd>
      </div>
    </section>
  </div>
</template>

<style scoped>
.system-rail {
  width: min(800px, calc(100% - 32px));
  height: 100%;
  margin-inline: auto;
  padding: 20px 0 64px;
  overflow-y: auto;
  scrollbar-width: none;
}

.system-rail::-webkit-scrollbar {
  display: none;
}

.system-hero {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.system-hero h1 {
  color: var(--color-ink);
  letter-spacing: -0.05em;
}

.system-hero p {
  max-width: 620px;
  color: var(--color-muted);
}

.system-section {
  margin-top: 48px;
}

.system-section__header {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--color-rule);
  color: var(--color-muted);
}

.system-section__header h2 {
  color: var(--color-body);
}

.font-specimens {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.font-card {
  display: grid;
  gap: 10px;
  border-bottom: 1px solid var(--color-rule);
  padding: 28px 0;
}

.font-card__meta {
  color: var(--color-muted);
}

.font-card strong {
  color: var(--color-ink);
}

.font-card p {
  color: var(--color-muted);
}

.type-scale li {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 24px;
  align-items: baseline;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 22px 0;
}

.type-scale__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--color-muted);
}

.type-scale__meta strong {
  color: var(--color-body);
}

.type-scale__sample {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.type-scale__sample p {
  overflow-wrap: anywhere;
  color: var(--color-ink);
  letter-spacing: -0.025em;
}

.type-scale__sample span {
  color: var(--color-muted);
}

.modifier-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--color-rule);
  padding: 16px 0;
  color: var(--color-muted);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding-top: 16px;
}

.color-grid li {
  border: 1px solid var(--color-rule);
  background: var(--color-panel);
}

.color-swatch {
  height: 112px;
  border-bottom: 1px solid var(--color-rule);
}

.color-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
}

.color-meta strong {
  color: var(--color-ink);
}

.color-meta span,
.color-meta code {
  color: var(--color-muted);
}

.component-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding: 28px 0;
}

.system-badge,
.system-button,
.system-key {
  border: 1px solid var(--color-rule);
  color: var(--color-body);
}

.system-badge {
  padding: 8px 10px;
}

.system-button {
  padding: 11px 14px;
  background: var(--color-ink);
  color: var(--color-canvas);
}

.system-key {
  display: inline-flex;
  min-width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  box-shadow: 0 2px 0 var(--color-rule);
}

@media (max-width: 639px) {
  .system-rail {
    width: min(800px, calc(100% - 24px));
  }

  .type-scale li {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .font-specimens {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .color-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
