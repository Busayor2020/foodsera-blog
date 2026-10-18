import type { ListRecipe } from "./content/types";
import { foldText } from "./format/text";

// Filters and sorting for the category, region and occasion pages. They run
// in the browser over the prerendered list, and live in the URL so a
// filtered view can be shared:
//   ?time=30|60  &difficulty=easy  &veg=1  &region=<slug>  &sort=rating|quick|az

/** "Under 30 min" and "Under 1 hour". */
export const TIME_LIMITS = [30, 60] as const;
export type TimeLimit = (typeof TIME_LIMITS)[number];

export const SORTS = ["popular", "rating", "quick", "az"] as const;
export type SortKey = (typeof SORTS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  popular: "Most popular",
  rating: "Highest rated",
  quick: "Quickest first",
  az: "A to Z",
};

export interface Filters {
  time: TimeLimit | null;
  easy: boolean;
  veg: boolean;
  region: string | null;
  sort: SortKey;
}

export const NO_FILTERS: Filters = {
  time: null,
  easy: false,
  veg: false,
  region: null,
  sort: "popular",
};

export interface FilterOptions {
  /** Region slugs with a chip on this page. Any other region is ignored. */
  regions: readonly string[];
  /** Whether "Highest rated" is offered (see hasRatings). */
  canSortByRating: boolean;
}

/** 30 or 60 from a URL value, or null for anything else. */
export function parseTime(value: string | null): TimeLimit | null {
  return TIME_LIMITS.find((limit) => String(limit) === value) ?? null;
}

/** Reads filters from the URL. Unknown or invalid values fall back to the default. */
export function parseFilters(
  params: URLSearchParams,
  { regions, canSortByRating }: FilterOptions,
): Filters {
  const region = params.get("region");
  const sort = SORTS.find((s) => s === params.get("sort")) ?? "popular";
  return {
    time: parseTime(params.get("time")),
    easy: params.get("difficulty") === "easy",
    veg: params.get("veg") === "1",
    region: region && regions.includes(region) ? region : null,
    sort: sort === "rating" && !canSortByRating ? "popular" : sort,
  };
}

/**
 * The URL params for a view, in a fixed order and without defaults, so the
 * same view always has the same URL.
 */
export function filtersToParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.time) params.set("time", String(filters.time));
  if (filters.easy) params.set("difficulty", "easy");
  if (filters.veg) params.set("veg", "1");
  if (filters.region) params.set("region", filters.region);
  if (filters.sort !== "popular") params.set("sort", filters.sort);
  return params;
}

/** True when any filter (not the sort) narrows the list. */
export function isFiltered(filters: Filters): boolean {
  return (
    filters.time !== null || filters.easy || filters.veg || !!filters.region
  );
}

/** "Highest rated" only makes sense when some recipe on the page shows a rating. */
export function hasRatings(recipes: ListRecipe[]): boolean {
  return recipes.some((r) => r.rating);
}

const byPopularity = (a: ListRecipe, b: ListRecipe) =>
  a.popularity - b.popularity;

const SORTERS: Record<SortKey, (a: ListRecipe, b: ListRecipe) => number> = {
  popular: byPopularity,
  // Rated recipes first, by stars, then by how many people rated them.
  rating: (a, b) =>
    (b.rating?.value ?? 0) - (a.rating?.value ?? 0) ||
    (b.rating?.count ?? 0) - (a.rating?.count ?? 0) ||
    byPopularity(a, b),
  quick: (a, b) => a.totalMinutes - b.totalMinutes || byPopularity(a, b),
  az: (a, b) =>
    foldText(a.title).localeCompare(foldText(b.title), "en") ||
    byPopularity(a, b),
};

export function sortRecipes(
  recipes: ListRecipe[],
  sort: SortKey,
): ListRecipe[] {
  return [...recipes].sort(SORTERS[sort]);
}

/** The recipes that match every filter, in the chosen order. */
export function applyFilters(
  recipes: ListRecipe[],
  filters: Filters,
): ListRecipe[] {
  const matching = recipes.filter(
    (r) =>
      (!filters.time || r.totalMinutes <= filters.time) &&
      (!filters.easy || r.difficulty === "easy") &&
      (!filters.veg || r.vegetarian) &&
      (!filters.region || r.region.slug === filters.region),
  );
  return sortRecipes(matching, filters.sort);
}
