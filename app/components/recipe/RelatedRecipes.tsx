import type { RecipeSummary } from "~/lib/content/types";

import { RecipeCard } from "./RecipeCard";

export function RelatedRecipes({ recipes }: { recipes: RecipeSummary[] }) {
  if (recipes.length === 0) return null;
  return (
    <section aria-labelledby="related" className="flex flex-col gap-4">
      <h2 id="related" className="text-3xl">
        You might also like
      </h2>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-4.5">
        {recipes.map((recipe) => (
          <li key={recipe.slug}>
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    </section>
  );
}
