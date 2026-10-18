import categories from "../../content/categories.json";
import occasions from "../../content/occasions.json";
import regions from "../../content/regions.json";
import type { ListRecipe, RecipeSummary, SiteNav } from "../lib/content/types";

// The real menu terms, read straight from the JSON for component tests.
export const NAV: SiteNav = { categories, regions, occasions };

export function recipeSummary(
  overrides: Partial<RecipeSummary> = {},
): RecipeSummary {
  return {
    slug: "egusi-soup",
    title: "Egusi Soup with Ugu and Assorted Meat",
    shortTitle: "Egusi Soup",
    description: "Rich melon seed soup.",
    category: { slug: "soups-and-stews", name: "Soups & Stews" },
    totalMinutes: 80,
    servings: 6,
    difficulty: "medium",
    rating: { value: 4.8, count: 126 },
    heroImage: "/images/recipes/egusi-soup/hero.svg",
    heroImageAlt: "A pot of egusi soup",
    ...overrides,
  };
}

/** A list card. Give each one a distinct slug and popularity. */
export function listRecipe(overrides: Partial<ListRecipe> = {}): ListRecipe {
  return {
    ...recipeSummary(),
    region: { slug: "yoruba", name: "Yoruba" },
    vegetarian: false,
    popularity: 0,
    ...overrides,
  };
}
