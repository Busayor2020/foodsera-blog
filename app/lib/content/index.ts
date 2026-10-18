import { join } from "node:path";

import { categoryPath, occasionPath, recipePath, regionPath } from "../paths";

import { loadContent, type ContentStore, type LoadOptions } from "./load";
import type { Recipe, RecipeSummary, SiteNav, Term } from "./types";

// The only module that knows where content comes from. Everything else asks
// these functions, so the source can later become a headless CMS.

export { ContentError } from "./load";

let cache: ContentStore | undefined;

function defaultOptions(): LoadOptions {
  return {
    contentDir: join(process.cwd(), "content"),
    publicDir: join(process.cwd(), "public"),
  };
}

/**
 * Loads and validates all content. Cached for production builds, where the
 * root loader runs once per prerendered page. In dev it is re-read on every
 * call so edits show up straight away. Pass `options` to read another folder
 * (tests use fixtures); that is never cached.
 */
export function getContent(options?: LoadOptions): ContentStore {
  if (options) return loadContent(options);
  if (cache) return cache;
  const store = loadContent(defaultOptions());
  if (process.env.NODE_ENV === "production") cache = store;
  return store;
}

/** Newest first. */
export function getAllRecipes(options?: LoadOptions): Recipe[] {
  return getContent(options).recipes;
}

export function getRecipe(
  slug: string,
  options?: LoadOptions,
): Recipe | undefined {
  return getAllRecipes(options).find((r) => r.slug === slug);
}

export function getCategories(options?: LoadOptions): Term[] {
  return getContent(options).categories;
}

export function getRegions(options?: LoadOptions): Term[] {
  return getContent(options).regions;
}

export function getOccasions(options?: LoadOptions): Term[] {
  return getContent(options).occasions;
}

export function getSiteNav(options?: LoadOptions): SiteNav {
  const { categories, regions, occasions } = getContent(options);
  return { categories, regions, occasions };
}

/** "Recipe of the week": the recipe marked featured, or else the newest. */
export function getFeaturedRecipe(options?: LoadOptions): Recipe | undefined {
  const recipes = getAllRecipes(options);
  return recipes.find((r) => r.featured) ?? recipes[0];
}

// Each rating is treated as if it also had 10 neutral 3.5-star reviews, so a
// few perfect scores can't outrank a long record of good ones. (A site-wide
// average prior doesn't work with few recipes: it sits near 5 itself.)
const PRIOR_REVIEWS = 10;
const PRIOR_VALUE = 3.5;

/**
 * Rated recipes first, by weighted rating, so 5.0 from 2 reviews doesn't beat
 * 4.8 from 126. Unrated recipes follow: the featured one, then newest first.
 */
export function rankPopular(recipes: Recipe[]): Recipe[] {
  const rated = recipes.filter((r) => r.rating);
  const score = (r: Recipe) => {
    const { value, count } = r.rating as NonNullable<Recipe["rating"]>;
    return (
      (value * count + PRIOR_VALUE * PRIOR_REVIEWS) / (count + PRIOR_REVIEWS)
    );
  };
  const byNewest = (a: Recipe, b: Recipe) =>
    b.publishedAt.localeCompare(a.publishedAt);

  return [
    ...rated.sort((a, b) => score(b) - score(a) || byNewest(a, b)),
    ...recipes
      .filter((r) => !r.rating)
      .sort(
        (a, b) => Number(b.featured) - Number(a.featured) || byNewest(a, b),
      ),
  ];
}

export function getPopularRecipes(
  limit: number,
  { exclude = [], content }: { exclude?: string[]; content?: LoadOptions } = {},
): Recipe[] {
  const recipes = getAllRecipes(content).filter(
    (r) => !exclude.includes(r.slug),
  );
  return rankPopular(recipes).slice(0, limit);
}

export function toRecipeSummary(recipe: Recipe): RecipeSummary {
  return {
    slug: recipe.slug,
    title: recipe.title,
    shortTitle: recipe.shortTitle,
    description: recipe.description,
    category: recipe.category,
    totalMinutes: recipe.totalMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    rating: recipe.rating,
    heroImage: recipe.heroImage,
    heroImageAlt: recipe.heroImageAlt,
  };
}

export interface ContentPaths {
  recipes: string[];
  categories: string[];
  regions: string[];
  occasions: string[];
}

/** Every content URL, grouped by the route that renders it. */
export function getContentPaths(options?: LoadOptions): ContentPaths {
  const { recipes, categories, regions, occasions } = getContent(options);
  return {
    recipes: recipes.map((r) => recipePath(r.slug)),
    categories: categories.map((t) => categoryPath(t.slug)),
    regions: regions.map((t) => regionPath(t.slug)),
    occasions: occasions.map((t) => occasionPath(t.slug)),
  };
}

/** Slugs of recipes still marked `sample: true`. */
export function getSampleRecipeSlugs(options?: LoadOptions): string[] {
  return getAllRecipes(options)
    .filter((r) => r.sample)
    .map((r) => r.slug);
}

/**
 * "You might also like": same category first, then same region, with the
 * popularity order breaking ties. Never includes the recipe itself.
 */
export function getRelatedRecipes(
  recipe: Recipe,
  limit: number,
  { content }: { content?: LoadOptions } = {},
): Recipe[] {
  const ranked = rankPopular(
    getAllRecipes(content).filter((r) => r.slug !== recipe.slug),
  );
  const closeness = (r: Recipe) =>
    (r.category.slug === recipe.category.slug ? 2 : 0) +
    (r.region.slug === recipe.region.slug ? 1 : 0);
  return ranked
    .map((r, popularity) => ({ r, popularity }))
    .sort((a, b) => closeness(b.r) - closeness(a.r) || a.popularity - b.popularity)
    .slice(0, limit)
    .map(({ r }) => r);
}
