<script setup lang="ts">
usePageSeo({
  title: "CH_SANTANA_OS_V3 // BIO",
  description: "Christopher Santana — Biography.",
  pageType: "AboutPage",
});

const timeline = [
  {
    period: "NOV 2020 — PRESENT",
    role: "Senior Full Stack Engineer",
    company: "StocksToTrade",
    tags: "NUXT // AWS // NODE.JS // AI",
    active: true,
  },
  {
    period: "NOV 2021 — OCT 2023",
    role: "React Developer",
    company: "BairesDev",
    tags: "REACT 18 // MICRO-FRONTEND // TYPESCRIPT",
    active: false,
  },
  {
    period: "SEP 2019 — OCT 2021",
    role: "Lead Design Engineer",
    company: "Claro Dominicana",
    tags: "REACT // UI LIBRARY // MOBILE",
    active: false,
  },
  {
    period: "MAR 2015 — SEP 2019",
    role: "Frontend Developer",
    company: "Atlantica Seguros | StateTrust",
    tags: "HTML // CSS // JS // 20+ COUNTRIES",
    active: false,
  },
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
              Senior Engineer with 10+ years of experience shipping fast,
              resilient products using JavaScript, UI frameworks, and cloud
              technologies.
            </p>
            <p>
              Currently pursuing a Master of Science in Information Systems to
              bridge my product design and engineering background with the
              demands of the AI era.
            </p>
            <p>
              At my latest role, I architected webapps that leverage real-time
              stock market data and headless CMSs, maintain CI/CD pipelines, and
              streamline workflows with LLM automation for heavily-visited
              trading education platforms.
            </p>
          </div>
        </div>

        <div class="border border-[#474747]/40 p-4 bg-[#1f1f1f]/20">
          <span class="hud-label mb-3">EDUCATION_RECORD</span>
          <div class="space-y-3">
            <div
              v-for="edu in [
                {
                  degree: 'MS INFORMATION SYSTEMS',
                  school: 'BARUCH COLLEGE',
                  year: 'AUG 2025',
                },
                {
                  degree: 'BS ADVERTISING',
                  school: 'APEC UNIVERSITY',
                  year: 'MAY 2015 – AUG 2018',
                },
                {
                  degree: 'AS MULTIMEDIA TECHNOLOGIES',
                  school: 'ITLA',
                  year: 'AUG 2012 – APR 2014',
                },
              ]"
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
        <span class="hud-label mb-4 flex-shrink-0">TIMELINE_LOGS</span>
        <div class="space-y-6 pl-2">
          <div
            v-for="item in timeline"
            :key="item.period"
            class="relative pl-6"
            :class="
              item.active
                ? 'border-l-2 border-white'
                : 'border-l-2 border-[#474747]/40'
            "
          >
            <div
              class="absolute top-0 left-[-5px] w-2.5 h-2.5"
              :class="item.active ? 'bg-white' : 'bg-[#474747]'"
            />
            <div
              class="font-mono text-[9px] tracking-widest mb-1"
              :class="item.active ? 'text-white' : 'text-[#919191]'"
            >
              {{ item.period }}
            </div>
            <div
              class="font-semibold uppercase text-sm tracking-wider"
              :class="item.active ? 'text-white' : 'text-[#c6c6c6]'"
            >
              {{ item.role }}
            </div>
            <div class="font-mono text-[9px] text-[#919191] uppercase mt-0.5">
              {{ item.company }}
            </div>
            <div class="font-mono text-[8px] text-[#474747] mt-1">
              // {{ item.tags }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
