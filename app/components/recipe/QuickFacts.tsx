import type { Recipe } from "~/lib/content/types";
import { formatMinutes } from "~/lib/format/duration";

import { useServings } from "./servings";

export const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/** Prep, cook, total, serves and difficulty. Serves follows the adjuster. */
export function QuickFacts({ recipe }: { recipe: Recipe }) {
  const { servings } = useServings();
  const facts = [
    ["Prep", formatMinutes(recipe.prepMinutes)],
    ["Cook", formatMinutes(recipe.cookMinutes)],
    ["Total", formatMinutes(recipe.totalMinutes)],
    ["Serves", String(servings)],
    ["Difficulty", DIFFICULTY_LABEL[recipe.difficulty]],
  ];
  return (
    <section
      aria-label="Quick facts"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(118px,100%),1fr))] overflow-hidden rounded-card border border-line bg-paper"
    >
      {facts.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 border-r border-b border-line-soft px-4 py-3.5"
        >
          <span className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
            {label}
          </span>
          <span className="text-lg font-bold">{value}</span>
        </div>
      ))}
    </section>
  );
}
