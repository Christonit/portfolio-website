import { IDENTITY_ID, SITE_URL } from "~/utils/site";

export type PageSchemaType =
  | "ProfilePage"
  | "CollectionPage"
  | "AboutPage"
  | "ContactPage"
  | "ItemPage";

type SeoValue = string | (() => string);

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
  const image = computed(() => {
    if (!options.image) return undefined;
    return typeof options.image === "function" ? options.image() : options.image;
  });

  const canonical = computed(() => {
    const origin = String(site.url || SITE_URL).replace(/\/$/, "");
    const path = route.path === "/" ? "/" : route.path.replace(/\/$/, "");
    return `${origin}${path}`;
  });

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogType: "website",
    ogImage: () => image.value || "/images/og-image.webp",
    twitterCard: "summary_large_image",
    twitterImage: () => image.value || "/images/og-image.webp",
  });

  useHead({
    link: [{ rel: "canonical", href: canonical }],
  });

  const mainEntity = options.mainEntity
    ? typeof options.mainEntity === "function"
      ? options.mainEntity()
      : options.mainEntity
    : options.pageType === "ProfilePage"
      ? { "@id": IDENTITY_ID }
      : undefined;

  useSchemaOrg([
    defineWebPage({
      "@type": options.pageType,
      name: title.value,
      description: description.value,
      url: canonical.value,
      inLanguage: "en",
      ...(image.value ? { primaryImageOfPage: image.value } : {}),
      ...(mainEntity ? { mainEntity } : {}),
    }),
    ...(options.extraSchema?.() ?? []),
  ]);
}
