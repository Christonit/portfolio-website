import snapshot from "~/public/data/portfolio.json";
import {
  mapPortfolio,
  type Portfolio,
  type PortfolioQueryData,
} from "~/sanity/mapPortfolio";

const mapped = mapPortfolio(snapshot as PortfolioQueryData);

if (!mapped) {
  throw new Error(
    "public/data/portfolio.json is incomplete; run `npm run sync:sanity`.",
  );
}

const local: Portfolio = { ...mapped, source: "json" };

export function localPortfolio(): Portfolio {
  return local;
}
