import { expect, test } from "@playwright/test";
import {
  articles,
  caseStudies,
  EMAIL_URL,
  featuredProjects,
  LINKEDIN_URL,
  RESUME_PATH,
  staticPages,
} from "./fixtures/site";
import {
  bottomBar,
  closeDossier,
  closeDossierButton,
  connectLink,
  dossier,
  dossierTitle,
  expectNavActive,
  expectNavInactive,
  gotoHydrated,
  header,
  navLink,
  openDossier,
  pagerRail,
} from "./fixtures/ui";

/**
 * The site has two navigation shells that swap at 1280px, so every test in
 * here runs at both viewports and branches on Playwright's `isMobile` fixture.
 * The desktop project sits at 1440px, past the `xl` breakpoint where the
 * header owns the tabs; the mobile project emulates a Pixel 5, below it, where
 * the fixed bottom bar does.
 */

test.describe("navigation shell", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/");
  });

  test("shows the tabs in the bar that owns them at this width", async ({
    page,
    isMobile,
  }) => {
    // The header is present at both widths — it keeps the wordmark and the
    // contact cluster below `xl` and only sheds the three tabs.
    await expect(header(page)).toBeVisible();

    if (isMobile) {
      await expect(bottomBar(page)).toBeVisible();
      await expect(header(page).locator('a[href="/projects/"]')).toBeHidden();
    } else {
      await expect(bottomBar(page)).toBeHidden();
      await expect(header(page).locator('a[href="/projects/"]')).toBeVisible();
    }

    for (const tab of ["HOME", "PROJECTS", "ABOUT"] as const) {
      await expect(navLink(page, isMobile, tab)).toBeVisible();
    }
  });

  test("keeps the wordmark, resume and contact links in the header", async ({
    page,
  }) => {
    // Exact, or the case-insensitive substring match also claims the
    // "Email Christopher Santana" icon link next to it.
    await expect(
      header(page).getByRole("link", {
        name: "CHRISTOPHER SANTANA",
        exact: true,
      }),
    ).toHaveAttribute("href", "/");

    const resume = header(page).getByRole("link", {
      name: "Resume (opens in a new tab)",
    });
    await expect(resume).toHaveAttribute("href", RESUME_PATH);
    await expect(resume).toHaveAttribute("target", "_blank");
    await expect(resume).toHaveAttribute("rel", /noopener/);

    await expect(
      header(page).getByRole("link", { name: "Email Christopher Santana" }),
    ).toHaveAttribute("href", EMAIL_URL);

    const linkedin = header(page).getByRole("link", { name: "LinkedIn profile" });
    await expect(linkedin).toHaveAttribute("href", LINKEDIN_URL);
    await expect(linkedin).toHaveAttribute("target", "_blank");
  });

  test("walks HOME → PROJECTS → ABOUT and back, marking the active tab", async ({
    page,
    isMobile,
  }) => {
    await expectNavActive(page, isMobile, "HOME");

    await navLink(page, isMobile, "PROJECTS").click();
    await expect(page).toHaveURL(/\/projects\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "SELECTED WORK" }),
    ).toBeVisible();
    await expectNavActive(page, isMobile, "PROJECTS");
    await expectNavInactive(page, isMobile, "HOME");

    await navLink(page, isMobile, "ABOUT").click();
    await expect(page).toHaveURL(/\/bio\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "ABOUT ME" }),
    ).toBeVisible();
    await expectNavActive(page, isMobile, "ABOUT");

    await navLink(page, isMobile, "HOME").click();
    await expect(page).toHaveURL(/\/$/);
    await expectNavActive(page, isMobile, "HOME");
  });

  test("the wordmark goes home from anywhere", async ({ page }) => {
    await gotoHydrated(page, "/bio/");
    await header(page)
      .getByRole("link", { name: "CHRISTOPHER SANTANA", exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("every published URL answers directly", async ({ page }) => {
    const paths = [
      ...staticPages.map((target) => target.path),
      ...caseStudies.map((project) => `/project/${project.slug}/`),
    ];

    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status(), `status for ${path}`).toBe(200);
    }
  });

  test("the skip link jumps focus to the main landmark", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();

    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });
});

