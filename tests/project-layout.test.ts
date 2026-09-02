import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const projectOverlay = readFileSync(
  new URL("../components/ProjectDossierOverlay.vue", import.meta.url),
  "utf8",
);

test("desktop project rails derive their minimum offset from the dossier gutter", () => {
  const centeredGutterOffset =
    "calc(var(--dossier-gutter) / 2 - 1.375rem)";

  assert.equal(projectOverlay.split(centeredGutterOffset).length - 1, 2);
});
