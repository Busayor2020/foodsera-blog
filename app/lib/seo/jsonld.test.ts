import { describe, expect, it } from "vitest";
import { z } from "zod";

import { getAllRecipes, getRecipe } from "~/lib/content";
import type { Recipe } from "~/lib/content/types";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  breadcrumbJsonLd,
  organizationJsonLd,
  recipeJsonLd,
  recipeTitle,
  websiteJsonLd,
} from "./jsonld";

// Google's Recipe structured-data rules, as a schema:
// https://developers.google.com/search/docs/appearance/structured-data/recipe
// Required: name and image. Everything else listed is "recommended", and we
// treat it as required so rich results stay eligible.

const absoluteUrl = z.string().regex(/^https:\/\/foodsera\.com\/\S*$/);
const isoDuration = z
  .string()
  .regex(/^PT(?:\d+H)?(?:\d+M)?$/)
  .refine((d) => d !== "PT", "empty duration");
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-][\d:]+)?)?$/);
// Google lists BMP, GIF, JPEG, PNG, WebP, SVG and AVIF as image formats.
const imageUrl = absoluteUrl.regex(/\.(?:bmp|gif|jpe?g|png|webp|svg|avif)$/);

const googleRecipe = z
  .object({
    "@context": z.literal("https://schema.org"),
    "@type": z.literal("Recipe"),
    name: z.string().min(1),
    image: z.array(imageUrl).min(1),
    description: z.string().min(1),
    author: z.object({
      "@type": z.enum(["Person", "Organization"]),
      name: z.string().min(1),
      url: absoluteUrl.optional(),
    }),
    datePublished: isoDate,
    dateModified: isoDate.optional(),
    prepTime: isoDuration,
    cookTime: isoDuration,
    totalTime: isoDuration,
    recipeYield: z.union([z.string().min(1), z.number().positive()]),
    recipeCategory: z.string().min(1),
    recipeCuisine: z.string().min(1),
    keywords: z.string().min(1),
    recipeIngredient: z.array(z.string().min(1)).min(1),
    recipeInstructions: z
      .array(
        z.object({
          "@type": z.literal("HowToStep"),
          text: z.string().min(1),
          name: z.string().min(1).optional(),
          url: absoluteUrl.optional(),
          image: imageUrl.optional(),
        }),
      )
      .min(1),
    nutrition: z
      .object({
        "@type": z.literal("NutritionInformation"),
        calories: z.string().regex(/^\d+ calories$/),
      })
      .catchall(z.string().regex(/^\d+(?:\.\d+)? (?:g|mg)$/))
      .optional(),
    suitableForDiet: z.string().url().optional(),
    aggregateRating: z
      .object({
        "@type": z.literal("AggregateRating"),
        ratingValue: z.number().min(1).max(5),
        ratingCount: z.number().int().positive(),
      })
      .optional(),
  })
  .strict();

const googleBreadcrumbs = z.object({
  "@context": z.literal("https://schema.org"),
  "@type": z.literal("BreadcrumbList"),
  itemListElement: z
    .array(
      z.object({
        "@type": z.literal("ListItem"),
        position: z.number().int().positive(),
        name: z.string().min(1),
        item: absoluteUrl.optional(),
      }),
    )
    .min(1),
});

function requireRecipe(slug: string): Recipe {
  const recipe = getRecipe(slug);
  if (!recipe) throw new Error(`missing sample recipe ${slug}`);
  return recipe;
}

