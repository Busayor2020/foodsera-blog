import { describe, expect, it } from "vitest";

import { getAllRecipes } from "./content";
import { loadContent } from "./content/load";
import { makeFixture, recipeFrontmatter } from "./content/test-fixture";
import { buildSearchIndex, createSearcher, SEARCH_SUGGESTIONS } from "./search";

// The index goes through JSON, as it does in the browser.
const searcherFor = (recipes = getAllRecipes()) =>
  createSearcher(JSON.parse(JSON.stringify(buildSearchIndex(recipes))));

const search = searcherFor();
const slugs = (query: string, searcher = search) =>
  searcher(query).map((r) => r.slug);

describe("recipe search", () => {
  it("finds recipes by title, best match first", () => {
    expect(slugs("jollof")[0]).toBe("jollof-rice");
    expect(slugs("puff-puff")[0]).toBe("puff-puff");
    expect(slugs("rice")).toContain("jollof-rice");
  });

  it("ignores tone marks and dots below in the query", () => {
    expect(slugs("efo riro")[0]).toBe("efo-riro");
    expect(slugs("Ẹ̀fọ́ Riro")[0]).toBe("efo-riro");
    expect(slugs("ẹ̀fọ́")).toContain("efo-riro");
  });

  it("ignores tone marks in the index too", () => {
    const { recipes } = loadContent(
      makeFixture({
        recipes: [
          { front: recipeFrontmatter("efo-riro", { title: "Ẹ̀fọ́ Riro" }) },
          { front: recipeFrontmatter("ofe-onugbu", { title: "Ọ̀fẹ́ Ọ̀nụ̀gbụ̀" }) },
        ],
      }),
    );
    const searcher = searcherFor(recipes);
    expect(slugs("efo riro", searcher)).toEqual(["efo-riro"]);
    expect(slugs("ofe onugbu", searcher)).toEqual(["ofe-onugbu"]);
  });

  it("finds recipes by local ingredient names and what else they're called", () => {
    expect(slugs("ugu")).toContain("egusi-soup");
    expect(slugs("dawadawa")).toEqual(
      expect.arrayContaining(["egusi-soup", "efo-riro"]),
    );
    expect(slugs("scent leaf")).toContain("catfish-pepper-soup");
    expect(slugs("kosai")).toContain("akara");
  });

  it("finds recipes by category, region and occasion", () => {
    expect(slugs("soup")).toEqual(
      expect.arrayContaining(["egusi-soup", "efo-riro", "catfish-pepper-soup"]),
    );
    expect(slugs("christmas")).toEqual(
      expect.arrayContaining(["jollof-rice", "puff-puff", "zobo"]),
    );
  });

  it("matches words from different fields, in any order", () => {
    expect(slugs("rice jollof")[0]).toBe("jollof-rice");
    expect(slugs("egusi party")).toContain("egusi-soup");
  });

  it("forgives a small typo in longer words, but not in short ones", () => {
    expect(slugs("jolof")).toContain("jollof-rice");
    // "rice" is one letter from "spice", which is in other recipes.
    expect(slugs("rice")).toEqual(["jollof-rice"]);
    expect(slugs("suya")).toEqual([]);
  });

  it("returns nothing for a dish we don't have, or an empty query", () => {
    expect(slugs("ofe nsala")).toEqual([]);
    expect(slugs("   ")).toEqual([]);
    expect(slugs("!^$")).toEqual([]);
  });

  it("only suggests searches that find something", () => {
    for (const term of SEARCH_SUGGESTIONS) {
      expect(slugs(term).length, term).toBeGreaterThan(0);
    }
  });

  it("puts card summaries in the index, not whole recipes", () => {
    const { docs } = buildSearchIndex(getAllRecipes());
    expect(Object.keys(docs[0].recipe)).not.toContain("steps");
    expect(docs[0].title).toBe(docs[0].title.toLowerCase());
  });
});
