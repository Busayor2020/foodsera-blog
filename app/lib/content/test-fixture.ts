import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import type { LoadOptions } from "./load";

// Builds a throwaway content folder for tests, so each rule can be broken
// on its own.

export type FrontmatterInput = Record<string, unknown>;

export function recipeFrontmatter(
  slug: string,
  overrides: FrontmatterInput = {},
): FrontmatterInput {
  return {
    title: `Recipe ${slug}`,
    slug,
    description: "A short description.",
    category: "soups-and-stews",
    region: "yoruba",
    occasions: ["party"],
    heroImage: `/images/recipes/${slug}/hero.svg`,
    heroImageAlt: "A pot of soup",
    prepMinutes: 20,
    cookMinutes: 40,
    servings: 4,
    difficulty: "easy",
    vegetarian: false,
    author: "Foodsera Kitchen",
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
    ingredients: [
      {
        items: [
          {
            name: "ground egusi",
            us: { qty: 2, unit: "cups" },
            metric: { qty: 250, unit: "g" },
          },
          { name: "Salt, to taste" },
        ],
      },
    ],
    steps: [{ title: "Cook", text: "Cook it well.", short: "Cook it." }],
    ...overrides,
  };
}

export interface FixtureRecipe {
  /** File name without .md. Defaults to the frontmatter slug. */
  file?: string;
  front: FrontmatterInput;
  body?: string;
  /** Raw file contents, used instead of front and body. */
  raw?: string;
}

export interface FixtureOptions {
  recipes: FixtureRecipe[];
  /** Image paths to create under public/. Each recipe's hero is added. */
  images?: string[];
  terms?: Partial<Record<"categories" | "regions" | "occasions", unknown>>;
}

const DEFAULT_TERMS = {
  categories: [
    { slug: "soups-and-stews", name: "Soups & Stews" },
    { slug: "rice-dishes", name: "Rice Dishes" },
  ],
  regions: [
    { slug: "yoruba", name: "Yoruba" },
    { slug: "igbo", name: "Igbo" },
  ],
  occasions: [
    { slug: "party", name: "Owambe and parties" },
    { slug: "weeknight", name: "Weeknight dinners" },
  ],
};

export function makeFixture({
  recipes,
  images = [],
  terms = {},
}: FixtureOptions): LoadOptions {
  const root = mkdtempSync(join(tmpdir(), "foodsera-content-"));
  const contentDir = join(root, "content");
  const publicDir = join(root, "public");
  mkdirSync(join(contentDir, "recipes"), { recursive: true });

  for (const name of ["categories", "regions", "occasions"] as const) {
    writeFileSync(
      join(contentDir, `${name}.json`),
      JSON.stringify(terms[name] ?? DEFAULT_TERMS[name]),
    );
  }

  const imagePaths = new Set(images);
  for (const recipe of recipes) {
    const file = recipe.file ?? String(recipe.front.slug);
    const contents =
      recipe.raw ??
      `---\n${JSON.stringify(recipe.front, null, 2)}\n---\n\n${recipe.body ?? "A short intro story."}\n`;
    writeFileSync(join(contentDir, "recipes", `${file}.md`), contents);
    if (typeof recipe.front.heroImage === "string")
      imagePaths.add(recipe.front.heroImage);
  }
  for (const path of imagePaths) {
    const full = join(publicDir, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, "<svg/>");
  }

  return { contentDir, publicDir };
}
