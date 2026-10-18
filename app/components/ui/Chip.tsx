import type { ReactNode } from "react";
import { Link } from "react-router";

interface ChipProps {
  to: string;
  children: ReactNode;
  onClick?: () => void;
}

interface ToggleChipProps {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** A filter chip: a pill button that stays pressed while its filter is on. */
export function ToggleChip({ pressed, onClick, children }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 rounded-full border-[1.5px] px-4 text-md font-semibold ${
        pressed
          ? "border-charcoal bg-charcoal text-white"
          : "border-field-line bg-paper text-charcoal"
      }`}
    >
      {children}
    </button>
  );
}

/** Rounded pill link, as used for regions and occasions in the menus. */
export function Chip({ to, children, onClick }: ChipProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex min-h-11 items-center rounded-full border border-line-strong bg-paper px-4 font-semibold text-charcoal no-underline hover:text-charcoal"
    >
      {children}
    </Link>
  );
}
