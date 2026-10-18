import { data, isRouteErrorResponse } from "react-router";

import { AdPosition } from "~/components/ads/AdPosition";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { Sidebar } from "~/components/layout/Sidebar";
import { FaqAccordion } from "~/components/recipe/FaqAccordion";
import { IngredientsExplained } from "~/components/recipe/IngredientsExplained";
import { QuickFacts } from "~/components/recipe/QuickFacts";
import { RecipeActions } from "~/components/recipe/RecipeActions";
import { RecipeCardFull } from "~/components/recipe/RecipeCardFull";
import { RecipeHeader } from "~/components/recipe/RecipeHeader";
import { RecipeIntro } from "~/components/recipe/RecipeIntro";
import { RelatedRecipes } from "~/components/recipe/RelatedRecipes";
import { Reviews } from "~/components/recipe/Reviews";
import { ServeWith } from "~/components/recipe/ServeWith";
import { ServingsProvider } from "~/components/recipe/servings";
import { StepList } from "~/components/recipe/StepList";
import { TipsBox } from "~/components/recipe/TipsBox";
import {
  getPopularRecipes,
  getRecipe,
  getRelatedRecipes,
  toRecipeSummary,
} from "~/lib/content";
import type { Recipe } from "~/lib/content/types";
import { RECIPE_HERO } from "~/lib/images";
import { categoryPath, recipePath } from "~/lib/paths";
import { breadcrumbJsonLd, recipeJsonLd, recipeTitle } from "~/lib/seo/jsonld";
import { absoluteUrl, pageMeta } from "~/lib/seo/meta";

import type { Route } from "./+types/recipe";
import NotFound from "./404";

export function loader({ params }: Route.LoaderArgs) {
  const recipe = getRecipe(params.slug);
  if (!recipe) throw data("Recipe not found", { status: 404 });
  return {
    recipe,
    related: getRelatedRecipes(recipe, 4).map(toRecipeSummary),
    popular: getPopularRecipes(5, { exclude: [recipe.slug] }).map(
      toRecipeSummary,
    ),
  };
}

export const handle = {
  ads: true,
  /** Underlines the recipe's category in the header nav. */
  navSection: (loaderData: unknown) =>
    (loaderData as { recipe?: Recipe } | undefined)?.recipe?.category.slug,
};

function crumbs(recipe: Recipe) {
  return [
    { name: "Home", path: "/" },
    { name: recipe.category.name, path: categoryPath(recipe.category.slug) },
    { name: recipe.shortTitle ?? recipe.title },
  ];
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Recipe not found | Foodsera" }];
  const { recipe } = loaderData;
  return [
    ...pageMeta({
      title: recipeTitle(recipe),
      description: recipe.description,
      path: recipePath(recipe.slug),
      image: recipe.heroImage,
      imageAlt: recipe.heroImageAlt,
      type: "article",
    }),
    { "script:ld+json": recipeJsonLd(recipe) },
    { "script:ld+json": breadcrumbJsonLd(crumbs(recipe)) },
  ];
}

export default function RecipePage({ loaderData }: Route.ComponentProps) {
  const { recipe, related, popular } = loaderData;
  const name = recipe.shortTitle ?? recipe.title;
  const url = absoluteUrl(recipePath(recipe.slug));

  return (
    <ServingsProvider key={recipe.slug} base={recipe.servings}>
      <div className="mx-auto max-w-page px-5 pt-5 pb-18 leading-[1.65] print:p-0">
        <Breadcrumbs
          className="mb-5 print:hidden"
          items={crumbs(recipe).map((c) => ({ label: c.name, href: c.path }))}
        />
        <div className="flex flex-wrap items-stretch gap-12">
          <article className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
            <div className="flex flex-col gap-8 print:hidden">
              <RecipeHeader recipe={recipe} />
              <QuickFacts recipe={recipe} />
              <RecipeActions />
              <figure className="flex flex-col gap-2">
                <img
                  src={recipe.heroImage}
                  alt={recipe.heroImageAlt}
                  width={RECIPE_HERO.width}
                  height={RECIPE_HERO.height}
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-3/2 w-full rounded-panel object-cover"
                />
                {recipe.heroCaption && (
                  <figcaption className="text-sm text-muted">
                    {recipe.heroCaption}
                  </figcaption>
                )}
              </figure>
              <AdPosition name="recipe-after-hero" />
              <RecipeIntro html={recipe.introHtml} />
              <IngredientsExplained items={recipe.ingredientsExplained} />
              <AdPosition name="recipe-after-explained" />
              <StepList
                heading={`How to make ${name.toLowerCase()}, step by step`}
                steps={recipe.steps}
              />
              <TipsBox tips={recipe.tips} />
              <AdPosition name="recipe-before-card" />
            </div>

            <RecipeCardFull recipe={recipe} url={url} />

            <div className="flex flex-col gap-8 print:hidden">
              <AdPosition name="recipe-after-card" />
              <ServeWith
                intro={recipe.serveWithIntro}
                items={recipe.serveWith}
              />
              <FaqAccordion heading={`${name} questions`} faqs={recipe.faqs} />
              <Reviews recipe={recipe} />
              <RelatedRecipes recipes={related} />
              <AdPosition name="recipe-multiplex" />
            </div>
          </article>
          <Sidebar popular={popular} />
        </div>
      </div>
      <AdPosition name="recipe-anchor" />
    </ServingsProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return (
    <div className="mx-auto max-w-narrow px-5 py-14">
      <h1 className="text-display">This recipe didn't load</h1>
      <p className="mt-4 text-lead text-ink-soft">
        Sorry, something went wrong. Try again in a moment.
      </p>
    </div>
  );
}
