import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createRoutesStub,
  useLoaderData,
  useLocation,
  type MetaDescriptor,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import { TermPage } from "~/components/term/TermPage";
import { adsAllowed } from "~/lib/ads/rules";
import type { ListRecipe, TermPageData } from "~/lib/content/types";
import { listRecipe, recipeSummary } from "~/test/fixtures";

import { handle, loader, meta, shouldRevalidate } from "./category";
import { meta as occasionMeta } from "./occasion";
import { loader as regionLoader } from "./region";

vi.mock("~/components/ads/AdPosition", () => ({
  AdPosition: ({ name }: { name: string }) => <li data-ad-position={name} />,
}));

const yoruba = { slug: "yoruba", name: "Yoruba" };
const igbo = { slug: "igbo", name: "Igbo" };

/** Recipe i: popularity i, 10 + 5i minutes, every third vegetarian, odd ones Igbo. */
function recipes(n: number, extra: Partial<ListRecipe> = {}): ListRecipe[] {
  return Array.from({ length: n }, (_, i) =>
    listRecipe({
      slug: `r-${i}`,
      title: `Recipe ${String.fromCharCode(90 - i)}`,
      totalMinutes: 10 + 5 * i,
      difficulty: i % 2 ? "medium" : "easy",
      vegetarian: i % 3 === 0,
      region: i % 2 ? igbo : yoruba,
      rating: undefined,
      popularity: i,
      ...extra,
    }),
  );
}

function termPage(overrides: Partial<TermPageData> = {}): TermPageData {
  return {
    kind: "category",
    term: {
      slug: "soups",
      name: "Soups & Stews",
      intro: "The heart of the table.",
    },
    path: "/category/soups",
    recipes: recipes(20),
    regions: [yoruba, igbo],
    thin: false,
    more: [],
    ...overrides,
  };
}

function Page() {
  const page = useLoaderData() as TermPageData;
  const { search } = useLocation();
  return (
    <>
      <output data-testid="search">{search}</output>
      <TermPage page={page} />
    </>
  );
}

async function renderPage(page: TermPageData, query = "") {
  const pageLoader = vi.fn(() => page);
  const Stub = createRoutesStub([
    {
      path: "/category/:slug",
      Component: Page,
      loader: pageLoader,
      shouldRevalidate,
    },
  ]);
  render(<Stub initialEntries={[`/category/soups${query}`]} />);
  await screen.findByRole("heading", { level: 1 });
  return { pageLoader, user: userEvent.setup() };
}

const cardSlugs = () =>
  [
    ...document.querySelectorAll<HTMLAnchorElement>(
      "main a[href^='/recipes/'], ul a[href^='/recipes/']",
    ),
  ]
    .filter((a) => !a.closest("aside"))
    .map((a) => a.getAttribute("href")?.replace("/recipes/", ""));
const search = () => screen.getByTestId("search").textContent;
const count = () => screen.getByText(/^Showing/, { selector: "p" }).textContent;
const adsInGrid = () =>
  [...document.querySelectorAll("ul.grid > *")].map((el) =>
    el.hasAttribute("data-ad-position") ? "ad" : "card",
  );

