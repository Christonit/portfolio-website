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

const origin = [
  { label: "ORIGIN", value: "PUNTA CANA // DOMINICAN REPUBLIC" },
  { label: "STATION", value: "MANHATTAN, NY" },
  { label: "VECTOR", value: "FRONTEND → FULLSTACK" },
];

const education = [
  {
    degree: "MS INFORMATION SYSTEMS",
    school: "BARUCH COLLEGE",
    year: "AUG 2025",
  },
  {
    degree: "BS ADVERTISING",
    school: "APEC UNIVERSITY",
    year: "MAY 2015 – AUG 2018",
  },
  {
    degree: "AS MULTIMEDIA TECHNOLOGIES",
    school: "ITLA",
    year: "AUG 2012 – APR 2014",
  },
];

const timeline = [
  {
    company: "StocksToTrade",
    span: "NOV 2020 — PRESENT",
    location: "REMOTE",
    active: true,
    roles: [
      {
        period: "NOV 2023 — PRESENT",
        role: "Senior Full Stack Engineer",
        type: "FULL-TIME",
        tags: "NUXT // AWS // NODE.JS // AI",
        note: "Lead frontend for the Timothy Sykes and StocksToTrade websites and web apps — architecture behind high-traffic platforms that show real-time stock data and curate financial content.",
        current: true,
      },
      {
        period: "NOV 2020 — OCT 2023",
        role: "Frontend Engineer",
        type: "CONTRACT",
        tags: "NUXT // GRIDSOME // TAILWIND // GRAPHQL",
        note: "Migrated WordPress sites to a headless architecture with Nuxt, Gridsome, Tailwind, GraphQL, and REST — decoupling content from presentation to improve performance and deploys.",
        current: false,
      },
    ],
  },
  {
    company: "BairesDev",
    span: "NOV 2021 — OCT 2023",
    location: "REMOTE",
    active: false,
    roles: [
      {
        period: "NOV 2021 — OCT 2023",
        role: "React Developer",
        type: "CONTRACT",
        tags: "REACT 18 // MICRO-FRONTEND // MONOREPO",
        note: "Led the migration of a micro-frontend monorepo of 60+ services from React 16 to React 18, clearing legacy debt and setting a modern baseline for the rest of the platform.",
        current: false,
      },
    ],
  },
  {
    company: "Claro RD",
    span: "SEP 2019 — OCT 2021",
    active: false,
    roles: [
      {
        period: "SEP 2019 — OCT 2021",
        role: "Design Engineer",
        type: "FULL-TIME",
        tags: "REACT // UI LIBRARY // SASS",
        note: "Maintained the React UI library and helped web developers implement newly designed interfaces in production HTML and CSS.",
        current: false,
      },
    ],
  },
  {
    company: "StateTrust Group",
    span: "DEC 2017 — SEP 2019",
    active: false,
    roles: [
      {
        period: "DEC 2017 — SEP 2019",
        role: "Front End Developer",
        type: "FULL-TIME",
        tags: "HTML // CSS // JS // 20+ COUNTRIES",
        note: "Frontend for wealth and investment management products used across 20+ countries.",
        current: false,
      },
    ],
  },
];
</script>

