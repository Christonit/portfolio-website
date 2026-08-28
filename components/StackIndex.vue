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
    <li v-for="(skill, index) in skills" :key="skill.name">
      <span class="stack-index__row" v-reveal="Math.min(index, 8) * 40">
        <span class="stack-index__label">
          <img :src="skill.iconSrc" alt="" width="18" height="18" />
          <strong>{{ skill.name }}</strong>
        </span>
        <span class="stack-index__rule" aria-hidden="true" />
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
  justify-content: space-between;
  gap: 18px;
  padding: 0 12px;
}

.stack-index li:nth-child(odd) {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.stack-index__label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d6d6d6;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.stack-index__label img {
  filter: brightness(0) invert(1);
  opacity: 0.42;
}

.stack-index__rule {
  width: 44px;
  height: 1px;
  background: #343434;
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
