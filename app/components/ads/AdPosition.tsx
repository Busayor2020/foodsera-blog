import type { AdPositionName } from "~/lib/ads/positions";

interface AdPositionProps {
  name: AdPositionName;
}

/**
 * Marks where an ad may go. Renders nothing until the ads system is built
 * (Phase 7), so pages look complete without it.
 */
export function AdPosition(_: AdPositionProps) {
  return null;
}
