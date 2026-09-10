import { expect, test } from "@playwright/test";
import {
  allProjects,
  BIO,
  canonicalUrl,
  caseStudies,
  dossierPage,
  HOME,
  PROJECTS,
  SITE_NAME,
  SITE_URL,
  sitemapPaths,
  staticPages,
  type PageUnderTest,
} from "./fixtures/site";
import {
  breadcrumbNames,
  canonicalLink,
  expectMetaName,
  expectMetaProperty,
  nodeOfType,
  schemaGraph,
} from "./fixtures/head";
import {
  expectEveryImageHasAlt,
  internalLinkHrefs,
  waitForHydration,
} from "./fixtures/ui";

const indexablePages: PageUnderTest[] = [
  ...staticPages,
  ...caseStudies.map(dossierPage),
];

/**
 * `E2E_BASE_URL` points the suite at a server someone else started, usually
 * `nuxt dev`. Robots, the sitemap and the stripped internal-tool routes are all
 * build output, so those assertions only mean something against the default
 * production-build target.
 */
const buildOnly = Boolean(process.env.E2E_BASE_URL);

/**
 * Everything here runs with JavaScript off, which is deliberate: this is what a
 * crawler is handed. Nuxt prerenders these routes, so the whole head — title,
 * canonical, Open Graph, JSON-LD — has to be in the served HTML rather than
 * arriving with hydration. A dossier is the case worth watching: its head is
 * registered by `ProjectDossierOverlay`, an app-level component rather than a
 * page, and it still has to be in the static file for `/project/<slug>/`.
 */
test.describe("SEO — crawler view, JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  for (const target of indexablePages) {
    test.describe(target.path, () => {
      test.beforeEach(async ({ page }) => {
        const response = await page.goto(target.path);
        expect(response?.status(), `status for ${target.path}`).toBe(200);
      });

      test("serves the documented title and description", async ({ page }) => {
        await expect(page).toHaveTitle(target.title);
        await expectMetaName(page, "description", target.description);
      });

      test("points its canonical at the trailing-slash URL", async ({
        page,
      }) => {
        await expect(canonicalLink(page)).toHaveAttribute(
          "href",
          canonicalUrl(target.path),
        );
      });

      test("ships Open Graph and Twitter card tags", async ({ page }) => {
        await expectMetaProperty(page, "og:title", target.title);
        await expectMetaProperty(page, "og:description", target.description);
        await expectMetaProperty(page, "og:url", canonicalUrl(target.path));
        await expectMetaProperty(page, "og:type", "website");
        await expectMetaProperty(page, "og:site_name", SITE_NAME);
        await expectMetaProperty(page, "og:image", target.ogImage);
        await expectMetaProperty(page, "og:image:width", "1200");
        await expectMetaProperty(page, "og:image:height", "630");

        await expectMetaName(page, "twitter:card", "summary_large_image");
        await expectMetaName(page, "twitter:title", target.title);
        await expectMetaName(page, "twitter:description", target.description);
        await expectMetaName(page, "twitter:image", target.ogImage);
      });

      test(`describes itself as a ${target.schemaType} in the JSON-LD graph`, async ({
        page,
      }) => {
        const graph = await schemaGraph(page);
        const webPage = nodeOfType(graph, target.schemaType);

        expect(webPage.url).toBe(canonicalUrl(target.path));
        expect(webPage.name).toBe(target.title);
        expect(webPage.description).toBe(target.description);
        expect(webPage.inLanguage).toBe("en");

        // Every page hangs off the same Person node, which is what ties the
        // site together as one entity for Google's knowledge panel.
        const person = nodeOfType(graph, "Person");
        expect(person["@id"]).toBe(`${SITE_URL}/#identity`);
        expect(person.name).toBe(SITE_NAME);
      });

      if (target.breadcrumb) {
        test("publishes its breadcrumb trail", async ({ page }) => {
          const graph = await schemaGraph(page);
          expect(breadcrumbNames(graph)).toEqual(target.breadcrumb);
        });
      }

      test("has one h1, an English lang attribute, and a viewport", async ({
        page,
      }) => {
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expectMetaName(page, "viewport", /width=device-width/);
      });

      test("gives every image an alt attribute", async ({ page }) => {
        await expectEveryImageHasAlt(page);
      });

      test("links internally with the trailing slash the canonical uses", async ({
        page,
      }) => {
        const hrefs = await internalLinkHrefs(page);
        // Files and fragments keep their own shape; page routes must not, or
        // Netlify's Pretty URLs 301 every internal click and the sitemap and
        // the links stop agreeing about which URL is the real one.
        const routes = hrefs.filter(
          (href) => !href.includes(".") && !href.startsWith("#"),
        );

        expect(routes.length).toBeGreaterThan(0);
        expect(routes.filter((href) => !href.endsWith("/"))).toEqual([]);
      });
    });
  }

  test("the projects collection lists every project in its ItemList", async ({
    page,
  }) => {
    await page.goto(PROJECTS.path);
    const graph = await schemaGraph(page);
    const list = nodeOfType(graph, "ItemList");

    expect(list.numberOfItems).toBe(allProjects.length);

    const listed = (list.itemListElement as { url: string }[]).map(
      (item) => item.url,
    );
    expect(listed).toHaveLength(allProjects.length);
  });

  test("a dossier carries a CreativeWork node for the project", async ({
    page,
  }) => {
    const project = caseStudies[0];
    await page.goto(`/project/${project.slug}/`);

    const graph = await schemaGraph(page);
    const work = nodeOfType(graph, "CreativeWork");

    expect(work["@id"]).toBe(`${canonicalUrl(`/project/${project.slug}/`)}#work`);
    expect(work.name).toBe(project.name);
    expect(work.keywords).toBe(project.tech.join(", "));
  });
});

