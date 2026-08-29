<script setup lang="ts">
export interface FeaturedSkill {
  iconSrc: string;
  name: string;
}

defineProps<{
  skills: FeaturedSkill[];
}>();
</script>

<template>
  <ul class="stack-index" role="list" v-reveal>
    <li
      v-for="(skill, index) in skills"
      :key="skill.name"
      :style="{
        '--stack-row': Math.floor(index / 2),
        '--stack-row-narrow': index,
      }"
    >
      <span class="stack-index__row">
        <span class="stack-index__label">
          <img :src="skill.iconSrc" alt="" width="18" height="18" />
          <strong>{{ skill.name }}</strong>
        </span>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.stack-index {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* The list owns the observer while the rows own the staggered motion. */
.stack-index[data-reveal] {
  opacity: 1;
  transform: none;
  transition: none;
  will-change: auto;
}

.stack-index::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.stack-index li {
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  --stack-delay: calc(var(--stack-row, 0) * 70ms);
}

.stack-index__row {
  display: flex;
  min-height: 42px;
  align-items: center;
  padding: 0 12px;
  opacity: 0;
  transform: translateY(var(--scroll-reveal-distance));
  transition:
    opacity var(--scroll-reveal-dur) var(--scroll-reveal-ease)
      var(--stack-delay),
    transform var(--scroll-reveal-dur) var(--scroll-reveal-ease)
      var(--stack-delay);
}

.stack-index[data-reveal="shown"] .stack-index__row {
  opacity: 1;
  transform: translateY(0);
}

.stack-index li:nth-child(odd) {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.stack-index__label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d6d6d6;
  font-size: var(--text-xs);
  letter-spacing: 0.02em;
}

.stack-index__label img {
  filter: brightness(0) invert(1);
  opacity: 0.42;
}

@media (max-width: 639px) {
  .stack-index {
    grid-template-columns: 1fr;
  }

  .stack-index li:nth-child(odd) {
    border-right: none;
  }

  .stack-index li {
    --stack-delay: calc(var(--stack-row-narrow, 0) * 45ms);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-index__row {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
