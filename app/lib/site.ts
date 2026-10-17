export const SITE_NAME = "Foodsera";
export const SITE_URL = "https://foodsera.com";
export const SITE_TAGLINE =
  "Nigerian home cooking, step by step. Tested recipes for kitchens in Lagos, London, Houston and everywhere in between.";

export type SocialNetwork = "instagram" | "youtube" | "tiktok" | "facebook";

export interface SocialLink {
  network: SocialNetwork;
  label: string;
  /** Leave empty to hide the icon until the account exists. */
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { network: "instagram", label: "Foodsera on Instagram", href: "" },
  { network: "youtube", label: "Foodsera on YouTube", href: "" },
  { network: "tiktok", label: "Foodsera on TikTok", href: "" },
  { network: "facebook", label: "Foodsera on Facebook", href: "" },
];
