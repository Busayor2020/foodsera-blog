import { Link } from "react-router";

import type { Category } from "~/lib/content/types";
import { categoryPath } from "~/lib/paths";

const TILE_IMAGE = { width: 600, height: 600 };

/** "Browse by category": a photo tile for each category. */
export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(150px,45%),1fr))] gap-4">
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            to={categoryPath(category.slug)}
            className="group flex h-full flex-col gap-2.5 rounded-panel border border-line bg-paper px-2.5 pt-2.5 pb-3.5 text-charcoal no-underline hover:text-charcoal"
          >
            {category.image ? (
              <img
                src={category.image}
                alt=""
                width={TILE_IMAGE.width}
                height={TILE_IMAGE.height}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-field object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="aspect-square w-full rounded-field bg-sand"
              />
            )}
            <span className="px-1 text-base leading-[1.25] font-bold group-hover:underline">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
