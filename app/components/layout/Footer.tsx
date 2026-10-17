import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { getCategories } from "~/lib/content/taxonomy";
import { categoryPath, recipeIndexPath, searchPath } from "~/lib/paths";
import { SITE_TAGLINE, SOCIAL_LINKS, type SocialLink } from "~/lib/site";

import { Logo } from "./Logo";
import { SocialIcon } from "./SocialIcon";

interface FooterProps {
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

export function Footer({ socialLinks = SOCIAL_LINKS }: FooterProps) {
  const social = socialLinks.filter((link) => link.href);
  return (
    <footer className="bg-charcoal text-base text-footer-text focus-on-dark">
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
          {getCategories().map((c) => (
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
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO(backend): send the address to the newsletter provider.
    setSubscribed(true);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <ColumnTitle>Newsletter</ColumnTitle>
      <p className="font-serif text-h3 text-cream">
        Get a new Nigerian recipe every week
      </p>
      {subscribed ? (
        <p
          role="status"
          className="rounded-field bg-ugu px-3.5 py-3 text-white"
        >
          Thank you. Check your inbox to confirm.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <label htmlFor="ft-email" className="text-sm text-footer-muted">
            Email address
          </label>
          <input
            id="ft-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="min-h-12 rounded-field bg-cream px-3.5 text-charcoal"
          />
          <button
            type="submit"
            className="min-h-12 rounded-field bg-plantain font-bold text-charcoal"
          >
            Subscribe
          </button>
          <span className="text-eyebrow text-footer-fine">
            No spam. Unsubscribe anytime.
          </span>
        </form>
      )}
    </div>
  );
}
