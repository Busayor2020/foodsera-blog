// Which pages may show ads. Each route says so in its handle:
//   export const handle = { ads: false };
//   export const handle = { ads: (loaderData) => !loaderData.thin };
// This is the one place that reads it (see CLAUDE.md, Ads).

export type AdsRule = boolean | ((loaderData: unknown) => boolean);

export interface AdsHandle {
  ads?: AdsRule;
}

interface MatchLike {
  handle?: unknown;
  loaderData?: unknown;
}

/** The deepest route with an ads rule decides. No rule means no ads. */
export function adsAllowed(matches: readonly MatchLike[]): boolean {
  for (const match of [...matches].reverse()) {
    const rule = (match.handle as AdsHandle | undefined)?.ads;
    if (rule === undefined) continue;
    return typeof rule === "function" ? rule(match.loaderData) : rule;
  }
  return false;
}
