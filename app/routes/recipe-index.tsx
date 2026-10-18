import { Link, useSearchParams } from "react-router";

import { AdPosition } from "~/components/ads/AdPosition";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { getAllRecipes, getCategories } from "~/lib/content";
import { parseTime } from "~/lib/filters";
import { formatMinutes } from "~/lib/format/duration";
import { foldText } from "~/lib/format/text";
import { useHydrated } from "~/lib/hydrated";
import { categoryPath, recipeIndexPath, recipePath } from "~/lib/paths";
import { keepDataWhenOnlySearchChanges } from "~/lib/revalidate";
import { breadcrumbJsonLd, type Crumb } from "~/lib/seo/jsonld";
import { pageMeta } from "~/lib/seo/meta";

import type { Route } from "./+types/recipe-index";

export const RECIPE_INDEX_TITLE = "Recipe Index A to Z | Foodsera";

const CRUMBS: Crumb[] = [{ name: "Home", path: "/" }, { name: "Recipe index" }];

/** Every recipe, grouped by category (in menu order), A to Z within each. */
export function loader() {
  const recipes = getAllRecipes();
  const groups = getCategories()
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      recipes: recipes
        .filter((r) => r.category.slug === category.slug)
        .map((r) => ({
          slug: r.slug,
          title: r.title,
          totalMinutes: r.totalMinutes,
        }))
        .sort((a, b) =>
          foldText(a.title).localeCompare(foldText(b.title), "en"),
        ),
    }))
    .filter((group) => group.recipes.length > 0);
  return { total: recipes.length, groups };
}

export const handle = { ads: true };

export const shouldRevalidate = keepDataWhenOnlySearchChanges;

export function meta(_: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: RECIPE_INDEX_TITLE,
      description:
        "Every Foodsera recipe in one place, grouped by category and sorted A to Z.",
      path: recipeIndexPath,
    }),
    { "script:ld+json": breadcrumbJsonLd(CRUMBS) },
  ];
}

/** From design/RecipeIndex.dc.html. */
export default function RecipeIndex({ loaderData }: Route.ComponentProps) {
  const hydrated = useHydrated();
  const [searchParams] = useSearchParams();
  // ?time=30 (the homepage's "More quick recipes"). The prerendered HTML
  // always has the full list, so the filter applies after hydration.
  const time = hydrated ? parseTime(searchParams.get("time")) : null;

  const groups = loaderData.groups
    .map((group) => ({
      ...group,
      recipes: time
        ? group.recipes.filter((r) => r.totalMinutes <= time)
        : group.recipes,
    }))
    .filter((group) => group.recipes.length > 0);
  const shown = groups.reduce((sum, g) => sum + g.recipes.length, 0);

  return (
    <div className="mx-auto flex max-w-narrow flex-col gap-9 px-5 pt-8 pb-20">
      <header className="flex flex-col gap-3">
        <Breadcrumbs
          items={CRUMBS.map((c) => ({ label: c.name, href: c.path }))}
        />
        <h1 className="text-display">Every Foodsera recipe, A to Z</h1>
        <p className="max-w-170 text-lg text-ink-soft">
          All {loaderData.total} recipes, grouped by category and sorted
          alphabetically. Jump to a section, or use your browser’s find to look
          for a dish.
        </p>
        {time && (
          <p
            role="status"
            className="rounded-field border border-plantain-line bg-plantain-soft px-4 py-3"
          >
            {shown > 0
              ? `Showing ${shown} recipe${shown === 1 ? "" : "s"} ready in ${time} minutes or less`
              : `No recipes are ready in ${time} minutes or less yet`}{" "}
            ·{" "}
            <Link to={recipeIndexPath} className="font-bold">
              Show all recipes
            </Link>
          </p>
        )}
        {groups.length > 0 && (
          <nav
            aria-label="Jump to category"
            className="mt-1.5 flex flex-wrap gap-2"
          >
            {groups.map((group) => (
              <a
                key={group.slug}
                href={`#cat-${group.slug}`}
                aria-label={`${group.name}, ${group.recipes.length} recipe${group.recipes.length === 1 ? "" : "s"}`}
                className="flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-paper px-4 text-md font-semibold text-charcoal no-underline hover:text-charcoal"
              >
                {group.name}
                <span className="font-medium text-muted">
                  {group.recipes.length}
                </span>
              </a>
            ))}
          </nav>
        )}
      </header>

      {groups.map((group, i) => (
        <section
          key={group.slug}
          id={`cat-${group.slug}`}
          aria-labelledby={`h-${group.slug}`}
          className="flex flex-col gap-3.5"
        >
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-charcoal pb-2">
            <h2 id={`h-${group.slug}`} className="text-3xl">
              {group.name}
            </h2>
            <Link
              to={categoryPath(group.slug)}
              className="flex min-h-11 flex-none items-center text-md font-bold"
            >
              View category<span className="sr-only">: {group.name}</span>
            </Link>
          </div>
          <ul className="columns-[3_240px] gap-x-8">
            {group.recipes.map((recipe) => (
              <li
                key={recipe.slug}
                className="break-inside-avoid border-b border-dashed border-line-dashed"
              >
                <Link
                  to={recipePath(recipe.slug)}
                  className="flex min-h-11.5 items-center justify-between gap-3 no-underline"
                >
                  <span className="font-semibold">{recipe.title}</span>
                  <span className="text-sm whitespace-nowrap text-muted">
                    {formatMinutes(recipe.totalMinutes)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {/* After the second group, only when a third follows. */}
          {i === 1 && groups.length > 2 && (
            <AdPosition name="index-after-second-group" />
          )}
        </section>
      ))}
    </div>
  );
}
