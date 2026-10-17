import categories from "../../../content/categories.json";
import occasions from "../../../content/occasions.json";
import regions from "../../../content/regions.json";

export interface Term {
  slug: string;
  name: string;
}

// Listed in the order the menus show them. Validation with zod arrives with
// the rest of the content layer in Phase 2.
export function getCategories(): Term[] {
  return categories;
}

export function getRegions(): Term[] {
  return regions;
}

export function getOccasions(): Term[] {
  return occasions;
}
