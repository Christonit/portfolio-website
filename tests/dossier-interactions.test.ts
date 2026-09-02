import assert from "node:assert/strict";
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
  assert.deepEqual(
    interactions.dossierPagerNavigation?.("timothy-sykes"),
    {
      type: "replace",
      to: "/project/timothy-sykes/",
    },
  );
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
