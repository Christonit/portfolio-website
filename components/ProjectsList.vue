<script setup lang="ts">
export interface Mission {
  name: string;
  tags: string;
  link: string;
}

defineProps<{
  missions: Mission[];
  focusedMission: number | null;
  refOffset: number;
  setItemRef: (el: HTMLElement | null, i: number) => void;
}>();
</script>

<template>
  <div class="xl:flex xl:flex-col xl:flex-1 xl:min-h-0 lg:mb-0 mb-16">
    <h3 class="hud-label mb-2 xl:flex-shrink-0 font-semibold lg:font-normal">
      PROJECTS
    </h3>
    <!-- Desktop: grows to fill remaining space + scrolls; Mobile: full list -->
    <div class="xl:flex-1 xl:overflow-y-auto">
      <NuxtLink
        v-for="(mission, i) in missions"
        :key="mission.name"
        :ref="(el) => setItemRef(el as HTMLElement, refOffset + i)"
        :class="[
          'flex gap-3 py-2.5 border-b border-[#474747]/20 px-1 cursor-pointer transition-colors group',
          focusedMission === i ? 'bg-[#2a2a2a]' : 'hover:bg-[#1f1f1f]/60',
        ]"
        :to="mission.link"
      >
        <div
          class="w-[2px] shrink-0 self-stretch transition-colors"
          :class="
            focusedMission === i
              ? 'bg-white'
              : 'bg-white/40 group-hover:bg-white'
          "
        />
        <div class="flex flex-col gap-1">
          <span
            class="font-bold text-[12px] leading-none block uppercase tracking-wider transition-colors"
            :class="
              focusedMission === i
                ? 'text-white'
                : 'text-[#e2e2e2] group-hover:text-white'
            "
          >
            {{ mission.name }}
          </span>
          <span
            class="font-mono text-[10px] leading-none text-[#919191] uppercase mt-0.5"
          >
            // {{ mission.tags }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
