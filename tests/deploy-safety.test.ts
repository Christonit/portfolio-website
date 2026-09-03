import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { loadNuxtConfig } from "@nuxt/kit";

const root = path.resolve(import.meta.dirname, "..");

test("production removes internal tool pages before Vite builds the route graph", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const config = await loadNuxtConfig({ cwd: root, overrides: { dev: false } });
    const extendPages = config.hooks?.["pages:extend"];
    assert.equal(typeof extendPages, "function");

    const pages = [
      { name: "index", path: "/", file: "pages/index.vue", children: [] },
      {
        name: "og-export",
        path: "/og-export",
        file: "pages/og-export.vue",
        children: [],
      },
      {
        name: "design-system",
        path: "/design-system",
        file: "pages/design-system.vue",
        children: [],
      },
    ];

    await extendPages!(pages);
    assert.deepEqual(
      pages.map((page) => page.path),
      ["/"],
    );
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("stable public asset URLs revalidate instead of remaining fresh", async () => {
  const netlify = await readFile(path.join(root, "netlify.toml"), "utf8");

  for (const assetPath of ["fonts", "videos", "images"]) {
    const block = netlify.match(
      new RegExp(
        `\\[\\[headers\\]\\]\\s+for = "/${assetPath}/\\*"[\\s\\S]*?(?=\\n\\[\\[headers\\]\\]|$)`,
      ),
    )?.[0];
    assert.ok(block, `expected a /${assetPath}/* header block`);
    assert.match(block, /Cache-Control = "public, max-age=0, must-revalidate"/);
  }
});

test("icon coverage detects quoted fallbacks inside interpolated spans", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "icon-coverage-"));

  try {
    await mkdir(path.join(fixture, "scripts"), { recursive: true });
    await mkdir(path.join(fixture, "components"), { recursive: true });
    await writeFile(
      path.join(fixture, "scripts/icon-coverage.mjs"),
      await readFile(path.join(root, "scripts/icon-coverage.mjs"), "utf8"),
    );
    await writeFile(
      path.join(fixture, "scripts/icon-names.mjs"),
      "export const ICON_NAMES = [];\n",
    );
    await writeFile(
      path.join(fixture, "components/Card.vue"),
      '<span class="material-symbols-outlined">{{ project.icon || "deployed_code" }}</span>\n',
    );

    const result = spawnSync(
      process.execPath,
      [path.join(fixture, "scripts/icon-coverage.mjs")],
      { cwd: fixture, encoding: "utf8" },
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /components\/Card\.vue: "deployed_code"/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
