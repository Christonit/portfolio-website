import { defineConfig, devices } from "@playwright/test";

/**
 * The suite runs against a production build by default, not `nuxt dev`.
 *
 * Three of the things it asserts only exist after a build: `/robots.txt` and
 * `/sitemap.xml` are prerendered routes, `@nuxtjs/sitemap` runs with
 * `zeroRuntime`, and the `pages:extend` hook in nuxt.config.ts only strips
 * `/design-system` and `/og-export` from the route graph when NODE_ENV is
 * production. Testing the dev server would pass on a site that ships broken.
 *
 * Point E2E_BASE_URL at an already-running server to skip the build — a dev
 * server for a quick loop, or the live site for a production smoke test. The
 * specs that need build output skip themselves when it is set.
 */
/**
 * Not 3000. `nuxt dev` lives there, and a suite that quietly reuses whatever is
 * already listening tests the dev server while reporting on the build — the
 * internal-tool routes are still in the graph, and robots and the sitemap have
 * no build output to serve.
 */
const E2E_PORT = 3100;
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html"]] : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        // Past the 1280px `xl` breakpoint, where the header owns the tabs and
        // the arrow keys, and the dossier rails sit in the side gutters.
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        // Below `xl`: the fixed bottom bar owns navigation, view transitions
        // are off, and the dossier goes full-bleed with its rails in the
        // bottom corners.
        ...devices["Pixel 5"],
      },
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // A dedicated build directory: `.nuxt` belongs to whatever `nuxt dev`
        // the developer already has open, and building into it underneath a
        // running dev server produces a server bundle that cannot render.
        command: `NUXT_BUILD_DIR=.nuxt-e2e npm run build && npx nuxt preview --port ${E2E_PORT}`,
        url: baseURL,
        // Cold Nuxt build plus server start.
        timeout: 240_000,
        reuseExistingServer: !process.env.CI,
        // The Nuxt build log is several hundred lines and buries the run.
        stdout: "ignore",
        stderr: "pipe",
      },
});
