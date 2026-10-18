import { describe, expect, it } from "vitest";

import { absoluteUrl, pageMeta, shareImage } from "./meta";

describe("absoluteUrl", () => {
  it("puts paths on foodsera.com without a trailing slash", () => {
    expect(absoluteUrl("/")).toBe("https://foodsera.com/");
    expect(absoluteUrl("/recipes/egusi-soup")).toBe(
      "https://foodsera.com/recipes/egusi-soup",
    );
    expect(absoluteUrl("/recipes/egusi-soup/")).toBe(
      "https://foodsera.com/recipes/egusi-soup",
    );
  });
});

describe("shareImage", () => {
  it("uses a page's own raster image", () => {
    expect(shareImage("/images/recipes/egusi-soup/hero.jpg", "Egusi")).toEqual({
      path: "/images/recipes/egusi-soup/hero.jpg",
      alt: "Egusi",
    });
  });

  it("falls back to og-default.png for SVG images and pages without one", () => {
    expect(shareImage("/images/recipes/egusi-soup/hero.svg").path).toBe(
      "/og-default.png",
    );
    expect(shareImage().path).toBe("/og-default.png");
  });
});

describe("pageMeta", () => {
  const meta = pageMeta({
    title: "Egusi Soup Recipe | Foodsera",
    description: "Rich melon seed soup.",
    path: "/recipes/egusi-soup",
    image: "/images/recipes/egusi-soup/hero.jpg",
    imageAlt: "A pot of egusi soup",
    type: "article",
  });

  it("sets the title, description and canonical URL", () => {
    expect(meta).toContainEqual({ title: "Egusi Soup Recipe | Foodsera" });
    expect(meta).toContainEqual({
      name: "description",
      content: "Rich melon seed soup.",
    });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "canonical",
      href: "https://foodsera.com/recipes/egusi-soup",
    });
  });

  it("sets Open Graph and Twitter tags with an absolute image URL", () => {
    const image = "https://foodsera.com/images/recipes/egusi-soup/hero.jpg";
    expect(meta).toEqual(
      expect.arrayContaining([
        { property: "og:type", content: "article" },
        {
          property: "og:url",
          content: "https://foodsera.com/recipes/egusi-soup",
        },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: "A pot of egusi soup" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ]),
    );
  });

  it("shares the branded image, with its size, when the page image is an SVG", () => {
    const svg = pageMeta({
      title: "Egusi Soup Recipe | Foodsera",
      description: "x",
      path: "/recipes/egusi-soup",
      image: "/images/recipes/egusi-soup/hero.svg",
      imageAlt: "A pot of egusi soup",
    });
    expect(svg).toEqual(
      expect.arrayContaining([
        {
          property: "og:image",
          content: "https://foodsera.com/og-default.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          name: "twitter:image",
          content: "https://foodsera.com/og-default.png",
        },
        {
          property: "og:image:alt",
          content: "Foodsera: Nigerian recipes, step by step",
        },
      ]),
    );
    expect(svg).not.toContainEqual(
      expect.objectContaining({ content: expect.stringMatching(/\.svg$/) }),
    );
  });

  it("uses the branded image on pages without an image", () => {
    expect(
      pageMeta({ title: "About | Foodsera", description: "x", path: "/about" }),
    ).toContainEqual({
      property: "og:image",
      content: "https://foodsera.com/og-default.png",
    });
  });
});
