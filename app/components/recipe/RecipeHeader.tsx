import { Link } from "react-router";

import type { Recipe } from "~/lib/content/types";
import { formatDate } from "~/lib/format/date";
import { categoryPath } from "~/lib/paths";
import { shownRating } from "~/lib/ratings";

import { RatingStars } from "./RatingStars";

/** Eyebrow, title and the rating, author and date row. */
export function RecipeHeader({ recipe }: { recipe: Recipe }) {
  const rating = shownRating(recipe);
  return (
    <header className="flex flex-col gap-3.5">
      <Link
        to={categoryPath(recipe.category.slug)}
        className="self-start eyebrow text-ugu no-underline hover:text-ugu-deep"
      >
        {recipe.category.name} · {recipe.region.name}
      </Link>
      <h1 className="text-title">{recipe.title}</h1>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-md text-muted">
        <a
          href="#reviews"
          className="flex items-center gap-2 text-charcoal no-underline hover:text-charcoal"
        >
          {rating ? (
            <>
              <RatingStars value={rating.value} />
              <span>
                <strong>{rating.value.toFixed(1)}</strong>{" "}
                <span className="sr-only">out of 5</span> ·{" "}
                <span className="underline">{rating.count} reviews</span>
              </span>
            </>
          ) : (
            <span className="underline">No reviews yet</span>
          )}
        </a>
        <span>
          By{" "}
          <Link
            to="/about"
            className="font-semibold text-charcoal hover:text-charcoal"
          >
            {recipe.author}
          </Link>
        </span>
        <span>
          Last updated{" "}
          <time dateTime={recipe.updatedAt}>
            {formatDate(recipe.updatedAt)}
          </time>
        </span>
      </div>
    </header>
  );
}
