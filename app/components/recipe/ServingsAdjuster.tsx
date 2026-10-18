import { MAX_SERVINGS, MIN_SERVINGS } from "~/lib/format/quantity";

import { useServings } from "./servings";

const stepButton =
  "flex size-11 items-center justify-center rounded-full bg-paper text-[22px] font-bold text-charcoal disabled:cursor-not-allowed disabled:opacity-40";

/** − 6 servings +. Changes are announced to screen readers. */
export function ServingsAdjuster() {
  const { servings, setServings } = useServings();
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-line bg-cream p-0.75">
      <button
        type="button"
        aria-label="Fewer servings"
        disabled={servings <= MIN_SERVINGS}
        onClick={() => setServings(servings - 1)}
        className={stepButton}
      >
        −
      </button>
      <span aria-live="polite" className="min-w-23 text-center text-md">
        <strong>{servings}</strong> {servings === 1 ? "serving" : "servings"}
      </span>
      <button
        type="button"
        aria-label="More servings"
        disabled={servings >= MAX_SERVINGS}
        onClick={() => setServings(servings + 1)}
        className={stepButton}
      >
        +
      </button>
    </div>
  );
}
