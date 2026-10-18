import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, Link } from "react-router";

import { Chip } from "~/components/ui/Chip";
import type { Term } from "~/lib/content/types";
import {
  categoryPath,
  occasionPath,
  recipeIndexPath,
  regionPath,
  searchPath,
} from "~/lib/paths";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Term[];
  regions: Term[];
  occasions: Term[];
}

const navLinkClass =
  "flex min-h-14 items-center border-b border-line font-serif text-h3 text-charcoal no-underline hover:text-charcoal";

/**
 * Full-screen menu below the `nav` breakpoint. A native modal <dialog> gives
 * the focus trap, Escape to close and an inert page behind it.
 */
export function MobileMenu({
  open,
  onClose,
  categories,
  regions,
  occasions,
}: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while the menu covers it.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    // The dialog handles Escape itself. Clicks are delegated so that any link,
    // including one to the current page, closes the menu.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-label="Menu"
      onClose={onClose}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-cream p-0 text-charcoal backdrop:bg-transparent"
    >
      {open && (
        <div className="mx-auto flex max-w-menu flex-col gap-5 px-4 pt-3 pb-10">
          <div className="flex min-h-14 items-center justify-between">
            <Link
              to="/"
              className="font-serif text-2xl text-charcoal no-underline hover:text-charcoal"
            >
              Food<span className="text-palm-text">sera</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex size-12 items-center justify-center rounded-full bg-charcoal text-white"
            >
              <X size={22} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>

          <Form
            role="search"
            action={searchPath}
            method="get"
            className="flex gap-2"
            onSubmit={onClose}
          >
            <label htmlFor="mob-q" className="sr-only">
              Search recipes
            </label>
            <input
              id="mob-q"
              name="q"
              type="search"
              placeholder="Search recipes"
              className="min-h-13 min-w-0 flex-1 rounded-tile border-[1.5px] border-field-line bg-white px-4 text-body"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex size-13 flex-none items-center justify-center rounded-tile bg-palm text-white"
            >
              <Search size={22} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </Form>

          <nav aria-label="Main" className="flex flex-col">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to={recipeIndexPath} className={navLinkClass}>
              All recipes A–Z
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={categoryPath(c.slug)}
                className={navLinkClass}
              >
                {c.name}
              </Link>
            ))}
            <Link to="/about" className={navLinkClass}>
              About
            </Link>
          </nav>

          <ChipGroup title="By region" terms={regions} toPath={regionPath} />
          <ChipGroup
            title="By occasion"
            terms={occasions}
            toPath={occasionPath}
          />

          <div className="flex gap-5 font-semibold">
            <Link
              to="/contact"
              className="flex min-h-11 items-center text-charcoal hover:text-charcoal"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="flex min-h-11 items-center text-charcoal hover:text-charcoal"
            >
              Privacy
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}

function ChipGroup({
  title,
  terms,
  toPath,
}: {
  title: string;
  terms: Term[];
  toPath: (slug: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="font-sans eyebrow text-ugu">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {terms.map((t) => (
          <li key={t.slug}>
            <Chip to={toPath(t.slug)}>{t.name}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}
