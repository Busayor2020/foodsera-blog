import { Search } from "lucide-react";
import { Form, Link } from "react-router";

import { AdPosition } from "~/components/ads/AdPosition";
import type { RecipeSummary } from "~/lib/content/types";
import { formatMinutes } from "~/lib/format/duration";
import { RECIPE_HERO } from "~/lib/images";
import { recipePath, searchPath } from "~/lib/paths";

import { LogoMark } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

interface SidebarProps {
  popular: RecipeSummary[];
}

/** Desktop sidebar (from lg, 1080px), as in design/Main.dc.html. */
export function Sidebar({ popular }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className="hidden min-w-75 flex-[0_1_320px] flex-col gap-8 lg:flex print:hidden"
    >
      <AdPosition name="recipe-sidebar-top" />

      <section
        aria-labelledby="side-about"
        className="flex flex-col items-start gap-3 rounded-panel border border-line bg-paper p-5"
      >
        <div className="flex items-center gap-3.5">
          <LogoMark size={64} />
          <div>
            <h2 id="side-about" className="text-xl">
              About Foodsera Kitchen
            </h2>
            <span className="text-sm text-muted">Cooks and writers</span>
          </div>
        </div>
        <p className="text-md leading-[1.55]">
          We share the Nigerian food we grew up on, tested in a home kitchen and
          written so anyone can cook it, wherever you live.
        </p>
        <Link
          to="/about"
          className="flex min-h-11 items-center text-md font-bold"
        >
          Read our story
        </Link>
      </section>

      <Form
        role="search"
        action={searchPath}
        method="get"
        className="flex flex-col gap-2"
      >
        <label htmlFor="side-q" className="font-bold">
          Search recipes
        </label>
        <div className="flex gap-2">
          <input
            id="side-q"
            name="q"
            type="search"
            placeholder="e.g. jollof, akara"
            className="min-h-12 min-w-0 flex-1 rounded-field border-[1.5px] border-field-line bg-white px-3.5"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex size-12 flex-none items-center justify-center rounded-field bg-charcoal text-white"
          >
            <Search size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </Form>

      <SidebarNewsletter />
      <SidebarPopular recipes={popular} />

      <AdPosition name="recipe-sidebar-sticky" />
    </aside>
  );
}

interface TermSidebarProps {
  popular: RecipeSummary[];
  /** False on thin pages, which show no ads. */
  ads: boolean;
}

/** Desktop sidebar on category, region and occasion pages (design/Category.dc.html). */
export function TermSidebar({ popular, ads }: TermSidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className="hidden min-w-75 flex-[0_1_320px] flex-col gap-8 lg:flex print:hidden"
    >
      {ads && <AdPosition name="term-sidebar-top" />}
      <SidebarPopular recipes={popular} />
      <SidebarNewsletter />
      {ads && <AdPosition name="term-sidebar-sticky" />}
    </aside>
  );
}

function SidebarNewsletter() {
  return (
    <section
      aria-labelledby="side-news"
      className="flex flex-col gap-2.5 rounded-panel bg-ugu p-5 text-white focus-on-dark"
    >
      <h2 id="side-news" className="text-h3">
        Get a new Nigerian recipe every week
      </h2>
      <NewsletterForm variant="sidebar" />
    </section>
  );
}

/**
 * "Popular recipes": the design says "Most cooked this month", but there is
 * no cooking data to back that up.
 */
function SidebarPopular({ recipes }: { recipes: RecipeSummary[] }) {
  if (recipes.length === 0) return null;
  return (
    <section aria-labelledby="side-pop" className="flex flex-col gap-3">
      <h2 id="side-pop" className="text-h3">
        Popular recipes
      </h2>
      <ol className="flex flex-col gap-2.5">
        {recipes.map((recipe) => (
          <li key={recipe.slug}>
            <Link
              to={recipePath(recipe.slug)}
              className="flex min-h-16 items-center gap-3 text-charcoal no-underline hover:text-charcoal"
            >
              <img
                src={recipe.heroImage}
                alt=""
                width={RECIPE_HERO.width}
                height={RECIPE_HERO.height}
                loading="lazy"
                decoding="async"
                className="size-16 flex-none rounded-field object-cover"
              />
              <span className="flex flex-col">
                <span className="leading-[1.3] font-bold">{recipe.title}</span>
                <span className="text-sm text-muted">
                  {formatMinutes(recipe.totalMinutes)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
