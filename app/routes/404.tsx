import { Form, Link } from "react-router";

import { RecipeCard } from "~/components/recipe/RecipeCard";
import { recipeIndexPath, searchPath } from "~/lib/paths";
import { useSiteData } from "~/lib/site-data";

import type { Route } from "./+types/404";

export const handle = { ads: false };

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Page not found | Foodsera" },
    {
      name: "description",
      content:
        "We could not find that page. Search for a recipe or start from the Foodsera homepage.",
    },
    { name: "robots", content: "noindex" },
  ];
}

function EmptyPot() {
  return (
    <svg width="280" height="220" viewBox="0 0 280 220" className="max-w-full">
      <ellipse
        cx="140"
        cy="200"
        rx="110"
        ry="14"
        className="fill-shadow-soft"
      />
      <path
        d="M40 90h200l-16 86a16 16 0 0 1-16 13H72a16 16 0 0 1-16-13z"
        className="fill-charcoal"
      />
      <rect
        x="26"
        y="78"
        width="228"
        height="22"
        rx="11"
        className="fill-charcoal-soft"
      />
      <rect
        x="8"
        y="84"
        width="30"
        height="10"
        rx="5"
        className="fill-charcoal-soft"
      />
      <rect
        x="242"
        y="84"
        width="30"
        height="10"
        rx="5"
        className="fill-charcoal-soft"
      />
      <text
        x="140"
        y="160"
        textAnchor="middle"
        fontSize="56"
        className="fill-plantain font-serif"
      >
        404
      </text>
      <path
        d="M110 60c-8-12 8-20 0-36M140 60c-8-12 8-20 0-36M170 60c-8-12 8-20 0-36"
        className="stroke-line-strong"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NotFound() {
  const { popular } = useSiteData();
  return (
    <div className="mx-auto flex max-w-narrow flex-col gap-12 px-5 pt-14 pb-22">
      <section className="flex flex-wrap items-center gap-x-14 gap-y-8">
        <div
          aria-hidden="true"
          className="flex flex-[0_1_300px] justify-center"
        >
          <EmptyPot />
        </div>
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-3.5">
          <span className="text-eyebrow font-bold tracking-label text-palm-deep uppercase">
            Error 404
          </span>
          <h1 className="text-display">This pot is empty</h1>
          <p className="text-lead text-ink-soft">
            We could not find that page. It may have moved, or the link may be
            wrong. Search for a recipe, or start from the homepage.
          </p>
          <Form
            role="search"
            action={searchPath}
            method="get"
            className="mt-1.5 flex gap-2.5"
          >
            <label htmlFor="nf-q" className="sr-only">
              Search recipes
            </label>
            <input
              id="nf-q"
              name="q"
              type="search"
              placeholder="Search recipes"
              className="min-h-13.5 min-w-0 flex-1 rounded-full border-[1.5px] border-charcoal bg-white px-4.5"
            />
            <button
              type="submit"
              className="flex min-h-13.5 items-center rounded-full bg-palm px-6 font-bold text-white"
            >
              Search
            </button>
          </Form>
          <div className="flex flex-wrap gap-4 font-bold">
            <Link to="/" className="flex min-h-11 items-center">
              Go to homepage
            </Link>
            <Link to={recipeIndexPath} className="flex min-h-11 items-center">
              Browse all recipes
            </Link>
          </div>
        </div>
      </section>
      {popular.length > 0 && (
        <section aria-labelledby="popular" className="flex flex-col gap-5">
          <h2 id="popular" className="text-3xl">
            Popular recipes
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-5">
            {popular.map((recipe) => (
              <li key={recipe.slug}>
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
