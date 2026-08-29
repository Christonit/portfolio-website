<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    hovered?: boolean;
    /** Approx size (in CSS px) of one pixel block. */
    pixelSize?: number;
    /** Vertical crop bias (0 = top, 0.5 = center, 1 = bottom). */
    focusY?: number;
  }>(),
  {
    src: "/images/profile-portrait.webp",
    alt: "",
    hovered: false,
    pixelSize: 1,
    focusY: 0.4,
  },
);

const frame = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
let img: HTMLImageElement | null = null;
let ro: ResizeObserver | undefined;

function draw() {
  const el = frame.value;
  const cv = canvas.value;
  if (!el || !cv || !img || !img.complete || img.naturalWidth === 0) return;

  const fw = el.clientWidth || 1;
  const fh = el.clientHeight || 1;
  const tw = Math.max(4, Math.round(fw / props.pixelSize));
  const th = Math.max(4, Math.round(fh / props.pixelSize));

  // Internal resolution stays tiny; CSS size is the full frame — the
  // browser's own upscale (with image-rendering: pixelated) produces
  // crisp, real pixel blocks instead of a blurred fake.
  cv.width = tw;
  cv.height = th;
  cv.style.width = `${fw}px`;
  cv.style.height = `${fh}px`;

  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  // object-fit: cover crop, biased slightly toward the top (face). Must
  // match the base <img>'s object-position exactly, or the two layers
  // visibly jump against each other during the hover crossfade.
  const focusY = props.focusY;
  const srcAspect = img.naturalWidth / img.naturalHeight;
  const dstAspect = tw / th;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (srcAspect > dstAspect) {
    sw = img.naturalHeight * dstAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / dstAspect;
    sy = (img.naturalHeight - sh) * focusY;
  }

  ctx.clearRect(0, 0, tw, th);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
}

onMounted(() => {
  img = new Image();
  img.onload = draw;
  img.src = props.src;

  ro = new ResizeObserver(draw);
  if (frame.value) ro.observe(frame.value);
});

onUnmounted(() => ro?.disconnect());
</script>

<template>
  <div ref="frame" class="portrait-pixelate" :class="{ 'is-hovered': hovered }">
    <img
      :src="src"
      :alt="alt"
      class="portrait-pixelate__base"
      :style="{ objectPosition: `50% ${focusY * 100}%` }"
    />
    <canvas ref="canvas" class="portrait-pixelate__pixel" aria-hidden="true" />
  </div>
</template>

<style scoped>
.portrait-pixelate {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.portrait-pixelate__base,
.portrait-pixelate__pixel {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.portrait-pixelate__base {
  object-fit: cover;
}

.portrait-pixelate__pixel {
  image-rendering: pixelated;
  filter: grayscale(1) contrast(1.08) brightness(0.94);
  transition: opacity 320ms ease;
}

.portrait-pixelate.is-hovered .portrait-pixelate__pixel {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .portrait-pixelate__pixel {
    transition: none;
  }
}
</style>
