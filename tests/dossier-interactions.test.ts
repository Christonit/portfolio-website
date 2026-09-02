import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import * as dossier from "../composables/useDossierBackground.ts";

test("closing a dossier consumes its modal history entry", () => {
  const interactions = dossier as typeof dossier & {
    dossierDismissalNavigation?: (
      background: { fullPath: string } | null,
    ) => { type: "back" } | { type: "replace"; to: string };
  };

  assert.equal(typeof interactions.dossierDismissalNavigation, "function");
  assert.deepEqual(
    interactions.dossierDismissalNavigation?.({ fullPath: "/bio/?from=work" }),
    { type: "back" },
  );
  assert.deepEqual(interactions.dossierDismissalNavigation?.(null), {
    type: "replace",
    to: "/projects",
  });
});

test("pager steps replace the current dossier history entry", () => {
  const interactions = dossier as typeof dossier & {
    dossierPagerNavigation?: (slug: string) => {
      type: "replace";
      to: string;
    };
  };

  assert.equal(typeof interactions.dossierPagerNavigation, "function");
  assert.deepEqual(interactions.dossierPagerNavigation?.("timothy-sykes"), {
    type: "replace",
    to: "/project/timothy-sykes/",
  });
});

test("dossier controls are blocked for the whole dismissal", () => {
  const interactions = dossier as typeof dossier & {
    dossierControlsAreBlocked?: (closing: boolean) => boolean;
  };

  assert.equal(typeof interactions.dossierControlsAreBlocked, "function");
  assert.equal(interactions.dossierControlsAreBlocked?.(false), false);
  assert.equal(interactions.dossierControlsAreBlocked?.(true), true);
});

test("focus restoration waits until the underlying page updates", async () => {
  const interactions = dossier as typeof dossier & {
    restoreDossierFocus?: (
      target: { focus: (options?: FocusOptions) => void } | null,
      afterUpdate: () => Promise<unknown>,
    ) => Promise<void>;
  };

  assert.equal(typeof interactions.restoreDossierFocus, "function");

  const events: string[] = [];
  let releaseUpdate: (() => void) | undefined;
  const updateFinished = new Promise<void>((resolve) => {
    releaseUpdate = resolve;
  });

  const restoring = interactions.restoreDossierFocus?.(
    {
      focus(options) {
        events.push(options?.preventScroll ? "focus-without-scroll" : "focus");
      },
    },
    () => updateFinished,
  );

  await Promise.resolve();
  assert.deepEqual(events, []);

  releaseUpdate?.();
  await restoring;
  assert.deepEqual(events, ["focus-without-scroll"]);
});

test("the sheet's own entrance holds the pager gate", () => {
  const sheet = readFileSync(
    new URL("../components/ProjectSheet.vue", import.meta.url),
    "utf8",
  );

  // A press that lands mid-entrance must be queued, not committed: a pager
  // step's stylesheet takes the panel's entrance animation away, so a step
  // arriving mid-zoom teleports the panel into place.
  assert.match(
    sheet,
    /import\.meta\.client && enter === "animate"\) holdProjectPagerStep\(\)/,
  );

  // …and released again when the panel has actually landed.
  assert.match(
    sheet,
    /watch\(entered, \(value\) => \{\s*if \(value\) settleProjectPagerStep\(\);/,
  );
});

test("the pager's entrance backstop outlasts the sheet's own", () => {
  const sheet = readFileSync(
    new URL("../components/ProjectSheet.vue", import.meta.url),
    "utf8",
  );
  const pager = readFileSync(
    new URL("../composables/useProjectSheet.ts", import.meta.url),
    "utf8",
  );

  const sheetFallback = Number(
    /const ENTRANCE_TIMEOUT_MS = (\d+)/.exec(sheet)?.[1],
  );
  const pagerFallback = Number(
    /const PAGER_ENTRANCE_TIMEOUT_MS = (\d+)/.exec(pager)?.[1],
  );

  assert.ok(Number.isFinite(sheetFallback) && Number.isFinite(pagerFallback));
  // Whichever fires first wins the entrance. The pager winning is the snap the
  // hold exists to prevent, so it has to be the later of the two.
  assert.ok(
    pagerFallback > sheetFallback,
    `pager backstop ${pagerFallback}ms must outlast sheet entrance fallback ${sheetFallback}ms`,
  );
});
