import { describe, expect, it } from "vitest";

import { listRecipe } from "~/test/fixtures";

import {
  applyFilters,
  filtersToParams,
  hasRatings,
  isFiltered,
  NO_FILTERS,
  parseFilters,
  parseTime,
  sortRecipes,
  type Filters,
} from "./filters";

const igbo = { slug: "igbo", name: "Igbo" };

// Listed in popularity order.
const RECIPES = [
  listRecipe({
    slug: "egusi",
    title: "Egusi Soup",
    totalMinutes: 80,
    difficulty: "medium",
    rating: { value: 4.8, count: 126 },
    popularity: 0,
  }),
  listRecipe({
    slug: "efo",
    title: "Ẹ̀fọ́ Riro",
    totalMinutes: 50,
    difficulty: "easy",
    rating: { value: 4.9, count: 88 },
    popularity: 1,
  }),
  listRecipe({
    slug: "okra",
    title: "Okra Soup",
    totalMinutes: 30,
    difficulty: "easy",
    region: igbo,
    vegetarian: true,
    rating: undefined,
    popularity: 2,
  }),
  listRecipe({
    slug: "ewedu",
    title: "Ewedu",
    totalMinutes: 20,
    difficulty: "easy",
    vegetarian: true,
    rating: { value: 4.8, count: 40 },
    popularity: 3,
  }),
  listRecipe({
    slug: "banga",
    title: "Banga Soup",
    totalMinutes: 30,
    difficulty: "medium",
    region: { slug: "niger-delta", name: "Niger Delta" },
    rating: undefined,
    popularity: 4,
  }),
];

const slugs = (recipes: { slug: string }[]) => recipes.map((r) => r.slug);
const filtered = (filters: Partial<Filters>) =>
  slugs(applyFilters(RECIPES, { ...NO_FILTERS, ...filters }));

const OPTIONS = {
  regions: ["yoruba", "igbo", "niger-delta"],
  canSortByRating: true,
};
const parse = (query: string, options = OPTIONS) =>
  parseFilters(new URLSearchParams(query), options);

describe("applyFilters", () => {
  it("keeps every recipe, most popular first, with no filters", () => {
    expect(filtered({})).toEqual(["egusi", "efo", "okra", "ewedu", "banga"]);
  });

  it("filters by total time, inclusive", () => {
    expect(filtered({ time: 30 })).toEqual(["okra", "ewedu", "banga"]);
    expect(filtered({ time: 60 })).toEqual(["efo", "okra", "ewedu", "banga"]);
  });

  it("filters by easy, vegetarian and region", () => {
    expect(filtered({ easy: true })).toEqual(["efo", "okra", "ewedu"]);
    expect(filtered({ veg: true })).toEqual(["okra", "ewedu"]);
    expect(filtered({ region: "igbo" })).toEqual(["okra"]);
  });

  it("combines filters", () => {
    expect(filtered({ time: 30, easy: true, veg: true })).toEqual([
      "okra",
      "ewedu",
    ]);
    expect(filtered({ time: 30, region: "yoruba" })).toEqual(["ewedu"]);
    expect(filtered({ veg: true, region: "niger-delta" })).toEqual([]);
  });

  it("sorts what is left", () => {
    expect(filtered({ easy: true, sort: "quick" })).toEqual([
      "ewedu",
      "okra",
      "efo",
    ]);
  });
});

describe("sortRecipes", () => {
  it("sorts by popularity", () => {
    expect(slugs(sortRecipes([...RECIPES].reverse(), "popular"))).toEqual(
      slugs(RECIPES),
    );
  });

  it("sorts by rating, then rating count, then popularity, unrated last", () => {
    expect(slugs(sortRecipes(RECIPES, "rating"))).toEqual([
      "efo",
      "egusi",
      "ewedu",
      "okra",
      "banga",
    ]);
  });

  it("sorts quickest first, breaking ties by popularity", () => {
    expect(slugs(sortRecipes(RECIPES, "quick"))).toEqual([
      "ewedu",
      "okra",
      "banga",
      "efo",
      "egusi",
    ]);
  });

  it("sorts A to Z ignoring tone marks", () => {
    expect(slugs(sortRecipes(RECIPES, "az"))).toEqual([
      "banga",
      "efo",
      "egusi",
      "ewedu",
      "okra",
    ]);
  });

  it("doesn't change the list it is given", () => {
    const copy = [...RECIPES];
    sortRecipes(RECIPES, "az");
    expect(RECIPES).toEqual(copy);
  });
});

describe("parseFilters", () => {
  it("reads every filter", () => {
    expect(
      parse("time=30&difficulty=easy&veg=1&region=igbo&sort=quick"),
    ).toEqual({
      time: 30,
      easy: true,
      veg: true,
      region: "igbo",
      sort: "quick",
    });
  });

  it("falls back to the defaults for unknown or invalid values", () => {
    expect(
      parse("time=7&difficulty=hard&veg=yes&region=mars&sort=nope&x=1"),
    ).toEqual(NO_FILTERS);
    expect(parse("")).toEqual(NO_FILTERS);
  });

  it("ignores regions that have no chip on the page", () => {
    expect(parse("region=edo").region).toBeNull();
    expect(parse("region=igbo", { ...OPTIONS, regions: [] }).region).toBeNull();
  });

  it("ignores the rating sort when no recipe shows a rating", () => {
    expect(parse("sort=rating").sort).toBe("rating");
    expect(
      parse("sort=rating", { ...OPTIONS, canSortByRating: false }).sort,
    ).toBe("popular");
  });
});

describe("filtersToParams", () => {
  it("writes params in a fixed order and leaves out defaults", () => {
    const all: Filters = {
      sort: "az",
      region: "igbo",
      veg: true,
      easy: true,
      time: 60,
    };
    expect(filtersToParams(all).toString()).toBe(
      "time=60&difficulty=easy&veg=1&region=igbo&sort=az",
    );
    expect(filtersToParams(NO_FILTERS).toString()).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const view: Filters = { ...NO_FILTERS, veg: true, sort: "rating" };
    expect(parseFilters(filtersToParams(view), OPTIONS)).toEqual(view);
  });
});

describe("helpers", () => {
  it("parses only the offered time limits", () => {
    expect(parseTime("30")).toBe(30);
    expect(parseTime("60")).toBe(60);
    expect(parseTime("45")).toBeNull();
    expect(parseTime(null)).toBeNull();
  });

  it("tells whether a filter is set, ignoring the sort", () => {
    expect(isFiltered(NO_FILTERS)).toBe(false);
    expect(isFiltered({ ...NO_FILTERS, sort: "az" })).toBe(false);
    expect(isFiltered({ ...NO_FILTERS, veg: true })).toBe(true);
    expect(isFiltered({ ...NO_FILTERS, region: "igbo" })).toBe(true);
  });

  it("knows when any recipe shows a rating", () => {
    expect(hasRatings(RECIPES)).toBe(true);
    expect(hasRatings(RECIPES.map((r) => ({ ...r, rating: undefined })))).toBe(
      false,
    );
  });
});
