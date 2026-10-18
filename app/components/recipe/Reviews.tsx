import { useId, useRef, useState, type SubmitEvent } from "react";

import type { Recipe } from "~/lib/content/types";
import { shownRating } from "~/lib/ratings";

import { Star } from "./RatingStars";

const field =
  "min-h-12 rounded-ad border-[1.5px] border-field-line bg-white px-3.5 font-normal";
const fieldLabel = "flex flex-col gap-1.5 text-md font-semibold";

/**
 * Reviews: the summary, the form and the list. There is no reviews backend
 * yet, so the list shows an empty state and the form has one TODO(backend)
 * submit handler. No made-up reviews are ever shown.
 */
export function Reviews({ recipe }: { recipe: Recipe }) {
  const rating = shownRating(recipe);
  const id = useId();
  const [stars, setStars] = useState(0);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const firstStar = useRef<HTMLInputElement>(null);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stars === 0) {
      setError("Choose a rating from 1 to 5 stars.");
      firstStar.current?.focus();
      return;
    }
    // TODO(backend): send { recipe: recipe.slug, stars, name, email, comment }
    // to the reviews service.
    setError("");
    setSent(true);
  };

  return (
    <section
      id="reviews"
      aria-labelledby="rev"
      className="flex scroll-mt-4 flex-col gap-5"
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id="rev" className="text-3xl">
          Reviews
        </h2>
        <span className="text-muted">
          {rating
            ? `${rating.value.toFixed(1)} out of 5 · ${rating.count} reviews`
            : "No reviews yet"}
        </span>
      </div>

      {sent ? (
        <p role="status" className="rounded-card bg-ugu-soft px-5 py-4">
          Thanks. Reviews will appear here once they're published.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3.5 rounded-card border border-line bg-paper p-5"
        >
          <fieldset
            className="flex flex-col gap-1.5"
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <legend className="mb-1.5 font-bold">Your rating</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-xs has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ugu has-focus-visible:outline-solid"
                >
                  <input
                    ref={n === 1 ? firstStar : undefined}
                    type="radio"
                    name="rating"
                    value={n}
                    checked={stars === n}
                    onChange={() => {
                      setStars(n);
                      setError("");
                    }}
                    className="sr-only"
                  />
                  <span className="sr-only">
                    {n} star{n > 1 ? "s" : ""}
                  </span>
                  <Star size={30} filled={n <= stars} strokeWidth={1.2} />
                </label>
              ))}
            </div>
            {error && (
              <p
                id={`${id}-error`}
                className="text-md font-semibold text-pepper"
              >
                {error}
              </p>
            )}
          </fieldset>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
            <label className={fieldLabel}>
              Name
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className={field}
              />
            </label>
            <label className={fieldLabel}>
              Email (not published)
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className={field}
              />
            </label>
          </div>
          <label className={fieldLabel}>
            Your comment
            <textarea
              name="comment"
              rows={4}
              required
              className="resize-y rounded-ad border-[1.5px] border-field-line bg-white px-3.5 py-3 font-normal"
            />
          </label>
          <button
            type="submit"
            className="min-h-12 self-start rounded-full bg-ugu px-6 font-bold text-white"
          >
            Post review
          </button>
        </form>
      )}

      <p className="rounded-card border border-dashed border-line-strong px-5 py-6 text-center text-ink-soft">
        <strong className="text-charcoal">
          Be the first to review this recipe.
        </strong>{" "}
        Tell other cooks how it went and what you changed.
      </p>
    </section>
  );
}
