import { joinURL, withTrailingSlash, withoutTrailingSlash } from "ufo";
import { IDENTITY_ID, SITE_NAME, SITE_URL } from "~/utils/site";

export type PageSchemaType =
  | "ProfilePage"
  | "CollectionPage"
  | "AboutPage"
  | "ItemPage";

type SeoValue = string | (() => string);

function toAbsoluteUrl(pathOrUrl: string, origin: string) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, `${origin}/`).href;
}

export function usePageSeo(options: {
  title: SeoValue;
  description: SeoValue;
  pageType: PageSchemaType;
  image?: SeoValue;
  mainEntity?: Record<string, unknown> | (() => Record<string, unknown>);
  extraSchema?: () => unknown[];
}) {
  const route = useRoute();
  const site = useSiteConfig();

  const title = computed(() =>
    typeof options.title === "function" ? options.title() : options.title,
  );
  const description = computed(() =>
    typeof options.description === "function"
      ? options.description()
      : options.description,
  );
  const imagePath = computed(() => {
    if (!options.image) return undefined;
    return typeof options.image === "function" ? options.image() : options.image;
  });

  const canonical = computed(() => {
    const origin = withoutTrailingSlash(String(site.url || SITE_URL));
    const path = withoutTrailingSlash(route.path || "/") || "/";
    if (path === "/") return `${origin}/`;
    const url = joinURL(origin, path);
    return site.trailingSlash ? withTrailingSlash(url) : url;
  });

  const image = computed(() => {
    const origin = String(site.url || SITE_URL).replace(/\/$/, "");
    return toAbsoluteUrl(imagePath.value || "/images/og-image.webp", origin);
  });

  const imageType = computed(() =>
    image.value.toLowerCase().endsWith(".png") ? "image/png" : "image/webp",
  );

  const mainEntity = computed(() => {
    if (options.mainEntity) {
      return typeof options.mainEntity === "function"
        ? options.mainEntity()
        : options.mainEntity;
    }
    if (options.pageType === "ProfilePage") return { "@id": IDENTITY_ID };
    return undefined;
  });

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogType: "website",
    ogSiteName: SITE_NAME,
    ogImage: image,
    ogImageType: imageType,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  });

  useHead({
    link: [{ rel: "canonical", href: canonical }],
  });

  useSchemaOrg([
    defineWebPage({
      "@type": options.pageType,
      name: () => title.value,
      description: () => description.value,
      url: () => canonical.value,
      inLanguage: "en",
      primaryImageOfPage: () => image.value,
      mainEntity: () => mainEntity.value,
    }),
    ...(options.extraSchema?.() ?? []),
  ]);
}
