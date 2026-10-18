import { Link } from "react-router";

import type { Region } from "~/lib/content/types";
import { regionPath } from "~/lib/paths";

// Tile colours from design/Home.dc.html, keyed by region. Presentation, so
// they live here rather than in content. Text colours are checked for WCAG AA.
const THEMES: Record<string, { tile: string; ring: string }> = {
  yoruba: { tile: "bg-palm text-white", ring: "border-white/14" },
  igbo: { tile: "bg-ugu text-white", ring: "border-white/14" },
  "hausa-northern": {
    tile: "bg-plantain text-charcoal",
    ring: "border-charcoal/10",
  },
  "niger-delta": { tile: "bg-pepper text-white", ring: "border-white/14" },
  edo: { tile: "bg-charcoal text-white", ring: "border-plantain/25" },
  "efik-ibibio": { tile: "bg-cocoa text-white", ring: "border-white/14" },
};
const FALLBACK = Object.values(THEMES);

/** "Browse by region": a coloured tile for each region. */
export function RegionTiles({ regions }: { regions: Region[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
      {regions.map((region, i) => {
        const theme = THEMES[region.slug] ?? FALLBACK[i % FALLBACK.length];
        return (
          <li key={region.slug}>
            <Link
              to={regionPath(region.slug)}
              className={`relative flex h-full min-h-42 flex-col gap-2.5 overflow-hidden rounded-block p-5.5 no-underline hover:text-current ${theme.tile}`}
            >
              <span
                aria-hidden="true"
                className={`absolute -right-7 -bottom-7 size-32.5 rounded-full border-[18px] ${theme.ring}`}
              />
              <span className="font-serif text-region">{region.name}</span>
              {region.dishes && (
                <span className="max-w-[80%] text-md">{region.dishes}</span>
              )}
              <span className="mt-auto text-md font-bold">
                Explore {region.name} recipes ›
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
