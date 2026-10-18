// Types only, safe to import from browser code. The loaders that produce
// these values live in ./index.ts and run at build time.

export interface Term {
  slug: string;
  name: string;
}

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

/** For layout only. Never output as aggregateRating (see CLAUDE.md, SEO). */
export interface Rating {
  value: number;
  count: number;
}

export interface Recipe {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  category: Term;
  region: Term;
  occasions: Term[];
  heroImage: string;
  heroImageAlt: string;
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
  serveWith: ServeWith[];
  faqs: Faq[];
  nutrition?: Nutrition;
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
