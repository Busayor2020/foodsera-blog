import { describe, expect, it } from "vitest";

import {
  ContentError,
  getAllRecipes,
  getContentPaths,
  getFeaturedRecipe,
  getOccasions,
  getPopularRecipes,
  getRecipe,
  getRelatedRecipes,
  getRegions,
  getSampleRecipeSlugs,
  toRecipeSummary,
} from "./index";
import { loadContent } from "./load";
import {
  makeFixture,
  recipeFrontmatter,
  type FixtureOptions,
  type FrontmatterInput,
} from "./test-fixture";

/** Loads a fixture and returns the problems it reports, as "file field: message". */
function problemsFor(options: FixtureOptions): string[] {
  try {
    loadContent(makeFixture(options));
  } catch (error) {
    if (error instanceof ContentError) {
      return error.problems.map(
        (p) => `${p.file.split("/").pop()} ${p.field ?? ""}: ${p.message}`,
      );
    }
    throw error;
  }
  return [];
}

const one = (
  overrides: FrontmatterInput,
  extra: Partial<FixtureOptions> = {},
) =>
  problemsFor({
    recipes: [{ front: recipeFrontmatter("egusi-soup", overrides) }],
    ...extra,
  });

describe("recipe schema", () => {
  it("accepts a complete, valid recipe", () => {
    expect(
      one(
        {
          shortTitle: "Egusi",
          sample: true,
          rating: { value: 4.8, count: 126 },
          tips: [{ kind: "do", text: "Be patient." }],
          nutrition: { calories: 610, protein: "38g", sodium: "980 mg" },
          steps: [
            {
              title: "Fry",
              text: "Fry the lumps.",
              short: "Fry.",
              image: "/images/recipes/egusi-soup/step-1.svg",
              imageAlt: "Lumps frying",
              caption: "Do not stir.",
            },
          ],
        },
        { images: ["/images/recipes/egusi-soup/step-1.svg"] },
      ),
    ).toEqual([]);
  });

  it("allows a rating only on sample recipes", () => {
    expect(one({ rating: { value: 4.8, count: 126 } })).toContain(
      "egusi-soup.md rating: is only allowed on sample: true recipes. Real ratings come from reader reviews",
    );
    expect(one({ sample: true, rating: { value: 4.8, count: 126 } })).toEqual([]);
  });

  it("accepts seoTitle, heroCaption, serveWithIntro, notes and nutritionNote", () => {
    const options = makeFixture({
      recipes: [
        {
          front: recipeFrontmatter("egusi-soup", {
            seoTitle: "Egusi Soup Recipe (Nigerian Melon Seed Soup)",
            heroCaption: "Party-style egusi.",
            serveWithIntro: "Egusi needs a swallow.",
            notes: ["No bitterleaf? Leave it out."],
            nutritionNote: "estimated, per serving",
          }),
        },
      ],
    });
    const recipe = getRecipe("egusi-soup", options);
    expect(recipe?.seoTitle).toBe("Egusi Soup Recipe (Nigerian Melon Seed Soup)");
    expect(recipe?.notes).toEqual(["No bitterleaf? Leave it out."]);
    expect(getRecipe("egusi-soup", makeFixture({ recipes: [{ front: recipeFrontmatter("egusi-soup") }] }))?.notes).toEqual([]);
  });

  it("limits seoTitle to 70 characters", () => {
    expect(one({ seoTitle: "x".repeat(71) })).toContain(
      "egusi-soup.md seoTitle: must be 70 characters or fewer",
    );
  });

  it("makes rating optional", () => {
    const options = makeFixture({
      recipes: [{ front: recipeFrontmatter("egusi-soup") }],
    });
    expect(getRecipe("egusi-soup", options)?.rating).toBeUndefined();
  });

  it.each<[string, FrontmatterInput, string]>([
    [
      "a wrong difficulty",
      { difficulty: "tricky" },
      "egusi-soup.md difficulty:",
    ],
    ["a missing title", { title: undefined }, "egusi-soup.md title:"],
    [
      "an empty description",
      { description: "  " },
      "egusi-soup.md description: must not be empty",
    ],
    ["zero servings", { servings: 0 }, "egusi-soup.md servings:"],
    [
      "a rating above 5",
      { rating: { value: 5.5, count: 3 } },
      "egusi-soup.md rating.value:",
    ],
    [
      "a fractional review count",
      { rating: { value: 4, count: 2.5 } },
      "egusi-soup.md rating.count:",
    ],
    [
      "a bad date",
      { publishedAt: "1 Oct 2026" },
      "egusi-soup.md publishedAt: must be a date like 2026-10-01",
    ],
    [
      "an impossible date",
      { publishedAt: "2026-02-31", updatedAt: "2026-03-01" },
      "egusi-soup.md publishedAt: is not a real date",
    ],
    [
      "updatedAt before publishedAt",
      { publishedAt: "2026-10-05", updatedAt: "2026-10-01" },
      "egusi-soup.md updatedAt: must not be earlier than publishedAt",
    ],
    ["an unknown key", { calories: 400 }, "egusi-soup.md : Unrecognized key"],
    [
      "a hero outside /images",
      { heroImage: "hero.jpg" },
      "egusi-soup.md heroImage: must be a path under /images/",
    ],
    [
      "a bad tip kind",
      { tips: [{ kind: "maybe", text: "x" }] },
      "egusi-soup.md tips[0].kind:",
    ],
    [
      "a badly written nutrient",
      { nutrition: { protein: "lots" } },
      'egusi-soup.md nutrition.protein: must look like "38g"',
    ],
  ])("rejects %s, naming the file and field", (_, overrides, expected) => {
    const problems = one(overrides);
    expect(problems.some((p) => p.startsWith(expected))).toBe(true);
  });

  it("requires alt text when a step has an image", () => {
    const problems = one(
      {
        steps: [
          {
            title: "Fry",
            text: "Fry.",
            short: "Fry.",
            image: "/images/recipes/egusi-soup/s.svg",
          },
        ],
      },
      { images: ["/images/recipes/egusi-soup/s.svg"] },
    );
    expect(problems).toContain(
      "egusi-soup.md steps[0].imageAlt: is required when there is an image",
    );
  });

  it("requires both US and metric amounts, or neither", () => {
    const problems = one({
      ingredients: [
        { items: [{ name: "egusi", us: { qty: 2, unit: "cups" } }] },
      ],
    });
    expect(problems).toContain(
      "egusi-soup.md ingredients[0].items[0].metric: give both us and metric amounts, or neither",
    );
  });

  it("accepts unquoted YAML dates", () => {
    const options = makeFixture({
      recipes: [
        {
          front: recipeFrontmatter("egusi-soup"),
          raw: `---\n${JSON.stringify(recipeFrontmatter("egusi-soup")).replace(
            '"publishedAt":"2026-10-01"',
            '"publishedAt":2026-10-01',
          )}\n---\nIntro.`,
        },
      ],
    });
    expect(getRecipe("egusi-soup", options)?.publishedAt).toBe("2026-10-01");
  });

  it("lists every problem in one error, grouped by file", () => {
    let message = "";
    try {
      loadContent(
        makeFixture({
          recipes: [
            { front: recipeFrontmatter("egusi-soup", { region: "yorba" }) },
            { front: recipeFrontmatter("jollof-rice", { difficulty: "x" }) },
          ],
        }),
      );
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/^Invalid content \(2 problems\)/);
    expect(message).toContain(
      'content/recipes/egusi-soup.md\n    region: unknown region "yorba"',
    );
    expect(message).toContain(
      "content/recipes/jollof-rice.md\n    difficulty:",
    );
  });
});

