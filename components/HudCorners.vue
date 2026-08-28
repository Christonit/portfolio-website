<script setup lang="ts">
export type HudCorner = "tl" | "tr" | "bl" | "br";
export type HudCornerVariant = "white" | "muted";
export type HudCornerReveal = "always" | "hover";

withDefaults(
  defineProps<{
    corners?: HudCorner[];
    variant?: HudCornerVariant;
    reveal?: HudCornerReveal;
  }>(),
  {
    corners: () => ["tl", "tr", "bl", "br"],
    variant: "white",
    reveal: "always",
  },
);
</script>

<template>
  <span
    class="hud-corners"
    :class="[`is-${variant}`, `is-reveal-${reveal}`]"
    aria-hidden="true"
  >
    <span
      v-for="corner in corners"
      :key="corner"
      class="hud-corners__mark"
      :class="`is-${corner}`"
    />
  </span>
</template>

<style>
.hud-corners {
  display: contents;
}

.hud-corners__mark {
  position: absolute;
  z-index: 3;
  width: var(--hud-corner-size, 10px);
  height: var(--hud-corner-size, 10px);
  border-color: var(--hud-corner-color, rgba(255, 255, 255, 0.4));
  border-style: solid;
  border-width: 0;
  pointer-events: none;
}

.hud-corners.is-muted .hud-corners__mark {
  --hud-corner-color: var(--color-rule, #474747);
  --hud-corner-size: 8px;
}

.hud-corners__mark.is-tl {
  top: var(--hud-corner-inset, 0px);
  left: var(--hud-corner-inset, 0px);
  border-top-width: 1px;
  border-left-width: 1px;
}

.hud-corners__mark.is-tr {
  top: var(--hud-corner-inset, 0px);
  right: var(--hud-corner-inset, 0px);
  border-top-width: 1px;
  border-right-width: 1px;
}

.hud-corners__mark.is-bl {
  bottom: var(--hud-corner-inset, 0px);
  left: var(--hud-corner-inset, 0px);
  border-bottom-width: 1px;
  border-left-width: 1px;
}

.hud-corners__mark.is-br {
  bottom: var(--hud-corner-inset, 0px);
  right: var(--hud-corner-inset, 0px);
  border-bottom-width: 1px;
  border-right-width: 1px;
}

.hud-corners.is-reveal-hover .hud-corners__mark {
  opacity: 0;
  transition:
    opacity var(--duration-quick, 150ms) var(--ease-out, ease-out),
    transform var(--duration-quick, 150ms) var(--ease-smooth-out, cubic-bezier(0.22, 1, 0.36, 1)),
    border-color var(--duration-quick, 150ms) var(--ease-out, ease-out);
}

.hud-corners.is-reveal-hover .hud-corners__mark.is-tl {
  transform: translate(var(--distance-micro, 4px), var(--distance-micro, 4px));
}

.hud-corners.is-reveal-hover .hud-corners__mark.is-tr {
  transform: translate(calc(var(--distance-micro, 4px) * -1), var(--distance-micro, 4px));
}

.hud-corners.is-reveal-hover .hud-corners__mark.is-bl {
  transform: translate(var(--distance-micro, 4px), calc(var(--distance-micro, 4px) * -1));
}

.hud-corners.is-reveal-hover .hud-corners__mark.is-br {
  transform: translate(
    calc(var(--distance-micro, 4px) * -1),
    calc(var(--distance-micro, 4px) * -1)
  );
}

.group:hover .hud-corners.is-reveal-hover .hud-corners__mark,
.group:focus-visible .hud-corners.is-reveal-hover .hud-corners__mark,
.group.is-focused .hud-corners.is-reveal-hover .hud-corners__mark {
  opacity: 1;
  transform: none;
  border-color: var(--hud-corner-hover-color, var(--color-signal, #67f57a));
}

@media (prefers-reduced-motion: reduce) {
  .hud-corners.is-reveal-hover .hud-corners__mark {
    transform: none;
    transition: opacity var(--duration-micro, 80ms) linear;
  }
}
</style>
