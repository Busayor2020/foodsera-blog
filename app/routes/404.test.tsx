import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import type { SiteData } from "~/lib/content/types";
import { NAV, recipeSummary } from "~/test/fixtures";

import NotFound from "./404";

function renderWithSiteData(data: SiteData) {
  const Stub = createRoutesStub([
    {
      id: "root",
      path: "/",
      loader: () => data,
      children: [{ path: "*", Component: NotFound }],
    },
  ]);
  render(<Stub initialEntries={["/no-such-page"]} />);
}

describe("404 page", () => {
  it("lists popular recipes from the root loader", async () => {
    renderWithSiteData({
      nav: NAV,
      popular: [
        recipeSummary(),
        recipeSummary({
          slug: "jollof-rice",
          title: "Smoky Party Jollof Rice",
        }),
      ],
    });

    const section = await screen.findByRole("region", {
      name: "Popular recipes",
    });
    const links = within(section).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/recipes/egusi-soup",
      "/recipes/jollof-rice",
    ]);
  });

  it("leaves the section out when there are no recipes", async () => {
    renderWithSiteData({ nav: NAV, popular: [] });
    expect(
      await screen.findByRole("heading", { name: "This pot is empty" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Popular recipes" }),
    ).toBeNull();
  });
});
