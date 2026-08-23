<script setup lang="ts">
import { IDENTITY_ID, pageTitle } from "~/utils/site";

usePageSeo({
  title: pageTitle("Bio"),
  description:
    "Christopher Santana — from Punta Cana to Manhattan. Senior Full Stack Engineer behind real-time news and quote systems used by 1M+ monthly users.",
  pageType: "AboutPage",
  mainEntity: { "@id": IDENTITY_ID },
  extraSchema: () => [
    defineBreadcrumb({
      itemListElement: [
        { name: "Home", item: "/" },
        { name: "Bio" },
      ],
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

const keyOps = [
  {
    code: "01",
    org: "STOCKS_TO_TRADE",
    metric: "1M+ MONTHLY UNIQUES",
    detail:
      "Real-time news platform and quote lookup. Analytics tools, scanners, watchlists, webinars — a trading cockpit in the same traffic class as Yahoo News and Google Finance.",
  },
  {
    code: "02",
    org: "CANOPY NETWORK",
    metric: "20K+ CONCURRENT // WEEK 1",
    detail:
      "Founding frontend engineer for a blockchain superapp. Owned the interface architecture from zero through testnet launch.",
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

const theaters = [
  "WEALTH & INVESTMENT",
  "TELECOM",
  "STARTUPS",
  "FINANCIAL PUBLISHING",
];
</script>

<template>
  <div
    class="lg:h-full flex flex-col px-4 lg:px-8 py-5 gap-6 lg:overflow-hidden pb-16 lg:pb-0"
  >
    <div class="flex items-center gap-4 flex-shrink-0">
      <span
        class="font-mono text-[10px] text-[#919191] tracking-widest uppercase"
        >01.</span
      >
      <h2 class="font-semibold text-2xl uppercase tracking-tighter text-white">
        BIO_DATABASE
      </h2>
      <div class="flex-1 h-px bg-[#474747]/40 max-w-xs" />
    </div>

    <div
      class="flex flex-col gap-4 lg:grid grid-cols-12 gap-8 flex-1 lg:min-h-0 lg:overflow-hidden"
    >
      <div class="col-span-5 flex flex-col gap-5 overflow-y-auto pr-2">
        <div class="relative border-l-[3px] border-white pl-4 lg:pr-3 lg:py-2">
          <div class="corner-tr-w" />
          <div class="corner-br-w" />
          <span class="hud-label mb-3">IDENTITY_NARRATIVE</span>
          <div class="space-y-3 text-sm text-[#c6c6c6] leading-relaxed">
            <p>
              I’m Chris. I live in Manhattan. I’m originally from Punta Cana in
              the Dominican Republic, and I moved to the United States to pursue
              a Master’s in Information Systems.
            </p>
            <p>
              I work at StocksToTrade, building analytics tools and training for
              traders — webinars, chart scanners, watchlists, the kind of
              cockpit that sits next to a Bloomberg terminal. I built the
              systems behind the financial real-time news platform and the quote
              lookup sites. Those products serve more than a million unique
              monthly users.
            </p>
            <p>
              I was a founding frontend engineer at Canopy Network, a blockchain
              framework built for fast app integration. I owned the frontend
              architecture from zero through the testnet launch. The first week
              hit 20,000+ concurrent users.
            </p>
            <p>
              Most of my career has been frontend software engineering. I now
              work as a fullstack engineer — across wealth and investment
              management, telecom, startups, and financial publishing. I’m here
              for more ambiguous, ambitious problems, and a seat among the best
              and brightest in the United States.
            </p>
          </div>
        </div>

        <div class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20">
          <span class="hud-label mb-3">ORIGIN_LOG</span>
          <dl class="space-y-2">
            <div
              v-for="row in origin"
              :key="row.label"
              class="flex items-baseline justify-between gap-4"
            >
              <dt
                class="font-mono text-[9px] text-[#919191] tracking-widest shrink-0"
              >
                {{ row.label }}
              </dt>
              <dd
                class="font-mono text-[9px] text-[#e2e2e2] tracking-wider text-right"
              >
                {{ row.value }}
              </dd>
            </div>
          </dl>
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
                class="font-bold text-[10px] uppercase tracking-wider text-[#e2e2e2]"
              >
                {{ edu.degree }}
              </div>
              <div class="font-mono text-[8px] text-[#919191] mt-0.5">
                {{ edu.school }} // {{ edu.year }}
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
                class="font-bold text-[10px] uppercase tracking-wider text-[#e2e2e2]"
              >
                1ST PLACE — BRANDING DESIGN CONTEST
              </div>
              <div class="font-mono text-[8px] text-[#919191] mt-0.5">
                MINISTRY OF FOREIGN AFFAIRS // DOMINICAN REPUBLIC // NOV 2017
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7 flex flex-col lg:min-h-0 overflow-y-auto">
        <span class="hud-label mb-3 flex-shrink-0">KEY_OPS</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div
            v-for="op in keyOps"
            :key="op.org"
            class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <span class="font-mono text-[9px] text-[#919191] tracking-widest"
                >{{ op.code }}.</span
              >
              <span
                class="font-mono text-[8px] text-white tracking-widest text-right"
                >{{ op.metric }}</span
              >
            </div>
            <div
              class="font-semibold uppercase text-sm tracking-wider text-white"
            >
              {{ op.org }}
            </div>
            <p class="mt-2 text-xs text-[#c6c6c6] leading-relaxed">
              {{ op.detail }}
            </p>
          </div>
        </div>

        <span class="hud-label mb-4 flex-shrink-0">TIMELINE_LOGS</span>
        <div class="space-y-8 pl-2">
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
              class="font-mono text-[9px] tracking-widest mb-1"
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
            <div
              v-if="org.location"
              class="font-mono text-[8px] text-[#474747] mt-0.5"
            >
              // {{ org.location }}
            </div>

            <div class="mt-4 space-y-4">
              <div v-for="item in org.roles" :key="item.role">
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <div
                    class="font-semibold uppercase text-xs tracking-wider"
                    :class="item.current ? 'text-white' : 'text-[#c6c6c6]'"
                  >
                    {{ item.role }}
                  </div>
                  <div class="font-mono text-[8px] text-[#919191] tracking-widest">
                    {{ item.type }}
                  </div>
                </div>
                <div
                  class="font-mono text-[8px] tracking-widest mt-0.5"
                  :class="item.current ? 'text-white' : 'text-[#919191]'"
                >
                  {{ item.period }}
                </div>
                <p class="text-xs text-[#c6c6c6] leading-relaxed mt-1.5">
                  {{ item.note }}
                </p>
                <div class="font-mono text-[8px] text-[#474747] mt-1">
                  // {{ item.tags }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20 mt-8">
          <span class="hud-label mb-3">THEATERS</span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="theater in theaters"
              :key="theater"
              class="font-mono text-[8px] tracking-widest text-[#e2e2e2] border border-[#474747]/40 px-2 py-1"
            >
              {{ theater }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
