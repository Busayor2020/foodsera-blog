import { Search } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { RecipeGrid } from "~/components/home/RecipeGrid";
import {
  getCategories,
  getPopularRecipes,
  getTermPage,
  toRecipeSummary,
} from "~/lib/content";
import { useHydrated } from "~/lib/hydrated";
import { categoryPath, recipeIndexPath, searchPath } from "~/lib/paths";
import { keepDataWhenOnlySearchChanges } from "~/lib/revalidate";
import { loadSearcher, SEARCH_SUGGESTIONS, type Searcher } from "~/lib/search";
import { pageMeta } from "~/lib/seo/meta";

import type { Route } from "./+types/search";

const POPULAR_LIMIT = 8;
const FALLBACK_LIMIT = 4;
/** The in-feed ad position goes after this many results. */
const INFEED_AFTER = 6;
/** Wait this long after the last keystroke before searching. */
const TYPING_DELAY_MS = 200;

export function loader() {
  // The category with the most recipes, for the no-results links.
  const largest = getCategories()
    .map((c) => ({
      name: c.name,
      path: categoryPath(c.slug),
      count: getTermPage("category", c.slug)?.recipes.length ?? 0,
    }))
    .sort((a, b) => b.count - a.count)[0];
  return {
    popular: getPopularRecipes(POPULAR_LIMIT).map(toRecipeSummary),
    largestCategory:
      largest && largest.count > 0
        ? { name: largest.name, path: largest.path }
        : undefined,
  };
}

export const handle = { ads: true };

export const shouldRevalidate = keepDataWhenOnlySearchChanges;

export function meta(_: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "Search recipes | Foodsera",
      description:
        "Search every Foodsera recipe by dish, ingredient or local name.",
      path: searchPath,
    }),
    // One canonical /search, and no result pages in search engines.
    { name: "robots", content: "noindex, follow" },
  ];
}

const plural = (n: number) => `${n} recipe${n === 1 ? "" : "s"}`;

/** From design/Search.dc.html and SearchEmpty.dc.html. */
export default function SearchPage({ loaderData }: Route.ComponentProps) {
  const { popular, largestCategory } = loaderData;
  const hydrated = useHydrated();
  const [searchParams, setSearchParams] = useSearchParams();

  // The prerendered page has no query, so ?q= is read after hydration.
  const query = hydrated ? (searchParams.get("q") ?? "").trim() : "";

  // What's in the box. Typing updates ?q= shortly after, and a query that
  // arrives from elsewhere (a suggestion link, the header search, back and
  // forward) replaces what's in the box.
  const [text, setText] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  if (query !== seenQuery) {
    setSeenQuery(query);
    if (query !== text.trim()) setText(query);
  }

  const commit = (value: string) => {
    const next = value.trim();
    setSearchParams(next ? { q: next } : {}, {
      replace: true,
      preventScrollReset: true,
    });
  };

  useEffect(() => {
    if (!hydrated || text.trim() === query) return;
    const timer = setTimeout(() => commit(text), TYPING_DELAY_MS);
    return () => clearTimeout(timer);
  });

  const [searcher, setSearcher] = useState<Searcher | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    loadSearcher().then(
      (loaded) => current && setSearcher(() => loaded),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, []);

  const results = query && searcher ? searcher(query) : null;

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    commit(text);
  };

  let status = "";
  if (query && failed) status = "Search isn't working right now.";
  else if (results) {
    status = results.length
      ? `${plural(results.length)} found for ${query}`
      : `No recipes found for ${query}`;
  }

  return (
    <div className="mx-auto flex max-w-page flex-col gap-7 px-5 pt-8 pb-20">
      <section className="flex max-w-prose flex-col gap-3.5">
        <h1 className="text-search">Search recipes</h1>
        <form
          role="search"
          action={searchPath}
          method="get"
          onSubmit={onSubmit}
          className="flex gap-2.5"
        >
          <label htmlFor="sq" className="sr-only">
            Search recipes
          </label>
          <input
            id="sq"
            name="q"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Try egusi, jollof, akara"
            autoComplete="off"
            className="min-h-14 min-w-0 flex-1 rounded-full border-[1.5px] border-charcoal bg-white px-5 text-lg"
          />
          <button
            type="submit"
            className="flex min-h-14 flex-none items-center gap-2 rounded-full bg-palm px-6 font-bold text-white"
          >
            <Search size={20} strokeWidth={2.2} aria-hidden="true" />
            <span>Search</span>
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-md">
          <span id="try" className="text-muted">
            Try searching for:
          </span>
          <ul aria-labelledby="try" className="flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((term) => (
              <li key={term}>
                <Link
                  to={`${searchPath}?q=${encodeURIComponent(term)}`}
                  preventScrollReset
                  className="flex min-h-11 items-center rounded-full border border-line-strong bg-paper px-3.5 font-semibold text-charcoal no-underline hover:text-charcoal"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p role="status" className="sr-only">
        {status}
      </p>

      {!query && popular.length > 0 && (
        <section aria-labelledby="popular" className="flex flex-col gap-5">
          <h2 id="popular" className="text-2xl">
            Popular right now
          </h2>
          <RecipeGrid recipes={popular} minCard={250} />
        </section>
      )}

      {query && failed && (
        <p className="text-lead text-ink-soft">
          Search isn't working right now. Try again in a moment, or{" "}
          <Link to={recipeIndexPath}>browse all recipes A–Z</Link>.
        </p>
      )}

      {query && !results && !failed && <p className="text-muted">Searching…</p>}

      {results && results.length > 0 && (
        <section aria-labelledby="results" className="flex flex-col gap-5">
          <h2 id="results" className="text-2xl">
            {plural(results.length)} for “{query}”
          </h2>
          <RecipeGrid
            recipes={results}
            minCard={250}
            inFeed={{ after: INFEED_AFTER, name: "search-infeed" }}
          />
        </section>
      )}

      {results && results.length === 0 && (
        <NoResults
          query={query}
          largestCategory={largestCategory}
          fallback={popular.slice(0, FALLBACK_LIMIT)}
        />
      )}
    </div>
  );
}

