import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createRoutesStub,
  useLocation,
  type MetaDescriptor,
} from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Searcher } from "~/lib/search";

import SearchPage, { loader, meta, shouldRevalidate } from "./search";

vi.mock("~/components/ads/AdPosition", () => ({
  AdPosition: ({ name }: { name: string }) => <li data-ad-position={name} />,
}));

// The real index over the real recipes, without fetching it.
const searchState: { fail: boolean } = { fail: false };
vi.mock("~/lib/search", async (importOriginal) => {
  const original = await importOriginal<typeof import("~/lib/search")>();
  const { getAllRecipes } = await import("~/lib/content");
  const searcher: Searcher = original.createSearcher(
    JSON.parse(JSON.stringify(original.buildSearchIndex(getAllRecipes()))),
  );
  return {
    ...original,
    loadSearcher: () =>
      searchState.fail
        ? Promise.reject(new Error("offline"))
        : Promise.resolve(searcher),
  };
});

function Page(props: Parameters<typeof SearchPage>[0]) {
  const { search } = useLocation();
  return (
    <>
      <span data-testid="search">{search}</span>
      <SearchPage {...props} />
    </>
  );
}

async function renderSearch(query = "") {
  const Stub = createRoutesStub([
    {
      path: "/search",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the stub passes loader data as props
      Component: Page as any,
      loader,
      shouldRevalidate,
    },
  ]);
  render(<Stub initialEntries={[`/search${query}`]} />);
  await screen.findByRole("heading", { level: 1, name: "Search recipes" });
  return userEvent.setup();
}

const search = () => screen.getByTestId("search").textContent;
const input = () => screen.getByRole("searchbox", { name: "Search recipes" });

beforeEach(() => {
  searchState.fail = false;
});

describe("search page", () => {
  it("shows the search box, suggestions and popular recipes before a search", async () => {
    await renderSearch();
    expect(input()).toHaveValue("");
    expect(screen.getByText("Try searching for:")).toBeInTheDocument();
    const suggestions = within(
      screen.getByRole("list", { name: "Try searching for:" }),
    );
    expect(suggestions.getByRole("link", { name: "Jollof" })).toHaveAttribute(
      "href",
      "/search?q=Jollof",
    );
    expect(screen.queryByText(/Popular searches/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Popular right now" }),
    ).toBeInTheDocument();
  });

  it("shows results for ?q= from the URL", async () => {
    await renderSearch("?q=jollof");
    expect(
      await screen.findByRole("heading", { name: "1 recipe for “jollof”" }),
    ).toBeInTheDocument();
    expect(input()).toHaveValue("jollof");
    expect(
      screen.getByRole("link", { name: /Smoky Party Jollof Rice/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 recipe found for jollof",
    );
    expect(
      screen.queryByRole("heading", { name: "Popular right now" }),
    ).not.toBeInTheDocument();
  });

  it("searches as you type, putting the query in the URL", async () => {
    const user = await renderSearch();
    await user.type(input(), "pepper soup");
    await waitFor(() => expect(search()).toBe("?q=pepper+soup"));
    expect(
      await screen.findByRole("heading", { name: /for “pepper soup”/ }),
    ).toBeInTheDocument();
    expect(input()).toHaveValue("pepper soup");
  });

  it("searches straight away on Enter", async () => {
    const user = await renderSearch();
    await user.type(input(), "zobo{Enter}");
    expect(search()).toBe("?q=zobo");
  });

  it("fills the box when a suggestion is picked", async () => {
    const user = await renderSearch("?q=egusi");
    await screen.findByRole("heading", { name: /for “egusi”/ });
    await user.click(screen.getByRole("link", { name: "Zobo" }));
    expect(
      await screen.findByRole("heading", { name: /for “Zobo”/ }),
    ).toBeInTheDocument();
    expect(input()).toHaveValue("Zobo");
  });

  it("helps when nothing is found, without ad positions", async () => {
    await renderSearch("?q=ofe%20nsala");
    expect(
      await screen.findByRole("heading", {
        name: "No recipes found for “ofe nsala”",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all recipes A–Z" }),
    ).toHaveAttribute("href", "/recipes");
    expect(screen.getByRole("link", { name: "Soups & Stews" })).toHaveAttribute(
      "href",
      "/category/soups-and-stews",
    );
    const tryThese = screen.getByRole("heading", { name: "Try these instead" })
      .parentElement as HTMLElement;
    expect(within(tryThese).getAllByRole("listitem")).toHaveLength(4);
    expect(document.querySelectorAll("[data-ad-position]")).toHaveLength(0);
  });

  it("says so when the index can't load", async () => {
    searchState.fail = true;
    await renderSearch("?q=jollof");
    expect(
      await screen.findByText(/Search isn't working right now/, {
        selector: "p:not([role])",
      }),
    ).toBeInTheDocument();
  });
});

describe("search page meta", () => {
  const tags = meta({} as Parameters<typeof meta>[0]);
  const find = (key: string, value: string) =>
    tags.find(
      (t: MetaDescriptor) => (t as Record<string, unknown>)[key] === value,
    ) as Record<string, unknown> | undefined;

  it("is noindex, follow with one canonical /search", () => {
    expect(find("title", "Search recipes | Foodsera")).toBeDefined();
    expect(find("name", "robots")?.content).toBe("noindex, follow");
    expect(find("rel", "canonical")?.href).toBe("https://foodsera.com/search");
  });

  it("links the no-results state to the largest category", () => {
    expect(loader().largestCategory).toEqual({
      name: "Soups & Stews",
      path: "/category/soups-and-stews",
    });
  });
});
