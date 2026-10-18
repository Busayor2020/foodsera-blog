import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  readUnits,
  resetUnitsForTests,
  useUnits,
  writeUnits,
} from "./preferences";

function throwingStorage(): Storage {
  const fail = () => {
    throw new Error("SecurityError");
  };
  return {
    length: 0,
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}

afterEach(() => {
  resetUnitsForTests();
  window.localStorage.clear();
});

describe("unit preference", () => {
  it("defaults to US cups", () => {
    expect(readUnits()).toBe("us");
  });

  it("remembers the choice in localStorage", () => {
    writeUnits("metric");
    expect(window.localStorage.getItem("foodsera:units")).toBe("metric");
    resetUnitsForTests();
    expect(readUnits()).toBe("metric");
  });

  it("ignores unknown stored values", () => {
    window.localStorage.setItem("foodsera:units", "imperial");
    expect(readUnits()).toBe("us");
  });

  it("still works when storage throws", () => {
    const broken = throwingStorage();
    expect(readUnits(broken)).toBe("us");
    expect(() => writeUnits("metric", broken)).not.toThrow();
    expect(readUnits(broken)).toBe("metric");
  });

  it("updates every component using it", () => {
    const first = renderHook(() => useUnits());
    const second = renderHook(() => useUnits());
    act(() => first.result.current[1]("metric"));
    expect(first.result.current[0]).toBe("metric");
    expect(second.result.current[0]).toBe("metric");
  });
});
