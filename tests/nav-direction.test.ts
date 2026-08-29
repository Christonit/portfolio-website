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
