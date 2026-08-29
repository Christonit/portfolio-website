<script setup lang="ts">
import type { NavDir } from "~/composables/useNavDirection";

useIdentitySchema();

const navDir = useNavDirection();

const TRANSITION_NAMES: Record<Exclude<NavDir, "none">, string> = {
  forward: "hud-forward",
  back: "hud-back",
  "modal-in": "hud-modal-in",
  "modal-out": "hud-modal-out",
};

// "none" turns the page transition off outright rather than naming an empty
// one: the project sheet animates itself over a board that has to stay put,
// and a no-op <Transition> would still keep the outgoing page in the DOM for
// a frame — long enough to render the board and the sheet twice.
const pageTransition = computed(() =>
  navDir.value === "none"
    ? false
    : { name: TRANSITION_NAMES[navDir.value] ?? "hud-forward" },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>

  <DevOnly>
    <DevAgentation />
  </DevOnly>
</template>
