<script setup lang="ts">
usePageSeo({
  title: "CH_SANTANA_OS_V3 // GET_IN_TOUCH",
  description: "Contact Christopher Santana on LinkedIn.",
  pageType: "ContactPage",
});

const form = reactive({ name: "", email: "", message: "" });
const sent = ref(false);
const sending = ref(false);

async function submit() {
  sending.value = true;
  await new Promise((r) => setTimeout(r, 1000));
  sending.value = false;
  sent.value = true;
}

const channels = [
  {
    icon: "mail",
    label: "EMAIL",
    value: "christopher.sant@outlook.com",
    href: "mailto:christopher.sant@outlook.com",
  },
  {
    icon: "link",
    label: "GITHUB",
    value: "github.com/chrisalesant",
    href: "https://github.com",
  },
  {
    icon: "work",
    label: "LINKEDIN",
    value: "linkedin.com/in/chrisalesant",
    href: "https://linkedin.com/in/chrisalesant",
  },
  {
    icon: "language",
    label: "WEBSITE",
    value: "chsantana.com",
    href: "https://chsantana.com",
  },
];
</script>

<template>
  <div class="h-full flex flex-col px-8 py-5 gap-6 overflow-hidden">
    <div class="flex items-center gap-4 flex-shrink-0">
      <span
        class="font-mono text-[10px] text-[#919191] tracking-widest uppercase"
        >04.</span
      >
      <h2 class="font-semibold text-2xl uppercase tracking-tighter text-white">
        GET_IN_TOUCH
      </h2>
      <div class="flex-1 h-px bg-[#474747]/40 max-w-xs" />
    </div>

    <div class="grid grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
      <div class="col-span-4 flex flex-col gap-4">
        <div class="relative border-l-[3px] border-white pl-5 pr-3 py-2">
          <div class="corner-tr-w" />
          <div class="corner-br-w" />
          <span class="hud-label mb-2">COMMUNICATION_CHANNELS</span>
          <p class="text-xs text-[#c6c6c6] leading-relaxed mt-2">
            Inbox always open. Response latency: 02_MS.
          </p>
        </div>
        <div class="space-y-2">
          <a
            v-for="ch in channels"
            :key="ch.label"
            :href="ch.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-3 border border-[#474747]/40 bg-[#1f1f1f]/20 hover:border-white/40 hover:bg-[#2a2a2a]/50 transition-all group"
          >
            <div
              class="w-8 h-8 border border-[#474747]/40 flex items-center justify-center text-[#919191] group-hover:text-white group-hover:border-white/40 transition-all shrink-0"
            >
              <span
                class="material-symbols-outlined text-[16px] leading-none"
                >{{ ch.icon }}</span
              >
            </div>
            <div>
              <span class="hud-label !text-[8px]">{{ ch.label }}</span>
              <span
                class="font-mono text-[10px] text-[#e2e2e2] group-hover:text-white transition-colors block"
                >{{ ch.value }}</span
              >
            </div>
          </a>
        </div>
      </div>

      <div class="col-span-8 flex flex-col min-h-0">
        <div
          class="relative border border-[#474747]/40 p-6 bg-[#1f1f1f]/20 flex-1 flex flex-col"
        >
          <div class="corner-tl" />
          <div class="corner-tr" />
          <div class="corner-bl" />
          <div class="corner-br" />

          <div
            v-if="sent"
            class="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div
              class="w-12 h-12 border border-white/20 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-white text-2xl"
                >check</span
              >
            </div>
            <span class="hud-label">TRANSMISSION_COMPLETE</span>
            <p class="font-mono text-xs text-[#919191]">
              Message received. Standing by for response.
            </p>
            <button
              class="font-mono text-[9px] text-[#919191] hover:text-white transition-colors mt-2 uppercase tracking-widest"
              @click="
                sent = false;
                form.name = '';
                form.email = '';
                form.message = '';
              "
            >
              [ SEND_ANOTHER ]
            </button>
          </div>

          <form
            v-else
            class="flex flex-col gap-4 flex-1"
            @submit.prevent="submit"
          >
            <span class="hud-label mb-1">INITIATE_TRANSMISSION</span>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <span class="hud-label">IDENTIFIER</span>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="JOHN_DOE"
                  class="bg-transparent border border-[#474747]/60 px-3 py-2 text-xs text-[#e2e2e2] placeholder-[#474747] font-mono focus:outline-none focus:border-white transition-colors w-full uppercase"
                />
              </div>
              <div class="flex flex-col gap-1">
                <span class="hud-label">NEURAL_LINK_ADDRESS</span>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  class="bg-transparent border border-[#474747]/60 px-3 py-2 text-xs text-[#e2e2e2] placeholder-[#474747] font-mono focus:outline-none focus:border-white transition-colors w-full"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <span class="hud-label">TRANSMISSION_BODY</span>
              <textarea
                v-model="form.message"
                required
                rows="6"
                placeholder="ENTER_MESSAGE..."
                class="bg-transparent border border-[#474747]/60 px-3 py-2 text-xs text-[#e2e2e2] placeholder-[#474747] font-mono focus:outline-none focus:border-white transition-colors resize-none flex-1 w-full uppercase"
              />
            </div>
            <button
              type="submit"
              :disabled="sending"
              class="self-start flex items-center gap-2 px-6 py-2.5 border border-white bg-transparent text-white font-semibold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                v-if="sending"
                class="material-symbols-outlined text-sm leading-none animate-spin"
                >sync</span
              >
              {{ sending ? "TRANSMITTING..." : "[ SEND_TRANSMISSION ]" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
