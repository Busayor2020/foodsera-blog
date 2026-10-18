import { describe, expect, it } from "vitest";

import {
  clampServings,
  formatAmount,
  formatCount,
  formatFraction,
  ingredientForSchema,
  ingredientLine,
} from "./quantity";

describe("formatFraction", () => {
  it.each([
    [1, "1"],
    [1.5, "1½"],
    [0.5, "½"],
    [0.33, "⅓"],
    [0.333333, "⅓"],
    [0.67, "⅔"],
    [2.75, "2¾"],
    [0.25, "¼"],
    [1.97, "2"],
    [3.1, "3"],
    [0.1, "¼"],
    [0.01, "¼"],
  ])("%d -> %s", (qty, expected) => {
    expect(formatFraction(qty)).toBe(expected);
  });
});

describe("formatCount", () => {
  it.each([
    [2, "2"],
    [1.33, "1½"],
    [2.67, "2½"],
    [0.67, "½"],
    [0.2, "½"],
    [3.2, "3"],
  ])("%d -> %s", (qty, expected) => {
    expect(formatCount(qty)).toBe(expected);
  });
});

describe("formatAmount", () => {
  it("scales US amounts into friendly fractions", () => {
    expect(formatAmount({ qty: 2, unit: "cups" }, 1, "us")).toBe("2 cups");
    expect(formatAmount({ qty: 2, unit: "cups" }, 0.5, "us")).toBe("1 cup");
    expect(formatAmount({ qty: 0.75, unit: "cup" }, 2, "us")).toBe("1½ cups");
    expect(formatAmount({ qty: 3, unit: "tbsp" }, 4 / 6, "us")).toBe("2 tbsp");
    expect(formatAmount({ qty: 0.5, unit: "tsp" }, 1 / 6, "us")).toBe("¼ tsp");
  });

  it("keeps pounds as decimals", () => {
    expect(formatAmount({ qty: 2.2, unit: "lb" }, 1, "us")).toBe("2.2 lb");
    expect(formatAmount({ qty: 2.2, unit: "lb" }, 0.5, "us")).toBe("1.1 lb");
  });

  it.each([
    [{ qty: 250, unit: "g" }, 1, "250 g"],
    [{ qty: 250, unit: "g" }, 4 / 6, "165 g"],
    [{ qty: 20, unit: "g" }, 4 / 6, "13 g"],
    [{ qty: 7, unit: "g" }, 0.5, "3.5 g"],
    [{ qty: 2, unit: "g" }, 1, "2 g"],
    [{ qty: 600, unit: "g" }, 2, "1.2 kg"],
    [{ qty: 375, unit: "g" }, 3, "1.13 kg"],
    [{ qty: 1, unit: "kg" }, 1, "1 kg"],
    [{ qty: 1, unit: "kg" }, 4 / 6, "670 g"],
    [{ qty: 180, unit: "ml" }, 8 / 6, "240 ml"],
    [{ qty: 1, unit: "litre" }, 1, "1 litre"],
    [{ qty: 1, unit: "litre" }, 1.5, "1.5 litres"],
    [{ qty: 750, unit: "ml" }, 2, "1.5 litres"],
  ])("rounds metric %o x %d to %s", (amount, factor, expected) => {
    expect(formatAmount(amount, factor, "metric")).toBe(expected);
  });

  it("rounds whole items to halves in both systems", () => {
    expect(formatAmount({ qty: 4 }, 4 / 6, "us")).toBe("2½");
    expect(formatAmount({ qty: 4 }, 4 / 6, "metric")).toBe("2½");
  });

  it("scales local measures as fractions", () => {
    expect(formatAmount({ qty: 1, unit: "derica" }, 1.5, "local")).toBe(
      "1½ derica",
    );
    expect(
      formatAmount({ qty: 0.5, unit: "small milk tin" }, 4 / 6, "local"),
    ).toBe("⅓ small milk tin");
  });
});

describe("ingredientLine", () => {
  const egusi = {
    name: "ground egusi (melon seeds)",
    us: { qty: 2, unit: "cups" },
    metric: { qty: 250, unit: "g" },
    localMeasure: { qty: 1, unit: "derica" },
  };

  it("shows the chosen system and the local measure", () => {
    expect(ingredientLine(egusi, "us", 1)).toEqual({
      amount: "2 cups",
      name: "ground egusi (melon seeds)",
      local: "≈ 1 derica",
      optional: false,
    });
    expect(ingredientLine(egusi, "metric", 1.5).amount).toBe("380 g");
    expect(ingredientLine(egusi, "metric", 1.5).local).toBe("≈ 1½ derica");
  });

  it("leaves 'to taste' items unchanged at any servings", () => {
    const salt = { name: "Salt, to taste" };
    for (const factor of [0.25, 1, 3]) {
      expect(ingredientLine(salt, "us", factor)).toEqual({
        amount: "",
        name: "Salt, to taste",
        local: undefined,
        optional: false,
      });
    }
  });

  it("flags optional items", () => {
    expect(
      ingredientLine(
        {
          name: "iru",
          us: { qty: 2, unit: "tbsp" },
          metric: { qty: 25, unit: "g" },
          optional: true,
        },
        "us",
        1,
      ).optional,
    ).toBe(true);
  });
});

describe("ingredientForSchema", () => {
  it("gives both systems at the recipe's own servings", () => {
    expect(
      ingredientForSchema({
        name: "ground egusi (melon seeds)",
        us: { qty: 2, unit: "cups" },
        metric: { qty: 250, unit: "g" },
      }),
    ).toBe("2 cups (250 g) ground egusi (melon seeds)");
  });

  it("doesn't repeat an amount that is the same in both", () => {
    expect(
      ingredientForSchema({
        name: "seasoning cubes",
        us: { qty: 2 },
        metric: { qty: 2 },
      }),
    ).toBe("2 seasoning cubes");
    expect(ingredientForSchema({ name: "Salt, to taste" })).toBe(
      "Salt, to taste",
    );
  });
});

describe("clampServings", () => {
  it("keeps servings between 1 and 20", () => {
    expect(clampServings(0)).toBe(1);
    expect(clampServings(21)).toBe(20);
    expect(clampServings(6)).toBe(6);
  });
});
