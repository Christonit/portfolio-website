<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { ProjectPreview } from "./ProjectTooltip.vue";
import { isExternalProjectHref, projectHref } from "~/utils/projects";
import { LINKEDIN_URL } from "~/utils/site";

const props = withDefaults(
  defineProps<{
    variant?: "work" | "mission";
    project?: ProjectPreview;
    index?: number;
    total?: number;
    focused?: boolean;
  }>(),
  {
    variant: "work",
    index: 0,
    total: 1,
    focused: false,
  },
);

const isMission = computed(() => props.variant === "mission");

const badges = computed(() => {
  if (!props.project) return [];
  return props.project.tags
    .split("//")
    .map((tag) => tag.trim().replace(/\s+/g, "_"))
    .filter(Boolean);
});

const ctaLabel = computed(() =>
  props.project?.category.toLowerCase() === "article"
    ? "READ_ARTICLE"
    : "VIEW_PROJECT",
);

const href = computed(() => {
  if (isMission.value) return LINKEDIN_URL;
  if (!props.project) return "/projects";
  return projectHref(props.project);
});

const isExternal = computed(() => {
  if (isMission.value) return true;
  return props.project ? isExternalProjectHref(props.project) : false;
});

const imageFailed = ref(false);
const measuredRatio = ref<string | null>(null);
const showPreview = computed(
  () => Boolean(props.project?.image) && !imageFailed.value,
);

// The thumb sizes itself from the image's intrinsic ratio. Reading that off the
// loaded <img> only works once the bytes have landed, so the slot has to be
// reserved from data instead — otherwise the first (uncached) visit paints a
// squat placeholder and every card jumps taller as its image decodes, while a
// reload serves from cache and looks correct. Measuring stays as a fallback for
// projects whose dimensions aren't recorded.
const previewRatio = computed(() => {
  const w = props.project?.imageWidth;
  const h = props.project?.imageHeight;
  if (w && h) return `${w} / ${h}`;
  return measuredRatio.value;
});

function applyPreviewSize(el: EventTarget | null) {
  if (!(el instanceof HTMLImageElement)) return;
  if (el.naturalWidth > 0 && el.naturalHeight > 0) {
    measuredRatio.value = `${el.naturalWidth} / ${el.naturalHeight}`;
  }
}

// Vue hands a template ref callback `Element | ComponentPublicInstance | null`,
// so the signature has to accept all three even though only the <img> matters.
function syncPreviewEl(el: Element | ComponentPublicInstance | null) {
  if (!(el instanceof HTMLImageElement)) return;
  if (el.complete && el.naturalWidth === 0) {
    imageFailed.value = true;
    return;
  }
  if (el.complete) applyPreviewSize(el);
}

watch(
  () => props.project?.image,
  () => {
    imageFailed.value = false;
    measuredRatio.value = null;
  },
);

const counter = computed(() => {
  const n = String(props.index + 1).padStart(2, "0");
  const t = String(props.total).padStart(2, "0");
  return `${n}/${t}`;
});

const ariaLabel = computed(() => {
  if (isMission.value) {
    return "New mission — get in touch to start a project";
  }
  const name = props.project?.name ?? "project";
  const action = ctaLabel.value.replace(/_/g, " ").toLowerCase();
  return isExternal.value
    ? `${action}: ${name} (opens in a new tab)`
    : `${action}: ${name}`;
});
</script>

