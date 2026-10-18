import type { MetaDescriptor } from "react-router";

import { SITE_NAME, SITE_URL } from "~/lib/site";

/** "https://foodsera.com" + path, with no trailing slash except the home page. */
export function absoluteUrl(path: string): string {
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean}`;
}

export interface PageMetaInput {
  /** The full title tag text. */
  title: string;
  description: string;
  /** Site path, for example "/recipes/egusi-soup". */
  path: string;
  /** Site path of the share image. */
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
  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    {
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    const imageUrl = absoluteUrl(image);
    tags.push(
      { property: "og:image", content: imageUrl },
      { name: "twitter:image", content: imageUrl },
    );
    if (imageAlt) {
      tags.push(
        { property: "og:image:alt", content: imageAlt },
        { name: "twitter:image:alt", content: imageAlt },
      );
    }
  }
  return tags;
}
