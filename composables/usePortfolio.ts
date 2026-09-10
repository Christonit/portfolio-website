import type { Portfolio } from "~/sanity/mapPortfolio";
import { localPortfolio } from "~/sanity/localPortfolio";

export function usePortfolio() {
  return useState<Portfolio>("portfolio", localPortfolio);
}

export function useCaseStudies() {
  const portfolio = usePortfolio();
  return computed(() =>
    portfolio.value.works.filter(
      (project) => project.category.toLowerCase() !== "article",
    ),
  );
}
