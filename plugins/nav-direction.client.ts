import type { NavDir } from "~/composables/useNavDirection";

export default defineNuxtPlugin((nuxtApp) => {
  const hint = useNavDirectionHint();
  const router = useRouter();

  // The app is wrapped in <Suspense>, so the initial page (and every NuxtLink's
  // click interception) hydrates asynchronously. Until that resolves, the links
  // are inert SSR <a href> elements — a tap follows the href as a full document
  // reload. On a slow phone that window is wide enough to catch the first tap,
  // which reads as an unresponsive link plus a full-page flicker. Track when
  // hydration has resolved so the capture-phase handler can bridge that gap.
  let appReady = !nuxtApp.isHydrating;
  nuxtApp.hook("app:suspense:resolve", () => {
    appReady = true;
  });

  function isInternalAnchor(el: Element | null): el is HTMLAnchorElement {
    if (!(el instanceof HTMLAnchorElement)) return false;
    const href = el.getAttribute("href");
    if (!href || href.startsWith("#")) return false;
    if (el.target === "_blank") return false;
    const origin = el.origin || window.location.origin;
    return origin === window.location.origin;
  }

  // A tap the browser would turn into a plain document navigation: primary
  // button, no modifier keys, not already handled by something else.
  function isPlainNavigationClick(event: MouseEvent) {
    return (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.defaultPrevented
    );
  }

  function markDirection(dir: NavDir) {
    hint.value = dir;
    applyNavDirection(dir);
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");

      // Pager controls may opt into a direction; other anchors resolve by path
      // so leaving a project dossier dismisses the sheet.
      if (isInternalAnchor(anchor)) {
        markDirection(
          navDirectionForNavigation(
            anchor.pathname,
            window.location.pathname,
            anchor.dataset.navDirection,
          ),
        );

        // Pre-hydration bridge: NuxtLink hasn't attached its click handler yet,
        // so let vue-router take the navigation instead of the browser doing a
        // full reload. Once hydrated, NuxtLink owns this and we stay out of it.
        if (!appReady && isPlainNavigationClick(event)) {
          event.preventDefault();
          router.push(anchor.pathname + anchor.search + anchor.hash);
        }
        return;
      }

      if (target.closest("[data-nav-back]")) {
        markDirection("back");
      }
    },
    true,
  );

  // vue-router stamps a monotonic `position` onto each history entry, and the
  // browser has already swapped it in by the time our guard runs on a
  // back/forward. A popstate listener can't be used here: the router's own
  // listener is registered first, so its guards run before ours would fire.
  const historyPosition = () =>
    (window.history.state?.position as number | undefined) ?? 0;
  let lastPosition = historyPosition();

  router.beforeEach((to, from) => {
    // Pushes only write their position once the navigation is confirmed, so a
    // position that already moved means the browser walked the stack for us.
    const position = historyPosition();
    const wentBackInHistory = position < lastPosition;

    if (!from.matched.length) {
      applyNavDirection("forward");
      hint.value = null;
      return;
    }

    const dir = navDirectionForPath(to.path, from.path);

    if (wentBackInHistory) {
      hint.value = null;
      // Retreating through the stack never plays as a forward slide, but a
      // modal dismissal already reads as backwards and is kept.
      applyNavDirection(dir === "forward" ? "back" : dir);
      return;
    }

    if (hint.value) {
      applyNavDirection(hint.value);
      hint.value = null;
      return;
    }

    applyNavDirection(dir);
  });

  // finalizeNavigation has written the new entry by the time afterEach runs.
  router.afterEach(() => {
    lastPosition = historyPosition();
  });
});
