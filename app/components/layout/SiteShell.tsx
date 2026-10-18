import type { ReactNode } from "react";

import { useSiteData } from "~/lib/site-data";

import { Footer } from "./Footer";
import { Header } from "./Header";

/** Skip link, header, the page's single <main>, and footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  const { nav, featured } = useSiteData();
  return (
    <>
      <a
        href="#main"
        className="absolute -left-[9999px] z-200 bg-charcoal px-3.5 py-2.5 text-white no-underline hover:text-white focus:top-2 focus:left-4 print:hidden"
      >
        Skip to content
      </a>
      <Header nav={nav} featured={featured} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer categories={nav.categories} />
    </>
  );
}
