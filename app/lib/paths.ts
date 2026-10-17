// One place for the site's URL shapes (see "Clean URLs" in CLAUDE.md).
export const recipeIndexPath = "/recipes";
export const searchPath = "/search";

export const recipePath = (slug: string) => `/recipes/${slug}`;
export const categoryPath = (slug: string) => `/category/${slug}`;
export const regionPath = (slug: string) => `/region/${slug}`;
export const occasionPath = (slug: string) => `/occasion/${slug}`;