describe("slugs and references", () => {
  it("requires the slug to match the file name", () => {
    expect(
      problemsFor({
        recipes: [{ file: "egusi", front: recipeFrontmatter("egusi-soup") }],
      }),
    ).toContain(
      'egusi.md slug: "egusi-soup" must match the file name "egusi.md"',
    );
  });

  it.each(["Egusi-Soup", "egusi_soup", "ẹfọ-riro", "egusi--soup", "-egusi"])(
    "rejects the slug %s",
    (slug) => {
      const problems = problemsFor({
        recipes: [{ file: "x", front: recipeFrontmatter("x", { slug }) }],
      });
      expect(
        problems.some((p) =>
          p.startsWith("x.md slug: must be lowercase ASCII kebab-case"),
        ),
      ).toBe(true);
    },
  );

  it("rejects unknown categories, regions and occasions", () => {
    const problems = one({
      category: "pastries",
      region: "lagos",
      occasions: ["party", "eid"],
    });
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^egusi-soup.md category: unknown category "pastries"/,
        ),
        expect.stringMatching(/^egusi-soup.md region: unknown region "lagos"/),
        expect.stringMatching(
          /^egusi-soup.md occasions\[1\]: unknown occasion "eid"/,
        ),
      ]),
    );
  });

  it("rejects duplicate term slugs", () => {
    const problems = problemsFor({
      recipes: [],
      terms: {
        regions: [
          { slug: "edo", name: "Edo" },
          { slug: "edo", name: "Edo again" },
        ],
      },
    });
    expect(problems).toContain('regions.json [1].slug: "edo" is used twice');
  });

  it("reports image files that don't exist in public/", () => {
    const problems = one({
      steps: [
        {
          title: "a",
          text: "b",
          short: "c",
          image: "/images/x/nope.svg",
          imageAlt: "d",
        },
      ],
      serveWith: [
        { name: "Eba", image: "/images/sides/eba.svg", imageAlt: "Eba" },
      ],
    });
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^egusi-soup.md steps\[0\].image: file not found: .*public\/images\/x\/nope.svg$/,
        ),
        expect.stringMatching(
          /^egusi-soup.md serveWith\[0\].image: file not found/,
        ),
      ]),
    );
  });

  it("checks serve-with recipe links", () => {
    const problems = one({ serveWith: [{ name: "Eba", recipe: "eba" }] });
    expect(problems).toContain(
      'egusi-soup.md serveWith[0].recipe: no recipe with slug "eba"',
    );
  });

  it("allows only one featured recipe", () => {
    const problems = problemsFor({
      recipes: [
        { front: recipeFrontmatter("egusi-soup", { featured: true }) },
        { front: recipeFrontmatter("jollof-rice", { featured: true }) },
      ],
    });
    expect(
      problems.filter((p) =>
        p.includes("featured: only one recipe can be featured"),
      ),
    ).toHaveLength(2);
  });

  it("returns undefined for an unknown recipe slug", () => {
    const options = makeFixture({
      recipes: [{ front: recipeFrontmatter("egusi-soup") }],
    });
    expect(getRecipe("nope", options)).toBeUndefined();
    expect(getRecipe("egusi-soup", options)?.slug).toBe("egusi-soup");
  });
});

