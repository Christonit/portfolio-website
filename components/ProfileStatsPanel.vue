<script setup lang="ts">
interface Biometric {
  label: string;
  value: string;
}

const biometrics: Biometric[] = [
  { label: "LOCATION", value: "NYC" },
  { label: "AVAILABILITY", value: "ACTIVE_FOR_PROJECTS" },
  { label: "LATENCY", value: "02_MS" },
  { label: "NEURAL_LINK", value: "STABLE" },
];
</script>

<template>
  <!-- Service Record -->
  <div
    class="relative flex-shrink-0 border border-rule/40 p-4 bg-surface/20"
  >
    <HudCorners variant="muted" />

    <div class="flex justify-between items-center mb-2">
      <span class="hud-label">SERVICE_RECORD</span>
      <span class="text-label-data tracking-wider text-white"
        >LVL_10</span
      >
    </div>

    <div class="h-px bg-rule w-full relative mb-4">
      <div class="absolute inset-y-0 left-0 bg-white" style="width: 85%" />
    </div>

    <div class="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      <div class="text-left">
        <span class="hud-label mb-1">EXPERIENCE</span>
        <span class="text-label-data block text-white">10_YEARS</span>
      </div>
      <div class="text-right sm:text-center">
        <span class="hud-label mb-1">COFFEE_CUPS</span>
        <span class="text-label-data block text-white">+99</span>
      </div>
      <div class="col-span-2 text-left sm:col-span-1 sm:text-right">
        <span class="hud-label mb-1">PROJECTS</span>
        <span class="text-label-data block text-white">+99</span>
      </div>
    </div>
  </div>

  <!-- Spacer (desktop only — pushes biometrics to bottom) -->
  <div class="hidden xl:block flex-1" />

  <!-- Biometric Data -->
  <div class="">
    <span class="hud-label pb-3 border-b border-rule/25 mb-2"
      >BIOMETRIC_DATA</span
    >
    <div class="space-y-2">
      <div
        v-for="bio in biometrics"
        :key="bio.label"
        class="flex justify-between items-center border-b border-rule/25 pb-2"
      >
        <span class="text-label-data uppercase text-muted">{{
          bio.label
        }}</span>
        <span class="text-label-data text-white">{{ bio.value }}</span>
      </div>
    </div>
  </div>
</template>
