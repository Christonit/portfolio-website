<script setup lang="ts">
useIdentitySchema();

const navDir = useNavDirection();

const pageTransition = computed(() => ({
  name: navDir.value === "back" ? "hud-back" : "hud-forward",
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
