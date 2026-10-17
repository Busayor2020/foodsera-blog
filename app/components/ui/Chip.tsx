import type { ReactNode } from "react";
import { Link } from "react-router";

interface ChipProps {
  to: string;
  children: ReactNode;
  onClick?: () => void;
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
