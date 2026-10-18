import { Fragment } from "react";

import { AdPosition } from "~/components/ads/AdPosition";
import { RecipeCard } from "~/components/recipe/RecipeCard";
import type { AdPositionName } from "~/lib/ads/positions";
import type { RecipeSummary } from "~/lib/content/types";

interface RecipeGridProps {
  recipes: RecipeSummary[];
  /** Smallest card width before the grid drops a column. */
  minCard: 240 | 260;
  /** An in-feed ad position after this many cards. */
  inFeed?: { after: number; name: AdPositionName };
}

const COLUMNS = {
  240: "grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))]",
  260: "grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]",
};

/** Cards that must follow the in-feed ad, so it sits well apart from the next ad. */
export const MIN_CARDS_AFTER_INFEED = 2;

/**
 * Recipe cards in a grid. The in-feed ad position only appears when at least
 * two cards follow it, so it is never the last item and never close to the
 * ad position after the section. (Phase 7: it must render as an <li>.)
 */
export function RecipeGrid({ recipes, minCard, inFeed }: RecipeGridProps) {
  const showInFeed =
    inFeed && recipes.length - inFeed.after >= MIN_CARDS_AFTER_INFEED;
  return (
    <ul className={`grid gap-5 ${COLUMNS[minCard]}`}>
      {recipes.map((recipe, i) => (
        <Fragment key={recipe.slug}>
          {showInFeed && i === inFeed.after && (
            <AdPosition name={inFeed.name} />
          )}
          <li>
            <RecipeCard recipe={recipe} />
          </li>
        </Fragment>
      ))}
    </ul>
  );
}
