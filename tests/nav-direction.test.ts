import assert from "node:assert/strict";
import test from "node:test";

import * as navDirection from "../composables/useNavDirection.ts";

test("an explicit previous-project direction overrides path inference", () => {
  assert.equal(typeof navDirection.navDirectionForNavigation, "function");
  assert.equal(
    navDirection.navDirectionForNavigation(
      "/project/stockstotrade",
      "/project/canopy-super-app",
      "back",
    ),
    "back",
  );
});

test("a trailing-slash-only difference is not a page change", () => {
  const { isSamePathIgnoringTrailingSlash: same } = navDirection;
  assert.equal(same("/projects", "/projects/"), true);
  assert.equal(same("/projects/", "/projects"), true);
  assert.equal(same("/", "/"), true);
  assert.equal(same("/projects", "/bio"), false);
  assert.equal(same("/", "/projects"), false);
  assert.equal(same("/project/canopy-super-app/", "/project/canopy-super-app"), true);
  assert.equal(same("/project/canopy-super-app", "/project/stockstotrade"), false);
});
