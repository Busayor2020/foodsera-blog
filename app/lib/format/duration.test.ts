import { describe, expect, it } from "vitest";

import { formatMinutes } from "./duration";

describe("formatMinutes", () => {
  it.each([
    [0, "0 min"],
    [5, "5 min"],
    [45, "45 min"],
    [60, "1 hr"],
    [75, "1 hr 15 min"],
    [80, "1 hr 20 min"],
    [120, "2 hr"],
    [135, "2 hr 15 min"],
  ])("%i minutes is %s", (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });
});
