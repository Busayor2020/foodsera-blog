import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router";

import { DIFFICULTY_LABEL } from "~/components/recipe/QuickFacts";
import type { RecipeSummary } from "~/lib/content/types";
import { formatMinutes } from "~/lib/format/duration";
import { RECIPE_HERO } from "~/lib/images";
import { recipePath } from "~/lib/paths";

export interface FeaturedRecipe extends RecipeSummary {
  teaser: string;
}

/** "Recipe of the week": the page's h1 and its only eager image. */
export function HomeHero({ recipe }: { recipe: FeaturedRecipe }) {
  return (
    <section aria-labelledby="hero-title" className="bg-plantain-soft">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-12 gap-y-8 px-5 pt-10 pb-12">
        <div className="min-w-0 flex-[1_1_520px]">
          <img
            src={recipe.heroImage}
            alt={recipe.heroImageAlt}
            width={RECIPE_HERO.width}
            height={RECIPE_HERO.height}
            loading="eager"
            fetchPriority="high"
            className="aspect-4/3 w-full rounded-feature object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_360px] flex-col items-start gap-4">
          <span className="rounded-full bg-paper px-3 py-1.5 eyebrow tracking-label text-palm-deep">
            Recipe of the week
          </span>
          <h1 id="hero-title" className="text-hero">
            {recipe.title}
          </h1>
          <p className="text-lead text-ink-soft">{recipe.teaser}</p>
          <p className="flex flex-wrap gap-x-4.5 gap-y-2 text-md text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Clock size={17} strokeWidth={2} aria-hidden="true" />
              <strong>{formatMinutes(recipe.totalMinutes)}</strong>
            </span>
            <span>
              Serves <strong>{recipe.servings}</strong>
            </span>
            <span>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
            {recipe.rating && (
              <span>
                <strong>{recipe.rating.value.toFixed(1)}</strong> from{" "}
                {recipe.rating.count} reviews
              </span>
            )}
          </p>
          <Link
            to={recipePath(recipe.slug)}
            className="mt-1.5 flex min-h-13 items-center gap-2.5 rounded-full bg-palm px-6.5 text-body font-bold text-white no-underline hover:text-white hover:brightness-95"
          >
            Get the recipe
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
