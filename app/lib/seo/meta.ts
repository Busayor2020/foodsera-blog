import type { MetaDescriptor } from "react-router";

import { SITE_NAME, SITE_URL } from "~/lib/site";

/** "https://foodsera.com" + path, with no trailing slash except the home page. */
export function absoluteUrl(path: string): string {
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean}`;
}

/**
 * The branded share image (1200x630, made by scripts/brand-images.ts). Used
 * whenever a page has no image of its own, or only an SVG, which social
 * networks don't show in link previews.
 */
export const DEFAULT_SHARE_IMAGE = {
  path: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "Foodsera: Nigerian recipes, step by step",
};

/** The image for og:image and twitter:image. */
export function shareImage(
  image?: string,
  imageAlt?: string,
): { path: string; alt?: string; width?: number; height?: number } {
  if (!image || /\.svg$/i.test(image)) return DEFAULT_SHARE_IMAGE;
  return { path: image, alt: imageAlt };
}

export interface PageMetaInput {
  /** The full title tag text. */
  title: string;
  description: string;
  /** Site path, for example "/recipes/egusi-soup". */
  path: string;
  /** Site path of the page's own image, if it has one. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}

/** Title, description, canonical URL, Open Graph and Twitter tags. */
export function pageMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}: PageMetaInput): MetaDescriptor[] {
  const url = absoluteUrl(path);
  const share = shareImage(image, imageAlt);
  const imageUrl = absoluteUrl(share.path);
  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
  if (share.width && share.height) {
    tags.push(
      { property: "og:image:width", content: String(share.width) },
      { property: "og:image:height", content: String(share.height) },
    );
  }
  if (share.alt) {
    tags.push(
      { property: "og:image:alt", content: share.alt },
      { name: "twitter:image:alt", content: share.alt },
    );
  }
  return tags;
}
