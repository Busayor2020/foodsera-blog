import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("recipes", "routes/recipe-index.tsx"),
  route("recipes/:slug", "routes/recipe.tsx"),
  route("category/:slug", "routes/category.tsx"),
  route("region/:slug", "routes/region.tsx"),
  route("occasion/:slug", "routes/occasion.tsx"),
  route("search", "routes/search.tsx"),
  route("search-index.json", "routes/search-index.ts"),
  // Anything unmatched. Prerendered as /404 and copied to /404.html.
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
