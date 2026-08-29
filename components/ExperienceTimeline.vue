<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import {
  isExternalProjectHref,
  projectHref,
  projectMediaAlt,
} from "~/utils/projects";
import { formatProjectName } from "~/utils/site";

export interface ExperienceRole {
  period: string;
  role: string;
  type: string;
  tags: string;
  note: string;
  current: boolean;
  /** Project slugs from data/projects.json shipped during this role. */
  projects?: string[];
}

export interface ExperienceOrg {
  company: string;
  span: string;
  location?: string;
  active: boolean;
  roles: ExperienceRole[];
}

defineProps<{
  orgs: ExperienceOrg[];
}>();

const projects = projectsJson as ProjectPreview[];

function roleProjects(role: ExperienceRole): ProjectPreview[] {
  if (!role.projects?.length) return [];
  return role.projects
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is ProjectPreview => Boolean(project?.image));
}
</script>

<template>
  <ol v-reveal="0" class="space-y-8 pl-2 mb-10">
    <li
      v-for="org in orgs"
      :key="org.company"
      class="relative pl-6"
      :class="
        org.active
          ? 'border-l-2 border-white'
          : 'border-l-2 border-[#474747]/40'
      "
    >
      <div
        class="absolute top-0 left-[-5px] w-2.5 h-2.5"
        :class="org.active ? 'bg-white' : 'bg-[#474747]'"
        aria-hidden="true"
      />
      <div
        class="font-mono text-xs tracking-widest mb-1"
        :class="org.active ? 'text-white' : 'text-[#919191]'"
      >
        {{ org.span }}
      </div>
      <div
        class="font-semibold uppercase text-sm tracking-wider"
        :class="org.active ? 'text-white' : 'text-[#c6c6c6]'"
      >
        {{ org.company }}
      </div>
      <div v-if="org.location" class="font-mono text-xs text-[#474747] mt-0.5">
        // {{ org.location }}
      </div>

      <ol class="mt-6">
        <li v-for="item in org.roles" :key="item.role" class="mb-8">
          <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <div
              class="font-semibold uppercase text-sm tracking-wider"
              :class="item.current ? 'text-white' : 'text-[#c6c6c6]'"
            >
              {{ item.role }}
            </div>
            <div class="font-mono text-sm text-[#919191] tracking-widest">
              {{ item.type }}
            </div>
          </div>
          <div
            class="font-mono text-xs tracking-widest"
            :class="item.current ? 'text-white' : 'text-[#919191]'"
          >
            {{ item.period }}
          </div>
          <p class="text-sm text-[#c6c6c6] leading-relaxed mt-1.5">
            {{ item.note }}
          </p>
          <div class="font-mono text-xs text-[#474747] mt-1">
            // {{ item.tags }}
          </div>

          <ul
            v-if="roleProjects(item).length"
            class="mt-4 flex flex-col gap-2"
            role="list"
          >
            <li v-for="project in roleProjects(item)" :key="project.slug">
              <NuxtLink
                :to="projectHref(project)"
                :target="isExternalProjectHref(project) ? '_blank' : undefined"
                :rel="
                  isExternalProjectHref(project)
                    ? 'noopener noreferrer'
                    : undefined
                "
                class="exp-project group flex items-center gap-3 border border-[#474747]/40 bg-[#1f1f1f]/40 p-2 no-underline outline-none"
              >
                <span class="exp-thumb shrink-0" aria-hidden="true">
                  <img
                    :src="project.image"
                    :alt="projectMediaAlt(project)"
                    class="h-full w-full object-cover"
                    decoding="async"
                  />
                </span>

                <span class="flex min-w-0 flex-col gap-0.5">
                  <span
                    class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#c6c6c6] transition-colors duration-150 group-hover:text-white group-focus-visible:text-white"
                  >
                    <span class="truncate">{{
                      formatProjectName(project.name)
                    }}</span>
                    <span
                      v-if="isExternalProjectHref(project)"
                      class="font-mono text-[10px] text-[#474747]"
                      aria-hidden="true"
                      >↗</span
                    >
                  </span>
                  <span
                    class="font-mono text-xs leading-relaxed text-[#919191] line-clamp-2"
                  >
                    {{ project.tags }}
                  </span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ol>
    </li>
  </ol>
</template>

<style scoped>
.exp-thumb {
  display: block;
  width: 64px;
  height: 44px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
  background: #0c0c0c;
}

.exp-project {
  transition:
    border-color 150ms ease,
    background-color 150ms ease;
}

.exp-project:hover,
.exp-project:focus-visible {
  border-color: rgba(103, 245, 122, 0.45);
  background: rgba(31, 31, 31, 0.75);
}

.exp-project:focus-visible {
  outline: 1px solid #67f57a;
  outline-offset: 2px;
}
</style>
