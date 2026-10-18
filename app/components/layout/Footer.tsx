import { Link } from "react-router";

import { categoryPath, recipeIndexPath, searchPath } from "~/lib/paths";
import type { Term } from "~/lib/content/types";
import { SITE_TAGLINE, SOCIAL_LINKS, type SocialLink } from "~/lib/site";

import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import { SocialIcon } from "./SocialIcon";

interface FooterProps {
  categories: Term[];
  /** Defaults to the site config. Only links with a URL are shown. */
  socialLinks?: SocialLink[];
}

const columnLinkClass =
  "flex min-h-9 items-center text-footer-text no-underline hover:text-footer-text hover:underline";
const legalLinkClass =
  "flex min-h-11 items-center text-footer-text hover:text-footer-text";

function ColumnTitle({ children }: { children: string }) {
  return <span className="mb-1.5 eyebrow text-plantain">{children}</span>;
}

export function Footer({
  categories,
  socialLinks = SOCIAL_LINKS,
}: FooterProps) {
  const social = socialLinks.filter((link) => link.href);
  return (
    <footer className="bg-charcoal text-base text-footer-text focus-on-dark print:hidden">
      <div className="mx-auto grid max-w-page grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-10 px-5 pt-14 pb-8">
        <div className="flex flex-col gap-3.5">
          <Logo variant="reversed" />
          <p className="text-footer-muted">{SITE_TAGLINE}</p>
          {social.length > 0 && (
            <ul className="flex gap-2.5">
              {social.map((link) => (
                <li key={link.network}>
                  <a
                    href={link.href}
                    aria-label={link.label}
                    rel="noopener"
                    className="flex size-11 items-center justify-center rounded-full border border-muted text-footer-text hover:text-footer-text"
                  >
                    <SocialIcon network={link.network} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Recipe categories" className="flex flex-col gap-1">
          <ColumnTitle>Recipes</ColumnTitle>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={categoryPath(c.slug)}
              className={columnLinkClass}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <nav aria-label="Explore" className="flex flex-col gap-1">
          <ColumnTitle>Explore</ColumnTitle>
          <Link to={recipeIndexPath} className={columnLinkClass}>
            Recipe index A–Z
          </Link>
          <Link to={searchPath} className={columnLinkClass}>
            Search recipes
          </Link>
          <Link to="/about" className={columnLinkClass}>
            About Foodsera
          </Link>
          <Link to="/contact" className={columnLinkClass}>
            Contact
          </Link>
        </nav>

        <Newsletter />
      </div>

      <div className="border-t border-footer-rule">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 pt-4.5 pb-6 text-sm text-footer-fine">
          <span>© 2026 Foodsera. All rights reserved.</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4.5 gap-y-1">
            <Link to="/privacy" className={legalLinkClass}>
              Privacy Policy
            </Link>
            <Link to="/cookies" className={legalLinkClass}>
              Cookie Policy
            </Link>
            <Link to="/terms" className={legalLinkClass}>
              Terms
            </Link>
            {/* Phase 7 points this at Google's consent message instead. */}
            <Link to="/cookies" className={legalLinkClass}>
              Cookie settings
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function Newsletter() {
  return (
    <div className="flex flex-col gap-2.5">
      <ColumnTitle>Newsletter</ColumnTitle>
      <p className="font-serif text-h3 text-cream">
        Get a new Nigerian recipe every week
      </p>
      <NewsletterForm variant="footer" />
    </div>
  );
}
