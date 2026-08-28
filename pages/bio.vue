<script setup lang="ts">
import type { ExperienceOrg } from "~/components/ExperienceTimeline.vue";
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

const timeline: ExperienceOrg[] = [
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
        tags: "NUXT // AWS // NODE.JS // AI // WORDPRESS",
        note: "Architecture, Systems Development and SEO for the Timothy Sykes and StocksToTrade websites — high-traffic financial educational and news platform and trading tools.",
        current: true,
      },
      {
        period: "NOV 2020 — OCT 2023",
        role: "Frontend Engineer",
        type: "CONTRACTOR",
        tags: "VUE.JS // GRIDSOME // TAILWIND // GRAPHQL // WORDPRESS",
        note: "Microsites and web marketing campaigns development. Decoupled monolithic wordpress websites  to headless architecture.",
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
        type: "CONTRACTOR",
        tags: "REACT 18 // MICRO-FRONTEND // MONOREPO",
        note: "Implemented  Headless CMS (Builder) into React App. Worked at core frontend team for webapp comprising of 60+ micro-frontends - Collaborated  with a small team to solve technical debt and core features development. ",
        current: false,
      },
    ],
  },
  {
    company: "Claro RD",
    span: "SEP 2019 — OCT 2021",
    active: false,
    location: "Santo Domingo, DR",
    roles: [
      {
        period: "SEP 2019 — OCT 2021",
        role: "UX Engineer",
        type: "FULL-TIME",
        tags: "REACT // HTML // SASS",
        note: "Created and maintained the first version of the inhouse design language and React UI library. Also helped the full stack developers implementing the user flows using the oficial UI library.",
        current: false,
      },
    ],
  },
  {
    company: "StateTrust Group",
    span: "DEC 2017 — SEP 2019",
    location: "Santo Domingo, DR",
    active: false,
    roles: [
      {
        period: "DEC 2017 — SEP 2019",
        role: "Front End Developer",
        type: "FULL-TIME",
        tags: "HTML // CSS // JS",
        note: "Email marketing and dashboards for private wealth management and trading products.",
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
      <span class="hud-label">// BIO</span>
      <h1
        class="font-semibold uppercase tracking-tighter text-white"
        style="font-size: clamp(2.1rem, 4.4vw, 3.6rem); line-height: 0.92"
      >
        ABOUT ME
      </h1>
      <p
        class="max-w-xl font-mono text-xs leading-relaxed text-[#919191] xl:text-sm"
      >
        Manhattan-based Senior Full Stack Engineer with over a decade of
        experience building interfaces and lately systems for high-traffic web
        products.
      </p>
    </header>

    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-5">
        <div class="relative border-l-[3px] border-white pl-4 lg:pr-3 lg:py-2">
          <HudCorners :corners="['tr', 'br']" />
          <div class="space-y-3 text-sm text-[#c6c6c6] leading-relaxed">
            <p>
              Originally from Punta Cana, Dominican Republic, I moved to the
              United States to pursue a Master’s in Information Systems at
              Baruch College and to expand my technical knowledge.
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
                class="font-bold text-xs uppercase tracking-wider text-[#e2e2e2]"
              >
                {{ edu.degree }}
              </div>
              <div class="font-mono text-xs text-[#919191] mt-0.5">
                {{ edu.school }} // {{ edu.year }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <span class="hud-label mb-4 flex-shrink-0">EXPERIENCE</span>
        <ExperienceTimeline :orgs="timeline" />

        <div class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20">
          <span class="hud-label mb-3">AWARDS</span>
          <div class="flex items-start gap-2">
            <div class="w-[2px] bg-white/40 shrink-0 self-stretch" />
            <div>
              <div
                class="font-bold text-xs uppercase tracking-wider text-[#e2e2e2]"
              >
                1ST PLACE — BRANDING DESIGN CONTEST
              </div>
              <div class="font-mono text-xs text-[#919191] mt-0.5">
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
