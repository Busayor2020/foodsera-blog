import type { Rating, Recipe } from "./content/types";

/**
 * The rating readers see. Frontmatter ratings only exist on sample recipes
 * (for layout); every other recipe shows "No reviews yet" until genuine reader
 * reviews exist. See CLAUDE.md, SEO.
 */
export function shownRating(
  recipe: Pick<Recipe, "sample" | "rating">,
): Rating | undefined {
  return recipe.sample ? recipe.rating : undefined;
}
