// Every place an ad can go, named after where the ad-enabled design shows a
// slot. Pages place <AdPosition name="..."/> at each one; Phase 7 decides
// what renders there.

export const AD_POSITIONS = [
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
] as const;

export type AdPositionName = (typeof AD_POSITIONS)[number];
