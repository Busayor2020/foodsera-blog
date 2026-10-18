import type { ShouldRevalidateFunctionArgs } from "react-router";

/**
 * For pages whose search params only change what the browser shows (filters,
 * search, ?time=). The data is fixed at build time and there is no .data file
 * per query, so a change that keeps the path never refetches.
 */
export function keepDataWhenOnlySearchChanges({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  return currentUrl.pathname === nextUrl.pathname
    ? false
    : defaultShouldRevalidate;
}
