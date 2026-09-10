import { expect, type Page } from "@playwright/test";

/**
 * Head and structured-data readers.
 *
 * The locators reach into `<head>` explicitly. `nuxt-schema-org` and `useHead`
 * both write there, and a bare `meta[...]` selector would also match anything
 * a page happened to render in its body.
 */

export const metaByName = (page: Page, name: string) =>
  page.locator(`head meta[name="${name}"]`);

export const metaByProperty = (page: Page, property: string) =>
  page.locator(`head meta[property="${property}"]`);

export const canonicalLink = (page: Page) =>
  page.locator('head link[rel="canonical"]');

export async function expectMetaName(
  page: Page,
  name: string,
  value: string | RegExp,
) {
  await expect(metaByName(page, name), `meta[name="${name}"]`).toHaveAttribute(
    "content",
    value,
  );
}

export async function expectMetaProperty(
  page: Page,
  property: string,
  value: string | RegExp,
) {
  await expect(
    metaByProperty(page, property),
    `meta[property="${property}"]`,
  ).toHaveAttribute("content", value);
}

export type SchemaNode = Record<string, unknown> & { "@type"?: string };

/**
 * Every JSON-LD node on the page, flattened out of the `@graph` wrappers that
 * `nuxt-schema-org` emits, so a test can look a node up by `@type` without
 * caring which script tag it landed in.
 */
export async function schemaGraph(page: Page): Promise<SchemaNode[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  expect(blocks.length, "JSON-LD blocks on the page").toBeGreaterThan(0);

  return blocks.flatMap((raw) => {
    const parsed = JSON.parse(raw);
    const graph = parsed["@graph"];
    return (Array.isArray(graph) ? graph : [parsed]) as SchemaNode[];
  });
}

export function nodeOfType(graph: SchemaNode[], type: string) {
  const node = graph.find((entry) => {
    const entryType = entry["@type"];
    return Array.isArray(entryType)
      ? entryType.includes(type)
      : entryType === type;
  });

  expect(
    node,
    `a ${type} node in the JSON-LD graph (found: ${graph
      .map((entry) => entry["@type"])
      .join(", ")})`,
  ).toBeDefined();

  return node!;
}

/** Breadcrumb names in trail order, for comparing against the expected path. */
export function breadcrumbNames(graph: SchemaNode[]) {
  const crumb = nodeOfType(graph, "BreadcrumbList");
  const items = crumb.itemListElement as { name: string }[];
  return items.map((item) => item.name);
}
