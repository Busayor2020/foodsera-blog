import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { RecipeGrid } from "~/components/home/RecipeGrid";
import { ToggleChip } from "~/components/ui/Chip";
import type { TermPageData } from "~/lib/content/types";
import {
  applyFilters,
  filtersToParams,
  hasRatings,
  isFiltered,
  NO_FILTERS,
  parseFilters,
  SORT_LABELS,
  SORTS,
  type Filters,
  type SortKey,
  type TimeLimit,
} from "~/lib/filters";
import { useHydrated } from "~/lib/hydrated";

/** Cards shown at first, and how many more each "Load more" adds. */
export const FIRST_PAGE = 9;
export const PAGE_STEP = 6;
/** An in-feed ad position after every this many cards. */
const INFEED_EVERY = 6;

const TIME_CHIPS: { limit: TimeLimit; label: string }[] = [
  { limit: 30, label: "Under 30 min" },
  { limit: 60, label: "Under 1 hour" },
];

const plural = (n: number) => `${n} recipe${n === 1 ? "" : "s"}`;

/**
 * Filter chips, sort and the recipe grid. The view lives in the URL's search
 * params, so it can be shared, and filtering runs in the browser over the
 * prerendered list. The prerendered HTML is the unfiltered view.
 */
export function FilteredRecipes({ page }: { page: TermPageData }) {
  const hydrated = useHydrated();
  const [searchParams, setSearchParams] = useSearchParams();

  const canSortByRating = hasRatings(page.recipes);
  const filters = hydrated
    ? parseFilters(searchParams, {
        regions: page.regions.map((r) => r.slug),
        canSortByRating,
      })
    : NO_FILTERS;
  const results = applyFilters(page.recipes, filters);
  const filtered = isFiltered(filters);

  // How many cards are showing, remembered per view: changing a filter or
  // the sort starts again from the first page.
  const view = filtersToParams(filters).toString();
  const [shown, setShown] = useState({ view, count: FIRST_PAGE });
  const count = shown.view === view ? shown.count : FIRST_PAGE;
  const visible = results.slice(0, count);
  const remaining = results.length - visible.length;

  // After "Load more", move keyboard focus to the first new card.
  const gridRef = useRef<HTMLUListElement>(null);
  const focusCard = useRef<number | null>(null);
  useEffect(() => {
    const index = focusCard.current;
    if (index === null) return;
    focusCard.current = null;
    gridRef.current
      ?.querySelectorAll<HTMLAnchorElement>("a[href^='/recipes/']")
      [index]?.focus();
  }, [count]);

  const update = (next: Filters) =>
    setSearchParams(filtersToParams(next), {
      replace: true,
      preventScrollReset: true,
    });
  const clear = () => update({ ...NO_FILTERS, sort: filters.sort });
  const loadMore = () => {
    focusCard.current = visible.length;
    setShown({ view, count: count + PAGE_STEP });
  };

  const sorts = SORTS.filter((s) => s !== "rating" || canSortByRating);

  return (
    <>
      {/* Cards use h3, so the list needs a heading above them. */}
      <h2 className="sr-only">{page.term.name} recipes</h2>
      <div className="flex flex-col gap-3.5 rounded-panel border border-line bg-paper px-4.5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-bold">Filter recipes</span>
          <label className="flex items-center gap-2.5 text-md font-semibold">
            Sort by
            <select
              value={filters.sort}
              onChange={(e) =>
                update({ ...filters, sort: e.target.value as SortKey })
              }
              className="min-h-11 rounded-ad border-[1.5px] border-field-line bg-white px-3 text-charcoal"
            >
              {sorts.map((sort) => (
                <option key={sort} value={sort}>
                  {SORT_LABELS[sort]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div
          role="group"
          aria-label="Cook time, difficulty and diet"
          className="flex flex-wrap gap-2"
        >
          {TIME_CHIPS.map(({ limit, label }) => (
            <ToggleChip
              key={limit}
              pressed={filters.time === limit}
              // The two time chips are one choice: picking one clears the other.
              onClick={() =>
                update({
                  ...filters,
                  time: filters.time === limit ? null : limit,
                })
              }
            >
              {label}
            </ToggleChip>
          ))}
          <ToggleChip
            pressed={filters.easy}
            onClick={() => update({ ...filters, easy: !filters.easy })}
          >
            Easy
          </ToggleChip>
          <ToggleChip
            pressed={filters.veg}
            onClick={() => update({ ...filters, veg: !filters.veg })}
          >
            Vegetarian
          </ToggleChip>
        </div>
        {page.regions.length > 0 && (
          <div
            role="group"
            aria-label="Region"
            className="flex flex-wrap gap-2"
          >
            {page.regions.map((region) => (
              <ToggleChip
                key={region.slug}
                pressed={filters.region === region.slug}
                onClick={() =>
                  update({
                    ...filters,
                    region: filters.region === region.slug ? null : region.slug,
                  })
                }
              >
                {region.name}
              </ToggleChip>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-md text-muted">
          Showing <strong className="text-charcoal">{visible.length}</strong> of{" "}
          {plural(results.length)}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={clear}
            className="min-h-11 px-1 font-bold text-palm-text underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-panel border border-dashed border-line-strong bg-paper p-8 text-center">
          <h2 className="text-2xl">No recipes match these filters</h2>
          <p className="text-muted">
            Try removing a filter, or show every recipe on this page.
          </p>
          <button
            type="button"
            onClick={clear}
            className="mt-1 min-h-12 rounded-full bg-charcoal px-6 font-bold text-white"
          >
            Show all recipes
          </button>
        </div>
      ) : (
        <RecipeGrid
          ref={gridRef}
          recipes={visible}
          minCard={240}
          inFeed={{
            after: INFEED_EVERY,
            every: INFEED_EVERY,
            name: "term-infeed",
          }}
        />
      )}

      {remaining > 0 && (
        <div className="flex flex-col items-center gap-2 pt-4">
          <button
            type="button"
            onClick={loadMore}
            className="min-h-13 rounded-full border-[1.5px] border-charcoal bg-paper px-8 font-bold text-charcoal"
          >
            Load more recipes
          </button>
          <span className="text-sm text-muted">{remaining} more to see</span>
        </div>
      )}
    </>
  );
}