describe("recipeJsonLd", () => {
  it.each(getAllRecipes().map((r) => [r.slug, r] as const))(
    "%s meets Google's Recipe requirements",
    (_, recipe) => {
      const result = googleRecipe.safeParse(recipeJsonLd(recipe));
      expect(result.error?.issues ?? []).toEqual([]);
    },
  );

  it("describes egusi soup correctly", () => {
    const data = recipeJsonLd(requireRecipe("egusi-soup"));
    expect(data).toMatchObject({
      name: "Egusi Soup with Ugu and Assorted Meat",
      image: ["https://foodsera.com/images/recipes/egusi-soup/hero.svg"],
      author: { "@type": "Organization", name: "Foodsera Kitchen" },
      prepTime: "PT25M",
      cookTime: "PT55M",
      totalTime: "PT1H20M",
      recipeYield: "6",
      recipeCuisine: "Nigerian",
      nutrition: { calories: "610 calories", proteinContent: "38 g" },
    });
    const ingredients = data.recipeIngredient as string[];
    expect(ingredients[0]).toBe("2 cups (250 g) ground egusi (melon seeds)");
    expect(ingredients).toContain("Salt, to taste");
    const steps = data.recipeInstructions as Record<string, string>[];
    expect(steps).toHaveLength(8);
    expect(steps[4]).toMatchObject({
      name: "Fry the egusi into lumps",
      url: "https://foodsera.com/recipes/egusi-soup#step-5",
      image: "https://foodsera.com/images/recipes/egusi-soup/step-5.svg",
    });
  });

  it("never outputs the frontmatter rating", () => {
    for (const recipe of getAllRecipes()) {
      expect(recipe.rating).toBeDefined();
      expect(recipeJsonLd(recipe)).not.toHaveProperty("aggregateRating");
    }
  });

  it("never outputs aggregateRating for a sample recipe, even with reviews", () => {
    const sample = requireRecipe("egusi-soup");
    expect(
      recipeJsonLd(sample, { reviews: { value: 4.5, count: 10 } }),
    ).not.toHaveProperty("aggregateRating");
  });

  it("outputs aggregateRating from genuine reviews on a real recipe", () => {
    const real = {
      ...requireRecipe("egusi-soup"),
      sample: false,
      rating: undefined,
    };
    const data = recipeJsonLd(real, { reviews: { value: 4.5, count: 10 } });
    expect(googleRecipe.safeParse(data).success).toBe(true);
    expect(data.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      ratingCount: 10,
    });
    expect(
      recipeJsonLd(real, { reviews: { value: 0, count: 0 } }),
    ).not.toHaveProperty("aggregateRating");
  });

  it("marks vegetarian recipes", () => {
    expect(recipeJsonLd(requireRecipe("puff-puff")).suitableForDiet).toBe(
      "https://schema.org/VegetarianDiet",
    );
    expect(recipeJsonLd(requireRecipe("egusi-soup"))).not.toHaveProperty(
      "suitableForDiet",
    );
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers the crumbs and links all but the current page", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Soups & Stews", path: "/category/soups-and-stews" },
      { name: "Egusi Soup" },
    ]);
    expect(googleBreadcrumbs.safeParse(data).success).toBe(true);
    expect(data.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://foodsera.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Soups & Stews",
        item: "https://foodsera.com/category/soups-and-stews",
      },
      { "@type": "ListItem", position: 3, name: "Egusi Soup" },
    ]);
  });
});

describe("recipeTitle", () => {
  it("defaults to '{short title} Recipe | Foodsera'", () => {
    expect(recipeTitle(requireRecipe("egusi-soup"))).toBe(
      "Egusi Soup Recipe | Foodsera",
    );
    expect(recipeTitle(requireRecipe("puff-puff"))).toBe(
      "Soft Puff-Puff Recipe | Foodsera",
    );
  });

  it("uses seoTitle when set", () => {
    const recipe = {
      ...requireRecipe("egusi-soup"),
      seoTitle: "Egusi Soup (Melon Seed Soup)",
    };
    expect(recipeTitle(recipe)).toBe("Egusi Soup (Melon Seed Soup)");
  });

  it("gives every recipe a different title", () => {
    const titles = getAllRecipes().map(recipeTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("organizationJsonLd", () => {
  it("names Foodsera with its PNG logo", () => {
    const data = organizationJsonLd([]);
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://foodsera.com/#organization",
      name: "Foodsera",
      url: "https://foodsera.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://foodsera.com/logo.png",
        width: 512,
        height: 512,
      },
    });
  });

  it("lists only social links that have a URL", () => {
    const data = organizationJsonLd([
      { href: "https://instagram.com/foodsera" },
      { href: "" },
    ]);
    expect(data.sameAs).toEqual(["https://instagram.com/foodsera"]);
    expect(organizationJsonLd()).not.toHaveProperty("sameAs");
  });

  it("points at a logo file that exists and is at least 112px square", () => {
    const png = readFileSync(join(process.cwd(), "public", "logo.png"));
    // PNG width and height live at bytes 16 and 20 of the IHDR chunk.
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(112);
    expect(png.readUInt32BE(20)).toBe(png.readUInt32BE(16));
  });
});

describe("websiteJsonLd", () => {
  it("describes the site and links it to the organization", () => {
    expect(websiteJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://foodsera.com/#website",
      name: "Foodsera",
      url: "https://foodsera.com/",
      inLanguage: "en",
      publisher: { "@id": "https://foodsera.com/#organization" },
    });
  });
});
