<script setup lang="ts">
const TIMEZONE = "America/New_York";
const CITY = "New York City";
const COUNTRY = "United States";
const COORDS = "40.7128° N  74.0060° W";
const MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=-74.056%2C40.68%2C-73.956%2C40.76&layer=mapnik";

const open = ref(false);
const mapReady = ref(false);
const now = ref<Date | null>(null);
const rootRef = ref<HTMLElement | null>(null);

let tickTimer: ReturnType<typeof setInterval> | null = null;

const timeLabel = computed(() =>
  now.value ? formatLocalTime(now.value) : "––:–– ––",
);

function formatLocalTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  const dayPeriod = (
    parts.find((p) => p.type === "dayPeriod")?.value ?? ""
  ).toLowerCase();
  const zone = parts.find((p) => p.type === "timeZoneName")?.value ?? "ET";

  return `${hour}:${minute}${dayPeriod} ${zone}`;
}

function ensureMap() {
  mapReady.value = true;
}

function onTriggerClick() {
  open.value = !open.value;
  if (open.value) ensureMap();
}

function onPointerEnter() {
  ensureMap();
}

function onDocPointerDown(e: PointerEvent) {
  if (!open.value || !rootRef.value) return;
  if (!rootRef.value.contains(e.target as Node)) open.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value) open.value = false;
}

onMounted(() => {
  now.value = new Date();
  tickTimer = setInterval(() => {
    now.value = new Date();
  }, 30_000);
  document.addEventListener("pointerdown", onDocPointerDown);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer);
  document.removeEventListener("pointerdown", onDocPointerDown);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div
    ref="rootRef"
    class="local-time"
    :class="{ 'is-open': open }"
    @pointerenter="onPointerEnter"
  >
    <button
      type="button"
      class="local-time__trigger"
      :aria-expanded="open"
      aria-controls="local-time-card"
      aria-describedby="local-time-location"
      @click="onTriggerClick"
    >
      Local time:
      <span class="local-time__value" aria-live="polite">{{ timeLabel }}</span>
    </button>

    <span id="local-time-location" class="sr-only"
      >{{ CITY }}, {{ COUNTRY }}</span
    >

    <div id="local-time-card" class="local-time__card" role="tooltip">
      <div class="corner-tl-w" />
      <div class="corner-tr-w" />
      <div class="corner-bl-w" />
      <div class="corner-br-w" />

      <div class="local-time__map">
        <ClientOnly>
          <iframe
            v-if="mapReady"
            class="local-time__map-frame"
            :src="MAP_EMBED"
            title="Map of New York City"
            loading="lazy"
            tabindex="-1"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </ClientOnly>

        <div class="local-time__map-grade" aria-hidden="true" />
        <div class="local-time__map-scan" aria-hidden="true" />
        <div class="local-time__map-vignette" aria-hidden="true" />

        <span class="local-time__reticle" aria-hidden="true">
          <span class="local-time__reticle-ring" />
          <span class="local-time__reticle-dot" />
        </span>

        <span class="local-time__coords">{{ COORDS }}</span>

        <a
          class="local-time__attribution"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          aria-label="OpenStreetMap contributors"
          @click.stop
        >
          © OSM
        </a>
      </div>

      <div class="local-time__copy">
        <div class="local-time__place">
          <span class="local-time__kicker">LOC_FIX</span>
          <strong>{{ CITY }}</strong>
          <span>{{ COUNTRY }}</span>
        </div>
        <div class="local-time__clock">
          <span class="local-time__kicker">LOCAL</span>
          <span class="local-time__card-clock">{{ timeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.local-time {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  z-index: 20;
}

.local-time__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.5rem;
  padding: 0.2rem 0.55rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #919191;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
  cursor: default;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.local-time__value {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

.local-time:hover .local-time__trigger,
.local-time__trigger:focus-visible,
.local-time.is-open .local-time__trigger {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e2e2;
}

.local-time__trigger:focus-visible {
  outline: 1px solid rgba(255, 255, 255, 0.45);
  outline-offset: 2px;
}

.local-time__card {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  z-index: 40;
  width: min(22.5rem, calc(100vw - 1.5rem));
  overflow: hidden;
  border: 1px solid #2a2a2a;
  background: #0c0c0c;
  color: #e2e2e2;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.72),
    0 0 0 1px rgba(103, 245, 122, 0.06);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-align: left;
  transform: translateY(-0.25rem) scale(0.98);
  transform-origin: right top;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.15s ease,
    visibility 0.15s ease;
}

.local-time__card::before {
  content: "";
  position: absolute;
  top: -0.75rem;
  right: 0;
  left: 0;
  height: 0.75rem;
}

.local-time.is-open .local-time__card,
.local-time:focus-within .local-time__card {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

@media (hover: hover) and (pointer: fine) {
  .local-time:hover .local-time__card {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }
}

.local-time__map {
  position: relative;
  height: 11rem;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #050505;
}

.local-time__map-frame {
  position: absolute;
  /* Crop OSM zoom controls + bottom chrome */
  top: -48px;
  right: -16px;
  bottom: -36px;
  left: -16px;
  width: calc(100% + 32px);
  height: calc(100% + 84px);
  border: 0;
  pointer-events: none;
  filter: invert(1) hue-rotate(180deg) brightness(0.62) contrast(1.18)
    saturate(0.22);
}

.local-time__map-grade {
  position: absolute;
  inset: 0;
  background: #67f57a;
  mix-blend-mode: color;
  opacity: 0.28;
  pointer-events: none;
}

.local-time__map-scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.22) 0px,
    rgba(0, 0, 0, 0.22) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
}

.local-time__map-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 42%,
    rgba(0, 0, 0, 0.55) 100%
  );
  pointer-events: none;
}

.local-time__reticle {
  position: absolute;
  top: 52%;
  left: 50%;
  z-index: 2;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.local-time__reticle-ring {
  position: absolute;
  inset: 0;
  border: 1px solid #67f57a;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(103, 245, 122, 0.35);
  animation: local-time-pulse 2.2s ease-out infinite;
}

.local-time__reticle-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  border: 1.5px solid #0c0c0c;
  border-radius: 50%;
  background: #67f57a;
  box-shadow: 0 0 8px rgba(103, 245, 122, 0.7);
  transform: translate(-50%, -50%);
}

.local-time__coords {
  position: absolute;
  top: 0.45rem;
  left: 0.5rem;
  z-index: 2;
  color: #67f57a;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1;
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.85);
  pointer-events: none;
}

