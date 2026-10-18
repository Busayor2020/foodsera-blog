import { useRouteLoaderData } from "react-router";

import type { SiteData } from "./content/types";

const EMPTY: SiteData = {
  nav: { categories: [], regions: [], occasions: [] },
  popular: [],
};

/**
 * The root loader's data: menus, recipe of the week and popular recipes.
 * Built once at prerender time and never refetched (see root.tsx).
 */
export function useSiteData(): SiteData {
  return (useRouteLoaderData("root") as SiteData | undefined) ?? EMPTY;
}