interface NoResultsProps {
  query: string;
  largestCategory?: { name: string; path: string };
  fallback: Route.ComponentProps["loaderData"]["popular"];
}

function NoResults({ query, largestCategory, fallback }: NoResultsProps) {
  return (
    <section aria-labelledby="no-results" className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-6 rounded-feature border border-line bg-paper p-[clamp(24px,4vw,40px)]">
        <EmptyPot />
        <div className="flex flex-[1_1_320px] flex-col gap-2">
          <h2 id="no-results" className="text-3xl">
            No recipes found for “{query}”
          </h2>
          <p className="text-ink-soft">
            Check the spelling, try a simpler word like <strong>soup</strong> or{" "}
            <strong>rice</strong>, or use the local name, for example{" "}
            <strong>ugu</strong> instead of pumpkin leaves.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            <Link
              to={recipeIndexPath}
              className="flex min-h-12 items-center rounded-full bg-charcoal px-5.5 font-bold text-white no-underline hover:text-white"
            >
              Browse all recipes A–Z
            </Link>
            {largestCategory && (
              <Link
                to={largestCategory.path}
                className="flex min-h-12 items-center rounded-full border-[1.5px] border-charcoal px-5.5 font-bold text-charcoal no-underline hover:text-charcoal"
              >
                {largestCategory.name}
              </Link>
            )}
          </div>
        </div>
      </div>
      {fallback.length > 0 && (
        <>
          <h2 className="text-h2">Try these instead</h2>
          <RecipeGrid recipes={fallback} minCard={250} />
        </>
      )}
    </section>
  );
}

function EmptyPot() {
  return (
    <svg
      width="120"
      height="96"
      viewBox="0 0 120 96"
      aria-hidden="true"
      className="flex-none"
    >
      <ellipse cx="60" cy="84" rx="46" ry="8" className="fill-shadow-soft" />
      <path
        d="M16 40h88l-8 36a8 8 0 0 1-8 6H32a8 8 0 0 1-8-6z"
        className="fill-charcoal"
      />
      <rect
        x="10"
        y="34"
        width="100"
        height="10"
        rx="5"
        className="fill-charcoal-soft"
      />
      <path
        d="M46 24c-4-6 4-10 0-18M60 24c-4-6 4-10 0-18M74 24c-4-6 4-10 0-18"
        className="stroke-line-strong"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
