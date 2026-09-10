import { expect, test } from "@playwright/test";
import {
  allProjects,
  articles,
  caseStudies,
  featuredProjects,
  projectBadges,
  SITE_SETTINGS,
  TECH_STACK,
} from "./fixtures/site";
import {
  dossier,
  dossierTitle,
  expectEveryImageHasAlt,
  expectNoBrokenImages,
  gotoHydrated,
} from "./fixtures/ui";

/**
 * Content integrity: what the generated Sanity snapshot says has to be what the
 * page renders, at both viewports. The specs read the snapshot rather than
 * restating it, because projects turn over — a new case study should extend
 * this suite by existing, not break it. The copy that is hardcoded in the Vue
 * files (the hero, the tech stack, the bio) is asserted literally.
 */

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/");
  });

  test("leads with the identity block", async ({ page }) => {
    const name = page.locator("#identity-name");
    await expect(name).toBeVisible();
    // A <wbr> and a <br> split the name across two lines; neither adds a
    // character, so the assertion ignores whitespace rather than guessing.
    expect((await name.textContent())!.replace(/\s+/g, "")).toBe(
      SITE_SETTINGS.displayName.replace(/\s+/g, ""),
    );

    await expect(page.locator(".identity-role")).toContainText(
      SITE_SETTINGS.role,
    );
    await expect(page.locator(".identity-role__location")).toHaveText(
      `// ${SITE_SETTINGS.location}`,
    );
    await expect(page.locator(".identity-mission__lead")).toHaveText(
      SITE_SETTINGS.mission,
    );
    await expect(
      page.locator(".identity-mission").getByRole("link"),
    ).toHaveAttribute("href", SITE_SETTINGS.employerUrl);
  });

  test("features case studies in the curated order", async ({ page }) => {
    const cards = page.locator("#featured-work a.dossier-card");
    await expect(cards).toHaveCount(featuredProjects.length);

    for (const [index, project] of featuredProjects.entries()) {
      const card = cards.nth(index);

      await expect(card).toHaveAttribute("href", `/project/${project.slug}/`);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(
        project.name,
      );
      await expect(card.locator(".dossier-card__summary")).toHaveText(
        project.description ?? project.tasks[0],
      );
      await expect(card.locator(".dossier-card__tags li")).toHaveText(
        projectBadges(project),
      );
      await expect(card.locator(".dossier-card__cta")).toContainText(
        "VIEW_PROJECT",
      );
    }
  });

  test("lists the whole tech stack in order", async ({ page }) => {
    const section = page.locator("#tech-stack-list");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "TECH STACK",
    );
    await expect(section.locator(".stack-index__label strong")).toHaveText(
      TECH_STACK,
    );
  });

  test("links out to both articles", async ({ page }) => {
    const section = page.locator("#articles-list");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "ARTICLES",
    );

    const entries = section.locator("li");
    await expect(entries).toHaveCount(articles.length);

    for (const [index, article] of articles.entries()) {
      const entry = entries.nth(index);
      await expect(entry.locator("strong")).toHaveText(article.name);
      await expect(entry.locator("small")).toHaveText("READ ARTICLE");
      await expect(entry.getByRole("link")).toHaveAttribute(
        "href",
        article.link!,
      );
    }
  });

  test("stacks the featured grid on mobile and pairs it on desktop", async ({
    page,
    isMobile,
  }) => {
    const cards = page.locator("#featured-work > ul > li");
    const first = (await cards.nth(0).boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;

    if (isMobile) {
      expect(second.y).toBeGreaterThan(first.y);
    } else {
      expect(second.y).toBeCloseTo(first.y, 0);
      expect(second.x).toBeGreaterThan(first.x);
    }
  });

  test("renders every image it references", async ({ page }) => {
    await expectNoBrokenImages(page);
    await expectEveryImageHasAlt(page);
  });
});

