// Intrinsic sizes of recipe images, for the width and height attributes that
// stop layout shift. Every hero is 4:3; the placeholders are drawn at these
// sizes and real photos must be exported at them too.
export const RECIPE_HERO = { width: 1200, height: 900 } as const;
export const RECIPE_STEP = { width: 800, height: 600 } as const;
export const SIDE_DISH = { width: 600, height: 450 } as const;
