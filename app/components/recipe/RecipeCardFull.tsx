import { Printer } from "lucide-react";

import { AdPosition } from "~/components/ads/AdPosition";
import type { Nutrition, Recipe } from "~/lib/content/types";
import { formatMinutes } from "~/lib/format/duration";
import { ingredientLine } from "~/lib/format/quantity";
import { RECIPE_HERO } from "~/lib/images";
import { useUnits } from "~/lib/preferences";

import { DIFFICULTY_LABEL } from "./QuickFacts";
import { printRecipe } from "./RecipeActions";
import { ServingsAdjuster } from "./ServingsAdjuster";
import { ShareButtons } from "./ShareButtons";
import { UnitToggle } from "./UnitToggle";
import { useServings } from "./servings";

const NUTRIENTS: [keyof Nutrition, string][] = [
  ["calories", "Calories"],
  ["protein", "Protein"],
  ["fat", "Fat"],
  ["carbs", "Carbs"],
  ["fibre", "Fibre"],
  ["sodium", "Sodium"],
];

function nutrientValue(key: keyof Nutrition, value: string | number): string {
  if (key === "calories") return `≈ ${value} kcal`;
  return `≈ ${String(value).replace(/^([\d.]+)\s*/, "$1 ")}`;
}

interface RecipeCardFullProps {
  recipe: Recipe;
  /** Canonical URL of the page, for sharing and print. */
  url: string;
}

/** The recipe card (#recipe): what Jump to Recipe and Print are for. */
export function RecipeCardFull({ recipe, url }: RecipeCardFullProps) {
  const { servings, factor } = useServings();
  const [units, setUnits] = useUnits();
  const name = recipe.shortTitle ?? recipe.title;
  const nutrition = recipe.nutrition
    ? NUTRIENTS.filter(([key]) => recipe.nutrition?.[key] !== undefined)
    : [];

  return (
    <section
      id="recipe"
      aria-labelledby="rc-title"
      className="scroll-mt-4 overflow-hidden rounded-feature border-[1.5px] border-line-strong bg-paper print:rounded-none print:border-0"
    >
      <div className="flex flex-wrap items-center gap-6 bg-sand p-6 print:bg-transparent print:p-0 print:pb-4">
        <div className="min-w-40 flex-[0_1_200px] print:hidden">
          <img
            src={recipe.heroImage}
            alt=""
            width={RECIPE_HERO.width}
            height={RECIPE_HERO.height}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full rounded-card object-cover"
          />
        </div>
        <div className="flex flex-[1_1_300px] flex-col gap-2.5">
          <span className="eyebrow text-ugu print:hidden">Recipe card</span>
          <h2 id="rc-title" className="text-card-title">
            {name}
          </h2>
          <p className="text-base text-ink-muted">{recipe.description}</p>
          <p className="flex flex-wrap gap-x-4.5 gap-y-2 text-md">
            <span>
              Prep <strong>{formatMinutes(recipe.prepMinutes)}</strong>
            </span>
            <span>
              Cook <strong>{formatMinutes(recipe.cookMinutes)}</strong>
            </span>
            <span>
              Total <strong>{formatMinutes(recipe.totalMinutes)}</strong>
            </span>
            <span>
              Serves <strong>{servings}</strong>
            </span>
            <span>
              Difficulty <strong>{DIFFICULTY_LABEL[recipe.difficulty]}</strong>
            </span>
          </p>
          <div className="mt-1 flex flex-wrap gap-2.5 print:hidden">
            <button
              type="button"
              onClick={printRecipe}
              className="flex min-h-11 items-center gap-2 rounded-full bg-charcoal px-4.5 text-md font-bold text-white"
            >
              <Printer size={17} strokeWidth={2} aria-hidden="true" />
              Print
            </button>
            <ShareButtons title={recipe.title} url={url} />
          </div>
          <p className="hidden text-sm print:block">
            {url.replace(/^https:\/\//, "")} · Serves {servings} ·{" "}
            {units === "us" ? "US cups" : "Metric"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4.5 px-6 py-7 print:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <h3 className="text-2xl">Ingredients</h3>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <ServingsAdjuster />
            <UnitToggle units={units} onChange={setUnits} />
          </div>
        </div>
        {recipe.ingredients.some((g) =>
          g.items.some((i) => i.localMeasure),
        ) && (
          <p className="text-sm text-muted print:hidden">
            Local measures in green are a rough guide for market shopping. Tick
            items off as you go.
          </p>
        )}
        {recipe.ingredients.map((group, g) => (
          <div key={group.group ?? g} className="flex flex-col gap-1">
            {group.group && <h4 className="mt-2 text-xl">{group.group}</h4>}
            <ul className="flex flex-col">
              {group.items.map((item, i) => {
                const line = ingredientLine(item, units, factor);
                return (
                  <li
                    key={`${g}-${i}`}
                    className="border-b border-dashed border-line"
                  >
                    <label className="flex min-h-11 cursor-pointer items-start gap-3.5 py-2.75">
                      <input
                        type="checkbox"
                        className="peer mt-0.5 size-5.5 flex-none accent-ugu print:hidden"
                      />
                      <span className="peer-checked:text-checked peer-checked:line-through">
                        {line.amount && (
                          <>
                            <strong>{line.amount}</strong>{" "}
                          </>
                        )}
                        {line.name}
                        {line.local && (
                          <span className="text-md font-semibold text-ugu">
                            {" "}
                            {line.local}
                          </span>
                        )}
                        {line.optional && (
                          <span className="text-md text-muted">
                            {" "}
                            (optional)
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="print:hidden">
          <AdPosition name="recipe-card-mid" />
        </div>

        <h3 className="mt-2 text-2xl">Instructions</h3>
        <ol className="flex flex-col gap-4">
          {recipe.steps.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="flex size-8 flex-none items-center justify-center rounded-full bg-charcoal text-md font-bold text-white print:border print:border-charcoal print:bg-transparent print:text-charcoal"
              >
                {i + 1}
              </span>
              <span>{step.short}</span>
            </li>
          ))}
        </ol>

        {recipe.notes.length > 0 && (
          <div className="flex flex-col gap-2 rounded-tile bg-cream px-5 py-4.5">
            <h4 className="text-xl">Notes</h4>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-base">
              {recipe.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {nutrition.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xl">
              Nutrition{" "}
              {recipe.nutritionNote && (
                <span className="font-sans text-sm text-muted">
                  {recipe.nutritionNote}
                </span>
              )}
            </h4>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(110px,100%),1fr))] gap-2">
              {nutrition.map(([key, label]) => (
                <div
                  key={key}
                  className="flex flex-col rounded-field border border-line px-3 py-2.5"
                >
                  <dt className="text-eyebrow text-muted">{label}</dt>
                  <dd className="font-bold">
                    {nutrientValue(key, recipe.nutrition?.[key] ?? "")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