describe("term page", () => {
  it("shows the name, intro, breadcrumbs and the first 9 recipes", async () => {
    await renderPage(termPage());
    // Cards are h3s, so a heading above them keeps the outline in order.
    expect(
      screen.getByRole("heading", { level: 2, name: "Soups & Stews recipes" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Soups & Stews",
    );
    expect(screen.getByText("The heart of the table.")).toBeInTheDocument();
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(cardSlugs()).toHaveLength(9);
    expect(count()).toBe("Showing 9 of 20 recipes");
    expect(screen.getByText("11 more to see")).toBeInTheDocument();
  });

  it("places an in-feed ad position after every 6th card, never last", async () => {
    const { user } = await renderPage(termPage());
    expect(adsInGrid()).toEqual([
      ...Array(6).fill("card"),
      "ad",
      ...Array(3).fill("card"),
    ]);
    await user.click(screen.getByRole("button", { name: "Load more recipes" }));
    expect(adsInGrid().filter((x) => x === "ad")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Load more recipes" }));
    // 20 cards: after 6, 12 and 18 (two cards still follow the last one).
    expect(adsInGrid().filter((x) => x === "ad")).toHaveLength(3);
    expect(adsInGrid().at(-1)).toBe("card");
    expect(
      screen.queryByRole("button", { name: "Load more recipes" }),
    ).not.toBeInTheDocument();
  });

  it("puts each filter in the URL and filters the list", async () => {
    const { user } = await renderPage(termPage());
    const veg = screen.getByRole("button", { name: "Vegetarian" });
    await user.click(veg);
    expect(veg).toHaveAttribute("aria-pressed", "true");
    expect(search()).toBe("?veg=1");
    expect(count()).toBe("Showing 7 of 7 recipes");

    await user.click(screen.getByRole("button", { name: "Igbo" }));
    expect(search()).toBe("?veg=1&region=igbo");
    expect(cardSlugs()).toEqual(["r-3", "r-9", "r-15"]);

    await user.click(screen.getByRole("button", { name: "Igbo" }));
    expect(search()).toBe("?veg=1");
  });

  it("treats the two time chips as one choice", async () => {
    const { user } = await renderPage(termPage());
    await user.click(screen.getByRole("button", { name: "Under 30 min" }));
    expect(search()).toBe("?time=30");
    expect(count()).toBe("Showing 5 of 5 recipes");
    await user.click(screen.getByRole("button", { name: "Under 1 hour" }));
    expect(search()).toBe("?time=60");
    expect(
      screen.getByRole("button", { name: "Under 30 min" }),
    ).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Under 1 hour" }));
    expect(search()).toBe("");
  });

  it("sorts from the select and keeps the sort in the URL", async () => {
    const { user } = await renderPage(termPage({ recipes: recipes(5) }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "az",
    );
    expect(search()).toBe("?sort=az");
    // Titles run Z, Y, X... so A to Z reverses popularity.
    expect(cardSlugs()).toEqual(["r-4", "r-3", "r-2", "r-1", "r-0"]);
  });

  it("never refetches data when only the filters change", async () => {
    const { pageLoader, user } = await renderPage(termPage());
    await user.click(screen.getByRole("button", { name: "Easy" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "quick",
    );
    await user.click(screen.getByRole("button", { name: "Vegetarian" }));
    expect(search()).toBe("?difficulty=easy&veg=1&sort=quick");
    expect(pageLoader).toHaveBeenCalledTimes(1);
  });

  it("restores a shared filtered view from the URL", async () => {
    await renderPage(
      termPage(),
      "?difficulty=easy&region=yoruba&sort=quick&junk=1",
    );
    expect(screen.getByRole("button", { name: "Easy" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Yoruba" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("combobox", { name: "Sort by" })).toHaveValue(
      "quick",
    );
    expect(count()).toBe("Showing 9 of 10 recipes");
  });

  it("clears filters, keeping the sort", async () => {
    const { user } = await renderPage(termPage(), "?veg=1&sort=az");
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(search()).toBe("?sort=az");
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const { user } = await renderPage(
      termPage({ recipes: recipes(4) }),
      "?veg=1&difficulty=easy&region=igbo",
    );
    expect(
      screen.getByRole("heading", { name: "No recipes match these filters" }),
    ).toBeInTheDocument();
    expect(count()).toBe("Showing 0 of 0 recipes");
    await user.click(screen.getByRole("button", { name: "Show all recipes" }));
    expect(search()).toBe("");
    expect(cardSlugs()).toHaveLength(4);
  });

  it("loads 6 more at a time, moves focus to the first new card, and resets on a filter change", async () => {
    const { user } = await renderPage(termPage());
    await user.click(screen.getByRole("button", { name: "Load more recipes" }));
    expect(cardSlugs()).toHaveLength(15);
    expect(document.activeElement).toHaveAttribute("href", "/recipes/r-9");
    expect(screen.getByText("5 more to see")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Easy" }));
    expect(count()).toBe("Showing 9 of 10 recipes");
  });

  it("hides region chips when the page has none, and Highest rated without ratings", async () => {
    await renderPage(termPage({ regions: [] }));
    expect(
      screen.queryByRole("group", { name: "Region" }),
    ).not.toBeInTheDocument();
    const options = within(
      screen.getByRole("combobox", { name: "Sort by" }),
    ).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "Most popular",
      "Quickest first",
      "A to Z",
    ]);
  });

  it("offers Highest rated when a recipe shows a rating", async () => {
    await renderPage(
      termPage({ recipes: recipes(3, { rating: { value: 4.5, count: 9 } }) }),
    );
    expect(
      screen.getByRole("option", { name: "Highest rated" }),
    ).toBeInTheDocument();
  });

  it("lists the top 4 recipes in the sidebar, with ad positions", async () => {
    await renderPage(termPage());
    const sidebar = screen.getByRole("complementary", { name: "Sidebar" });
    expect(
      within(sidebar).getByRole("heading", { name: "Popular recipes" }),
    ).toBeInTheDocument();
    expect(
      within(sidebar)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["/recipes/r-0", "/recipes/r-1", "/recipes/r-2", "/recipes/r-3"]);
    const positions = [...document.querySelectorAll("[data-ad-position]")].map(
      (el) => el.getAttribute("data-ad-position"),
    );
    expect(positions).toEqual([
      "term-after-intro",
      "term-infeed",
      "term-sidebar-top",
      "term-sidebar-sticky",
    ]);
  });
});

describe("thin term pages", () => {
  const thin = termPage({
    recipes: recipes(2),
    thin: true,
    more: [
      recipeSummary({ slug: "jollof", title: "Jollof" }),
      recipeSummary({ slug: "akara", title: "Akara" }),
    ],
  });

  it("skip the filters and ads, and point to popular recipes", async () => {
    await renderPage(thin);
    expect(screen.queryByText("Filter recipes")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "More recipes are on the way" }),
    ).toBeInTheDocument();
    expect(cardSlugs()).toEqual(["r-0", "r-1", "jollof", "akara"]);
    expect(document.querySelectorAll("[data-ad-position]")).toHaveLength(0);
  });

  it("turn ads off through the route handle", () => {
    expect(adsAllowed([{ handle, loaderData: thin }])).toBe(false);
    expect(adsAllowed([{ handle, loaderData: termPage() }])).toBe(true);
    expect(adsAllowed([{ handle, loaderData: undefined }])).toBe(false);
  });
});

describe("term page meta", () => {
  const find = (tags: MetaDescriptor[], key: string, value: string) =>
    tags.find((t) => (t as Record<string, unknown>)[key] === value) as
      Record<string, unknown> | undefined;
  const metaFor = (loaderData: TermPageData) =>
    meta({ loaderData } as Parameters<typeof meta>[0]);

  it("uses the name, intro and unfiltered canonical URL", () => {
    const tags = metaFor(
      loader({ params: { slug: "soups-and-stews" } } as Parameters<
        typeof loader
      >[0]),
    );
    expect(
      find(tags, "title", "Soups & Stews Recipes | Foodsera"),
    ).toBeDefined();
    expect(find(tags, "rel", "canonical")?.href).toBe(
      "https://foodsera.com/category/soups-and-stews",
    );
    expect(find(tags, "name", "description")?.content).toMatch(
      /^The heart of the Nigerian table/,
    );
    expect(find(tags, "name", "robots")).toBeUndefined();
  });

  it("adds BreadcrumbList and an ItemList of every recipe in order", () => {
    const page = termPage({ recipes: recipes(3) });
    const jsonLd = metaFor(page)
      .map((t) => (t as Record<string, unknown>)["script:ld+json"])
      .filter(Boolean) as Record<string, unknown>[];
    expect(jsonLd.map((j) => j["@type"])).toEqual([
      "BreadcrumbList",
      "ItemList",
    ]);
    expect(jsonLd[1].itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        url: "https://foodsera.com/recipes/r-0",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: "https://foodsera.com/recipes/r-1",
      },
      {
        "@type": "ListItem",
        position: 3,
        url: "https://foodsera.com/recipes/r-2",
      },
    ]);
  });

  it("marks thin pages noindex, follow", () => {
    const thinPage = regionLoader({
      params: { slug: "niger-delta" },
    } as Parameters<typeof regionLoader>[0]);
    expect(thinPage.thin).toBe(true);
    expect(find(metaFor(thinPage), "name", "robots")?.content).toBe(
      "noindex, follow",
    );
  });

  it("uses a term's seoTitle when it has one", () => {
    const tags = occasionMeta({
      loaderData: termPage({
        term: {
          slug: "party",
          name: "Parties",
          intro: "x",
          seoTitle: "Party Food | Foodsera",
        },
      }),
    } as Parameters<typeof occasionMeta>[0]);
    expect(find(tags, "title", "Party Food | Foodsera")).toBeDefined();
  });

  it("404s an unknown slug", () => {
    expect(() =>
      loader({ params: { slug: "nope" } } as Parameters<typeof loader>[0]),
    ).toThrow();
  });
});
