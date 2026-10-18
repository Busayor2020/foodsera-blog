import { describe, expect, it } from "vitest";

import { inFeedBefore } from "./RecipeGrid";

const slotsFor = (total: number, rule: { after: number; every?: number }) =>
  Array.from({ length: total }, (_, i) => i).filter((i) =>
    inFeedBefore(i, total, rule),
  );

describe("inFeedBefore", () => {
  it("places one slot after `after` cards when two or more follow", () => {
    expect(slotsFor(8, { after: 6 })).toEqual([6]);
    expect(slotsFor(7, { after: 6 })).toEqual([]);
    expect(slotsFor(6, { after: 6 })).toEqual([]);
    expect(slotsFor(20, { after: 6 })).toEqual([6]);
  });

  it("repeats every `every` cards, never near the end", () => {
    expect(slotsFor(20, { after: 6, every: 6 })).toEqual([6, 12, 18]);
    expect(slotsFor(19, { after: 6, every: 6 })).toEqual([6, 12]);
    expect(slotsFor(9, { after: 6, every: 6 })).toEqual([6]);
  });
});
