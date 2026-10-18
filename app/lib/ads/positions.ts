// Every place an ad can go, named after where the ad-enabled design shows a
// slot. Pages place <AdPosition name="..."/> at each one; Phase 7 decides
// what renders there.

export const AD_POSITIONS = [
  "home-after-hero",
  "home-popular-infeed",
  "home-after-popular",
  "home-after-regions",
  "recipe-after-hero",
  "recipe-after-explained",
  "recipe-steps-mid",
  "recipe-before-card",
  "recipe-card-mid",
  "recipe-after-card",
  "recipe-multiplex",
  "recipe-sidebar-top",
  "recipe-sidebar-sticky",
  "recipe-anchor",
  "term-after-intro",
  "term-infeed",
  "term-sidebar-top",
  "term-sidebar-sticky",
  "search-infeed",
  "index-after-second-group",
] as const;

export type AdPositionName = (typeof AD_POSITIONS)[number];
