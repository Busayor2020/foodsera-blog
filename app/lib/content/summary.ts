import type { Recipe, RecipeSummary } from "./types";

// Safe to import from browser code: no file system access.

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