<template>
  <div
    class="bio-rail flex flex-col gap-8 py-5 pb-16 xl:h-full xl:overflow-y-auto xl:pb-8"
  >
    <header class="flex max-w-3xl flex-col gap-3 pt-2">
      <span class="hud-label">// ABOUT</span>
      <h1
        class="text-display uppercase tracking-tighter text-white"
      >
        ABOUT ME
      </h1>
      <p class="text-body-compact max-w-xl text-[#919191]">
        From Punta Cana to Manhattan — a decade of building high-traffic web
        products and scalable systems.
      </p>
    </header>

    <div
      class="flex flex-col gap-10"
    >
      <div class="flex flex-col gap-5">
        <div class="relative border-l-[3px] border-white pl-4 lg:pr-3 lg:py-2">
          <div class="corner-tr-w" />
          <div class="corner-br-w" />
          <span class="hud-label mb-3">IDENTITY_NARRATIVE</span>
          <div class="text-body-prose space-y-3 text-[#c6c6c6]">
            <p>
              I am a Manhattan-based Senior Full Stack Engineer with over a
              decade of experience building interfaces and systems for
              high-traffic web products. Originally from Punta Cana, Dominican
              Republic, I moved to the United States to expand my technical
              foundation and am currently pursuing a Master’s in Information
              Systems at Baruch College.
            </p>
            <p>
              My recent work centers on scalable systems for fintech and
              financial education. Products I’ve shipped handle 25K+ concurrent
              users and serve more than 1M unique visitors each month.
            </p>

            <p>
              In the near future, I want to keep moving toward different and
              bigger problems than the ones I have faced before and collaborate
              with new people and keep growing as an engineer.
            </p>
          </div>
        </div>

        <div class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20">
          <span class="hud-label mb-3">EDUCATION_RECORD</span>
          <div class="space-y-3">
            <div
              v-for="edu in education"
              :key="edu.degree"
              class="border-b border-[#474747]/20 pb-2 last:border-0 last:pb-0"
            >
              <div
                class="text-title-ui uppercase tracking-wider text-[#e2e2e2]"
              >
                {{ edu.degree }}
              </div>
              <div class="text-label-data mt-0.5 text-[#919191]">
                {{ edu.school }} // {{ edu.year }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="flex flex-col">
        <span class="hud-label mb-4 flex-shrink-0">TIMELINE_LOGS</span>
        <div class="space-y-8 pl-2 mb-10">
          <div
            v-for="org in timeline"
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
            />
            <div
              class="text-label-data mb-1 tracking-widest"
              :class="org.active ? 'text-white' : 'text-[#919191]'"
            >
              {{ org.span }}
            </div>
            <div
              class="text-heading-section uppercase tracking-wider"
              :class="org.active ? 'text-white' : 'text-[#c6c6c6]'"
            >
              {{ org.company }}
            </div>
            <div
              v-if="org.location"
              class="text-label-data mt-0.5 text-[#474747]"
            >
              // {{ org.location }}
            </div>

            <div class="mt-4 space-y-4">
              <div v-for="item in org.roles" :key="item.role">
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <div
                    class="text-title-ui uppercase tracking-wider"
                    :class="item.current ? 'text-white' : 'text-[#c6c6c6]'"
                  >
                    {{ item.role }}
                  </div>
                  <div
                    class="text-label-data text-[#919191] tracking-widest"
                  >
                    {{ item.type }}
                  </div>
                </div>
                <div
                  class="text-label-data mt-0.5 tracking-widest"
                  :class="item.current ? 'text-white' : 'text-[#919191]'"
                >
                  {{ item.period }}
                </div>
                <p class="text-body-prose mt-1.5 text-[#c6c6c6]">
                  {{ item.note }}
                </p>
                <div class="text-label-data mt-1 text-[#474747]">
                  // {{ item.tags }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20">
          <span class="hud-label mb-3">AWARDS</span>
          <div class="flex items-start gap-2">
            <div class="w-[2px] bg-white/40 shrink-0 self-stretch" />
            <div>
              <div
                class="text-title-ui uppercase tracking-wider text-[#e2e2e2]"
              >
                1ST PLACE — BRANDING DESIGN CONTEST
              </div>
              <div class="text-label-data mt-0.5 text-[#919191]">
                MINISTRY OF FOREIGN AFFAIRS // DOMINICAN REPUBLIC // NOV 2017
              </div>
            </div>
          </div>
        </div>
      </div>
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

@media (max-width: 639px) {
  .bio-rail {
    width: min(800px, calc(100% - 24px));
  }
}
</style>
