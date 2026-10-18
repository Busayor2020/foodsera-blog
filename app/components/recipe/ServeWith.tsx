import { Link } from "react-router";

import type { ServeWith as ServeWithItem } from "~/lib/content/types";
import { SIDE_DISH } from "~/lib/images";
import { recipePath } from "~/lib/paths";

interface ServeWithProps {
  intro?: string;
  items: ServeWithItem[];
}

function Side({ item }: { item: ServeWithItem }) {
  return (
    <>
      {item.image && (
        <img
          src={item.image}
          alt={item.imageAlt}
          width={SIDE_DISH.width}
          height={SIDE_DISH.height}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full rounded-tile object-cover"
        />
      )}
      <span className="font-bold">{item.name}</span>
      {item.note && (
        <span className="-mt-1.5 text-sm text-muted">{item.note}</span>
      )}
    </>
  );
}

/** "What to serve it with". Sides link only when Foodsera has their recipe. */
export function ServeWith({ intro, items }: ServeWithProps) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="serve" className="flex flex-col gap-4">
      <h2 id="serve" className="text-3xl">
        What to serve it with
      </h2>
      {intro && <p>{intro}</p>}
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-4">
        {items.map((item) => (
          <li key={item.name}>
            {item.recipe ? (
              <Link
                to={recipePath(item.recipe)}
                className="flex flex-col gap-2 text-charcoal no-underline hover:text-charcoal"
              >
                <Side item={item} />
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Side item={item} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
