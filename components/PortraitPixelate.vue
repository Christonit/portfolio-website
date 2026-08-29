<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    hovered?: boolean;
    /** Approx size (in CSS px) of one pixel block at the default state. */
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
// pixelation (not just a filter trick). On hover it snaps to full size.
const stageStyle = computed(() => {
  const { w: fw, h: fh } = frameSize.value;
  if (props.hovered || !tinySize.value.w) {
    return { width: `${fw}px`, height: `${fh}px`, transform: "scale(1)" };
  }
  const { w: tw, h: th } = tinySize.value;
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
  transition:
    width 380ms cubic-bezier(0.22, 1, 0.36, 1),
    height 380ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.portrait-pixelate__stage img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% center;
  image-rendering: pixelated;
  filter: grayscale(1) contrast(1.08) brightness(0.94);
  transition: filter 320ms ease;
}

.portrait-pixelate.is-hovered .portrait-pixelate__stage img {
  image-rendering: auto;
  filter: none;
}

@media (max-width: 639px) {
  .portrait-pixelate__stage img {
    object-position: 50% 28%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-pixelate__stage {
    transition: none;
  }
}
</style>
