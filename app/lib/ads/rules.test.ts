import { describe, expect, it } from "vitest";

import { adsAllowed } from "./rules";

const root = { handle: undefined, loaderData: {} };

describe("adsAllowed", () => {
  it("follows the deepest route's rule", () => {
    expect(adsAllowed([root, { handle: { ads: true } }])).toBe(true);
    expect(adsAllowed([root, { handle: { ads: false } }])).toBe(false);
    expect(
      adsAllowed([{ handle: { ads: true } }, { handle: { ads: false } }]),
    ).toBe(false);
  });

  it("passes the route's loader data to a rule function", () => {
    const handle = {
      ads: (data: unknown) => !(data as { thin: boolean }).thin,
    };
    expect(adsAllowed([root, { handle, loaderData: { thin: false } }])).toBe(
      true,
    );
    expect(adsAllowed([root, { handle, loaderData: { thin: true } }])).toBe(
      false,
    );
  });

  it("shows no ads when no route has a rule", () => {
    expect(adsAllowed([root, { handle: {} }])).toBe(false);
    expect(adsAllowed([])).toBe(false);
  });
});
