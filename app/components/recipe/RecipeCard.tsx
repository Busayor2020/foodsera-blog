import { Clock } from "lucide-react";
import { Link } from "react-router";

import type { RecipeSummary } from "~/lib/content/types";
import { formatMinutes } from "~/lib/format/duration";
import { RECIPE_HERO } from "~/lib/images";
import { recipePath } from "~/lib/paths";

const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" };

interface RecipeCardProps {
  recipe: RecipeSummary;
}

/** Matches design/Card.dc.html. */
export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={recipePath(recipe.slug)}
      className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper leading-[1.4] text-charcoal no-underline hover:text-charcoal"
    >
      <img
        src={recipe.heroImage}
        alt={recipe.heroImageAlt}
        width={RECIPE_HERO.width}
        height={RECIPE_HERO.height}
        loading="lazy"
        decoding="async"
        className="aspect-4/3 w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 px-4 pt-3.5 pb-4.5">
        <span className="text-xs font-bold tracking-eyebrow text-ugu uppercase">
          {recipe.category.name}
        </span>
        <h3 className="text-xl">{recipe.title}</h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm text-muted">
          <span className="flex items-center gap-1.25">
            <Clock size={15} strokeWidth={2} aria-hidden="true" />
            {formatMinutes(recipe.totalMinutes)}
          </span>
          <span>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
          {recipe.rating && (
            <span className="flex items-center gap-1 text-charcoal">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
                  className="fill-star stroke-star-edge"
                  strokeWidth="1"
                />
              </svg>
              <span>
                <strong>{recipe.rating.value.toFixed(1)}</strong>
                <span className="sr-only"> out of 5</span>
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
