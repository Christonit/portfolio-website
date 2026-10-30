/**
 * Scroll-reveal plugin.
 *
 * Attaches a single IntersectionObserver per scroller that watches every
 * .scroll-reveal element. When an element enters the viewport it receives
 * .is-visible, which fires the CSS transition declared in globals.css.
 *
 * Elements start with only .scroll-reveal (no modifier). The plugin adds
 * .is-hiding synchronously in onMounted — after the server-rendered HTML has
 * hydrated — so the first paint is always at full opacity (SSR / no-JS safe).
 * On the next frame .is-hiding is on the element, locking in the hidden state
 * before the observer's callback has a chance to fire. The transition then
 * plays as the element enters the scrollport.
 *
 * Items already in the viewport at mount-time are given .is-visible
 * immediately (no transition), so only below-the-fold content animates.
 *
 * The observer is re-created on every route change so freshly-navigated pages
 * get a clean pass without stale entries from the previous route.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let observer: IntersectionObserver | null = null;

  function teardown() {
    observer?.disconnect();
    observer = null;
  }

  function setup() {
    teardown();

    if (reducedMotion()) return;

    const items = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    if (!items.length) return;

    // Mark every item hidden before the first paint. requestAnimationFrame
    // ensures the class lands after hydration but before the browser composites,
    // so there is no flash of unstyled hidden content.
    requestAnimationFrame(() => {
      items.forEach((el) => {
        el.classList.add("is-hiding");
      });

      // Give the browser one more frame to register the hidden state, then
      // start watching. Items already on-screen are resolved immediately.
      requestAnimationFrame(() => {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const el = entry.target as HTMLElement;
              if (entry.isIntersecting) {
                el.classList.add("is-visible");
                // Stop watching once it has revealed — it won't hide again.
                observer?.unobserve(el);
              }
            });
          },
          {
            // Trigger when 8% of the element is visible. Lower = earlier reveal;
            // at 0 the item fires the moment a single pixel crosses in.
            threshold: 0.08,
          },
        );

        items.forEach((el) => observer!.observe(el));
      });
    });
  }

  // Run on initial mount and after every page navigation.
  nuxtApp.hook("page:finish", () => {
    setup();
  });

  // Also run once on app start for the first page (page:finish fires for
  // subsequent navigations only on some Nuxt versions).
  nuxtApp.hook("app:mounted", () => {
    setup();
  });

  // Clean up when the plugin is disposed (HMR, unmount).
  nuxtApp.hook("app:beforeMount", () => {
    teardown();
  });
});
