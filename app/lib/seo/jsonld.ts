import type { Recipe } from "~/lib/content/types";
import { toIsoDuration } from "~/lib/format/duration";
import { ingredientForSchema } from "~/lib/format/quantity";
import { recipePath } from "~/lib/paths";
import { SITE_NAME, SITE_URL, SOCIAL_LINKS } from "~/lib/site";

import { absoluteUrl } from "./meta";

export type JsonLd = { [key: string]: JsonLdValue };
type JsonLdValue = string | number | boolean | null | JsonLd | JsonLdValue[];

/** The title tag for a recipe page: "Egusi Soup Recipe | Foodsera". */
export function recipeTitle(recipe: Recipe): string {
  return (
    recipe.seoTitle ??
    `${recipe.shortTitle ?? recipe.title} Recipe | ${SITE_NAME}`
  );
}

/** Totals from genuine reader reviews. Nothing supplies this until the reviews backend exists. */
export interface ReviewTotals {
  value: number;
  count: number;
}

const NUTRIENTS = [
  ["protein", "proteinContent"],
  ["fat", "fatContent"],
  ["carbs", "carbohydrateContent"],
  ["fibre", "fiberContent"],
  ["sodium", "sodiumContent"],
] as const;

/** "38g" -> "38 g", as Google's examples write nutrient amounts. */
const spaced = (amount: string) => amount.replace(/^([\d.]+)\s*/, "$1 ");

/**
 * schema.org Recipe for Google's recipe rich results. aggregateRating is only
 * added from genuine reader reviews, and never for sample recipes; the
 * frontmatter rating is never used (see CLAUDE.md, SEO).
 */
export function recipeJsonLd(
  recipe: Recipe,
  { reviews }: { reviews?: ReviewTotals } = {},
): JsonLd {
  const url = absoluteUrl(recipePath(recipe.slug));
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: [absoluteUrl(recipe.heroImage)],
    author: {
      "@type": "Organization",
      name: recipe.author,
      url: `${SITE_URL}/about`,
    },
    datePublished: recipe.publishedAt,
    dateModified: recipe.updatedAt,
    prepTime: toIsoDuration(recipe.prepMinutes),
    cookTime: toIsoDuration(recipe.cookMinutes),
    totalTime: toIsoDuration(recipe.totalMinutes),
    recipeYield: String(recipe.servings),
    recipeCategory: recipe.category.name,
    recipeCuisine: "Nigerian",
    keywords: [
      recipe.category.name,
      recipe.region.name,
      ...recipe.occasions.map((o) => o.name),
    ].join(", "),
    recipeIngredient: recipe.ingredients.flatMap((group) =>
      group.items.map(ingredientForSchema),
    ),
    recipeInstructions: recipe.steps.map((step, i) => {
      const howTo: JsonLd = {
        "@type": "HowToStep",
        name: step.title,
        text: step.text,
        url: `${url}#step-${i + 1}`,
      };
      if (step.image) howTo.image = absoluteUrl(step.image);
      return howTo;
    }),
  };

  if (recipe.vegetarian) {
    data.suitableForDiet = "https://schema.org/VegetarianDiet";
  }

  if (recipe.nutrition) {
    const nutrition: JsonLd = { "@type": "NutritionInformation" };
    if (recipe.nutrition.calories) {
      nutrition.calories = `${recipe.nutrition.calories} calories`;
    }
    for (const [field, property] of NUTRIENTS) {
      const amount = recipe.nutrition[field];
      if (amount) nutrition[property] = spaced(amount);
    }
    data.nutrition = nutrition;
  }

  if (reviews && reviews.count > 0 && !recipe.sample) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.value,
      ratingCount: reviews.count,
    };
  }
  return data;
}

export interface Crumb {
  name: string;
  /** Site path. Leave out for the current page. */
  path?: string;
}

/** schema.org BreadcrumbList for every page below home. */
export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => {
      const item: JsonLd = {
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
      };
      if (crumb.path) item.item = absoluteUrl(crumb.path);
      return item;
    }),
  };
}

/**
 * schema.org ItemList for a page that lists recipes (Google's summary page
 * pattern): each item is just its position and URL.
 */
export function itemListJsonLd(paths: string[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: paths.map((path, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(path),
    })),
  };
}

/** The Organization logo: a 512x512 PNG made by scripts/brand-images.ts. */
export const LOGO = { path: "/logo.png", width: 512, height: 512 };

/** schema.org Organization for the homepage. sameAs lists only configured social links. */
export function organizationJsonLd(
  socialLinks: { href: string }[] = SOCIAL_LINKS,
): JsonLd {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(LOGO.path),
      width: LOGO.width,
      height: LOGO.height,
    },
  };
  const sameAs = socialLinks.map((link) => link.href).filter(Boolean);
  if (sameAs.length > 0) data.sameAs = sameAs;
  return data;
}

/** schema.org WebSite for the homepage. */
export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
