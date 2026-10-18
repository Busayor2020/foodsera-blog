import { describe, expect, it } from "vitest";

import { formatMinutes, toIsoDuration } from "./duration";

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

describe("toIsoDuration", () => {
  it.each([
    [0, "PT0M"],
    [25, "PT25M"],
    [60, "PT1H"],
    [80, "PT1H20M"],
    [135, "PT2H15M"],
  ])("%i minutes is %s", (minutes, expected) => {
    expect(toIsoDuration(minutes)).toBe(expected);
  });
});
