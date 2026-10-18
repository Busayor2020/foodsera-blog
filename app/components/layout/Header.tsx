import { ChevronDown, Menu, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, useLocation } from "react-router";

import type { RecipeSummary, SiteNav } from "~/lib/content/types";
import { categoryPath, searchPath } from "~/lib/paths";

import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

type Panel = "mega" | "search" | "mobile";

interface HeaderProps {
  nav: SiteNav;
  /** "Recipe of the week", shown in the mega menu. */
  featured?: RecipeSummary;
}

/** Which main-nav item is underlined for a given URL. */
export function getNavSection(pathname: string): string | null {
  if (pathname === "/") return "home";
  if (pathname === "/about") return "about";
  const category = pathname.match(/^\/category\/([^/]+)/);
  return category ? category[1] : null;
}

const navItemClass =
  "flex min-h-11 items-center whitespace-nowrap border-b-2 px-2.25 py-2.5 text-md font-semibold text-charcoal no-underline hover:text-charcoal";

function underline(active: boolean) {
  return active ? "border-palm" : "border-transparent";
}

export function Header({ nav, featured }: HeaderProps) {
  const { pathname } = useLocation();
  const { categories, regions, occasions } = nav;

  // Panels remember the page they were opened on, so navigating closes them
  // without an effect.
  const [opened, setOpened] = useState<{ panel: Panel; path: string } | null>(
    null,
  );
  const panel = opened?.path === pathname ? opened.panel : null;
  const toggle = (next: Panel) =>
    setOpened(panel === next ? null : { panel: next, path: pathname });
  const close = () => setOpened(null);

  const scrolled = useScrolledPast(48);
  const section = getNavSection(pathname);

  const megaButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (panel === "search") searchInputRef.current?.focus();
  }, [panel]);

  // Escape, a click outside or focus moving away closes the mega menu and
  // the search panel. The mobile menu is a modal dialog and handles itself.
  useEffect(() => {
    if (panel !== "mega" && panel !== "search") return;
    const button = panel === "mega" ? megaButtonRef : searchButtonRef;
    const content = panel === "mega" ? megaRef : searchPanelRef;
    const isInside = (target: EventTarget | null) =>
      target instanceof Node &&
      (button.current?.contains(target) || content.current?.contains(target));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpened(null);
      button.current?.focus();
    };
    const onOutside = (event: Event) => {
      if (!isInside(event.target)) setOpened(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [panel]);

  return (
    <>
      {/* The header is fixed, so this holds its full height in the page.
          Shrinking on scroll then never moves the content below. */}
      <div aria-hidden="true" className="h-header-height" />
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-cream transition-shadow duration-200 ${scrolled ? "shadow-header" : ""}`}
      >
        <div
          className={`mx-auto flex max-w-header items-center gap-4 px-4 transition-[padding] duration-200 ${scrolled ? "py-1.5" : "py-3.5"}`}
        >
          <Logo compact={scrolled} />

          <nav
            aria-label="Main"
            className="hidden flex-1 items-center justify-center gap-0.5 nav:flex"
          >
            <Link
              to="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`${navItemClass} ${underline(section === "home")}`}
            >
              Home
            </Link>
            <button
              ref={megaButtonRef}
              type="button"
              onClick={() => toggle("mega")}
              aria-expanded={panel === "mega"}
              aria-controls={panel === "mega" ? "mega" : undefined}
              className={`${navItemClass} gap-1 bg-transparent ${underline(panel === "mega")}`}
            >
              Recipes
              <ChevronDown
                size={14}
                strokeWidth={2.6}
                aria-hidden="true"
                className={`transition-transform duration-200 ${panel === "mega" ? "rotate-180" : ""}`}
              />
            </button>
            {categories.map((c) => {
              const href = categoryPath(c.slug);
              return (
                <Link
                  key={c.slug}
                  to={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={`${navItemClass} ${underline(section === c.slug)}`}
                >
                  {c.name}
                </Link>
              );
            })}
            <Link
              to="/about"
              aria-current={pathname === "/about" ? "page" : undefined}
              className={`${navItemClass} ${underline(section === "about")}`}
            >
              About
            </Link>
          </nav>

          <span className="flex-1 nav:hidden" />

          <button
            ref={searchButtonRef}
            type="button"
            onClick={() => toggle("search")}
            aria-label="Search recipes"
            aria-expanded={panel === "search"}
            aria-controls={panel === "search" ? "header-search" : undefined}
            className="flex size-11 flex-none items-center justify-center rounded-full border-[1.5px] border-charcoal bg-paper text-charcoal"
          >
            <Search size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => toggle("mobile")}
            aria-label="Open menu"
            aria-expanded={panel === "mobile"}
            className="flex size-11 flex-none items-center justify-center rounded-full bg-charcoal text-white nav:hidden"
          >
            <Menu size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        {panel === "search" && (
          <div
            id="header-search"
            ref={searchPanelRef}
            className="border-t border-line bg-paper"
          >
            <Form
              role="search"
              action={searchPath}
              method="get"
              onSubmit={close}
              className="mx-auto flex max-w-prose items-center gap-2.5 px-4 py-3.5"
            >
              <label htmlFor="hdr-q" className="sr-only">
                Search recipes
              </label>
              <input
                ref={searchInputRef}
                id="hdr-q"
                name="q"
                type="search"
                placeholder="Search recipes, e.g. egusi, jollof, puff-puff"
                className="min-h-12 min-w-0 flex-1 rounded-full border-[1.5px] border-field-line bg-white px-4"
              />
              <button
                type="submit"
                className="flex min-h-12 items-center rounded-full bg-palm px-5.5 font-bold text-white"
              >
                Search
              </button>
            </Form>
          </div>
        )}

        {panel === "mega" && (
          <MegaMenu
            id="mega"
            ref={megaRef}
            categories={categories}
            regions={regions}
            occasions={occasions}
            featured={featured}
            onNavigate={close}
          />
        )}
      </header>

      <MobileMenu
        open={panel === "mobile"}
        onClose={() => {
          close();
          menuButtonRef.current?.focus();
        }}
        categories={categories}
        regions={regions}
        occasions={occasions}
      />
    </>
  );
}

/**
 * True once the page has scrolled more than `offset` pixels. Watches a
 * sentinel element instead of listening to every scroll event.
 */
function useScrolledPast(offset: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    Object.assign(sentinel.style, {
      position: "absolute",
      top: `${offset}px`,
      left: "0",
      width: "1px",
      height: "1px",
      pointerEvents: "none",
    });
    document.body.prepend(sentinel);
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [offset]);
  return scrolled;
}
