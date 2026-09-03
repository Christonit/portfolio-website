import { isDossierPath } from "~/composables/useDossierBackground";
import { createHeadAwarePageViewTracker } from "~/utils/pageViewTracker";
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

  function sendPageView(path: string) {
    if (typeof window.gtag !== "function") return false;

    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
      page_location: window.location.href,
    });
    return true;
  }

  const router = useRouter();
  const head = injectHead();
  const pageViews = createHeadAwarePageViewTracker({
    onHeadRendered: (callback) => head.hooks.hook("dom:rendered", callback),
    send: sendPageView,
  });

  nuxtApp.hook("page:finish", () => {
    if (isFirstPage) {
      isFirstPage = false;
      pageViews.markInitial(useRoute().fullPath);
      return;
    }
    pageViews.queue(useRoute().fullPath);
  });

  /**
   * Dossiers never reach `page:finish`.
   *
   * A dossier opens as a sheet over the page you were on, and `app.vue` pins
   * <NuxtPage> to that page so it does not re-render — see
   * `useDossierBackground`. No page component resolves, so the hook above never
   * fires and every client-side project view went unrecorded: the entire
   * projects section reported nothing but its cold loads.
   *
   * The router fires either way, so the sheet's own URLs are counted here.
   * The shared tracker de-dupes, so the two hooks can't double-count a hop.
   */
  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath) return;
    if (!isDossierPath(to.path) && !isDossierPath(from.path)) return;
    pageViews.queue(to.fullPath);
  });
});
