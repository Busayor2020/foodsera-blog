import { cleanup, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { getFeaturedRecipe } from "~/lib/content";
import { recipeSummary } from "~/test/fixtures";

import Home, { HOME_TITLE, loader, meta } from "./home";

// AdPosition renders nothing for now; mark where each one sits instead.
vi.mock("~/components/ads/AdPosition", () => ({
  AdPosition: ({ name }: { name: string }) => <div data-ad-position={name} />,
}));

type HomeData = ReturnType<typeof loader>;

async function renderHome(data: HomeData) {
  const Stub = createRoutesStub([
    {
      path: "/",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the stub passes loader data as props
      Component: Home as any,
      loader: () => data,
    },
  ]);
  render(<Stub initialEntries={["/"]} />);
  await screen.findByRole("heading", { level: 1 });
}

const SECTIONS: Record<string, string> = {
  hero: "[aria-labelledby=hero-title]",
  popular: "[aria-labelledby=popular]",
  categories: "[aria-labelledby=cats]",
  regions: "[aria-labelledby=regions]",
  quick: "[aria-labelledby=quick]",
  newsletter: "[aria-labelledby=news]",
};

/**
 * Sections and ad markers in page order. With `cards`, every recipe card in
 * a grid is listed too, to check what separates the ads.
 */
function pageOrder({ cards = false } = {}): string[] {
  const named = new Map<Element, string>();
  for (const [name, selector] of Object.entries(SECTIONS)) {
    const el = document.querySelector(selector);
    if (el) named.set(el, name);
  }
  if (cards) {
    for (const el of document.querySelectorAll(
      "section ul > li:has(a[href^='/recipes/'])",
    )) {
      named.set(el, "card");
    }
  }
  for (const el of document.querySelectorAll("[data-ad-position]")) {
    named.set(el, `ad:${el.getAttribute("data-ad-position")}`);
  }
  return [...document.querySelectorAll("*")]
    .filter((el) => named.has(el))
    .map((el) => named.get(el) as string);
}

const summaries = (n: number, prefix = "r") =>
  Array.from({ length: n }, (_, i) =>
    recipeSummary({ slug: `${prefix}-${i}`, title: `Recipe ${prefix} ${i}` }),
  );

describe("homepage", () => {
  it("renders every section and ad position in the design's order", async () => {
    await renderHome(loader());
    expect(pageOrder()).toEqual([
      "hero",
      "ad:home-after-hero",
      "popular",
      "ad:home-popular-infeed",
      "ad:home-after-popular",
      "categories",
      "regions",
      "ad:home-after-regions",
      "quick",
      "newsletter",
    ]);
  });

  it("puts the in-feed ad position after the fifth Popular card", async () => {
    await renderHome(loader());
    const ad = document.querySelector("[data-ad-position=home-popular-infeed]");
    const cardsBefore = [
      ...document.querySelectorAll("[aria-labelledby=popular] li"),
    ].filter(
      (li) =>
        ad && li.compareDocumentPosition(ad) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(cardsBefore).toHaveLength(5);
  });

  it("has exactly one h1, the recipe of the week, with an eager hero image", async () => {
    await renderHome(loader());
    const featured = getFeaturedRecipe();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      featured?.title ?? "",
    );
    const images = [...document.querySelectorAll("img")];
    const eager = images.filter(
      (img) => img.getAttribute("loading") !== "lazy",
    );
    expect(eager).toHaveLength(1);
    expect(eager[0]).toHaveAttribute("fetchpriority", "high");
    for (const img of images) {
      expect(img).toHaveAttribute("width");
      expect(img).toHaveAttribute("height");
    }
  });

  it("links tiles and 'more' links to their final URLs", async () => {
    await renderHome(loader());
    expect(
      screen.getByRole("link", { name: "See all recipes" }),
    ).toHaveAttribute("href", "/recipes");
    expect(
      screen.getByRole("link", { name: "More quick recipes" }),
    ).toHaveAttribute("href", "/recipes?time=30");
    expect(screen.getByRole("link", { name: "Swallow" })).toHaveAttribute(
      "href",
      "/category/swallow",
    );
    expect(screen.getByRole("link", { name: /^Edo/ })).toHaveAttribute(
      "href",
      "/region/edo",
    );
  });

  it("hides empty sections and the ad positions that follow them", async () => {
    const data = loader();
    await renderHome({ ...data, featured: undefined, popular: [], quick: [] });
    expect(pageOrder()).toEqual([
      "categories",
      "regions",
      "ad:home-after-regions",
      "newsletter",
    ]);
    // Still exactly one h1 without the hero.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows only the newsletter when there is no content at all", async () => {
    await renderHome({
      featured: undefined,
      popular: [],
      quick: [],
      categories: [],
      regions: [],
    });
    expect(pageOrder()).toEqual(["newsletter"]);
  });

  it("leaves out the in-feed ad unless two cards would follow it", async () => {
    await renderHome({ ...loader(), popular: summaries(6) });
    expect(
      document.querySelector("[data-ad-position=home-popular-infeed]"),
    ).toBeNull();
    cleanup();
    await renderHome({ ...loader(), popular: summaries(7) });
    expect(
      document.querySelector("[data-ad-position=home-popular-infeed]"),
    ).not.toBeNull();
  });

  it("never puts two ad positions next to each other", async () => {
    for (const popularCount of [0, 1, 5, 6, 7, 8]) {
      for (const withHero of [true, false]) {
        cleanup();
        const data = loader();
        await renderHome({
          ...data,
          featured: withHero ? data.featured : undefined,
          popular: summaries(popularCount),
        });
        const order = pageOrder({ cards: true });
        const where = `(popular ${popularCount}, hero ${withHero}): ${order.join(", ")}`;
        for (let i = 1; i < order.length; i++) {
          expect(
            order[i - 1].startsWith("ad:") && order[i].startsWith("ad:"),
            `${order[i - 1]} then ${order[i]} ${where}`,
          ).toBe(false);
        }
        // The in-feed ad is followed by at least two cards before anything else.
        const infeed = order.indexOf("ad:home-popular-infeed");
        if (infeed >= 0) {
          expect(order.slice(infeed + 1, infeed + 3), where).toEqual([
            "card",
            "card",
          ]);
        }
      }
    }
  }, 30_000);
});

describe("homepage loader", () => {
  const data = loader();

  it("leaves the recipe of the week out of Popular and Quick", () => {
    expect(data.featured).toBeDefined();
    const slug = data.featured?.slug;
    expect(data.popular.map((r) => r.slug)).not.toContain(slug);
    expect(data.quick.map((r) => r.slug)).not.toContain(slug);
  });

  it("caps Popular at 8 and Quick at 4, with Quick only 30 minutes or less", () => {
    expect(data.popular.length).toBeLessThanOrEqual(8);
    expect(data.quick.length).toBeGreaterThan(0);
    expect(data.quick.length).toBeLessThanOrEqual(4);
    expect(data.quick.every((r) => r.totalMinutes <= 30)).toBe(true);
  });

  it("uses the teaser for the hero line", () => {
    expect(data.featured?.teaser).toMatch(/^Soft melon seed lumps/);
  });
});

describe("homepage meta", () => {
  const tags = meta({ loaderData: loader() } as Parameters<typeof meta>[0]);

  it("sets the title, canonical URL and website type", () => {
    expect(tags).toContainEqual({ title: HOME_TITLE });
    expect(HOME_TITLE).toBe("Nigerian Recipes, Step by Step | Foodsera");
    expect(tags).toContainEqual({
      tagName: "link",
      rel: "canonical",
      href: "https://foodsera.com/",
    });
    expect(tags).toContainEqual({ property: "og:type", content: "website" });
  });

  it("shares og-default.png, since the featured image is an SVG", () => {
    expect(tags).toContainEqual({
      property: "og:image",
      content: "https://foodsera.com/og-default.png",
    });
  });

  it("includes WebSite and Organization JSON-LD", () => {
    const types = tags
      .filter((tag) => "script:ld+json" in tag)
      .map(
        (tag) =>
          (tag as { "script:ld+json": { "@type": string } })["script:ld+json"][
            "@type"
          ],
      );
    expect(types).toEqual(["WebSite", "Organization"]);
  });
});
