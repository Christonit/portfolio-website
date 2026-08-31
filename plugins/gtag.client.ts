import { GA_MEASUREMENT_ID } from "~/utils/site";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) return;

  const { gaMeasurementId } = useRuntimeConfig().public;
  const id = gaMeasurementId || GA_MEASUREMENT_ID;
  if (!id) return;

  // Initial page_view is sent by the gtag snippet in <head>. Only record
  // client-side navigations so SPA routes still show up in GA.
  let isFirstPage = true;
  nuxtApp.hook("page:finish", () => {
    if (isFirstPage) {
      isFirstPage = false;
      return;
    }
    if (typeof window.gtag !== "function") return;

    const route = useRoute();
    window.gtag("event", "page_view", {
      page_path: route.fullPath,
      page_title: document.title,
      page_location: window.location.href,
    });
  });
});
