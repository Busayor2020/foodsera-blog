import { describe, expect, it } from "vitest";

import { getCategories, getOccasions, getRegions } from "./taxonomy";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe.each([
  ["categories", getCategories],
  ["regions", getRegions],
  ["occasions", getOccasions],
])("%s", (_, get) => {
  it("has unique, URL-safe slugs and a name for each term", () => {
    const terms = get();
    expect(terms.length).toBeGreaterThan(0);
    expect(new Set(terms.map((t) => t.slug)).size).toBe(terms.length);
    for (const term of terms) {
      expect(term.slug).toMatch(SLUG);
      expect(term.name.trim()).not.toBe("");
    }
  });
});

describe("regions", () => {
  it("matches the region values allowed in recipe frontmatter", () => {
    expect(getRegions().map((r) => r.slug)).toEqual([
      "yoruba",
      "igbo",
      "hausa-northern",
      "niger-delta",
      "edo",
      "efik-ibibio",
    ]);
  });
});