<template>
  <NuxtLink
    :to="href"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :aria-label="ariaLabel"
    :class="[
      'projects-card group relative flex h-full min-h-[320px] flex-col border bg-[#0c0c0c] text-left no-underline outline-none',
      'transition-[border-color,background-color] duration-150',
      focused
        ? 'is-focused border-[#67F57A]'
        : 'border-[#2a2a2a] hover:border-[#67F57A]/55 focus-visible:border-[#67F57A]',
      isMission ? 'justify-center' : '',
    ]"
  >
    <div class="corner-tl-w" />
    <div class="corner-br-w" />

    <!-- ── NEW MISSION ── -->
    <div
      v-if="isMission"
      class="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center"
    >
      <div
        class="flex h-12 w-12 items-center justify-center border border-[#474747] text-[#919191] transition-colors duration-150 group-hover:border-[#67F57A] group-hover:text-[#67F57A] group-focus-visible:border-[#67F57A] group-focus-visible:text-[#67F57A]"
        style="border-radius: 9999px"
        aria-hidden="true"
      >
        <span class="material-symbols-outlined icon-md leading-none"
          >add</span
        >
      </div>
      <div>
        <h2
          class="text-title-ui uppercase tracking-[0.18em] text-[#919191] transition-colors duration-150 group-hover:text-white"
        >
          NEW MISSION
        </h2>
        <p class="text-body-compact mt-2 max-w-[220px] text-[#919191]">
          Awaiting deployment — drop your next project here.
        </p>
      </div>
    </div>

    <!-- ── WORK CARD ── -->
    <template v-else-if="project">
      <div
        class="projects-card__thumb relative shrink-0 overflow-hidden"
        :class="{ 'has-media': showPreview, 'h-36': !previewRatio }"
        :style="previewRatio ? { aspectRatio: previewRatio } : undefined"
      >
        <img
          v-if="showPreview"
          :ref="syncPreviewEl"
          :src="project.image"
          alt=""
          class="absolute inset-0 z-0 h-full w-full object-fill"
          loading="lazy"
          decoding="async"
          @load="applyPreviewSize($event.currentTarget)"
          @error="imageFailed = true"
        />
        <span
          v-else
          class="relative z-[1] material-symbols-outlined icon-lg text-white/90"
          aria-hidden="true"
        >
          {{ project.icon || "deployed_code" }}
        </span>
      </div>

      <div class="flex flex-1 flex-col gap-4 px-5 pb-5 pt-5">
        <div class="flex flex-col gap-2">
          <div class="flex min-w-0 items-baseline justify-between gap-3">
            <h2
              class="text-title-ui line-clamp-2 uppercase tracking-tight text-white"
            >
              {{ project.name }}
            </h2>
            <span
              class="text-label-data shrink-0 tabular-nums tracking-widest text-[#919191]"
            >
              {{ counter }}
            </span>
          </div>
          <p
            class="text-body-compact line-clamp-2 text-[#919191]"
          >
            {{ project.description || project.tasks[0] }}
          </p>
        </div>

        <ul v-if="badges.length" class="flex flex-wrap gap-1.5" role="list">
          <li v-for="badge in badges" :key="badge">
            <span
              class="text-label-data inline-flex items-center border border-[#3a3a3a] px-1.5 py-1 uppercase tracking-[0.14em] text-[#c6c6c6]"
            >
              {{ badge }}
            </span>
          </li>
        </ul>
      </div>

      <span class="projects-card__cta text-label-data uppercase">
        {{ ctaLabel }}
        <span class="projects-card__arrow" aria-hidden="true">&rarr;</span>
      </span>
    </template>
  </NuxtLink>
</template>

<style scoped>
.projects-card .corner-tl-w,
.projects-card .corner-br-w {
  width: 18px;
  height: 18px;
  border-color: rgba(255, 255, 255, 0.72);
}

.projects-card.is-focused .corner-tl-w,
.projects-card.is-focused .corner-br-w,
.projects-card:hover .corner-tl-w,
.projects-card:hover .corner-br-w,
.projects-card:focus-visible .corner-tl-w,
.projects-card:focus-visible .corner-br-w {
  border-color: rgba(103, 245, 122, 0.9);
}

.projects-card__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #111;
  border-bottom: 1px solid #1f1f1f;
}

.projects-card__thumb::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.045) 0px,
    rgba(255, 255, 255, 0.045) 1px,
    transparent 1px,
    transparent 7px
  );
  pointer-events: none;
}

.projects-card__thumb.has-media::before {
  display: none;
}

.projects-card__thumb img {
  color-scheme: light;
}

/* Same bottom strip the featured cards on the home page wear: full-bleed to
   the card edge, lit by the card's own hover state since the card is the link. */
.projects-card__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-top: 1px solid #262626;
  background: rgba(255, 255, 255, 0.025);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.14em;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.projects-card.is-focused .projects-card__cta,
.projects-card:hover .projects-card__cta,
.projects-card:focus-visible .projects-card__cta {
  border-color: rgba(103, 245, 122, 0.34);
  background: rgba(103, 245, 122, 0.1);
  color: var(--color-signal);
}

.projects-card__arrow {
  display: inline-block;
  transition: transform var(--tt-in-dur, 150ms) var(--tt-in-ease, ease-out);
}

.projects-card.is-focused .projects-card__arrow,
.projects-card:hover .projects-card__arrow,
.projects-card:focus-visible .projects-card__arrow {
  transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
  .projects-card,
  .projects-card__cta,
  .projects-card__arrow {
    transition: none !important;
  }

  .projects-card.is-focused .projects-card__arrow,
  .projects-card:hover .projects-card__arrow,
  .projects-card:focus-visible .projects-card__arrow {
    transform: none;
  }
}
</style>
