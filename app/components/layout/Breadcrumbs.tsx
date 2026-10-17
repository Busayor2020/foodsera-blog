import { Fragment } from "react";
import { Link } from "react-router";

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page, which must be the last item. */
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-muted ${className}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {isLast || !item.href ? (
                <li
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-semibold text-charcoal" : undefined}
                >
                  {item.label}
                </li>
              ) : (
                <li>
                  <Link
                    to={item.href}
                    className="text-muted hover:text-charcoal"
                  >
                    {item.label}
                  </Link>
                </li>
              )}
              {!isLast && <li aria-hidden="true">›</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
