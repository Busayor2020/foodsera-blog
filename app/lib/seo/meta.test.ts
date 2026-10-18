import { describe, expect, it } from "vitest";

import { absoluteUrl, pageMeta } from "./meta";

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

describe("pageMeta", () => {
  const meta = pageMeta({
    title: "Egusi Soup Recipe | Foodsera",
    description: "Rich melon seed soup.",
    path: "/recipes/egusi-soup",
    image: "/images/recipes/egusi-soup/hero.svg",
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
    const image = "https://foodsera.com/images/recipes/egusi-soup/hero.svg";
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

  it("uses a small Twitter card when there is no image", () => {
    expect(
      pageMeta({ title: "About | Foodsera", description: "x", path: "/about" }),
    ).toContainEqual({ name: "twitter:card", content: "summary" });
  });
});
