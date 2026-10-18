import { AdPosition } from "~/components/ads/AdPosition";
import { RecipeGrid } from "~/components/home/RecipeGrid";
import { Breadcrumbs } from "~/components/layout/Breadcrumbs";
import { TermSidebar } from "~/components/layout/Sidebar";
import type { TermPageData } from "~/lib/content/types";
import { RECIPE_HERO } from "~/lib/images";
import { termCrumbs } from "~/lib/term-page";

import { FilteredRecipes } from "./FilteredRecipes";

const SIDEBAR_POPULAR = 4;

/**
 * A category, region or occasion page, from design/Category.dc.html. Thin
 * pages (too few recipes to index) skip the filters and ads, and point to
 * popular recipes instead.
 */
export function TermPage({ page }: { page: TermPageData }) {
  const { term, recipes, thin } = page;
  const ads = !thin;
  const photos = recipes.slice(0, 2);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-7 px-5 pt-5 pb-18">
      <Breadcrumbs
        items={termCrumbs(page).map((c) => ({ label: c.name, href: c.path }))}
      />

      <header className="flex flex-wrap items-center gap-x-10 gap-y-5">
        <div className="flex flex-[1_1_480px] flex-col gap-3">
          <h1 className="text-term">{term.name}</h1>
          <p className="max-w-160 text-lg text-ink-soft">{term.intro}</p>
        </div>
        {photos.length === 2 && (
          <div
            aria-hidden="true"
            className="flex flex-[0_1_300px] items-start gap-2.5"
          >
            {photos.map((recipe, i) => (
              <img
                key={recipe.slug}
                src={recipe.heroImage}
                alt=""
                width={RECIPE_HERO.width}
                height={RECIPE_HERO.height}
                decoding="async"
                className={`aspect-square min-w-0 flex-1 rounded-full object-cover ${i === 1 ? "mt-7" : ""}`}
              />
            ))}
          </div>
        )}
      </header>

      {ads && <AdPosition name="term-after-intro" />}

      <div className="flex flex-wrap items-stretch gap-12">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          {thin ? (
            <ThinTermRecipes page={page} />
          ) : (
            <FilteredRecipes page={page} />
          )}
        </div>
        <TermSidebar
          popular={thin ? [] : recipes.slice(0, SIDEBAR_POPULAR)}
          ads={ads}
        />
      </div>
    </div>
  );
}

/** A page with fewer than 3 recipes: what there is, then popular recipes. */
function ThinTermRecipes({ page }: { page: TermPageData }) {
  return (
    <>
      {page.recipes.length > 0 && (
        <>
          <h2 className="sr-only">{page.term.name} recipes</h2>
          <RecipeGrid recipes={page.recipes} minCard={240} />
        </>
      )}
      <section
        aria-labelledby="on-the-way"
        className="flex flex-col gap-6 rounded-panel border border-dashed border-line-strong bg-paper p-[clamp(20px,4vw,32px)]"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 id="on-the-way" className="text-2xl">
            More recipes are on the way
          </h2>
          <p className="max-w-prose text-muted">
            We're still cooking and testing recipes for this page. Until they're
            ready, try one of our most popular dishes.
          </p>
        </div>
        {page.more.length > 0 && (
          <RecipeGrid recipes={page.more} minCard={240} />
        )}
      </section>
    </>
  );
}
