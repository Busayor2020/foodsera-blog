import type { MetaDescriptor } from "react-router";

import type { AdsRule } from "./ads/rules";
import type { TermPageData } from "./content/types";
import { recipePath } from "./paths";
import { breadcrumbJsonLd, itemListJsonLd, type Crumb } from "./seo/jsonld";
import { pageMeta } from "./seo/meta";
import { SITE_NAME } from "./site";

// Shared by the category, region and occasion routes.

/** The title tag: the term's seoTitle, or "Soups & Stews Recipes | Foodsera". */
export function termTitle(term: TermPageData["term"]): string {
  return term.seoTitle ?? `${term.name} Recipes | ${SITE_NAME}`;
}

export function termCrumbs(page: TermPageData): Crumb[] {
  return [{ name: "Home", path: "/" }, { name: page.term.name }];
}

/** Thin pages show no ads. */
export const termAds: AdsRule = (loaderData) => {
  const page = loaderData as TermPageData | undefined;
  return !!page && !page.thin;
};

/**
 * Meta for a term page. The canonical URL is always the unfiltered path, and
 * thin pages are noindex.
 */
export function termMeta(
  page: TermPageData | undefined,
  notFoundTitle: string,
): MetaDescriptor[] {
  if (!page) return [{ title: `${notFoundTitle} | ${SITE_NAME}` }];
  const lead = page.recipes[0];
  return [
    ...pageMeta({
      title: termTitle(page.term),
      description: page.term.intro,
      path: page.path,
      image: lead?.heroImage,
      imageAlt: lead?.heroImageAlt,
    }),
    ...(page.thin ? [{ name: "robots", content: "noindex, follow" }] : []),
    { "script:ld+json": breadcrumbJsonLd(termCrumbs(page)) },
    {
      "script:ld+json": itemListJsonLd(
        page.recipes.map((r) => recipePath(r.slug)),
      ),
    },
  ];
}
