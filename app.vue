<script setup lang="ts">
import type { NavDir } from "~/composables/useNavDirection";

useIdentitySchema();

const navDir = useNavDirection();

const TRANSITION_NAMES: Record<NavDir, string> = {
  forward: "hud-forward",
  back: "hud-back",
  "modal-in": "hud-modal-in",
  "modal-out": "hud-modal-out",
};

const pageTransition = computed(() => ({
  name: TRANSITION_NAMES[navDir.value] ?? "hud-forward",
}));
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>

  <DevOnly>
    <DevAgentation />
  </DevOnly>
</template>
