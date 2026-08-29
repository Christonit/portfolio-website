export type NavDir = "forward" | "back" | "modal-in" | "modal-out" | "none";

const NAV_DIRECTIONS: readonly NavDir[] = [
  "forward",
  "back",
  "modal-in",
  "modal-out",
  "none",
];

const TAB_PATHS = ["/", "/projects", "/bio"];

export const useNavDirection = () =>
  useState<NavDir>("nav-dir", () => "forward");

export const useNavDirectionHint = () =>
  useState<NavDir | null>("nav-dir-hint", () => null);

export function routeDepth(path: string) {
  return path.split("/").filter(Boolean).length;
}

export function tabIndex(path: string) {
  if (path.startsWith("/project/")) return TAB_PATHS.indexOf("/projects");
  return TAB_PATHS.indexOf(path);
}

function isProjectDetail(path: string) {
  return path.startsWith("/project/");
}

export function navDirectionForPath(toPath: string, fromPath: string): NavDir {
  if (toPath === fromPath) return "forward";

  // The dossier is a modal sheet layered over the projects board, and the
  // board renders underneath it either way — so the page itself must not
  // move. ProjectSheet owns the open/dismiss motion instead.
  if (isProjectDetail(toPath) || isProjectDetail(fromPath)) {
    return "none";
  }

  const toDepth = routeDepth(toPath);
  const fromDepth = routeDepth(fromPath);
  if (toDepth < fromDepth) return "back";
  if (toDepth > fromDepth) return "forward";

  const toTab = tabIndex(toPath);
  const fromTab = tabIndex(fromPath);
  if (toTab !== -1 && fromTab !== -1 && toTab !== fromTab) {
    return toTab < fromTab ? "back" : "forward";
  }

  return "forward";
}

export function navDirectionForNavigation(
  toPath: string,
  fromPath: string,
  explicitDirection?: string | null,
): NavDir {
  if (NAV_DIRECTIONS.includes(explicitDirection as NavDir)) {
    return explicitDirection as NavDir;
  }

  return navDirectionForPath(toPath, fromPath);
}

export function applyNavDirection(dir: NavDir) {
  const navDir = useNavDirection();
  navDir.value = dir;
  if (import.meta.client) {
    document.documentElement.dataset.navDir = dir;
  }
}
