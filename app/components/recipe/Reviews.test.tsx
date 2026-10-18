import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { getRecipe } from "~/lib/content";
import type { Recipe } from "~/lib/content/types";
import { renderWithRouter } from "~/test/render";

import { RecipeHeader } from "./RecipeHeader";
import { Reviews } from "./Reviews";

function sample(): Recipe {
  const recipe = getRecipe("egusi-soup");
  if (!recipe) throw new Error("missing sample recipe");
  return recipe;
}

/** The same recipe as if it were real content: no sample flag, no rating. */
const real = (): Recipe => ({ ...sample(), sample: false, rating: undefined });

describe("Reviews", () => {
  it("shows the frontmatter summary only on sample recipes", () => {
    const { unmount } = render(<Reviews recipe={sample()} />);
    expect(screen.getByText("4.8 out of 5 · 126 reviews")).toBeInTheDocument();
    unmount();
    render(<Reviews recipe={real()} />);
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    expect(screen.queryByText(/out of 5/)).toBeNull();
  });

  it("never lists made-up reviews, only the empty state", () => {
    render(<Reviews recipe={sample()} />);
    expect(
      screen.getByText("Be the first to review this recipe."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /show more reviews/i }),
    ).toBeNull();
  });

  it("asks for a star rating before sending", async () => {
    const user = userEvent.setup();
    render(<Reviews recipe={real()} />);
    await user.type(screen.getByLabelText("Name"), "Ada");
    await user.type(
      screen.getByLabelText("Email (not published)"),
      "ada@example.com",
    );
    await user.type(screen.getByLabelText("Your comment"), "Lovely.");
    await user.click(screen.getByRole("button", { name: "Post review" }));

    expect(
      screen.getByText("Choose a rating from 1 to 5 stars."),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "1 star" })).toHaveFocus();

    await user.click(screen.getByRole("radio", { name: "4 stars" }));
    await user.click(screen.getByRole("button", { name: "Post review" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Reviews will appear here once they're published.",
    );
  });

  it("lets the rating be chosen with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Reviews recipe={real()} />);
    await user.click(screen.getByRole("radio", { name: "2 stars" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "3 stars" })).toBeChecked();
  });
});

describe("RecipeHeader rating row", () => {
  it("shows stars and counts for a sample recipe", () => {
    renderWithRouter(<RecipeHeader recipe={sample()} />);
    const link = screen.getByRole("link", { name: /4\.8 out of 5/ });
    expect(link).toHaveAttribute("href", "#reviews");
    expect(link).toHaveTextContent("126 reviews");
  });

  it("shows 'No reviews yet' and no stars for a real recipe", () => {
    renderWithRouter(<RecipeHeader recipe={real()} />);
    expect(
      screen.getByRole("link", { name: "No reviews yet" }),
    ).toHaveAttribute("href", "#reviews");
    expect(screen.queryByText(/reviews$/)).toBeNull();
  });

  it("shows the author and last updated date", () => {
    renderWithRouter(<RecipeHeader recipe={sample()} />);
    expect(
      screen.getByRole("link", { name: "Foodsera Kitchen" }),
    ).toHaveAttribute("href", "/about");
    expect(screen.getByText("15 October 2026")).toHaveAttribute(
      "dateTime",
      "2026-10-15",
    );
  });
});
