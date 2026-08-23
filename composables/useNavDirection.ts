export type NavDir = "forward" | "back";

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

export function navDirectionForPath(toPath: string, fromPath: string): NavDir {
  if (toPath === fromPath) return "forward";

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

export function applyNavDirection(dir: NavDir) {
  const navDir = useNavDirection();
  navDir.value = dir;
  if (import.meta.client) {
    document.documentElement.dataset.navDir = dir;
  }
}
