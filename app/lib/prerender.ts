import type { RouteConfigEntry } from "@react-router/dev/routes";

import type { ContentPaths } from "./content";

// Which content URLs to prerender. A group is included only once its route
// is registered in app/routes.ts. Otherwise those URLs would fall through to
// the 404 splat route and be written out as "not found" pages with a 200.

export const CONTENT_ROUTE_PATTERNS: Record<keyof ContentPaths, string> = {
  recipes: "recipes/:slug",
  categories: "category/:slug",
  regions: "region/:slug",
  occasions: "occasion/:slug",
};

/** Every route path in the config, with nested paths joined to their parents. */
export function collectRoutePaths(
  routes: RouteConfigEntry[],
  parent = "",
): Set<string> {
  const paths = new Set<string>();
  for (const route of routes) {
    const path = [parent, route.path ?? ""]
      .filter(Boolean)
      .join("/")
      .replace(/^\/+|\/+$/g, "");
    if (route.path !== undefined) paths.add(path);
    for (const child of collectRoutePaths(route.children ?? [], path)) {
      paths.add(child);
    }
  }
  return paths;
}

export function contentPathsForRoutes(
  content: ContentPaths,
  registered: Set<string>,
): string[] {
  return (Object.keys(CONTENT_ROUTE_PATTERNS) as (keyof ContentPaths)[])
    .filter((group) => registered.has(CONTENT_ROUTE_PATTERNS[group]))
    .flatMap((group) => content[group]);
}
