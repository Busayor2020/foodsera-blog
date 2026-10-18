import { useSyncExternalStore } from "react";

import type { UnitSystem } from "./format/quantity";

// The reader's Cups/Metric choice, kept in this browser. Storage can be
// missing or throw (private mode, blocked site data), so every access is
// guarded and the choice still works for the visit from memory.

const KEY = "foodsera:units";
const listeners = new Set<() => void>();
let current: UnitSystem | undefined;

function storage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function readUnits(store: Storage | undefined = storage()): UnitSystem {
  if (current) return current;
  try {
    return store?.getItem(KEY) === "metric" ? "metric" : "us";
  } catch {
    return "us";
  }
}

export function writeUnits(
  units: UnitSystem,
  store: Storage | undefined = storage(),
): void {
  current = units;
  try {
    store?.setItem(KEY, units);
  } catch {
    // Not saved for next time, but still applies now.
  }
  for (const listener of listeners) listener();
}

/** Forget the in-memory choice. For tests. */
export function resetUnitsForTests(): void {
  current = undefined;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The saved unit system. Prerendered HTML always uses US cups; the saved
 * choice applies once the page has loaded.
 */
export function useUnits(): [UnitSystem, (units: UnitSystem) => void] {
  const units = useSyncExternalStore(
    subscribe,
    () => readUnits(),
    () => "us" as const,
  );
  return [units, writeUnits];
}
