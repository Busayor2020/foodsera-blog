import { AdPosition } from "~/components/ads/AdPosition";
import {
  CategoryTiles,
  type CategoryTile,
} from "~/components/home/CategoryTiles";
import { HomeHero } from "~/components/home/HomeHero";
import { HomeSection } from "~/components/home/HomeSection";
import { NewsletterBand } from "~/components/home/NewsletterBand";
import { RecipeGrid } from "~/components/home/RecipeGrid";
import { RegionTiles, type RegionTile } from "~/components/home/RegionTiles";
import {
  getCategories,
  getFeaturedRecipe,
  getPopularRecipes,
  getQuickRecipes,
  getRegions,
  QUICK_MINUTES,
  toRecipeSummary,
} from "~/lib/content";
import { recipeIndexPath } from "~/lib/paths";
import { organizationJsonLd, websiteJsonLd } from "~/lib/seo/jsonld";
import { pageMeta } from "~/lib/seo/meta";
import { SITE_TAGLINE } from "~/lib/site";

import type { Route } from "./+types/home";

export const HOME_TITLE = "Nigerian Recipes, Step by Step | Foodsera";
const POPULAR_LIMIT = 8;
const QUICK_LIMIT = 4;
/** The in-feed ad position goes after this many Popular cards (as in the design). */
const POPULAR_INFEED_AFTER = 5;

export function loader() {
  const featured = getFeaturedRecipe();
  const exclude = featured ? [featured.slug] : [];
  return {
    featured: featured && {
      ...toRecipeSummary(featured),
      teaser: featured.teaser ?? featured.description,
    },
    popular: getPopularRecipes(POPULAR_LIMIT, { exclude }).map(toRecipeSummary),
    quick: getQuickRecipes(QUICK_LIMIT, { exclude }).map(toRecipeSummary),
    // Only what the tiles show, not each term's page intro.
    categories: getCategories().map(
      ({ slug, name, image, imageAlt }): CategoryTile => ({
        slug,
        name,
        image,
        imageAlt,
      }),
    ),
    regions: getRegions().map(({ slug, name, dishes }): RegionTile => ({
      slug,
      name,
      dishes,
    })),
  };
}

export const handle = { ads: true };

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: HOME_TITLE,
      description: SITE_TAGLINE,
      path: "/",
      image: loaderData?.featured?.heroImage,
      imageAlt: loaderData?.featured?.heroImageAlt,
    }),
    { "script:ld+json": websiteJsonLd() },
    { "script:ld+json": organizationJsonLd() },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, popular, quick, categories, regions } = loaderData;

  // Each section hides itself when it has nothing to show, and the ad
  // position after a section only appears with it, so two ads can never meet.
  return (
    <div className="flex flex-col gap-14 pb-18">
      {featured ? (
        <>
          <HomeHero recipe={featured} />
          <div className="-mt-4">
            <AdPosition name="home-after-hero" />
          </div>
        </>
      ) : (
        <h1 className="sr-only">Foodsera: Nigerian recipes, step by step</h1>
      )}

      {popular.length > 0 && (
        <>
          <HomeSection
            id="popular"
            title="Popular right now"
            more={{ label: "See all recipes", href: recipeIndexPath }}
          >
            <RecipeGrid
              recipes={popular}
              minCard={260}
              inFeed={{
                after: POPULAR_INFEED_AFTER,
                name: "home-popular-infeed",
              }}
            />
          </HomeSection>
          <AdPosition name="home-after-popular" />
        </>
      )}

      {categories.length > 0 && (
        <HomeSection id="cats" title="Browse by category">
          <CategoryTiles categories={categories} />
        </HomeSection>
      )}

      {regions.length > 0 && (
        <>
          <HomeSection
            id="regions"
            title="Browse by region"
            intro="Every part of Nigeria cooks differently. Find the dishes from home."
          >
            <RegionTiles regions={regions} />
          </HomeSection>
          <AdPosition name="home-after-regions" />
        </>
      )}

      {quick.length > 0 && (
        <HomeSection
          id="quick"
          title={`Quick and easy, under ${QUICK_MINUTES} minutes`}
          intro="For busy weeknights and hungry children."
          more={{
            label: "More quick recipes",
            href: `${recipeIndexPath}?time=${QUICK_MINUTES}`,
          }}
        >
          <RecipeGrid recipes={quick} minCard={240} />
        </HomeSection>
      )}

      <NewsletterBand />
    </div>
  );
}
