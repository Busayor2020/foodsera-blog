import type { ReactNode } from "react";
import { Link } from "react-router";

interface HomeSectionProps {
  id: string;
  title: string;
  intro?: string;
  /** A "See all" style link at the end of the heading row. */
  more?: { label: string; href: string };
  children: ReactNode;
}

/** A homepage section: heading row, then content, in the page column. */
export function HomeSection({
  id,
  title,
  intro,
  more,
  children,
}: HomeSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto flex w-full max-w-page flex-col gap-5 px-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <h2 id={id} className="text-h2">
            {title}
          </h2>
          {intro && <p className="text-muted">{intro}</p>}
        </div>
        {more && (
          <Link to={more.href} className="flex min-h-11 items-center font-bold">
            {more.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