describe("intro Markdown", () => {
  const withBody = (body: string, recipes = ["egusi-soup"]) =>
    problemsFor({
      recipes: recipes.map((slug, i) => ({
        front: recipeFrontmatter(slug),
        body: i === 0 ? body : "Intro.",
      })),
    });

  it("renders Markdown to HTML, including links between recipes", () => {
    const options = makeFixture({
      recipes: [
        {
          front: recipeFrontmatter("egusi-soup"),
          body: "Serve with [jollof](/recipes/jollof-rice).",
        },
        { front: recipeFrontmatter("jollof-rice") },
      ],
    });
    expect(getRecipe("egusi-soup", options)?.introHtml).toBe(
      '<p>Serve with <a href="/recipes/jollof-rice">jollof</a>.</p>\n',
    );
  });

  it("rejects links to recipes that don't exist", () => {
    expect(withBody("Try [moi moi](/recipes/moi-moi).")).toContain(
      "egusi-soup.md intro: links to /recipes/moi-moi, but there is no recipe with that slug",
    );
  });

  it("doesn't report links to a recipe that has its own errors", () => {
    const problems = problemsFor({
      recipes: [
        {
          front: recipeFrontmatter("egusi-soup"),
          body: "Serve with [jollof](/recipes/jollof-rice).",
        },
        { front: recipeFrontmatter("jollof-rice", { difficulty: "x" }) },
      ],
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^jollof-rice.md difficulty:/);
  });

  it("rejects raw HTML", () => {
    expect(
      withBody("Hello <script>alert(1)</script>").some((p) =>
        p.startsWith("egusi-soup.md intro: raw HTML is not allowed"),
      ),
    ).toBe(true);
  });

  it("requires an intro", () => {
    expect(withBody("   ")).toContain(
      "egusi-soup.md intro: the Markdown intro below the frontmatter must not be empty",
    );
  });
});

describe("text normalisation", () => {
  it("stores every string in NFC", () => {
    // "Ẹ̀fọ́" typed with combining marks (NFD).
    const decomposed = "Ẹ̀fọ́ riro";
    const options = makeFixture({
      recipes: [
        {
          front: recipeFrontmatter("efo-riro", {
            title: decomposed,
            ingredientsExplained: [
              { local: decomposed, meaning: "A spinach stew" },
            ],
          }),
          body: decomposed,
        },
      ],
    });
    const recipe = getRecipe("efo-riro", options);
    expect(recipe?.title).toBe(decomposed.normalize("NFC"));
    expect(recipe?.title).not.toBe(decomposed);
    expect(recipe?.ingredientsExplained[0].local).toBe(
      decomposed.normalize("NFC"),
    );
    expect(recipe?.introHtml).toContain(decomposed.normalize("NFC"));
  });
});

describe("loaders", () => {
  const content = makeFixture({
    recipes: [
      {
        front: recipeFrontmatter("old-rated", {
          publishedAt: "2026-01-01",
          updatedAt: "2026-01-01",
          sample: true,
          rating: { value: 4.8, count: 126 },
        }),
      },
      {
        front: recipeFrontmatter("few-reviews", {
          publishedAt: "2026-02-01",
          updatedAt: "2026-02-01",
          sample: true,
          rating: { value: 5, count: 2 },
        }),
      },
      {
        front: recipeFrontmatter("unrated-new", {
          publishedAt: "2026-09-01",
          updatedAt: "2026-09-01",
        }),
      },
      {
        front: recipeFrontmatter("unrated-featured", {
          publishedAt: "2026-03-01",
          updatedAt: "2026-03-01",
          featured: true,
          sample: true,
        }),
      },
      {
        front: recipeFrontmatter("unrated-old", {
          publishedAt: "2026-02-15",
          updatedAt: "2026-02-15",
          category: "rice-dishes",
        }),
      },
    ],
  });

  it("returns recipes newest first, with resolved terms and total time", () => {
    const recipes = getAllRecipes(content);
    expect(recipes.map((r) => r.slug)).toEqual([
      "unrated-new",
      "unrated-featured",
      "unrated-old",
      "few-reviews",
      "old-rated",
    ]);
    expect(recipes[2].category).toEqual({
      slug: "rice-dishes",
      name: "Rice Dishes",
    });
    expect(recipes[0].totalMinutes).toBe(60);
  });

  it("ranks popular by weighted rating, then featured, then newest", () => {
    expect(getPopularRecipes(10, { content }).map((r) => r.slug)).toEqual([
      "old-rated",
      "few-reviews",
      "unrated-featured",
      "unrated-new",
      "unrated-old",
    ]);
    expect(
      getPopularRecipes(2, { content, exclude: ["old-rated"] }).map(
        (r) => r.slug,
      ),
    ).toEqual(["few-reviews", "unrated-featured"]);
  });

  it("picks the featured recipe, or the newest when none is featured", () => {
    expect(getFeaturedRecipe(content)?.slug).toBe("unrated-featured");
    const noFeature = makeFixture({
      recipes: [
        {
          front: recipeFrontmatter("a", {
            publishedAt: "2026-01-01",
            updatedAt: "2026-01-01",
          }),
        },
        {
          front: recipeFrontmatter("b", {
            publishedAt: "2026-05-01",
            updatedAt: "2026-05-01",
          }),
        },
      ],
    });
    expect(getFeaturedRecipe(noFeature)?.slug).toBe("b");
  });

  it("lists sample recipes", () => {
    expect(getSampleRecipeSlugs(content)).toEqual([
      "unrated-featured",
      "few-reviews",
      "old-rated",
    ]);
  });

  it("makes summaries with only what cards need", () => {
    const recipe = getRecipe("old-rated", content);
    if (!recipe) throw new Error("fixture recipe missing");
    const summary = toRecipeSummary(recipe);
    expect(summary).toEqual({
      slug: "old-rated",
      title: "Recipe old-rated",
      shortTitle: undefined,
      description: "A short description.",
      category: { slug: "soups-and-stews", name: "Soups & Stews" },
      totalMinutes: 60,
      servings: 4,
      difficulty: "easy",
      rating: { value: 4.8, count: 126 },
      heroImage: "/images/recipes/old-rated/hero.svg",
      heroImageAlt: "A pot of soup",
    });
  });

  it("builds every content URL", () => {
    const paths = getContentPaths(content);
    expect(paths.recipes).toContain("/recipes/old-rated");
    expect(paths.categories).toEqual([
      "/category/soups-and-stews",
      "/category/rice-dishes",
    ]);
    expect(paths.regions).toEqual(["/region/yoruba", "/region/igbo"]);
    expect(paths.occasions).toEqual(["/occasion/party", "/occasion/weeknight"]);
  });
});

describe("the real content folder", () => {
  it("is valid", () => {
    expect(() => getAllRecipes()).not.toThrow();
  });
});

describe("the real terms", () => {
  it("match the region values allowed in recipe frontmatter", () => {
    expect(getRegions().map((r) => r.slug)).toEqual([
      "yoruba",
      "igbo",
      "hausa-northern",
      "niger-delta",
      "edo",
      "efik-ibibio",
    ]);
  });

  it("include the occasion slugs listed in CLAUDE.md", () => {
    expect(getOccasions().map((o) => o.slug)).toEqual([
      "party",
      "christmas",
      "sallah",
      "weeknight",
      "lunch-box",
    ]);
  });
});

describe("getRelatedRecipes", () => {
  const content = makeFixture({
    recipes: [
      { front: recipeFrontmatter("egusi-soup") },
      { front: recipeFrontmatter("same-both") },
      {
        front: recipeFrontmatter("same-category", { region: "igbo" }),
      },
      {
        front: recipeFrontmatter("same-region", { category: "rice-dishes" }),
      },
      {
        front: recipeFrontmatter("unrelated", {
          category: "rice-dishes",
          region: "igbo",
        }),
      },
    ],
  });

  it("puts the closest recipes first and leaves out the recipe itself", () => {
    const egusi = getRecipe("egusi-soup", content);
    if (!egusi) throw new Error("fixture recipe missing");
    expect(
      getRelatedRecipes(egusi, 4, { content }).map((r) => r.slug),
    ).toEqual(["same-both", "same-category", "same-region", "unrelated"]);
    expect(getRelatedRecipes(egusi, 2, { content })).toHaveLength(2);
  });
});
