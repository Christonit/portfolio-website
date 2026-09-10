import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { PORTFOLIO_QUERY } from "../sanity/queries.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "public/data/portfolio.json");
const API_VERSION = "2026-09-09";

async function loadLocalEnv() {
  try {
    const source = await readFile(path.join(ROOT, ".env"), "utf8");

    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;

      const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
      process.env[match[1]] = value;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

await loadLocalEnv();

const projectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NUXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "Cannot sync Sanity: NUXT_PUBLIC_SANITY_PROJECT_ID and " +
      "NUXT_PUBLIC_SANITY_DATASET are required.",
  );
}

const endpoint =
  `https://${projectId}.api.sanity.io/v${API_VERSION}/data/query/` +
  `${encodeURIComponent(dataset)}?perspective=published`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    ...(process.env.SANITY_API_READ_TOKEN
      ? { authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` }
      : {}),
  },
  body: JSON.stringify({
    query: PORTFOLIO_QUERY,
  }),
});

if (!response.ok) {
  throw new Error(
    `Sanity sync failed (${response.status} ${response.statusText}): ` +
      (await response.text()),
  );
}

const payload = (await response.json()) as {
  result?: {
    settings?: unknown;
    works?: unknown[];
  };
};

if (!payload.result?.settings || !payload.result.works?.length) {
  throw new Error(
    "Sanity sync returned incomplete portfolio data; refusing to replace the snapshot.",
  );
}

await mkdir(path.dirname(OUTPUT), { recursive: true });
const temporary = `${OUTPUT}.tmp`;
await writeFile(temporary, `${JSON.stringify(payload.result, null, 2)}\n`);
await rename(temporary, OUTPUT);

console.log(
  `Synced ${payload.result.works.length} works from Sanity to ` +
    path.relative(ROOT, OUTPUT),
);
