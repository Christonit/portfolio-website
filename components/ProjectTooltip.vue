<script setup lang="ts">
import { isArticle } from "~/utils/projects";

export interface ProjectMetric {
  label: string;
  value: string;
  progress: number;
}

export interface ProjectTechGroup {
  label: string;
  items: string[];
}

export interface ProjectPreview {
  name: string;
  slug: string;
  category: string;
  role?: string;
  tags: string;
  link?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  imageTone?: "dark" | "light";
  video?: string;
  tasks: string[];
  tech: string[];
  techGroups?: ProjectTechGroup[];
  description?: string;
  dossier?: string[];
  icon?: string;
  metric?: ProjectMetric;
}

const props = defineProps<{
  project: ProjectPreview;
  objectId: string;
}>();

const imageReady = ref(false);

watch(
  () => [props.project.image, props.project.slug],
  () => {
    imageReady.value = false;
  },
);

const tasks = computed(() => props.project.tasks.slice(0, 3));
const visitUrl = computed(() => props.project.link?.trim() || "");
const article = computed(() => isArticle(props.project));
const visitLabel = computed(() =>
  article.value ? "READ ARTICLE" : "VISIT PROJECT",
);
</script>

<template>
  <article
    class="project-tt flex w-full flex-col overflow-hidden border border-surface bg-panel text-left shadow-[0_24px_80px_rgba(0,0,0,0.72),0_0_0_1px_rgba(103,245,122,0.06)]"
    :aria-label="`${project.name} project preview`"
  >
    <!-- Preview image -->
    <div
      class="relative aspect-[16/9] w-full overflow-hidden border-b border-white/10 bg-black"
    >
      <div
        class="absolute inset-0 flex flex-col items-center justify-center gap-2"
      >
        <div class="absolute inset-0 grid-bg opacity-40" />
        <span
          class="text-label-data relative z-[1] uppercase tracking-[0.28em] text-signal"
          >{{ objectId }}</span
        >
        <span
          class="text-label-data relative z-[1] uppercase tracking-[0.18em] text-muted"
          >PREVIEW_OFFLINE</span
        >
      </div>
      <img
        v-if="project.image"
        :src="project.image"
        :alt="`${project.name} preview`"
        class="absolute inset-0 z-[1] h-full w-full object-cover object-top transition-opacity duration-200"
        :class="imageReady ? 'opacity-100' : 'opacity-0'"
        loading="lazy"
        decoding="async"
        @load="imageReady = true"
        @error="imageReady = false"
      />
    </div>

    <div class="flex flex-col gap-4 px-4 pb-4 pt-4">
      <!-- Title -->
      <h3
        class="text-title-ui uppercase tracking-tight text-white"
      >
        {{ project.name }}
      </h3>

      <!-- Tasks -->
      <ul v-if="tasks.length" class="flex flex-col gap-2" role="list">
        <li
          v-for="(task, i) in tasks"
          :key="task"
          class="project-tt-task text-label-data flex items-start gap-2 uppercase tracking-wide text-body"
          :style="{ '--task-i': i }"
        >
          <span class="mt-px shrink-0 text-signal" aria-hidden="true"
            >&gt;</span
          >
          <span>{{ task }}</span>
        </li>
      </ul>

      <!-- Tech stack -->
      <ul v-if="project.tech.length" class="flex flex-wrap gap-2" role="list">
        <li v-for="(item, i) in project.tech" :key="item">
          <span
            class="text-label-data inline-flex items-center border px-2 py-1 uppercase tracking-[0.14em] transition-colors duration-150"
            :class="
              i === 0
                ? 'border-signal text-signal'
                : 'border-rule text-body hover:border-signal hover:text-signal'
            "
          >
            {{ item }}
          </span>
        </li>
      </ul>

      <!-- Actions -->
      <div class="flex gap-2 pt-1">
        <NuxtLink
          v-if="!article"
          :to="`/project/${project.slug}`"
          class="project-tt-btn text-label-data"
        >
          LEARN MORE
        </NuxtLink>

        <a
          v-if="visitUrl"
          :href="visitUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="project-tt-btn text-label-data"
        >
          {{ visitLabel }}
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-tt-btn {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 0;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-signal);
  color: var(--color-signal);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  transition:
    background-color var(--tt-in-dur, 150ms) var(--tt-in-ease, ease-out),
    color var(--tt-in-dur, 150ms) var(--tt-in-ease, ease-out);
}

.project-tt-btn:hover,
.project-tt-btn:focus-visible {
  background-color: var(--color-signal);
  color: var(--color-canvas);
}

.project-tt-btn:focus-visible {
  outline: 1px solid var(--color-signal);
  outline-offset: 2px;
}

.project-tt-task {
  animation: project-tt-task-in var(--tt-in-dur, 150ms)
    var(--tt-in-ease, ease-out) both;
  animation-delay: calc(
    var(--tt-delay, 80ms) + (var(--task-i, 0) * var(--duration-stagger, 40ms))
  );
}

@keyframes project-tt-task-in {
  from {
    opacity: 0;
    transform: translateY(var(--distance-micro, 4px));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-tt-task {
    animation: none !important;
  }

  .project-tt-btn {
    transition: none;
  }
}
</style>
