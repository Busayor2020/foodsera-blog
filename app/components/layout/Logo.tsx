import { Link } from "react-router";

interface LogoMarkProps {
  size: number;
  className?: string;
}

/** Cream pot with plantain steam and an ugu leaf, on a palm-oil circle. */
export function LogoMark({ size, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
    >
      <circle cx="24" cy="24" r="24" className="fill-palm" />
      <path d="M10 25h28a14 14 0 0 1-28 0z" className="fill-cream" />
      <path
        d="M19 20c-2-3 2-5 0-9M26 20c-2-3 2-5 0-9"
        className="stroke-plantain"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M31 19c1-5 6-7 9-6-1 4-5 7-9 6z" className="fill-leaf" />
    </svg>
  );
}

interface LogoProps {
  /** "reversed" is for dark backgrounds: cream text, "sera" in plantain. */
  variant?: "default" | "reversed";
  /** Smaller mark and wordmark for the scrolled header. */
  compact?: boolean;
  className?: string;
}

export function Logo({
  variant = "default",
  compact = false,
  className = "",
}: LogoProps) {
  const reversed = variant === "reversed";
  return (
    <Link
      to="/"
      aria-label="Foodsera home"
      className={`flex flex-none items-center gap-2.5 no-underline ${reversed ? "text-cream hover:text-cream" : "text-charcoal hover:text-charcoal"} ${className}`}
    >
      <LogoMark
        size={compact ? 32 : 40}
        className="transition-[width,height] duration-200"
      />
      <span
        className={`font-serif leading-none tracking-[-0.01em] transition-[font-size] duration-200 ${compact ? "text-[24px]" : "text-3xl"}`}
      >
        Food
        <span className={reversed ? "text-plantain" : "text-palm-text"}>
          sera
        </span>
      </span>
    </Link>
  );
}
