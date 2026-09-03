<script setup lang="ts">
import type { NuxtError } from "#app";
import { pageTitle } from "~/utils/site";

const props = defineProps<{
  error: NuxtError;
}>();

const route = useRoute();
const router = useRouter();

const statusCode = computed(() => {
  const code = Number(props.error?.statusCode);
  return Number.isFinite(code) && code > 0 ? code : 500;
});

const isNotFound = computed(() => statusCode.value === 404);

const title = computed(() =>
  isNotFound.value ? pageTitle("Page Not Found") : pageTitle("Server Error"),
);
const description = computed(() =>
  isNotFound.value
    ? "This page isn't on Christopher Santana's site."
    : "Something went wrong on Christopher Santana's site.",
);

/**
 * `tagPriority: "high"` so this entry outranks `app.head` in nuxt.config —
 * both register a <title>, and without it the error page loses the tie.
 */
useHead(
  () => ({
    title: title.value,
    meta: [
      { name: "description", content: description.value },
      { property: "og:title", content: title.value },
      { property: "og:description", content: description.value },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  { tagPriority: "high" },
);

/**
 * ...and then flush it by hand, because nothing else will.
 *
 * Nuxt's head plugin only writes the resolved head to the DOM on `page:finish`,
 * `app:error` and `app:suspense:resolve` — and on a static build all three have
 * already fired by the time this component's entry registers. unhead resolved
 * the right title the whole time (weight 9 against app.head's 10); it simply
 * never got rendered, so every 404 sat there wearing the home page's title and
 * og:title while its own description had landed. Meta tags are appended fresh
 * on the next patch and slipped through; <title> is a unique tag that has to be
 * rewritten in place, and that write is what never came.
 *
 * onMounted, so the entry is registered before the flush.
 */
if (import.meta.client) {
  const head = injectHead();
  onMounted(() => {
    head.dirty = true;
    void head.hooks.callHook("entries:updated", head);
  });
}

const requestPath = computed(() => route.fullPath);

const detail = computed(() => {
  if (!import.meta.dev) return undefined;
  const message = props.error?.message || props.error?.statusMessage;
  if (!message) return undefined;
  // Nuxt's stock 404/500 strings duplicate the PATH + CODE readouts.
  if (/^page not found/i.test(message)) return undefined;
  if (/^internal server error$/i.test(message)) return undefined;
  return message;
});

function goHome() {
  clearError({ redirect: "/" });
}

function goProjects() {
  clearError({ redirect: "/projects/" });
}

function retry() {
  clearError({ redirect: route.fullPath });
}

/* Layout nav, arrow keys, and Escape all go through the router. Clear the
   error on those navigations so error.vue actually unmounts. */
let stopGuard: (() => void) | undefined;

onMounted(() => {
  stopGuard = router.beforeEach((to, from) => {
    if (to.fullPath === from.fullPath) return;
    clearError();
  });
});

onBeforeUnmount(() => {
  stopGuard?.();
});
</script>

<template>
  <NuxtLayout>
    <ErrorConsole
      :status-code="statusCode"
      :request-path="requestPath"
      :detail="detail"
      @home="goHome"
      @projects="goProjects"
      @retry="retry"
    />
  </NuxtLayout>
</template>
