import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NAV, recipeSummary } from "~/test/fixtures";
import { renderWithRouter } from "~/test/render";

import { getNavSection, Header } from "./Header";

describe("getNavSection", () => {
  it.each([
    ["/", "home"],
    ["/about", "about"],
    ["/category/rice-dishes", "rice-dishes"],
    ["/recipes", null],
  ])("%s gives %s", (path, section) => {
    expect(getNavSection(path)).toBe(section);
  });
});

describe("Header", () => {
  it("renders both the full nav and the menu button, and CSS picks one", () => {
    renderWithRouter(<Header nav={NAV} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(
      within(nav).getByRole("link", { name: "Soups & Stews" }),
    ).toHaveAttribute("href", "/category/soups-and-stews");
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });

  it("marks the current category as the current page", () => {
    renderWithRouter(<Header nav={NAV} />, { path: "/category/swallow" });
    expect(screen.getByRole("link", { name: "Swallow" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("opens the search panel and focuses its input", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);
    const button = screen.getByRole("button", { name: "Search recipes" });

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    const input = screen.getByRole("searchbox", { name: "Search recipes" });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("name", "q");
  });

  it("opens the mega menu from the keyboard and closes it with Escape", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);
    const button = screen.getByRole("button", { name: "Recipes" });

    button.focus();
    await user.keyboard("{Enter}");

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", "mega");
    const panel = document.getElementById("mega") as HTMLElement;
    expect(panel).not.toBeNull();
    expect(
      within(panel).getByRole("link", { name: "Owambe and parties" }),
    ).toHaveAttribute("href", "/occasion/party");

    await user.keyboard("{Escape}");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mega")).toBeNull();
    expect(button).toHaveFocus();
  });

  it("shows the recipe of the week in the mega menu", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} featured={recipeSummary()} />);

    await user.click(screen.getByRole("button", { name: "Recipes" }));

    const panel = document.getElementById("mega") as HTMLElement;
    const card = within(panel).getByRole("link", {
      name: /Recipe of the week/,
    });
    expect(card).toHaveAttribute("href", "/recipes/egusi-soup");
    expect(card).toHaveTextContent("Egusi Soup with Ugu and Assorted Meat");
  });

  it("closes the mega menu on a click outside", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);

    await user.click(screen.getByRole("button", { name: "Recipes" }));
    expect(document.getElementById("mega")).not.toBeNull();

    await user.click(document.body);
    expect(document.getElementById("mega")).toBeNull();
  });

  it("shows only one panel at a time", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);

    await user.click(screen.getByRole("button", { name: "Recipes" }));
    await user.click(screen.getByRole("button", { name: "Search recipes" }));

    expect(document.getElementById("mega")).toBeNull();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });
});
