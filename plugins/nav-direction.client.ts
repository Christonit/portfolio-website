import type { NavDir } from "~/composables/useNavDirection";

export default defineNuxtPlugin(() => {
  const hint = useNavDirectionHint();

  function isInternalAnchor(el: Element | null): el is HTMLAnchorElement {
    if (!(el instanceof HTMLAnchorElement)) return false;
    const href = el.getAttribute("href");
    if (!href || href.startsWith("#")) return false;
    if (el.target === "_blank") return false;
    const origin = el.origin || window.location.origin;
    return origin === window.location.origin;
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
        return;
      }

      if (target.closest("[data-nav-back]")) {
        markDirection("back");
      }
    },
    true,
  );

  const router = useRouter();

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
