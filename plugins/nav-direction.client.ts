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

      if (target.closest("[data-nav-back]")) {
        markDirection("back");
        return;
      }

      const anchor = target.closest("a");
      if (isInternalAnchor(anchor)) {
        markDirection(
          navDirectionForPath(anchor.pathname, window.location.pathname),
        );
      }
    },
    true,
  );

  window.addEventListener("popstate", () => {
    markDirection("back");
  });

  const router = useRouter();
  router.beforeEach((to, from) => {
    if (!from.matched.length) {
      applyNavDirection("forward");
      hint.value = null;
      return;
    }

    if (hint.value) {
      applyNavDirection(hint.value);
      hint.value = null;
      return;
    }

    applyNavDirection(navDirectionForPath(to.path, from.path));
  });
});
