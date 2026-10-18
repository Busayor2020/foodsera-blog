import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import { Logo } from "./components/layout/Logo";
import { SiteShell } from "./components/layout/SiteShell";
import {
  getFeaturedRecipe,
  getPopularRecipes,
  getSiteNav,
  toRecipeSummary,
} from "./lib/content";
import type { SiteData } from "./lib/content/types";
import "./styles/app.css";

import figtreeLatin from "./styles/fonts/figtree-latin.woff2?url";
import youngSerifLatin from "./styles/fonts/young-serif-latin.woff2?url";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  {
    rel: "preload",
    href: figtreeLatin,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    href: youngSerifLatin,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

// Runs at build time for every prerendered page; the content code never
// reaches the browser. Read it with useSiteData().
export function loader(): SiteData {
  const featured = getFeaturedRecipe();
  return {
    nav: getSiteNav(),
    featured: featured && toRecipeSummary(featured),
    popular: getPopularRecipes(4).map(toRecipeSummary),
  };
}

// The data is fixed at build time. Never refetch it, so client navigation
// doesn't request .data files that don't exist (unknown URLs, or search
// params changing on the same page).
export function shouldRevalidate() {
  return false;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FBF5EA" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}

// Unknown URLs are handled by the 404 route, so this only catches real errors.
// It skips the header and footer in case one of them is what failed.
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const stack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main
      id="main"
      className="mx-auto flex max-w-narrow flex-col gap-4 px-5 pt-10 pb-22"
    >
      <Logo />
      <h1 className="mt-8 text-display">Something went wrong</h1>
      <p className="text-lead text-ink-soft">
        Sorry, this page did not load. Try again, or go back to the{" "}
        <a href="/">homepage</a>.
      </p>
      {stack && (
        <pre className="overflow-x-auto text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
