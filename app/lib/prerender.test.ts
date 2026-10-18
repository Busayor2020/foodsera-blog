import { index, layout, prefix, route } from "@react-router/dev/routes";
import { describe, expect, it } from "vitest";

import { collectRoutePaths, contentPathsForRoutes } from "./prerender";

const content = {
  recipes: ["/recipes/egusi-soup", "/recipes/jollof-rice"],
  categories: ["/category/soups-and-stews"],
  regions: ["/region/yoruba"],
  occasions: ["/occasion/party"],
};

describe("collectRoutePaths", () => {
  it("joins nested and prefixed paths", () => {
    const paths = collectRoutePaths([
      index("routes/home.tsx"),
      layout("routes/layout.tsx", [
        route("category/:slug", "routes/category.tsx"),
      ]),
      ...prefix("recipes", [route(":slug", "routes/recipe.tsx")]),
      route("*", "routes/404.tsx"),
    ]);
    expect([...paths].sort()).toEqual(["*", "category/:slug", "recipes/:slug"]);
  });
});

describe("contentPathsForRoutes", () => {
  it("includes nothing while no content routes exist", () => {
    expect(contentPathsForRoutes(content, new Set(["*"]))).toEqual([]);
  });

  it("includes each group once its route is registered", () => {
    expect(
      contentPathsForRoutes(
        content,
        new Set(["recipes/:slug", "occasion/:slug"]),
      ),
    ).toEqual([
      "/recipes/egusi-soup",
      "/recipes/jollof-rice",
      "/occasion/party",
    ]);
  });
});
