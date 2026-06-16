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
  <div class="flex-shrink-0 xl:flex xl:flex-col xl:min-h-0">
    <div class="flex justify-between items-center mb-2 flex-shrink-0">
      <h3 class="hud-label font-semibold lg:font-normal">TECH STACK</h3>
      <span class="font-mono text-[8px] text-[#919191]"
        >MOD_{{ String(skills.length).padStart(3, "0") }}</span
      >
    </div>
    <!-- Desktop: capped + scrollable; Mobile: full list -->
    <div
      class="space-y-px xl:overflow-y-auto overflow-x-hidden xl:max-h-[142px]"
      role="list"
    >
      <div
        v-for="(skill, i) in skills"
        :key="skill.name"
        :ref="(el) => setItemRef(el as HTMLElement, refOffset + i)"
        role="listitem"
        itemscope
        itemtype="https://schema.org/DefinedTerm"
        :title="skill.metadata"
        :data-keywords="skill.metadata"
        :aria-label="`${skill.name.replace(/_/g, ' ')} — ${skill.metadata}`"
        :class="[
          'flex items-center justify-between px-3 py-2 border-r-2 cursor-pointer transition-all duration-150 group',
          focusedSkill === i
            ? 'bg-[#353535] border-white translate-x-0.5'
            : skill.active
              ? 'bg-[#2a2a2a] border-white hover:translate-x-0.5'
              : 'bg-[#353535]/10 border-[#474747]/50 hover:bg-[#1f1f1f] hover:translate-x-0.5',
        ]"
      >
        <div class="flex items-center gap-3">
          <img
            itemprop="image"
            :src="skill.iconSrc"
            :alt="`${skill.name.replace(/_/g, ' ')} — ${skill.metadata}`"
            :title="skill.metadata"
            width="16"
            height="16"
            loading="lazy"
            decoding="async"
            class="tech-stack-icon h-4 w-4 shrink-0"
            :class="
              focusedSkill === i || skill.active
                ? 'opacity-100'
                : 'opacity-40 group-hover:opacity-70'
            "
          />
          <meta itemprop="name" :content="skill.name.replace(/_/g, ' ')" />
          <meta itemprop="description" :content="skill.metadata" />
          <meta itemprop="keywords" :content="skill.metadata" />
          <span
            itemprop="termCode"
            class="lg:font-bold text-[12px] uppercase tracking-wider"
            :class="focusedSkill === i ? 'text-white' : ''"
            >{{ skill.name }}</span
          >
        </div>
        <div
          class="w-10 h-px shrink-0"
          :class="
            focusedSkill === i || skill.active ? 'bg-white' : 'bg-[#474747]/60'
          "
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
