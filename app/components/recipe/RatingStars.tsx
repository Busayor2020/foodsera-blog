const STAR =
  "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z";

interface StarProps {
  size: number;
  filled: boolean;
  strokeWidth?: number;
}

export function Star({ size, filled, strokeWidth = 1 }: StarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={STAR}
        className={`${filled ? "fill-star" : "fill-white"} stroke-star-edge`}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

interface RatingStarsProps {
  value: number;
  size?: number;
}

/** Five stars, filled to the nearest whole star. Decorative: say the number in text too. */
export function RatingStars({ value, size = 18 }: RatingStarsProps) {
  const filled = Math.round(value);
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} filled={n <= filled} />
      ))}
    </span>
  );
}
