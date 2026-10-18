// Types only, safe to import from browser code. The loaders that produce
// these values live in ./index.ts and run at build time.

export interface Term {
  slug: string;
  name: string;
}

/** A category, region or occasion, with what its own page needs. */
export interface TermDetails extends Term {
  /** The page intro, also used as the meta description. */
  intro: string;
  /** The intro is a placeholder still to be rewritten. */
  introDraft: boolean;
  /** Overrides the default "{name} Recipes | Foodsera" title tag. */
  seoTitle?: string;
}

export interface Category extends TermDetails {
  /** Photo for the homepage "Browse by category" tile. */
  image?: string;
  imageAlt?: string;
}

export interface Region extends TermDetails {
  /** For example "Efo riro, amala and ewedu, ofada stew". */
  dishes?: string;
}

export type Occasion = TermDetails;

export type Difficulty = "easy" | "medium" | "hard";

export interface Amount {
  qty: number;
  unit?: string;
}

export interface Ingredient {
  name: string;
  us?: Amount;
  metric?: Amount;
  localMeasure?: Amount;
  optional?: boolean;
}

export interface IngredientGroup {
  group?: string;
  items: Ingredient[];
}

export interface Step {
  title: string;
  text: string;
  /** One-line version for the recipe card. */
  short: string;
  image?: string;
  imageAlt?: string;
  caption?: string;
}

export interface Tip {
  kind: "do" | "avoid";
  text: string;
}

export interface ExplainedIngredient {
  local: string;
  aka?: string;
  meaning: string;
  substitute?: string;
}

export interface ServeWith {
  name: string;
  note?: string;
  image?: string;
  imageAlt?: string;
  /** Slug of a Foodsera recipe for this side, if there is one. */
  recipe?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Nutrition {
  calories?: number;
  protein?: string;
  fat?: string;
  carbs?: string;
  fibre?: string;
  sodium?: string;
}

/**
 * Hand-entered, allowed only on sample recipes for layout. Never output as
 * aggregateRating (see CLAUDE.md, SEO).
 */
export interface Rating {
  value: number;
  count: number;
}

export interface Recipe {
  slug: string;
  title: string;
  shortTitle?: string;
  /** One punchy line for the homepage hero. Falls back to description. */
  teaser?: string;
  /** Overrides the default "{short title} Recipe | Foodsera" title tag. */
  seoTitle?: string;
  description: string;
  category: Term;
  region: Term;
  occasions: Term[];
  heroImage: string;
  heroImageAlt: string;
  heroCaption?: string;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  servings: number;
  difficulty: Difficulty;
  vegetarian: boolean;
  author: string;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** YYYY-MM-DD */
  updatedAt: string;
  featured: boolean;
  sample: boolean;
  rating?: Rating;
  ingredientsExplained: ExplainedIngredient[];
  ingredients: IngredientGroup[];
  steps: Step[];
  tips: Tip[];
  serveWithIntro?: string;
  serveWith: ServeWith[];
  faqs: Faq[];
  /** The Notes box in the recipe card. */
  notes: string[];
  nutrition?: Nutrition;
  /** For example "estimated, per serving, soup only". */
  nutritionNote?: string;
  /** The Markdown intro, rendered to HTML at build time. */
  introHtml: string;
}

/** The small slice of a recipe that cards and menus need. */
export interface RecipeSummary {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  category: Term;
  totalMinutes: number;
  servings: number;
  difficulty: Difficulty;
  rating?: Rating;
  heroImage: string;
  heroImageAlt: string;
}

/** A card on a filterable list, with what the filters and sorting need. */
export interface ListRecipe extends RecipeSummary {
  region: Term;
  vegetarian: boolean;
  /** Place in the site's popularity order. 0 is the most popular. */
  popularity: number;
}

export type TermKind = "category" | "region" | "occasion";

/** Everything a category, region or occasion page shows. */
export interface TermPageData {
  kind: TermKind;
  term: Pick<TermDetails, "slug" | "name" | "intro" | "seoTitle">;
  /** For example "/category/soups-and-stews". */
  path: string;
  /** The term's recipes, most popular first. */
  recipes: ListRecipe[];
  /** Regions offered as filter chips: only those with recipes here. */
  regions: Term[];
  /** Too few recipes to index: noindex, no sitemap entry, no ads. */
  thin: boolean;
  /** On thin pages, popular recipes from elsewhere on the site. */
  more: RecipeSummary[];
}

export interface SiteNav {
  categories: Term[];
  regions: Term[];
  occasions: Term[];
}

/** What the root loader gives every page: menus and the recipe highlights. */
export interface SiteData {
  nav: SiteNav;
  /** "Recipe of the week". */
  featured?: RecipeSummary;
  popular: RecipeSummary[];
}
