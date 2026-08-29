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
    degree: "Master’s in Information Systems",
    school: "BARUCH COLLEGE",
    year: "AUG 2025 — PRESENT",
    active: true,
    status: "CURRENT",
    note: "",
  },
  {
    degree: "Bachelor’s in Advertising",
    school: "APEC UNIVERSITY",
    year: "MAY 2015 – AUG 2018",
    active: false,
    status: "",
    note: "",
  },
  {
    degree: "Associate’s in Multimedia Technology",
    school: "ITLA",
    year: "AUG 2012 – APR 2014",
    active: false,
    status: "",
    note: "",
  },
];

const timeline: ExperienceOrg[] = [
  {
    company: "StocksToTrade",
    span: "NOV 2020 — PRESENT",
    logo: "/images/logos/stockstotrade.png",
    active: true,
    roles: [
      {
        period: "NOV 2023 — PRESENT",
        role: "Senior Full Stack Engineer",
        tags: "NUXT // AWS // NODE.JS // AI // WORDPRESS",
        note: "Architecture, Systems Development and SEO for the Timothy Sykes and StocksToTrade websites — high-traffic financial educational and news platform and trading tools.",
        current: true,
        projects: ["timothy-sykes", "stockstotrade", "content-automation-ai"],
      },
      /* Kept as a bare line: the point it makes is the step up from
         contractor frontend to senior full stack, not the work itself. */
      {
        period: "NOV 2020 — OCT 2023",
        role: "Frontend Engineer",
        type: "CONTRACTOR",
        current: false,
      },
    ],
  },
  {
    company: "BairesDev",
    span: "NOV 2021 — OCT 2023",
    logo: "/images/logos/bairesdev.png",
    active: false,
    roles: [
      {
        period: "NOV 2021 — OCT 2023",
        role: "React Developer",
        type: "CONTRACTOR",
        tags: "REACT 18 // MICRO-FRONTEND // MONOREPO",
        note: "Implemented a headless CMS (Builder) into a React app. Worked on the core frontend team for a webapp comprising 60+ micro-frontends, collaborating with a small team on technical debt and core feature development.",
        current: false,
      },
    ],
  },
  {
    company: "Claro RD",
    span: "SEP 2019 — OCT 2021",
    logo: "/images/logos/claro.png",
    active: false,
    location: "Santo Domingo, DR",
    roles: [
      {
        period: "SEP 2019 — OCT 2021",
        role: "UX Engineer",
        tags: "REACT // HTML // SASS",
        note: "Created and maintained the first version of the inhouse design language and React UI library. Also helped the full stack developers implementing the user flows using the official UI library.",
        current: false,
      },
    ],
  },
  {
    company: "StateTrust Group",
    span: "DEC 2017 — SEP 2019",
    logo: "/images/logos/statetrust.png",
    location: "Santo Domingo, DR",
    active: false,
    roles: [
      {
        period: "DEC 2017 — SEP 2019",
        role: "Front End Developer",
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
    class="bio-rail flex flex-col gap-10 py-5 pb-24 xl:h-full xl:gap-12 xl:overflow-y-auto xl:pb-10"
  >
    <header class="flex flex-col gap-4 pt-2">
      <span class="hud-label">// BIO</span>
      <h1 class="hud-title">ABOUT ME</h1>
      <p class="bio-lede text-body-compact text-[#919191]">
        Manhattan-based Senior Full Stack Engineer with over a decade of
        experience building interfaces and lately systems for high-traffic web
        products.
      </p>
    </header>

    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-5">
        <div class="relative border-l-[3px] border-white pl-4 lg:pr-3 lg:py-2">
          <HudCorners :corners="['tr', 'br']" />
          <div class="text-body-prose space-y-3 text-[#c6c6c6]">
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

        <section class="bio-panel">
          <h2 class="hud-label mb-4">EDUCATION_RECORD</h2>
          <ul class="flex flex-col gap-4" role="list">
            <li
              v-for="edu in education"
              :key="edu.degree"
              class="border-l-2 pl-3"
              :class="edu.active ? 'border-white' : 'border-[#474747]/40'"
            >
              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span
                  class="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold uppercase leading-snug tracking-wider"
                  :class="edu.active ? 'text-white' : 'text-[#c6c6c6]'"
                >
                  {{ edu.degree }}
                  <span
                    v-if="edu.status"
                    class="font-mono text-2xs font-normal tracking-[0.18em] text-[#67F57A]"
                    >{{ edu.status }}</span
                  >
                </span>
                <span
                  class="font-mono text-xs leading-snug tracking-wide text-[#919191] sm:shrink-0"
                >
                  {{ edu.school }} // {{ edu.year }}
                </span>
              </div>
              <p
                v-if="edu.note"
                class="mt-2 text-sm leading-relaxed text-[#c6c6c6]"
              >
                {{ edu.note }}
              </p>
            </li>
          </ul>

          <div class="mt-6 border-t border-[#474747]/40 pt-5">
            <h3 class="hud-label mb-3">AWARDS</h3>
            <div class="flex items-stretch gap-3">
              <div class="w-[2px] shrink-0 bg-white/40" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <span
                  class="text-sm font-semibold uppercase leading-snug tracking-wider text-[#e2e2e2]"
                >
                  1ST PLACE — BRANDING DESIGN CONTEST
                </span>
                <span
                  class="font-mono text-xs leading-snug tracking-wide text-[#919191]"
                >
                  MINISTRY OF FOREIGN AFFAIRS // DOMINICAN REPUBLIC // NOV 2017
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="flex flex-col">
        <h2 class="hud-label mb-5">EXPERIENCE</h2>
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
  padding: 16px;
}

@media (min-width: 1280px) {
  .bio-panel {
    padding: 20px;
  }
}

@media (max-width: 639px) {
  .bio-rail {
    width: min(800px, calc(100% - 24px));
  }
}
</style>
