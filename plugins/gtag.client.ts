import { GA_MEASUREMENT_ID } from "~/utils/site";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const { gaMeasurementId } = useRuntimeConfig().public;
  const id = gaMeasurementId || GA_MEASUREMENT_ID;

  if (!id || import.meta.dev) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${id}`,
        async: true,
      },
    ],
  });

  const trackPageView = () => {
    const route = useRoute();
    window.gtag("event", "page_view", {
      page_path: route.fullPath,
      page_title: document.title,
      page_location: window.location.href,
    });
  };

  trackPageView();
  nuxtApp.hook("page:finish", trackPageView);
});
