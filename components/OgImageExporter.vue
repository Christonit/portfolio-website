<script setup lang="ts">
import {
  OG_HEIGHT,
  OG_WIDTH,
  createOgScene,
  downloadDataUrl,
  type OgSceneHandle,
} from "~/utils/ogImageRenderer";

const stageRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const errored = ref(false);
const rotationY = ref(0.72);
const exporting = ref(false);

let sceneHandle: OgSceneHandle | null = null;

const previewScale = ref(1);

function updatePreviewScale() {
  const maxWidth = Math.min(window.innerWidth - 48, 960);
  previewScale.value = Math.min(1, maxWidth / OG_WIDTH);
}

onMounted(() => {
  updatePreviewScale();
  window.addEventListener("resize", updatePreviewScale);
  initScene();
});

onUnmounted(() => {
  window.removeEventListener("resize", updatePreviewScale);
  sceneHandle?.dispose();
  sceneHandle = null;
});

async function initScene() {
  if (!stageRef.value) return;

  try {
    sceneHandle = await createOgScene(stageRef.value);
    sceneHandle.rotationY = rotationY.value;
    loading.value = false;
  } catch (error) {
    console.error("[OgImageExporter] failed to initialize:", error);
    errored.value = true;
    loading.value = false;
  }
}

watch(rotationY, (value) => {
  if (!sceneHandle) return;
  sceneHandle.rotationY = value;
});

function exportPng() {
  if (!sceneHandle) return;

  exporting.value = true;
  try {
    const dataUrl = sceneHandle.exportPng();
    downloadDataUrl(dataUrl, "og-image.png");
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
    <div class="space-y-2">
      <span class="hud-label">OG_IMAGE_EXPORT</span>
      <h1 class="text-white text-lg font-semibold uppercase tracking-tight">
        Open Graph Image Generator
      </h1>
      <p class="font-mono text-xs text-[#919191] leading-relaxed max-w-2xl">
        Renders the 3D operator mesh at {{ OG_WIDTH }}×{{ OG_HEIGHT }} with the
        same lighting, pixel shader, grid background, and HUD overlays used on
        the site. Export the PNG and place it at
        <code class="text-white">public/og-image.png</code>.
      </p>
    </div>

    <div class="flex flex-wrap items-end gap-4">
      <label class="flex min-w-[220px] flex-1 flex-col gap-2">
        <span class="hud-label">MODEL_ROTATION</span>
        <input
          v-model.number="rotationY"
          type="range"
          min="-3.14"
          max="3.14"
          step="0.01"
          class="w-full accent-white"
        />
        <span class="font-mono text-2xs text-[#919191]">
          {{ rotationY.toFixed(2) }} rad
        </span>
      </label>

      <button
        class="inline-flex items-center justify-center border border-white/20 bg-white px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-black transition hover:bg-[#e2e2e2] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading || errored || exporting"
        @click="exportPng"
      >
        {{ exporting ? "EXPORTING…" : "EXPORT PNG" }}
      </button>
    </div>

    <div class="overflow-auto rounded border border-white/10 bg-[#0a0a0a] p-4">
      <div
        class="relative mx-auto origin-top-left"
        :style="{
          width: `${OG_WIDTH}px`,
          height: `${OG_HEIGHT}px`,
          transform: `scale(${previewScale})`,
          transformOrigin: 'top left',
        }"
      >
        <div
          ref="stageRef"
          class="absolute inset-0 overflow-hidden border border-white/10 bg-black/50"
        />

        <div
          class="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        >
          <div class="absolute inset-0 grid-bg opacity-[0.15]" />
          <div class="absolute inset-0 scanline-overlay" />

          <div
            class="absolute top-2 left-2 border-l border-t border-white/15 px-2 py-0.5"
          >
            <span class="font-mono text-2xs text-[#919191] uppercase">
              SCAN_LOCK: TARGET_ACQUIRED
            </span>
          </div>

          <div
            class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-3 text-center"
          >
            <div class="mb-1.5 flex justify-center">
              <div
                class="h-0 w-0 border-b-[11px] border-l-[8px] border-r-[8px] border-b-white/25 border-l-transparent border-r-transparent"
              />
            </div>
            <div
              class="font-mono text-2xs uppercase tracking-widest text-[#919191]"
            >
              SUIT INTEGRITY HIGH
            </div>
            <div
              class="mt-0.5 font-mono text-2xs uppercase tracking-widest text-[#474747]"
            >
              OPTIMAL_V_2.4
            </div>
          </div>

          <div class="corner-tl-w" />
          <div class="corner-tr-w" />
          <div class="corner-bl-w" />
          <div class="corner-br-w" />
        </div>

        <div
          v-if="loading"
          class="absolute inset-0 z-20 flex items-center justify-center bg-[#131313]"
        >
          <span
            class="animate-pulse font-mono text-2xs uppercase tracking-[0.3em] text-[#919191]"
          >
            DECODING_SUIT_MESH…
          </span>
        </div>

        <div
          v-if="errored"
          class="absolute inset-0 z-20 flex items-center justify-center bg-[#131313]"
        >
          <span
            class="font-mono text-2xs uppercase tracking-[0.3em] text-red-400/80"
          >
            SIGNAL_LOST // MESH_UNAVAILABLE
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
