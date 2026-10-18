import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRecipe } from "~/lib/content";
import type { Recipe } from "~/lib/content/types";
import { resetUnitsForTests } from "~/lib/preferences";
import { renderWithRouter } from "~/test/render";

import { RecipeActions } from "./RecipeActions";
import { RecipeCardFull } from "./RecipeCardFull";
import { ServingsProvider } from "./servings";

function egusi(): Recipe {
  const recipe = getRecipe("egusi-soup");
  if (!recipe) throw new Error("missing sample recipe");
  return recipe;
}

function renderCard(recipe = egusi()) {
  return renderWithRouter(
    <ServingsProvider base={recipe.servings}>
      <RecipeActions />
      <RecipeCardFull
        recipe={recipe}
        url="https://foodsera.com/recipes/egusi-soup"
      />
    </ServingsProvider>,
  );
}

const ingredientText = (pattern: RegExp) =>
  screen.getByText(pattern, { selector: "label > span" }).textContent;

afterEach(() => {
  resetUnitsForTests();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("RecipeCardFull", () => {
  it("is the #recipe target for Jump to Recipe", () => {
    renderCard();
    expect(
      screen.getByRole("link", { name: "Jump to Recipe" }),
    ).toHaveAttribute("href", "#recipe");
    expect(document.getElementById("recipe")).toHaveAccessibleName(
      "Egusi Soup",
    );
  });

  it("prints from both Print buttons", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: "Print Recipe" }));
    await user.click(screen.getByRole("button", { name: "Print" }));
    expect(print).toHaveBeenCalledTimes(2);
  });

  it("scales every amount and announces the new servings", async () => {
    const user = userEvent.setup();
    renderCard();
    const status = screen.getByText("servings", {
      exact: false,
      selector: "[aria-live]",
    });
    expect(status).toHaveTextContent("6 servings");
    expect(ingredientText(/ground egusi/)).toContain("2 cups");

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole("button", { name: "More servings" }));
    }

    expect(status).toHaveTextContent("9 servings");
    expect(ingredientText(/ground egusi/)).toContain("3 cups");
    expect(ingredientText(/ground egusi/)).toContain("≈ 1½ derica");
    // ¾ cup x 9/6 = 1.125, which rounds to the nearest kitchen fraction: 1.
    expect(ingredientText(/palm oil/)).toContain("1 cup");
    expect(ingredientText(/Salt, to taste/)).toBe("Salt, to taste");
  });

  it("stops at 1 and 20 servings", async () => {
    const user = userEvent.setup();
    renderCard();
    const fewer = screen.getByRole("button", { name: "Fewer servings" });
    for (let i = 0; i < 8; i++) await user.click(fewer);
    expect(fewer).toBeDisabled();
    expect(
      screen.getByText("serving", { exact: false, selector: "[aria-live]" }),
    ).toHaveTextContent("1 serving");
    const more = screen.getByRole("button", { name: "More servings" });
    for (let i = 0; i < 25; i++)
      if (!more.hasAttribute("disabled")) await user.click(more);
    expect(more).toBeDisabled();
    expect(
      screen.getByText("servings", { exact: false, selector: "[aria-live]" }),
    ).toHaveTextContent("20 servings");
  }, 20_000);

  it("switches to metric and remembers the choice", async () => {
    const user = userEvent.setup();
    renderCard();
    const metric = screen.getByRole("button", { name: "Metric" });
    expect(metric).toHaveAttribute("aria-pressed", "false");

    await user.click(metric);

    expect(metric).toHaveAttribute("aria-pressed", "true");
    expect(ingredientText(/ground egusi/)).toContain("250 g");
    expect(ingredientText(/assorted meat/)).toContain("1 kg");
    expect(window.localStorage.getItem("foodsera:units")).toBe("metric");
  });

  it("lets readers tick ingredients off", async () => {
    const user = userEvent.setup();
    renderCard();
    const list = screen.getAllByRole("list")[0];
    const box = within(list).getAllByRole("checkbox")[0];
    await user.click(box);
    expect(box).toBeChecked();
  });

  it("shows the short instructions, notes and nutrition", () => {
    renderCard();
    const card = document.getElementById("recipe") as HTMLElement;
    expect(within(card).getByText(/Spoon in the paste/)).toBeInTheDocument();
    expect(
      within(card).getByRole("heading", { name: "Notes" }),
    ).toBeInTheDocument();
    expect(within(card).getByText("≈ 610 kcal")).toBeInTheDocument();
    expect(within(card).getByText("≈ 980 mg")).toBeInTheDocument();
  });

  it("has no Save button", () => {
    renderCard();
    expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
  });
});
