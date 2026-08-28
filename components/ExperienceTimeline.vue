<script setup lang="ts">
export interface ExperienceRole {
  period: string;
  role: string;
  type: string;
  tags: string;
  note: string;
  current: boolean;
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
</script>

<template>
  <ol class="space-y-8 pl-2 mb-10">
    <li
      v-for="(org, index) in orgs"
      :key="org.company"
      v-reveal="index * 80"
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
        </li>
      </ol>
    </li>
  </ol>
</template>
