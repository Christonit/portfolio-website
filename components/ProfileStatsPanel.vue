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
    class="relative flex-shrink-0 border border-[#474747]/40 p-4 bg-[#1f1f1f]/20"
  >
    <div class="corner-tl" />
    <div class="corner-tr" />
    <div class="corner-bl" />
    <div class="corner-br" />

    <div class="flex justify-between items-center mb-2">
      <span class="hud-label">SERVICE_RECORD</span>
      <span class="text-label-data tracking-wider text-white"
        >LVL_10</span
      >
    </div>

    <div class="h-px bg-[#353535] w-full relative mb-4">
      <div class="absolute inset-y-0 left-0 bg-white" style="width: 85%" />
    </div>

    <div class="flex gap-2 text-center justify-between w-full">
      <div class="text-left">
        <span class="hud-label mb-0.5">EXPERIENCE</span>
        <span class="text-title-ui block text-white">10_YEARS</span>
      </div>
      <div>
        <span class="hud-label mb-0.5">COFFEE_CUPS</span>
        <span class="text-title-ui block text-white">+99</span>
      </div>
      <div class="text-right">
        <span class="hud-label mb-0.5">PROJECTS</span>
        <span class="text-title-ui block text-white">+99</span>
      </div>
    </div>
  </div>

  <!-- Spacer (desktop only — pushes biometrics to bottom) -->
  <div class="hidden xl:block flex-1" />

  <!-- Biometric Data -->
  <div class="">
    <span class="hud-label pb-3 border-b border-[#474747]/25 mb-2"
      >BIOMETRIC_DATA</span
    >
    <div class="space-y-1.5">
      <div
        v-for="bio in biometrics"
        :key="bio.label"
        class="flex justify-between items-center border-b border-[#474747]/25 pb-1.5"
      >
        <span class="text-label-data uppercase text-[#919191]">{{
          bio.label
        }}</span>
        <span class="text-label-data text-white">{{ bio.value }}</span>
      </div>
    </div>
  </div>
</template>