.local-time__attribution {
  position: absolute;
  right: 0.4rem;
  bottom: 0.35rem;
  z-index: 2;
  padding: 0.2rem 0.4rem;
  border: 1px solid rgba(103, 245, 122, 0.35);
  background: rgba(12, 12, 12, 0.82);
  color: #67f57a;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1;
  text-decoration: none;
}

.local-time__attribution:hover,
.local-time__attribution:focus-visible {
  border-color: #67f57a;
  color: #e2e2e2;
}

.local-time__copy {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.8rem 0.8rem;
}

.local-time__place,
.local-time__clock {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.2rem;
}

.local-time__clock {
  flex: 0 0 auto;
  align-items: flex-end;
  text-align: right;
}

.local-time__kicker {
  color: #67f57a;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.22em;
  line-height: 1;
}

.local-time__place strong {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
  color: #fff;
}

.local-time__place span:last-child {
  color: #919191;
  font-size: 10px;
  letter-spacing: 0.12em;
  line-height: 1.25;
  text-transform: uppercase;
}

.local-time__card-clock {
  color: #e2e2e2;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1;
}

@media (min-width: 1280px) {
  .local-time__trigger {
    font-size: 11px;
    padding: 0.25rem 0.65rem;
  }
}

@keyframes local-time-pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  70% {
    transform: scale(1.55);
    opacity: 0;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .local-time__trigger,
  .local-time__card {
    transition: none !important;
  }

  .local-time__reticle-ring {
    animation: none;
  }
}
</style>