/**
 * The head is registered twice over on a dossier — once by the page underneath
 * and once by the overlay — and `error.vue` has to flush its own entry by hand
 * because nothing else does on a static build. Both are the kind of thing that
 * looks right in the served HTML and then gets overwritten a tick after the app
 * boots, so the hydrated document is worth checking separately.
 */
test.describe("SEO — head survives hydration", () => {
  for (const target of indexablePages) {
    test(`${target.path} keeps its title and canonical`, async ({ page }) => {
      await page.goto(target.path);
      await waitForHydration(page);

      await expect(page).toHaveTitle(target.title);
      await expect(canonicalLink(page)).toHaveAttribute(
        "href",
        canonicalUrl(target.path),
      );
      await expect(canonicalLink(page)).toHaveCount(1);
    });
  }
});

test.describe("SEO — indexing rules", () => {
  test("a missing page answers 404 and asks not to be indexed", async ({
    page,
  }) => {
    const response = await page.goto("/no-such-page/");

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(`${SITE_NAME} - Page Not Found`);
    await expectMetaName(page, "robots", "noindex, nofollow");
  });

  test("an article slug is not a project route", async ({ page }) => {
    // `pages/project/[slug].vue` validates against the case studies only —
    // articles live on dev.to, and a second indexable copy here would be
    // duplicate content pointing at someone else's canonical.
    const response = await page.goto("/project/content-automation-ai/");
    expect(response?.status()).toBe(404);
  });

  test("robots.txt allows the site and names the sitemap", async ({
    request,
  }) => {
    test.skip(buildOnly, "robots.txt is prerendered at build time");

    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /og-export");
    expect(body).toContain("Disallow: /design-system");
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test("the sitemap lists every public URL and nothing else", async ({
    request,
  }) => {
    test.skip(buildOnly, "the sitemap is generated at build time");

    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    );

    expect(locs.sort()).toEqual(sitemapPaths.map(canonicalUrl).sort());
    // Each URL carries the relevant document's published Sanity update time.
    expect([...xml.matchAll(/<lastmod>/g)]).toHaveLength(locs.length);
  });

  test("internal tools are not in the deployed build", async ({ page }) => {
    test.skip(buildOnly, "route stripping only happens in a production build");

    for (const path of ["/design-system", "/og-export"]) {
      const response = await page.goto(path);
      expect(response?.status(), `status for ${path}`).toBe(404);
    }
  });

  test("the home page is the ProfilePage for the site identity", async ({
    page,
  }) => {
    await page.goto(HOME.path);
    const graph = await schemaGraph(page);

    const profile = nodeOfType(graph, "ProfilePage");
    expect(profile.mainEntity).toEqual({ "@id": `${SITE_URL}/#identity` });

    const person = nodeOfType(graph, "Person");
    expect(person.jobTitle).toBeTruthy();
    expect(person.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining("linkedin.com")]),
    );
  });

  test("the about page is the AboutPage for the same identity", async ({
    page,
  }) => {
    await page.goto(BIO.path);
    const graph = await schemaGraph(page);

    expect(nodeOfType(graph, "AboutPage").mainEntity).toEqual({
      "@id": `${SITE_URL}/#identity`,
    });
  });
});
