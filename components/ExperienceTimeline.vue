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
  /** Only worth printing when it isn't the default — e.g. CONTRACTOR. */
  type?: string;
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
  /** Path under public/ — falls back to a monogram when absent. */
  logo?: string;
  active: boolean;
  roles: ExperienceRole[];
}

defineProps<{
  orgs: ExperienceOrg[];
}>();

const projects = projectsJson as ProjectPreview[];

/* A single-role org repeats its own date span on the role line. Drop the
   duplicate so the block reads as one date, not two identical ones. */
function showRolePeriod(org: ExperienceOrg, role: ExperienceRole): boolean {
  if (org.roles.length > 1) return true;
  return role.period !== org.span;
}

/* Stands in for a missing logo file. Capitals carry the name better than a
   blind first-two-letters slice does: StocksToTrade reads ST, not "St". */
function orgInitials(org: ExperienceOrg): string {
  const capitals = org.company.match(/[A-Z]/g);
  return (capitals ?? [org.company.slice(0, 1).toUpperCase()])
    .slice(0, 2)
    .join("");
}

function roleProjects(role: ExperienceRole): ProjectPreview[] {
  if (!role.projects?.length) return [];
  return role.projects
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is ProjectPreview => Boolean(project?.image));
}
</script>

<template>
  <ol class="flex flex-col gap-12">
    <li v-for="org in orgs" :key="org.company">
      <div class="exp-row">
        <div class="exp-logo" :class="{ 'exp-logo--active': org.active }">
          <img
            v-if="org.logo"
            :src="org.logo"
            :alt="`${org.company} logo`"
            class="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
          <span v-else class="exp-monogram" aria-hidden="true">
            {{ orgInitials(org) }}
          </span>
        </div>

        <div class="exp-body">
          <div
            class="exp-date mb-1.5"
            :class="org.active ? 'text-white' : 'text-[#919191]'"
          >
            {{ org.span }}
          </div>
          <h3
            class="font-semibold uppercase leading-snug tracking-wider"
            :class="org.active ? 'text-white' : 'text-[#e2e2e2]'"
            style="font-size: var(--text-lg)"
          >
            {{ org.company }}
          </h3>
          <div
            v-if="org.location"
            class="mt-1 font-mono text-xs leading-snug text-[#474747]"
          >
            // {{ org.location }}
          </div>
        </div>
      </div>

      <ol class="exp-roles mt-7 flex flex-col gap-8">
        <li v-for="item in org.roles" :key="item.role" class="exp-row">
          <div class="exp-body">
            <!-- A role span is secondary to the org span above it, so it
                 sits on its own title rather than reading as a peer. -->
            <div
              v-if="showRolePeriod(org, item)"
              class="exp-date mb-1.5"
              :class="item.current ? 'text-[#c6c6c6]' : 'text-[#919191]'"
            >
              {{ item.period }}
            </div>

            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <div
                class="text-sm font-medium uppercase leading-snug tracking-wider"
                :class="item.current ? 'text-[#c6c6c6]' : 'text-[#919191]'"
              >
                {{ item.role }}
              </div>
              <div
                v-if="item.type"
                class="font-mono text-xs leading-snug tracking-widest text-[#474747]"
              >
                {{ item.type }}
              </div>
            </div>

            <p class="exp-measure mt-3 text-sm leading-relaxed text-[#c6c6c6]">
              {{ item.note }}
            </p>
            <div
              class="exp-measure mt-2 font-mono text-xs leading-relaxed tracking-wide text-[#474747]"
            >
              // {{ item.tags }}
            </div>

            <ul
              v-if="roleProjects(item).length"
              class="exp-measure mt-5 flex flex-col gap-2"
              role="list"
            >
              <li v-for="project in roleProjects(item)" :key="project.slug">
                <NuxtLink
                  :to="projectHref(project)"
                  :target="
                    isExternalProjectHref(project) ? '_blank' : undefined
                  "
                  :rel="
                    isExternalProjectHref(project)
                      ? 'noopener noreferrer'
                      : undefined
                  "
                  class="exp-project group flex items-center gap-3 border border-[#474747]/40 bg-[#1f1f1f]/40 p-2.5 no-underline outline-none"
                >
                  <span class="exp-thumb shrink-0" aria-hidden="true">
                    <img
                      :src="project.image"
                      :alt="projectMediaAlt(project)"
                      class="h-full w-full object-cover"
                      decoding="async"
                    />
                  </span>

                  <span class="flex min-w-0 flex-col gap-1">
                    <span
                      class="flex items-center gap-1 text-xs font-semibold uppercase leading-snug tracking-wider text-[#c6c6c6] transition-colors duration-150 group-hover:text-white group-focus-visible:text-white"
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
                      class="font-mono text-xs leading-snug text-[#919191] line-clamp-2"
                    >
                      {{ project.tags }}
                    </span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </li>
      </ol>
    </li>
  </ol>
</template>

<style scoped>
/* Every span now reads above the thing it dates, so a row only has to place
   the logo beside the text stack it labels. */
.exp-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.exp-body {
  flex: 1;
  min-width: 0;
}

.exp-date {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.4;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.exp-logo {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 1px solid rgba(71, 71, 71, 0.4);
  background: rgba(31, 31, 31, 0.4);
}

.exp-logo--active {
  border-color: rgba(255, 255, 255, 0.3);
}

.exp-monogram {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1;
  letter-spacing: 0.06em;
  color: #919191;
}

.exp-logo--active .exp-monogram {
  color: #ffffff;
}

/* Roles hang off the company name, not the logo, so the logo square stays
   the org's own column. Under 768px there is no width to give up. */
@media (min-width: 768px) {
  .exp-roles {
    padding-left: 54px;
  }
}

/* One column width for everything a role owns — notes, tags and project
   cards share a right edge instead of each running to the full rail. At
   800px the 14px notes were wrapping past 95 characters a line. */
.exp-measure {
  max-width: 560px;
  text-wrap: pretty;
}

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
