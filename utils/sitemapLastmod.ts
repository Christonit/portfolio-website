import { execFileSync } from "node:child_process";

/**
 * Per-route `lastmod`, taken from git rather than from the clock.
 *
 * Stamping every URL with the build time would mark the whole site as changed
 * on every deploy — including a deploy that only touched CSS — and Google's
 * guidance is explicit that a lastmod it learns to distrust is worth less than
 * no lastmod at all. So each route reports the last commit that touched the
 * files its content actually comes from.
 *
 * Returns undefined when git can't answer (a shallow CI clone deep enough to
 * miss a file's last change, an export with no .git). Omitting the field is
 * the honest fallback; guessing is not.
 */
function lastCommitISO(...paths: string[]): string | undefined {
  const dates = paths
    .map((path) => {
      try {
        const out = execFileSync(
          "git",
          ["log", "-1", "--format=%cI", "--", path],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
        ).trim();
        return out || undefined;
      } catch {
        return undefined;
      }
    })
    .filter((value): value is string => Boolean(value));

  if (!dates.length) return undefined;
  return dates.sort().at(-1);
}

type SitemapEntry = { loc: string; lastmod?: string };

/** The files whose commits count as a change to each route's content. */
const PROJECT_DATA = "data/projects.json";

function sourcesFor(loc: string): string[] {
  const path = new URL(loc, "https://example.com").pathname.replace(/\/+$/, "");

  if (path.startsWith("/project/")) {
    return [PROJECT_DATA, "components/ProjectDossier.vue"];
  }
  if (path === "/projects") {
    return [PROJECT_DATA, "pages/projects.vue", "components/ProjectsBoard.vue"];
  }
  if (path === "/bio") return ["pages/bio.vue"];
  return [PROJECT_DATA, "pages/index.vue"];
}

export function withGitLastmod(entry: SitemapEntry): SitemapEntry {
  const lastmod = lastCommitISO(...sourcesFor(entry.loc));
  return lastmod ? { ...entry, lastmod } : entry;
}
