import { render, screen, within } from "@testing-library/react";
import { createRoutesStub, type MetaDescriptor } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { getAllRecipes } from "~/lib/content";

import RecipeIndex, {
  loader,
  meta,
  RECIPE_INDEX_TITLE,
  shouldRevalidate,
} from "./recipe-index";

vi.mock("~/components/ads/AdPosition", () => ({
  AdPosition: ({ name }: { name: string }) => <div data-ad-position={name} />,
}));

type IndexData = ReturnType<typeof loader>;

async function renderIndex(query = "", data: IndexData = loader()) {
  const Stub = createRoutesStub([
    {
      path: "/recipes",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the stub passes loader data as props
      Component: RecipeIndex as any,
      loader: () => data,
      shouldRevalidate,
    },
  ]);
  render(<Stub initialEntries={[`/recipes${query}`]} />);
  await screen.findByRole("heading", { level: 1 });
}

const groupHeadings = () =>
  screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
const titlesIn = (name: string) => {
  const section = screen.getByRole("region", { name });
  return within(section)
    .getAllByRole("listitem")
    .map((li) => li.querySelector("span")?.textContent);
};

describe("recipe index", () => {
  it("groups recipes by category in menu order, skipping empty ones", async () => {
    await renderIndex();
    expect(groupHeadings()).toEqual([
      "Soups & Stews",
      "Rice Dishes",
      "Small Chops & Snacks",
      "Breakfast",
      "Drinks",
    ]);
    expect(
      screen.getByText(/^All 8 recipes, grouped by category/),
    ).toBeInTheDocument();
  });

  it("sorts each group A to Z", async () => {
    await renderIndex();
    expect(titlesIn("Soups & Stews")).toEqual([
      "Catfish Pepper Soup",
      "Efo Riro (Yoruba Spinach Stew)",
      "Egusi Soup with Ugu and Assorted Meat",
    ]);
  });

  it("links every recipe", async () => {
    await renderIndex();
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"))
      .filter((href) => href?.startsWith("/recipes/"));
    expect(hrefs.sort()).toEqual(
      getAllRecipes()
        .map((r) => `/recipes/${r.slug}`)
        .sort(),
    );
  });

  it("has jump links with counts and a link to each category", async () => {
    await renderIndex();
    const jump = within(
      screen.getByRole("navigation", { name: "Jump to category" }),
    );
    expect(
      jump.getByRole("link", { name: "Soups & Stews, 3 recipes" }),
    ).toHaveAttribute("href", "#cat-soups-and-stews");
    expect(
      screen.getByRole("link", { name: "View category: Soups & Stews" }),
    ).toHaveAttribute("href", "/category/soups-and-stews");
  });

  it("shows only quick recipes with ?time=30", async () => {
    await renderIndex("?time=30");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 3 recipes ready in 30 minutes or less · Show all recipes",
    );
    expect(
      screen.getByRole("link", { name: "Show all recipes" }),
    ).toHaveAttribute("href", "/recipes");
    expect(groupHeadings()).toEqual(["Soups & Stews", "Breakfast", "Drinks"]);
    expect(titlesIn("Soups & Stews")).toEqual(["Catfish Pepper Soup"]);
    const jump = within(
      screen.getByRole("navigation", { name: "Jump to category" }),
    );
    expect(
      jump.getByRole("link", { name: "Breakfast, 1 recipe" }),
    ).toBeInTheDocument();
  });

  it("ignores other time values", async () => {
    await renderIndex("?time=5");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(groupHeadings()).toHaveLength(5);
  });

  it("puts an ad position after the second group, only when a third follows", async () => {
    await renderIndex();
    const second = screen.getByRole("region", { name: "Rice Dishes" });
    expect(
      second.querySelector("[data-ad-position=index-after-second-group]"),
    ).not.toBeNull();
    expect(document.querySelectorAll("[data-ad-position]")).toHaveLength(1);

    const data = loader();
    await renderIndex("", { ...data, groups: data.groups.slice(0, 2) });
    expect(document.querySelectorAll("[data-ad-position]")).toHaveLength(1);
  });
});

describe("recipe index meta", () => {
  const tags = meta({} as Parameters<typeof meta>[0]);
  const find = (key: string, value: string) =>
    tags.find(
      (t: MetaDescriptor) => (t as Record<string, unknown>)[key] === value,
    ) as Record<string, unknown> | undefined;

  it("has its title, canonical URL and BreadcrumbList", () => {
    expect(find("title", RECIPE_INDEX_TITLE)).toBeDefined();
    expect(find("rel", "canonical")?.href).toBe("https://foodsera.com/recipes");
    const crumbs = tags.find((t) => "script:ld+json" in t) as Record<
      string,
      { "@type": string }
    >;
    expect(crumbs["script:ld+json"]["@type"]).toBe("BreadcrumbList");
  });
});
