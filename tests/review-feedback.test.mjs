import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectPage = await readFile(
  new URL("../pages/project/[slug].vue", import.meta.url),
  "utf8",
);
const homePage = await readFile(
  new URL("../pages/index.vue", import.meta.url),
  "utf8",
);

test("project detail navigation omits stats and offers an explicit close action", () => {
  assert.doesNotMatch(projectPage, />\s*STATS\s*</);
  assert.match(projectPage, /aria-label="Close project and return to projects"/);
});

test("project detail page is constrained to a 1000px content rail", () => {
  assert.match(projectPage, /max-width:\s*1000px/);
});

test("project media stacks full-width above the scrolling dossier on desktop", () => {
  assert.match(projectPage, /xl:overflow-y-auto/);
  assert.doesNotMatch(projectPage, /xl:grid-cols-12/);
  assert.doesNotMatch(projectPage, /xl:col-span-(?:5|7)/);
});

test("visit project remains available below the md breakpoint", () => {
  const visitLink = projectPage.match(
    /<a\s+v-if="visitUrl"[\s\S]*?>/,
  );

  assert.ok(visitLink, "expected a visit-project link");
  assert.doesNotMatch(visitLink[0], /class="[^"]*\bhidden\b/);
  assert.match(visitLink[0], /class="[^"]*\bmin-h-11\b/);
  assert.match(visitLink[0], /class="[^"]*\bmin-w-11\b/);
});

test("vertical HUD navigation can scroll the outer stacked project page", () => {
  assert.match(projectPage, /ref="projectPageRef"/);
  assert.match(projectPage, /projectPageRef\.value/);
  assert.match(projectPage, /page\.scrollBy\(/);
});

test("featured cards use stationary green hover cues", () => {
  assert.match(homePage, /dossier-card__corner--tl/);
  assert.match(homePage, /dossier-card__corner--br/);
  assert.match(homePage, /border-top:\s*2px solid #67f57a/);
  assert.match(homePage, /border-bottom:\s*2px solid #67f57a/);
  assert.doesNotMatch(homePage, /transform:\s*translateY\(-2px\)/);
  assert.doesNotMatch(homePage, /transform:\s*scale\(1\.02\)/);
});
