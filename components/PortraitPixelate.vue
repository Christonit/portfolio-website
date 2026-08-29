<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    hovered?: boolean;
    /** Approx size (in CSS px) of one pixel block. */
    pixelSize?: number;
  }>(),
  {
    src: "/images/profile-portrait.webp",
    alt: "",
    hovered: false,
    pixelSize: 9,
  },
);

const frame = ref<HTMLElement | null>(null);
const frameSize = ref({ w: 0, h: 0 });
const tinySize = ref({ w: 24, h: 24 });

function measure() {
  const el = frame.value;
  if (!el) return;
  const w = el.clientWidth || 1;
  const h = el.clientHeight || 1;
  frameSize.value = { w, h };
  tinySize.value = {
    w: Math.max(4, Math.round(w / props.pixelSize)),
    h: Math.max(4, Math.round(h / props.pixelSize)),
  };
}

let ro: ResizeObserver | undefined;
onMounted(() => {
  measure();
  ro = new ResizeObserver(measure);
  if (frame.value) ro.observe(frame.value);
});
onUnmounted(() => ro?.disconnect());

// The stage renders at a tiny box size then scales back up — the browser
// samples the image down to that few-pixel grid, giving a real blocky
// pixelation (not just a filter trick). This geometry is static: hover is a
// cross-fade to the sharp layer, so the pixel grid never animates its size.
const stageStyle = computed(() => {
  const { w: fw } = frameSize.value;
  const { w: tw, h: th } = tinySize.value;
  if (!fw || !tw) return undefined;
  return {
    width: `${tw}px`,
    height: `${th}px`,
    transform: `scale(${fw / tw})`,
  };
});
</script>

<template>
  <div ref="frame" class="portrait-pixelate" :class="{ 'is-hovered': hovered }">
    <div class="portrait-pixelate__stage" :style="stageStyle">
      <img :src="src" :alt="alt" />
    </div>
    <!-- Sharp, full-colour layer: fades over the pixel grid on hover with a
         light push-in. Decorative — the stage image carries the alt text. -->
    <img class="portrait-pixelate__sharp" :src="src" alt="" aria-hidden="true" />
  </div>
</template>

<style scoped>
.portrait-pixelate {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.portrait-pixelate__stage {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}

.portrait-pixelate__stage img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% center;
  image-rendering: pixelated;
  filter: grayscale(1) contrast(1.08) brightness(0.94);
}

.portrait-pixelate__sharp {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% center;
  opacity: 0;
  transform: scale(1);
  transition:
    opacity 320ms ease,
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.portrait-pixelate.is-hovered .portrait-pixelate__sharp {
  opacity: 1;
  transform: scale(1.04);
}

@media (max-width: 639px) {
  .portrait-pixelate__stage img,
  .portrait-pixelate__sharp {
    object-position: 50% 28%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-pixelate__sharp {
    transition: opacity 320ms ease;
  }

  .portrait-pixelate.is-hovered .portrait-pixelate__sharp {
    transform: none;
  }
}
</style>
