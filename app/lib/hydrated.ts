import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while React hydrates the prerendered HTML, true from then on.
 *
 * Every page is prerendered without a query string, so anything read from
 * the URL's search params (filters, ?q=, ?time=) must wait until after
 * hydration. Otherwise the first browser render wouldn't match the HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
