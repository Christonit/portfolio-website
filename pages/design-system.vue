<script setup lang="ts">
import { pageTitle } from "~/utils/site";

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

const typeScale = [
  { name: "DISPLAY XL", size: "56px", weight: "600", sample: "SYSTEM INDEX" },
  { name: "DISPLAY MD", size: "36px", weight: "600", sample: "SELECTED WORK" },
  { name: "HEADING", size: "24px", weight: "600", sample: "Interface architecture" },
  { name: "TITLE", size: "18px", weight: "600", sample: "Tomorrow Semibold" },
  { name: "BODY", size: "14px", weight: "400", sample: "Readable body copy for product stories and project details." },
  { name: "LABEL / MIN", size: "12px", weight: "500", sample: "MINIMUM UI TEXT — 12 PX" },
];
</script>

<template>
  <div class="system-rail">
    <header class="system-hero">
      <span class="hud-label">// DESIGN SYSTEM</span>
      <h1>SYSTEM INDEX</h1>
      <p>
        A working inventory of the visual language used across the portfolio.
        The minimum interface type size is 12px.
      </p>
    </header>

    <section class="system-section" aria-labelledby="type-heading">
      <header class="system-section__header">
        <h2 id="type-heading">TYPEFACE + SCALE</h2>
        <span>TOMORROW / 100–700</span>
      </header>

      <div class="font-card">
        <span class="font-card__meta">PRIMARY FAMILY</span>
        <strong>TOMORROW</strong>
        <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
      </div>

      <ul class="type-scale" role="list">
        <li v-for="style in typeScale" :key="style.name">
          <div class="type-scale__meta">
            <strong>{{ style.name }}</strong>
            <span>{{ style.size }} / {{ style.weight }}</span>
          </div>
          <p :style="{ fontSize: style.size, fontWeight: style.weight }">
            {{ style.sample }}
          </p>
        </li>
      </ul>
    </section>

    <section class="system-section" aria-labelledby="color-heading">
      <header class="system-section__header">
        <h2 id="color-heading">COLOR TOKENS</h2>
        <span>08 CORE VALUES</span>
      </header>

      <ul class="color-grid" role="list">
        <li v-for="color in colors" :key="color.token">
          <div class="color-swatch" :style="{ backgroundColor: color.value }" />
          <div class="color-meta">
            <strong>{{ color.name }}</strong>
            <span>{{ color.value }}</span>
            <code>{{ color.token }}</code>
          </div>
        </li>
      </ul>
    </section>

    <section class="system-section" aria-labelledby="ui-heading">
      <header class="system-section__header">
        <h2 id="ui-heading">INTERFACE PARTS</h2>
        <span>LIVE SAMPLES</span>
      </header>

      <div class="component-row">
        <span class="hud-label">// SECTION LABEL</span>
        <span class="system-badge">FRONTEND_ARCHITECTURE</span>
        <button class="system-button" type="button">VIEW PROJECT →</button>
        <kbd class="system-key">A</kbd>
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
  font-size: clamp(2.1rem, 5vw, 3.6rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 0.92;
}

.system-hero p {
  max-width: 620px;
  color: var(--color-muted);
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
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
  font-family: monospace;
  font-size: var(--font-size-min);
  letter-spacing: 0.14em;
}

.system-section__header h2 {
  color: var(--color-body);
  font: inherit;
}

.font-card {
  display: grid;
  gap: 10px;
  border-bottom: 1px solid var(--color-rule);
  padding: 28px 0;
}

.font-card__meta,
.font-card p {
  color: var(--color-muted);
  font-family: monospace;
  font-size: var(--font-size-min);
  letter-spacing: 0.1em;
}

.font-card strong {
  color: var(--color-ink);
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 600;
  letter-spacing: -0.06em;
  line-height: 0.9;
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
  font-family: monospace;
  font-size: var(--font-size-min);
}

.type-scale__meta strong {
  color: var(--color-body);
}

.type-scale p {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--color-ink);
  letter-spacing: -0.025em;
  line-height: 1.12;
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
  font-family: monospace;
  font-size: var(--font-size-min);
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
  font-family: monospace;
  font-size: var(--font-size-min);
  letter-spacing: 0.1em;
}

.system-badge {
  padding: 8px 10px;
}

.system-button {
  padding: 11px 14px;
  background: var(--color-ink);
  color: var(--color-canvas);
  font-weight: 600;
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

  .color-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