test.describe("mobile bottom bar", () => {
  test.skip(({ isMobile }) => !isMobile, "below the xl breakpoint only");

  test("CONNECT leaves the site in a new tab", async ({ page }) => {
    await gotoHydrated(page, "/");

    const connect = connectLink(page);
    await expect(connect).toBeVisible();
    await expect(connect).toHaveAttribute("target", "_blank");
    await expect(connect).toHaveAttribute("rel", /noopener/);
    await expect(connect).toHaveAttribute(
      "aria-label",
      "CONNECT (opens in a new tab)",
    );
  });

  test("stays pinned to the bottom of the viewport while the page scrolls", async ({
    page,
  }) => {
    await gotoHydrated(page, "/projects/");

    const viewport = page.viewportSize()!;
    const before = await bottomBar(page).boundingBox();
    expect(before!.y + before!.height).toBeCloseTo(viewport.height, 0);

    await page.mouse.wheel(0, 1200);
    const after = await bottomBar(page).boundingBox();
    expect(after!.y).toBe(before!.y);
  });
});

test.describe("desktop HUD", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "xl and up only");

  test("the header arrow keys step through the tabs", async ({ page }) => {
    await gotoHydrated(page, "/");

    await page
      .getByRole("button", { name: "Next page (Right arrow)" })
      .click();
    await expect(page).toHaveURL(/\/projects\/?$/);

    await page
      .getByRole("button", { name: "Previous page (Left arrow)" })
      .click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("the physical arrow keys do the same", async ({ page }) => {
    await gotoHydrated(page, "/");

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/projects\/?$/);

    // The tabs wrap: right from ABOUT lands back on HOME.
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/bio\/?$/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("project dossier", () => {
  test("opens over the board and dismisses back to it", async ({
    page,
    isMobile,
  }) => {
    await gotoHydrated(page, "/projects/");

    const project = caseStudies[0];
    await openDossier(
      page.getByRole("link", { name: `view project: ${project.name}` }),
    );

    await expect(page).toHaveURL(new RegExp(`/project/${project.slug}/?$`));
    await expect(dossierTitle(page)).toHaveText(`// ${project.name}`);
    // The tab under the sheet is still the board it opened over.
    await expectNavActive(page, isMobile, "PROJECTS");

    await closeDossier(page);
    await expect(page).toHaveURL(/\/projects\/?$/);
  });

  test("opened from the home page, it dismisses back to the home page", async ({
    page,
    isMobile,
  }) => {
    await gotoHydrated(page, "/");

    const project = featuredProjects[0];
    await openDossier(page.locator(`a.dossier-card[href="/project/${project.slug}/"]`));

    await expect(page).toHaveURL(new RegExp(`/project/${project.slug}/?$`));
    // A sheet is a layer over the page you opened it from, so HOME keeps the
    // highlight rather than handing it to PROJECTS.
    await expectNavActive(page, isMobile, "HOME");

    await closeDossier(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#identity-name")).toBeVisible();
  });

  test("Escape closes the sheet", async ({ page }) => {
    await gotoHydrated(page, `/project/${caseStudies[0].slug}/`);
    await expect(dossier(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dossier(page)).toHaveCount(0);
  });

  test("clicking beside the panel closes the sheet", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      Boolean(isMobile),
      "the panel is full-bleed below xl, so there is no scrim to click",
    );

    await gotoHydrated(page, `/project/${caseStudies[0].slug}/`);

    const panel = (await dossier(page).boundingBox())!;
    expect(panel.x, "a gutter to the left of the panel").toBeGreaterThan(48);

    // Hard against the left edge and low in the panel: the sticky site header
    // sits over the top of the scrim, and the previous-project rail is parked
    // in the middle of that gutter.
    await page.mouse.click(8, Math.round(panel.y + panel.height * 0.85));
    await expect(dossier(page)).toHaveCount(0);
  });

  test("the pager rails walk the case studies and wrap", async ({ page }) => {
    await gotoHydrated(page, `/project/${caseStudies[0].slug}/`);

    // Forward through the whole set and round to the start again.
    for (let step = 1; step <= caseStudies.length; step += 1) {
      const expected = caseStudies[step % caseStudies.length];
      await pagerRail(page, "Next").click();
      await expect(page).toHaveURL(new RegExp(`/project/${expected.slug}/?$`));
      await expect(dossierTitle(page)).toHaveText(`// ${expected.name}`);
    }

    // And backwards, which from the first entry wraps to the last.
    const last = caseStudies[caseStudies.length - 1];
    await pagerRail(page, "Previous").click();
    await expect(page).toHaveURL(new RegExp(`/project/${last.slug}/?$`));
  });

  test("the rails advertise the project they lead to", async ({ page }) => {
    await gotoHydrated(page, `/project/${caseStudies[1].slug}/`);

    await expect(pagerRail(page, "Previous")).toHaveAttribute(
      "aria-label",
      `Previous project: ${caseStudies[0].name}`,
    );
    await expect(pagerRail(page, "Next")).toHaveAttribute(
      "aria-label",
      `Next project: ${caseStudies[2].name}`,
    );
  });

  test("a cold load draws the board behind the sheet without a second h1", async ({
    page,
  }) => {
    await gotoHydrated(page, `/project/${caseStudies[0].slug}/`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(closeDossierButton(page)).toBeVisible();
  });
});

test.describe("outbound links", () => {
  test("articles point at their published home, not a route here", async ({
    page,
  }) => {
    await gotoHydrated(page, "/projects/");

    for (const article of articles) {
      const card = page.getByRole("link", {
        name: `read article: ${article.name} (opens in a new tab)`,
      });

      await expect(card).toHaveAttribute("href", article.link!);
      await expect(card).toHaveAttribute("target", "_blank");
      await expect(card).toHaveAttribute("rel", /noopener/);
    }
  });

  test("a live project links out from its dossier", async ({ page }) => {
    const project = caseStudies.find((entry) => entry.link)!;
    await gotoHydrated(page, `/project/${project.slug}/`);

    const visit = dossier(page).getByRole("link", { name: "VISIT_PROJECT" });
    await expect(visit).toHaveAttribute("href", project.link!);
    await expect(visit).toHaveAttribute("target", "_blank");
  });

  test("a project with no live site shows no visit link", async ({ page }) => {
    const project = caseStudies.find((entry) => !entry.link);
    test.skip(!project, "every case study currently has a live URL");

    await gotoHydrated(page, `/project/${project!.slug}/`);
    await expect(
      dossier(page).getByRole("link", { name: "VISIT_PROJECT" }),
    ).toHaveCount(0);
  });
});

test.describe("dead ends", () => {
  test("an unknown project slug lands on the 404 console", async ({ page }) => {
    const response = await page.goto("/project/not-a-real-project/");
    expect(response?.status()).toBe(404);

    await expect(page.getByText("// ERR_404")).toBeVisible();
    await expect(page.getByText("PAGE_NOT_FOUND")).toBeVisible();
  });

  test("RETURN_HOME and VIEW_PROJECTS recover from a 404", async ({ page }) => {
    await gotoHydrated(page, "/nowhere/");

    await page.getByRole("button", { name: "RETURN_HOME" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#identity-name")).toBeVisible();

    await gotoHydrated(page, "/nowhere/");
    await page.getByRole("button", { name: "VIEW_PROJECTS" }).click();
    await expect(page).toHaveURL(/\/projects\/?$/);
  });
});
