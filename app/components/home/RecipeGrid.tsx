import { Fragment, type Ref } from "react";

import { AdPosition } from "~/components/ads/AdPosition";
import { RecipeCard } from "~/components/recipe/RecipeCard";
import type { AdPositionName } from "~/lib/ads/positions";
import type { RecipeSummary } from "~/lib/content/types";

interface InFeed {
  /** The first in-feed ad position goes after this many cards. */
  after: number;
  /** Then another after every this many cards. Leave out for just one. */
  every?: number;
  name: AdPositionName;
}

interface RecipeGridProps {
  recipes: RecipeSummary[];
  /** Smallest card width before the grid drops a column. */
  minCard: 240 | 250 | 260;
  inFeed?: InFeed;
  ref?: Ref<HTMLUListElement>;
}

const COLUMNS = {
  240: "grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))]",
  250: "grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))]",
  260: "grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]",
};

/** Cards that must follow the in-feed ad, so it sits well apart from the next ad. */
export const MIN_CARDS_AFTER_INFEED = 2;

/** Whether an in-feed ad position goes before card `index` (0-based). */
export function inFeedBefore(
  index: number,
  total: number,
  { after, every }: Pick<InFeed, "after" | "every">,
): boolean {
  const atSlot =
    index === after ||
    (every !== undefined && index > after && (index - after) % every === 0);
  return atSlot && total - index >= MIN_CARDS_AFTER_INFEED;
}

/**
 * Recipe cards in a grid. An in-feed ad position only appears when at least
 * two cards follow it, so it is never the last item and never close to the
 * ad position or button after the grid. (Phase 7: it must render as an <li>.)
 */
export function RecipeGrid({ recipes, minCard, inFeed, ref }: RecipeGridProps) {
  return (
    <ul ref={ref} className={`grid gap-5 ${COLUMNS[minCard]}`}>
      {recipes.map((recipe, i) => (
        <Fragment key={recipe.slug}>
          {inFeed && inFeedBefore(i, recipes.length, inFeed) && (
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
