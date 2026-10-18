import Fuse, { type FuseIndex, type IFuseOptions } from "fuse.js";

import { toRecipeSummary } from "./content/summary";
import type { Recipe, RecipeSummary } from "./content/types";
import { foldText } from "./format/text";

// Recipe search. The index is built once at build time and served as
// /search-index.json; only the search page downloads it. Every field is
// folded (see foldText), and so is every query, so "efo riro" finds
// "Ẹ̀fọ́ Riro" and the other way round.

/** Shown as "Try searching for" links. Each should find something. */
export const SEARCH_SUGGESTIONS = [
  "Jollof",
  "Egusi",
  "Puff-puff",
  "Soup",
  "Zobo",
];

export const SEARCH_INDEX_PATH = "/search-index.json";

export interface SearchDoc {
  recipe: RecipeSummary;
  /** Folded title and short title. */
  title: string;
  /** Local ingredient names and what else they are called ("ugu", "dawadawa"). */
  local: string;
  /** Category, region and occasions. */
  terms: string;
  ingredients: string;
  /** Everything above, so a query can match words from different fields. */
  all: string;
}

export interface SearchIndexData {
  docs: SearchDoc[];
  index: ReturnType<FuseIndex<SearchDoc>["toJSON"]>;
}

const KEYS = [
  { name: "title", weight: 4 },
  { name: "local", weight: 2 },
  { name: "terms", weight: 1 },
  { name: "ingredients", weight: 1 },
  { name: "all", weight: 0.5 },
];

const OPTIONS: IFuseOptions<SearchDoc> = {
  keys: KEYS,
  // Spaces mean AND, and each word is matched loosely (Fuse extended search).
  useExtendedSearch: true,
  ignoreLocation: true,
  threshold: 0.3,
  minMatchCharLength: 2,
};

/** Words shorter than this must match exactly. */
const MIN_FUZZY_LENGTH = 5;

function toDoc(recipe: Recipe): SearchDoc {
  const fold = (parts: (string | undefined)[]) =>
    foldText(parts.filter(Boolean).join(" · "));
  const title = fold([recipe.title, recipe.shortTitle]);
  const local = fold(
    recipe.ingredientsExplained.flatMap((item) => [item.local, item.aka]),
  );
  const terms = fold([
    recipe.category.name,
    recipe.region.name,
    ...recipe.occasions.map((o) => o.name),
  ]);
  const ingredients = fold(
    recipe.ingredients.flatMap((group) => group.items.map((i) => i.name)),
  );
  return {
    recipe: toRecipeSummary(recipe),
    title,
    local,
    terms,
    ingredients,
    all: [title, local, terms, ingredients].join(" · "),
  };
}

/** Runs at build time, for /search-index.json. */
export function buildSearchIndex(recipes: Recipe[]): SearchIndexData {
  const docs = recipes.map(toDoc);
  return { docs, index: Fuse.createIndex(KEYS, docs).toJSON() };
}

export type Searcher = (query: string) => RecipeSummary[];

/** A search function over a prebuilt index. */
export function createSearcher({ docs, index }: SearchIndexData): Searcher {
  const fuse = new Fuse(docs, OPTIONS, Fuse.parseIndex<SearchDoc>(index));
  return (query) => {
    // Fuse's extended search treats these as operators. Readers mean words.
    const words = foldText(query)
      .replace(/[!^=$'|"]/g, " ")
      .split(" ")
      .filter(Boolean);
    if (words.length === 0) return [];
    // A typo in a short word is a different word ("rice" is one letter from
    // "spice"), so short words must appear as typed. Longer ones may have one.
    const pattern = words
      .map((word) => (word.length < MIN_FUZZY_LENGTH ? `'${word}` : word))
      .join(" ");
    return fuse.search(pattern).map((result) => result.item.recipe);
  };
}

let loading: Promise<Searcher> | undefined;

/** Downloads the index once per visit and makes a searcher from it. */
export function loadSearcher(): Promise<Searcher> {
  loading ??= fetch(SEARCH_INDEX_PATH)
    .then((response) => {
      if (!response.ok) throw new Error(`Search index: ${response.status}`);
      return response.json() as Promise<SearchIndexData>;
    })
    .then(createSearcher)
    .catch((error: unknown) => {
      // Let the next visit to the page try again.
      loading = undefined;
      throw error;
    });
  return loading;
}
