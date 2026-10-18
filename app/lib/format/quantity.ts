import type { Amount, Ingredient } from "~/lib/content/types";

// Scaling and display of ingredient amounts for the recipe card.

export type UnitSystem = "us" | "metric";

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 20;

export function clampServings(servings: number): number {
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(servings)));
}

const FRACTIONS: [number, string][] = [
  [0, ""],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [1, ""],
];

/** Nearest kitchen fraction: 1.5 -> "1½", 0.33 -> "⅓". Never below "¼". */
export function formatFraction(qty: number): string {
  const whole = Math.floor(qty + 1e-9);
  const rest = qty - whole;
  let best = FRACTIONS[0];
  for (const option of FRACTIONS) {
    if (Math.abs(rest - option[0]) < Math.abs(rest - best[0])) best = option;
  }
  const w = whole + (best[0] === 1 ? 1 : 0);
  return `${w || ""}${best[1]}` || "¼";
}

/** Whole things (peppers, onions): nearest half, never below ½. */
export function formatCount(qty: number): string {
  return formatFraction(Math.max(0.5, Math.round(qty * 2) / 2));
}

const trim = (n: number, decimals: number) =>
  String(Number(n.toFixed(decimals)));

/** Grams or millilitres, rounded to what a scale or jug can measure. */
function roundMetric(value: number): number {
  if (value < 10) return Math.max(0.1, Number(value.toFixed(1)));
  if (value < 50) return Math.round(value);
  if (value < 250) return Math.round(value / 5) * 5;
  return Math.round(value / 10) * 10;
}

const METRIC_BASE: Record<string, { base: "g" | "ml"; factor: number }> = {
  g: { base: "g", factor: 1 },
  kg: { base: "g", factor: 1000 },
  ml: { base: "ml", factor: 1 },
  l: { base: "ml", factor: 1000 },
  litre: { base: "ml", factor: 1000 },
  litres: { base: "ml", factor: 1000 },
};

function formatMetricMass(qty: number, unit: string): string {
  const { base, factor } = METRIC_BASE[unit];
  const amount = roundMetric(qty * factor);
  if (amount >= 1000) {
    const big = amount / 1000;
    const label = base === "g" ? "kg" : big === 1 ? "litre" : "litres";
    return `${trim(big, 2)} ${label}`;
  }
  return `${trim(amount, 1)} ${base}`;
}

// Units that read better as decimals than as fractions.
const DECIMAL_UNITS = new Set(["lb", "oz"]);

/** Singular or plural, for the units that change when scaled. */
function unitLabel(unit: string, qty: number): string {
  const singular = qty <= 1;
  if (unit === "cup" || unit === "cups") return singular ? "cup" : "cups";
  return unit;
}

/** One amount, scaled and formatted: "1½ cups", "1.2 kg", "2", "⅓ derica". */
export function formatAmount(
  amount: Amount,
  factor: number,
  system: UnitSystem | "local",
): string {
  const qty = amount.qty * factor;
  const unit = amount.unit;
  if (!unit) return formatCount(qty);
  if (system === "metric" && unit.toLowerCase() in METRIC_BASE) {
    return formatMetricMass(qty, unit.toLowerCase());
  }
  if (DECIMAL_UNITS.has(unit)) {
    return `${trim(Math.max(0.1, qty), 1)} ${unit}`;
  }
  return `${formatFraction(qty)} ${unitLabel(unit, qty)}`;
}

export interface IngredientLine {
  /** Empty for items like "Salt, to taste". */
  amount: string;
  name: string;
  /** For example "≈ 1 derica". */
  local?: string;
  optional: boolean;
}

/** What the recipe card shows for one ingredient. */
export function ingredientLine(
  item: Ingredient,
  system: UnitSystem,
  factor: number,
): IngredientLine {
  const amount = item[system];
  return {
    amount: amount ? formatAmount(amount, factor, system) : "",
    name: item.name,
    local: item.localMeasure
      ? `≈ ${formatAmount(item.localMeasure, factor, "local")}`
      : undefined,
    optional: !!item.optional,
  };
}

/**
 * The fixed text for JSON-LD recipeIngredient, at the recipe's own servings:
 * "2 cups (250 g) ground egusi (melon seeds)".
 */
export function ingredientForSchema(item: Ingredient): string {
  if (!item.us || !item.metric) return item.name;
  const us = formatAmount(item.us, 1, "us");
  const metric = formatAmount(item.metric, 1, "metric");
  const amounts = us === metric ? us : `${us} (${metric})`;
  return `${amounts} ${item.name}`;
}
