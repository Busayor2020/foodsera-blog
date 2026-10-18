import type { Ref } from "react";
import { Link } from "react-router";

import type { RecipeSummary, Term } from "~/lib/content/types";
import { RECIPE_HERO } from "~/lib/images";
import {
  categoryPath,
  occasionPath,
  recipeIndexPath,
  recipePath,
  regionPath,
} from "~/lib/paths";

interface MegaMenuProps {
  id: string;
  categories: Term[];
  regions: Term[];
  occasions: Term[];
  /** "Recipe of the week". */
  featured?: RecipeSummary;
  onNavigate: () => void;
  ref?: Ref<HTMLDivElement>;
}

interface MenuLink {
  label: string;
  href: string;
}

function Column({ title, links }: { title: string; links: MenuLink[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-sans text-xs font-bold tracking-eyebrow text-ugu uppercase">
        {title}
      </h2>
      <ul className="flex flex-col gap-1.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="flex min-h-9 items-center font-semibold text-charcoal no-underline hover:text-charcoal"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MegaMenu({
  id,
  categories,
  regions,
  occasions,
  featured,
  onNavigate,
  ref,
}: MegaMenuProps) {
  return (
    // Any link click inside the panel closes it, including links to the
    // current page, which don't change the route.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      id={id}
      ref={ref}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) onNavigate();
      }}
      className="absolute inset-x-0 top-full z-10 border-b border-line bg-paper shadow-menu"
    >
      <div className="mx-auto grid max-w-header grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-7 px-6 pt-7 pb-8">
        <Column
          title="By category"
          links={[
            ...categories.map((c) => ({
              label: c.name,
              href: categoryPath(c.slug),
            })),
            { label: "All recipes A–Z", href: recipeIndexPath },
          ]}
        />
        <Column
          title="By region"
          links={regions.map((r) => ({
            label: r.name,
            href: regionPath(r.slug),
          }))}
        />
        <Column
          title="By occasion"
          links={occasions.map((o) => ({
            label: o.name,
            href: occasionPath(o.slug),
          }))}
        />
        {featured && (
          <Link
            to={recipePath(featured.slug)}
            className="flex flex-col gap-2.5 rounded-card bg-plantain-soft p-3.5 text-charcoal no-underline hover:text-charcoal"
          >
            <img
              src={featured.heroImage}
              alt={featured.heroImageAlt}
              width={RECIPE_HERO.width}
              height={RECIPE_HERO.height}
              loading="lazy"
              decoding="async"
              className="aspect-16/10 w-full rounded-field object-cover"
            />
            <span className="text-xs font-bold tracking-eyebrow text-palm-deep uppercase">
              Recipe of the week
            </span>
            <span className="font-serif text-xl">{featured.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
