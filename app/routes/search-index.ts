import { getAllRecipes } from "~/lib/content";
import { buildSearchIndex } from "~/lib/search";

// A resource route: no page, just the JSON. Prerendered to
// build/client/search-index.json, and only the search page fetches it.
export function loader() {
  return Response.json(buildSearchIndex(getAllRecipes()));
}
