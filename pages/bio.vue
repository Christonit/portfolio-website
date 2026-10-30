<script setup lang="ts">
import { IDENTITY_ID, pageTitle } from "~/utils/site";

usePageSeo({
  title: pageTitle("About"),
  description:
    "Christopher Santana — from Punta Cana to Manhattan. Senior Full Stack Engineer behind real-time news and quote systems used by 1M+ monthly users.",
  pageType: "AboutPage",
  mainEntity: { "@id": IDENTITY_ID },
  extraSchema: () => [
    defineBreadcrumb({
      itemListElement: [{ name: "Home", item: "/" }, { name: "About" }],
    }),
  ],
});

const portfolio = usePortfolio();
const about = computed(() => portfolio.value.about);
const education = computed(() => about.value.education);
const timeline = computed(() => portfolio.value.experience);
</script>

<template>
  <div
    class="bio-rail flex flex-col gap-8 py-4 pb-24 xl:h-full xl:gap-12 xl:overflow-y-auto xl:pb-8"
  >
    <header class="flex flex-col gap-4 pt-2">
      <span class="hud-label">// BIO</span>
      <h1 class="hud-title">ABOUT ME</h1>
      <p class="bio-lede text-body-compact text-muted">
        {{ about.subtitle }}
      </p>
    </header>

    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-6">
        <div class="relative border-l-[3px] border-white pl-4 lg:pr-3 lg:py-2">
          <HudCorners :corners="['tr', 'br']" />
          <div class="text-body-prose space-y-3 text-prose">
            <p v-for="(paragraph, index) in about.paragraphs" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <section class="bio-panel">
          <h2 class="hud-label mb-4">EDUCATION_RECORD</h2>
          <ul class="flex flex-col gap-4" role="list">
            <li
              v-for="edu in education"
              :key="edu.degree"
              class="border-l-2 pl-3"
              :class="edu.active ? 'border-white' : 'border-rule/40'"
            >
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span
                  class="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold uppercase leading-snug tracking-wider"
                  :class="edu.active ? 'text-white' : 'text-prose'"
                >
                  {{ edu.degree }}
                  <span
                    v-if="edu.status"
                    class="font-mono text-2xs font-normal tracking-[0.18em] text-signal"
                    >{{ edu.status }}</span
                  >
                </span>
                <span
                  class="font-mono text-xs leading-snug tracking-wide text-muted sm:shrink-0"
                >
                  {{ edu.school }} // {{ edu.year }}
                </span>
              </div>
              <p
                v-if="edu.note"
                class="mt-2 text-sm leading-relaxed text-prose"
              >
                {{ edu.note }}
              </p>
            </li>
          </ul>

          <div class="mt-6 border-t border-rule/40 pt-6">
            <h3 class="hud-label mb-3">AWARDS</h3>
            <div
              v-for="award in about.awards"
              :key="award.title"
              class="flex items-stretch gap-3"
            >
              <div class="w-[2px] shrink-0 bg-white/40" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <span
                  class="text-sm font-semibold uppercase leading-snug tracking-wider text-body"
                >
                  {{ award.title }}
                </span>
                <span
                  class="font-mono text-xs leading-snug tracking-wide text-muted"
                >
                  {{ award.detail }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="flex flex-col">
        <h2 class="hud-label mb-6">EXPERIENCE</h2>
        <ExperienceTimeline :orgs="timeline" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.bio-rail {
  width: min(800px, calc(100% - 32px));
  margin-inline: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.bio-rail::-webkit-scrollbar {
  display: none;
}

/* The lede breaks earlier than the prose below it so the display type
   above keeps its shape. */
.bio-lede {
  max-width: 60ch;
}

/* No one-word last lines anywhere in the rail's prose. */
.bio-rail p {
  text-wrap: pretty;
}

.bio-panel {
  border: 1px solid rgba(71, 71, 71, 0.4);
  background: rgba(31, 31, 31, 0.2);
  padding: var(--space-4);
}

@media (min-width: 1280px) {
  .bio-panel {
    padding: var(--space-6);
  }
}

@media (max-width: 639px) {
  .bio-rail {
    width: min(800px, calc(100% - 24px));
  }
}
</style>
