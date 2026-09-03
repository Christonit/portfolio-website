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
  <ul class="stack-index" role="list">
    <li v-for="skill in skills" :key="skill.name">
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

.stack-index::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.stack-index li {
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stack-index__row {
  display: flex;
  min-height: 42px;
  align-items: center;
  padding: 0 var(--space-3);
}

.stack-index li:nth-child(odd) {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.stack-index__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-body);
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
}
</style>
