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

useSeoMeta({
  title: () =>
    isNotFound.value ? pageTitle("Page Not Found") : pageTitle("Server Error"),
  description: () =>
    isNotFound.value
      ? "This page isn't on Christopher Santana's site."
      : "Something went wrong on Christopher Santana's site.",
  robots: "noindex, nofollow",
});

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
