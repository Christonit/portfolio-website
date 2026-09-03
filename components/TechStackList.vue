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
      <h3 class="hud-label">TECH STACK</h3>
      <span class="text-label-data text-muted"
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
          'flex items-center justify-between py-2 border-b border-rule/50 transition-all duration-150',
          'xl:px-3 xl:border-r-2 xl:border-b-0 xl:cursor-pointer xl:group',
          focusedSkill === i
            ? 'xl:bg-surface xl:border-white xl:translate-x-1'
            : 'xl:bg-surface/10 xl:border-rule/50 xl:hover:bg-surface xl:hover:translate-x-1',
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
            class="text-body-compact uppercase tracking-wider"
            :class="focusedSkill === i ? 'xl:text-white' : ''"
            >{{ skill.name }}</span
          >
        </div>
        <div
          class="w-8 h-px shrink-0 bg-rule/60"
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