test.describe("projects board", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/projects/");
  });

  test("introduces the collection", async ({ page }) => {
    await expect(page.locator(".hud-label").first()).toHaveText("// PROJECTS");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "SELECTED WORK",
    );
    await expect(
      page.getByText(
        "A collection of web apps and projects I've collaborated on over the years",
      ),
    ).toBeVisible();
  });

  test("shows every project in Sanity order", async ({
    page,
  }) => {
    const cards = page.locator("a.projects-card");
    await expect(cards).toHaveCount(allProjects.length);

    for (const [index, project] of allProjects.entries()) {
      const card = cards.nth(index);
      const isArticle = project.category.toLowerCase() === "article";

      await expect(card.getByRole("heading", { level: 2 })).toHaveText(
        project.name,
      );
      await expect(card).toHaveAttribute(
        "href",
        isArticle ? project.link! : `/project/${project.slug}/`,
      );
      await expect(card.locator("ul li span")).toHaveText(
        projectBadges(project),
      );
      await expect(card.locator(".projects-card__cta")).toContainText(
        isArticle ? "READ_ARTICLE" : "VIEW_PROJECT",
      );
      await expect(card).toHaveAttribute(
        "aria-label",
        isArticle
          ? `read article: ${project.name} (opens in a new tab)`
          : `view project: ${project.name}`,
      );
    }
  });

  test("uses one column on mobile and two on desktop", async ({
    page,
    isMobile,
  }) => {
    const cards = page.locator("a.projects-card");
    const first = (await cards.nth(0).boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;

    if (isMobile) {
      expect(second.y).toBeGreaterThan(first.y);
    } else {
      expect(second.y).toBeCloseTo(first.y, 0);
    }
  });

  test("renders every image it references", async ({ page }) => {
    await expectNoBrokenImages(page);
    await expectEveryImageHasAlt(page);
  });
});

test.describe("bio page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/bio/");
  });

  test("opens with the lede", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "ABOUT ME",
    );
    await expect(page.locator(".bio-lede")).toContainText(
      "Manhattan-based Senior Full Stack Engineer",
    );
    await expect(
      page.getByText("Originally from Punta Cana, Dominican Republic"),
    ).toBeVisible();
  });

  test("records education, the award, and the work history", async ({
    page,
  }) => {
    const education = page.locator(".bio-panel ul li");
    await expect(education).toHaveCount(3);
    await expect(education.nth(0)).toContainText("BARUCH COLLEGE");
    await expect(education.nth(0)).toContainText("CURRENT");
    await expect(education.nth(1)).toContainText("APEC UNIVERSITY");
    await expect(education.nth(2)).toContainText("ITLA");

    await expect(
      page.getByText("1ST PLACE — BRANDING DESIGN CONTEST"),
    ).toBeVisible();

    for (const company of [
      "StocksToTrade",
      "BairesDev",
      "Claro RD",
      "StateTrust Group",
    ]) {
      await expect(page.getByText(company, { exact: true }).first()).toBeVisible();
    }
  });

  test("renders every image it references", async ({ page }) => {
    await expectNoBrokenImages(page);
    await expectEveryImageHasAlt(page);
  });
});

test.describe("project dossiers", () => {
  for (const project of caseStudies) {
    test(`${project.slug} carries its full record`, async ({ page }) => {
      await gotoHydrated(page, `/project/${project.slug}/`);

      const sheet = dossier(page);
      await expect(sheet).toBeVisible();
      await expect(dossierTitle(page)).toHaveText(`// ${project.name}`);
      await expect(sheet).toHaveAttribute(
        "aria-label",
        `${project.name} — project dossier`,
      );

      if (project.role) {
        await expect(sheet.getByText(project.role, { exact: true })).toBeVisible();
      }

      // Every paragraph of the written record, in the order the data lists it.
      await expect(sheet.locator(".project-dossier-copy")).toHaveText(
        project.dossier,
      );

      // Each row opens with an aria-hidden ">" bullet in its own span, which
      // is part of the row's text but not part of the task.
      const tasks = sheet.locator(
        'section[aria-label="Tasks"] li > span:not([aria-hidden])',
      );
      await expect(tasks).toHaveText(project.tasks);

      const tech = sheet.locator('section[aria-label="Tech stack"] li span');
      await expect(tech).toHaveText(project.tech);
    });
  }

  test("the media band is labelled for whichever medium it holds", async ({
    page,
  }) => {
    const withVideo = caseStudies.find((entry) => entry.video)!;
    await gotoHydrated(page, `/project/${withVideo.slug}/`);

    await expect(
      dossier(page).locator('section[aria-label="Project demo video"]'),
    ).toBeVisible();
  });
});
