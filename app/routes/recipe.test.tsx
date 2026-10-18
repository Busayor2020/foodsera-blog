import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AD_POSITIONS } from "~/lib/ads/positions";

import RecipePage, { loader } from "./recipe";

// AdPosition renders nothing for now; mark where each one sits instead.
vi.mock("~/components/ads/AdPosition", () => ({
  AdPosition: ({ name }: { name: string }) => <div data-ad-position={name} />,
}));

const SECTIONS: Record<string, string> = {
  header: "article header",
  "quick facts": "[aria-label='Quick facts']",
  "jump to recipe": "a[href='#recipe']",
  hero: "figure img[fetchpriority='high']",
  explained: "[aria-labelledby=explained]",
  method: "[aria-labelledby=method]",
  "step 4": "#step-4",
  "step 5": "#step-5",
  tips: "[aria-labelledby=tips]",
  "recipe card": "#recipe",
  instructions: "#recipe ol",
  "serve with": "[aria-labelledby=serve]",
  faq: "[aria-labelledby=faq]",
  reviews: "#reviews",
  related: "[aria-labelledby=related]",
  sidebar: "aside",
  popular: "[aria-labelledby=side-pop]",
};

function pageOrder(): string[] {
  const named = new Map<Element, string>();
  for (const [name, selector] of Object.entries(SECTIONS)) {
    const el = document.querySelector(selector);
    if (el) named.set(el, name);
  }
  for (const el of document.querySelectorAll("[data-ad-position]")) {
    named.set(el, `ad:${el.getAttribute("data-ad-position")}`);
  }
  const all = [...document.querySelectorAll("*")];
  return all.filter((el) => named.has(el)).map((el) => named.get(el) as string);
}

async function renderRecipe(slug: string) {
  const Stub = createRoutesStub([
    {
      path: "/recipes/:slug",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the stub passes loader data as props
      Component: RecipePage as any,
      loader: ({ params }) =>
        loader({ params } as Parameters<typeof loader>[0]),
    },
  ]);
  render(<Stub initialEntries={[`/recipes/${slug}`]} />);
  await screen.findByRole("heading", { level: 1 });
}

describe("recipe page", () => {
  it("renders every section and ad position in the design's order", async () => {
    await renderRecipe("egusi-soup");
    expect(pageOrder()).toEqual([
      "header",
      "quick facts",
      "jump to recipe",
      "hero",
      "ad:recipe-after-hero",
      "explained",
      "ad:recipe-after-explained",
      "method",
      "step 4",
      "ad:recipe-steps-mid",
      "step 5",
      "tips",
      "ad:recipe-before-card",
      "recipe card",
      "ad:recipe-card-mid",
      "instructions",
      "ad:recipe-after-card",
      "serve with",
      "faq",
      "reviews",
      "related",
      "ad:recipe-multiplex",
      "sidebar",
      "ad:recipe-sidebar-top",
      "popular",
      "ad:recipe-sidebar-sticky",
      "ad:recipe-anchor",
    ]);
  });

  it("places every named ad position exactly once", async () => {
    await renderRecipe("egusi-soup");
    const placed = [...document.querySelectorAll("[data-ad-position]")].map(
      (el) => el.getAttribute("data-ad-position"),
    );
    expect([...placed].sort()).toEqual(
      AD_POSITIONS.filter((name) => name.startsWith("recipe-")).sort(),
    );
  });

  it("never puts the mid-method ad between a step's photo and its text", async () => {
    await renderRecipe("egusi-soup");
    const ad = document.querySelector("[data-ad-position=recipe-steps-mid]");
    expect(ad?.closest("li, figure")).toBeNull();
  });

  it("has one h1 and builds the headings from the short title", async () => {
    await renderRecipe("egusi-soup");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        name: "How to make egusi soup, step by step",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Egusi Soup questions" }),
    ).toBeInTheDocument();
  });

  it("shows ingredient groups as headings", async () => {
    await renderRecipe("jollof-rice");
    expect(
      screen.getByRole("heading", { name: "Pepper base", level: 4 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Rice", level: 4 }),
    ).toBeInTheDocument();
  });
});
