import { PORTFOLIO_QUERY } from "~/sanity/queries";
import { mapPortfolio } from "~/sanity/mapPortfolio";

/**
 * Server-only so the GROQ request never leaves the browser. The result is
 * written into `useState("portfolio")`, which Nuxt serialises into the page
 * payload for hydration. Client navigations reuse that blob; they do not
 * refetch.
 */
export default defineNuxtPlugin(async () => {
  const portfolio = usePortfolio();

  try {
    const sanity = useSanity();
    const data = await sanity.fetch(PORTFOLIO_QUERY);
    const mapped = mapPortfolio(data);
    if (mapped) portfolio.value = mapped;
  } catch (error) {
    console.warn("[sanity] Falling back to local content", error);
  }
});
