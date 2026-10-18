import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { recipeSummary } from "~/test/fixtures";
import { renderWithRouter } from "~/test/render";

import { RecipeCard } from "./RecipeCard";

describe("RecipeCard", () => {
  it("links to the recipe and shows its details", () => {
    renderWithRouter(<RecipeCard recipe={recipeSummary()} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/recipes/egusi-soup");
    expect(
      screen.getByRole("heading", {
        name: "Egusi Soup with Ugu and Assorted Meat",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Soups & Stews")).toBeInTheDocument();
    expect(screen.getByText("1 hr 20 min")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(link).toHaveTextContent("4.8 out of 5");
  });

  it("sets image size and lazy loading", () => {
    renderWithRouter(<RecipeCard recipe={recipeSummary()} />);
    const image = screen.getByRole("img", { name: "A pot of egusi soup" });
    expect(image).toHaveAttribute("width", "1200");
    expect(image).toHaveAttribute("height", "900");
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("leaves out the rating when there is none", () => {
    renderWithRouter(
      <RecipeCard recipe={recipeSummary({ rating: undefined })} />,
    );
    expect(screen.queryByText(/out of 5/)).toBeNull();
  });
});
