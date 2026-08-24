<script setup lang="ts">
export interface Skill {
  iconSrc: string;
  name: string;
  metadata: string;
  active?: boolean;
}

defineProps<{
  skills: Skill[];
  focusedSkill: number | null;
  refOffset: number;
  setItemRef: (el: HTMLElement | null, i: number) => void;
}>();
</script>

<template>
  <div class="order-3 xl:order-2 flex-shrink-0 xl:flex xl:flex-col xl:min-h-0">
    <div class="flex justify-between items-center mb-2 flex-shrink-0">
      <h3 class="hud-label font-semibold lg:font-normal">TECH STACK</h3>
      <span class="font-mono text-[8px] text-[#919191]"
        >MOD_{{ String(skills.length).padStart(3, "0") }}</span
      >
    </div>
    <!-- Desktop: capped + scrollable; Mobile: static list (no interaction) -->
    <div
      class="space-y-px xl:overflow-y-auto overflow-x-hidden xl:max-h-[142px]"
      role="list"
    >
      <div
        v-for="(skill, i) in skills"
        :key="skill.name"
        :ref="(el) => setItemRef(el as HTMLElement, refOffset + i)"
        role="listitem"
        :title="skill.metadata"
        :data-keywords="skill.metadata"
        :aria-label="`${skill.name.replace(/_/g, ' ')} — ${skill.metadata}`"
        :class="[
          'flex items-center justify-between py-2 border-b border-[#474747]/50 transition-all duration-150',
          'xl:px-3 xl:border-r-2 xl:border-b-0 xl:cursor-pointer xl:group',
          focusedSkill === i
            ? 'xl:bg-[#353535] xl:border-white xl:translate-x-0.5'
            : 'xl:bg-[#353535]/10 xl:border-[#474747]/50 xl:hover:bg-[#1f1f1f] xl:hover:translate-x-0.5',
        ]"
      >
        <div class="flex items-center gap-3">
          <img
            :src="skill.iconSrc"
            :alt="`${skill.name.replace(/_/g, ' ')} — ${skill.metadata}`"
            :title="skill.metadata"
            width="16"
            height="16"
            loading="lazy"
            decoding="async"
            class="tech-stack-icon h-4 w-4 shrink-0 opacity-100 xl:opacity-40"
            :class="
              focusedSkill === i || skill.active
                ? 'xl:opacity-100'
                : 'xl:group-hover:opacity-70'
            "
          />
          <span
            class="lg:font-bold text-[12px] uppercase tracking-wider"
            :class="focusedSkill === i ? 'xl:text-white' : ''"
            >{{ skill.name }}</span
          >
        </div>
        <div
          class="w-10 h-px shrink-0 bg-[#474747]/60"
          :class="focusedSkill === i ? 'xl:bg-white' : ''"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-stack-icon {
  filter: brightness(0) invert(1);
  transition: opacity 150ms;
}
</style>
