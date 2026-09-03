<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import { isExternalProjectHref, projectHref } from "~/utils/projects";

defineProps<{
  articles: ProjectPreview[];
}>();
</script>

<template>
  <ul class="articles-index-list" role="list">
    <li v-for="(article, index) in articles" :key="article.slug">
      <NuxtLink
        v-reveal="index * 60"
        :to="projectHref(article)"
        :external="isExternalProjectHref(article)"
        :target="isExternalProjectHref(article) ? '_blank' : undefined"
        :rel="
          isExternalProjectHref(article) ? 'noopener noreferrer' : undefined
        "
      >
        <span class="articles-index-list__thumb" aria-hidden="true">
          <img
            v-if="article.image"
            :src="article.image"
            alt=""
            loading="lazy"
          />
        </span>
        <span class="articles-index-list__copy">
          <strong>{{ article.name }}</strong>
          <small>READ ARTICLE</small>
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.articles-index-list {
  position: relative;
  z-index: 1;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.articles-index-list::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.articles-index-list li {
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.045);
}

.articles-index-list a {
  display: grid;
  grid-template-columns: 144px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-6);
  min-height: 104px;
  padding: var(--space-3) 0;
  color: var(--color-body);
  text-decoration: none;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.articles-index-list a:hover,
.articles-index-list a:focus-visible {
  background: rgba(255, 255, 255, 0.035);
  color: white;
  outline: none;
}

.articles-index-list__thumb {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--color-surface);
  background: var(--color-panel);
}

.articles-index-list__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.articles-index-list__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-3);
}

.articles-index-list strong {
  font-size: var(--text-sm);
  letter-spacing: 0.015em;
  line-height: 1.2;
  text-transform: uppercase;
}

.articles-index-list small {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
}

@media (max-width: 639px) {
  .articles-index-list a {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: var(--space-3);
    min-height: 84px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .articles-index-list a {
    transition: none;
  }
}
</style>
