import { z } from "zod";

// Shape checks for one file at a time. Checks that need other files (slug vs
// filename, known category, image exists, links) are in ./load.ts.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = z.string().trim().min(1, "must not be empty");

const slug = z
  .string()
  .regex(SLUG_PATTERN, "must be lowercase ASCII kebab-case, like efo-riro");

const imagePath = z
  .string()
  .regex(
    /^\/images\/[a-z0-9/_-]+\.(?:avif|webp|jpe?g|png|svg)$/,
    "must be a path under /images/ ending in .avif, .webp, .jpg, .png or .svg",
  );

const minutes = z.number().int().positive();

// YAML turns unquoted dates into Date objects; quoted ones stay strings.
const date = z
  .union([
    z.date(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date like 2026-10-01"),
  ])
  .transform((value, ctx) => {
    const parsed =
      value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
    const iso = Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString().slice(0, 10);
    // Date rolls 2026-02-31 over to March, so compare the round trip.
    if (!iso || (typeof value === "string" && iso !== value)) {
      ctx.addIssue({ code: "custom", message: "is not a real date" });
      return z.NEVER;
    }
    return iso;
  });

const amount = z.strictObject({
  qty: z.number().positive(),
  unit: text.optional(),
});

const ingredient = z
  .strictObject({
    name: text,
    us: amount.optional(),
    metric: amount.optional(),
    localMeasure: amount.optional(),
    optional: z.boolean().optional(),
  })
  .refine((item) => !item.us === !item.metric, {
    message: "give both us and metric amounts, or neither",
    path: ["metric"],
  });

const withImageAlt = <T extends { image?: string; imageAlt?: string }>(
  value: T,
) => !value.image || !!value.imageAlt;
const imageAltRequired = {
  message: "is required when there is an image",
  path: ["imageAlt"],
};

const step = z
  .strictObject({
    title: text,
    text,
    short: text,
    image: imagePath.optional(),
    imageAlt: text.optional(),
    caption: text.optional(),
  })
  .refine(withImageAlt, imageAltRequired);

const serveWith = z
  .strictObject({
    name: text,
    note: text.optional(),
    image: imagePath.optional(),
    imageAlt: text.optional(),
    recipe: slug.optional(),
  })
  .refine(withImageAlt, imageAltRequired);

const nutrientAmount = z
  .string()
  .regex(/^\d+(?:\.\d+)?\s?(?:g|mg)$/, 'must look like "38g" or "980 mg"');

export const termSchema = z.strictObject({ slug, name: text });
export const termListSchema = z.array(termSchema).min(1);

export interface KnownTerms {
  categories: readonly string[];
  regions: readonly string[];
  occasions: readonly string[];
}

/** A slug that must be one of the terms in content/<kind>s.json. */
const termSlug = (kind: string, known: readonly string[]) =>
  slug.refine((value) => known.includes(value), {
    error: (issue) =>
      `unknown ${kind} "${String(issue.input)}". Must be one of: ${known.join(", ")}`,
  });

/**
 * Built from the known terms, so an unknown category, region or occasion is
 * reported in the same pass as every other field problem.
 */
export const recipeFrontmatterSchema = (terms: KnownTerms) =>
  z
  .strictObject({
    title: text,
    shortTitle: text.optional(),
    slug,
    description: text,
    category: termSlug("category", terms.categories),
    region: termSlug("region", terms.regions),
    occasions: z.array(termSlug("occasion", terms.occasions)).default([]),
    heroImage: imagePath,
    heroImageAlt: text,
    prepMinutes: minutes,
    cookMinutes: minutes,
    servings: z.number().int().positive(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    vegetarian: z.boolean(),
    author: text,
    publishedAt: date,
    updatedAt: date,
    featured: z.boolean().default(false),
    sample: z.boolean().default(false),
    rating: z
      .strictObject({
        value: z.number().min(1).max(5),
        count: z.number().int().positive(),
      })
      .optional(),
    ingredientsExplained: z
      .array(
        z.strictObject({
          local: text,
          aka: text.optional(),
          meaning: text,
          substitute: text.optional(),
        }),
      )
      .default([]),
    ingredients: z
      .array(
        z.strictObject({
          group: text.optional(),
          items: z.array(ingredient).min(1),
        }),
      )
      .min(1),
    steps: z.array(step).min(1),
    tips: z
      .array(z.strictObject({ kind: z.enum(["do", "avoid"]), text }))
      .default([]),
    serveWith: z.array(serveWith).default([]),
    faqs: z.array(z.strictObject({ q: text, a: text })).default([]),
    nutrition: z
      .strictObject({
        calories: z.number().int().positive().optional(),
        protein: nutrientAmount.optional(),
        fat: nutrientAmount.optional(),
        carbs: nutrientAmount.optional(),
        fibre: nutrientAmount.optional(),
        sodium: nutrientAmount.optional(),
      })
      .optional(),
  })
  .refine((r) => r.updatedAt >= r.publishedAt, {
    message: "must not be earlier than publishedAt",
    path: ["updatedAt"],
  });

export type RecipeFrontmatter = z.output<
  ReturnType<typeof recipeFrontmatterSchema>
>;

/** Turns a zod issue path into "steps[4].image". */
export function formatPath(path: readonly PropertyKey[]): string {
  return path
    .map((part, i) =>
      typeof part === "number"
        ? `[${part}]`
        : `${i === 0 ? "" : "."}${String(part)}`,
    )
    .join("");
}
