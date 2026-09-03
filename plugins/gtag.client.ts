import { isDossierPath } from "~/composables/useDossierBackground";
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
  let lastPath: string | null = null;

  function sendPageView(path: string) {
    if (typeof window.gtag !== "function") return;
    if (path === lastPath) return;
    lastPath = path;

    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  nuxtApp.hook("page:finish", () => {
    if (isFirstPage) {
      isFirstPage = false;
      lastPath = useRoute().fullPath;
      return;
    }
    sendPageView(useRoute().fullPath);
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
   * `sendPageView` de-dupes, so the two paths can't double-count a hop.
   */
  const router = useRouter();
  const head = injectHead();

  /**
   * `page_title` is read off the document, so the send has to wait for the
   * head to actually reach the DOM — a `nextTick` is too early and every
   * project view was reported under the *previous* page's title.
   * `dom:rendered` is the moment unhead finishes patching; the timer is the
   * backstop for a hop whose head never changes and so never renders.
   */
  function sendAfterHeadFlush(path: string) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      stop();
      clearTimeout(timer);
      sendPageView(path);
    };
    const stop = head.hooks.hook("dom:rendered", () => finish());
    const timer = setTimeout(finish, 300);
  }

  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath) return;
    if (!isDossierPath(to.path) && !isDossierPath(from.path)) return;
    sendAfterHeadFlush(to.fullPath);
  });
});
