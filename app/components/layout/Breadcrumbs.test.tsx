import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithRouter } from "~/test/render";

import { Breadcrumbs } from "./Breadcrumbs";

describe("Breadcrumbs", () => {
  it("links earlier items and marks the last one as the current page", () => {
    renderWithRouter(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Soups & Stews", href: "/category/soups-and-stews" },
          { label: "Egusi Soup" },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      within(nav).getByRole("link", { name: "Soups & Stews" }),
    ).toHaveAttribute("href", "/category/soups-and-stews");

    const current = within(nav).getByText("Egusi Soup");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("link", { name: "Egusi Soup" })).toBeNull();
  });

  it("hides the separators from assistive technology", () => {
    renderWithRouter(
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />,
    );
    expect(screen.getByText("›")).toHaveAttribute("aria-hidden", "true");
  });
});
