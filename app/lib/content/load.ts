import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

import matter from "gray-matter";
import { Marked, type Token } from "marked";
import type { z } from "zod";

import {
  formatPath,
  recipeFrontmatterSchema,
  termListSchema,
  type RecipeFrontmatter,
} from "./schema";
import type { Recipe, Term } from "./types";

export interface ContentProblem {
  file: string;
  field?: string;
  message: string;
}

/** Thrown with every problem found, so one build run shows them all. */
export class ContentError extends Error {
  readonly problems: ContentProblem[];

  constructor(problems: ContentProblem[]) {
    super(formatProblems(problems));
    this.name = "ContentError";
    this.problems = problems;
  }
}

export function formatProblems(problems: ContentProblem[]): string {
  const byFile = new Map<string, ContentProblem[]>();
  for (const problem of problems) {
    byFile.set(problem.file, [...(byFile.get(problem.file) ?? []), problem]);
  }
  const lines = [
    `Invalid content (${problems.length} problem${problems.length === 1 ? "" : "s"})`,
  ];
  for (const [file, list] of byFile) {
    lines.push(`  ${file}`);
    for (const p of list) {
      lines.push(`    ${p.field ? `${p.field}: ` : ""}${p.message}`);
    }
  }
  return lines.join("\n");
}

export interface LoadOptions {
  contentDir: string;
  publicDir: string;
}

export interface ContentStore {
  recipes: Recipe[];
  categories: Term[];
  regions: Term[];
  occasions: Term[];
}

/** NFC-normalises every string, so the same word always has the same code points. */
export function normalizeText<T>(value: T): T {
  if (typeof value === "string") return value.normalize("NFC") as T;
  if (Array.isArray(value)) return value.map(normalizeText) as T;
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, normalizeText(v)]),
    ) as T;
  }
  return value;
}

const markdown = new Marked({ gfm: true });

export function loadContent({
  contentDir,
  publicDir,
}: LoadOptions): ContentStore {
  const problems: ContentProblem[] = [];
  const display = (path: string) =>
    relative(process.cwd(), path).split("\\").join("/");

  const addIssues = (file: string, issues: z.core.$ZodIssue[]) => {
    for (const issue of issues) {
      problems.push({
        file,
        field: formatPath(issue.path) || undefined,
        message: issue.message,
      });
    }
  };

  const loadTerms = (name: string): Term[] => {
    const path = join(contentDir, `${name}.json`);
    const file = display(path);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      problems.push({
        file,
        message: `could not be read: ${(error as Error).message}`,
      });
      return [];
    }
    const result = termListSchema.safeParse(normalizeText(raw));
    if (!result.success) {
      addIssues(file, result.error.issues);
      return [];
    }
    const seen = new Set<string>();
    result.data.forEach((term, i) => {
      if (seen.has(term.slug)) {
        problems.push({
          file,
          field: `[${i}].slug`,
          message: `"${term.slug}" is used twice`,
        });
      }
      seen.add(term.slug);
    });
    return result.data;
  };

  const categories = loadTerms("categories");
  const regions = loadTerms("regions");
  const occasions = loadTerms("occasions");

  const slugsOf = (terms: Term[]) => terms.map((t) => t.slug);
  const schema = recipeFrontmatterSchema({
    categories: slugsOf(categories),
    regions: slugsOf(regions),
    occasions: slugsOf(occasions),
  });

  // Parse each recipe file on its own first.
  const recipesDir = join(contentDir, "recipes");
  const files = existsSync(recipesDir)
    ? readdirSync(recipesDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
    : [];
  const parsed: {
    file: string;
    name: string;
    data: RecipeFrontmatter;
    body: string;
  }[] = [];

  for (const fileName of files) {
    const path = join(recipesDir, fileName);
    const file = display(path);
    let front: Record<string, unknown>;
    let body: string;
    try {
      // Passing options turns off gray-matter's cache, which would share
      // objects between calls.
      const result = matter(readFileSync(path, "utf8"), { excerpt: false });
      front = normalizeText(result.data);
      body = normalizeText(result.content).trim();
    } catch (error) {
      problems.push({
        file,
        message: `frontmatter is not valid YAML: ${(error as Error).message}`,
      });
      continue;
    }
    const result = schema.safeParse(front);
    if (!result.success) {
      addIssues(file, result.error.issues);
      continue;
    }
    parsed.push({
      file,
      name: basename(fileName, ".md"),
      data: result.data,
      body,
    });
  }

  // Then the checks that need other files.
  const termIndex = (terms: Term[]) => new Map(terms.map((t) => [t.slug, t]));
  const categoryBySlug = termIndex(categories);
  const regionBySlug = termIndex(regions);
  const occasionBySlug = termIndex(occasions);
  // From file names, so a recipe with its own errors doesn't also make every
  // link to it fail.
  const recipeSlugs = new Set(files.map((f) => basename(f, ".md")));
  const featured = parsed.filter((p) => p.data.featured);

  const recipes: Recipe[] = [];
  const slugsSeen = new Map<string, string>();

  for (const { file, name, data, body } of parsed) {
    const before = problems.length;
    const problem = (field: string | undefined, message: string) =>
      problems.push({ file, field, message });

    if (data.slug !== name) {
      problem("slug", `"${data.slug}" must match the file name "${name}.md"`);
    }
    const other = slugsSeen.get(data.slug);
    if (other) problem("slug", `"${data.slug}" is also used by ${other}`);
    slugsSeen.set(data.slug, file);

    // The schema has already checked these exist.
    const category = categoryBySlug.get(data.category);
    const region = regionBySlug.get(data.region);

    const checkImage = (field: string, src: string | undefined) => {
      if (src && !existsSync(join(publicDir, src))) {
        problem(field, `file not found: ${display(join(publicDir, src))}`);
      }
    };
    checkImage("heroImage", data.heroImage);
    data.steps.forEach((s, i) => checkImage(`steps[${i}].image`, s.image));
    data.serveWith.forEach((s, i) => {
      checkImage(`serveWith[${i}].image`, s.image);
      if (s.recipe && !recipeSlugs.has(s.recipe)) {
        problem(`serveWith[${i}].recipe`, `no recipe with slug "${s.recipe}"`);
      }
    });

    if (data.featured && featured.length > 1) {
      const others = featured.filter((f) => f.file !== file).map((f) => f.file);
      problem(
        "featured",
        `only one recipe can be featured (also: ${others.join(", ")})`,
      );
    }

    const introHtml = renderIntro(body, recipeSlugs, (message) =>
      problem("intro", message),
    );

    if (problems.length > before || !category || !region) continue;
    recipes.push({
      ...data,
      category,
      region,
      occasions: data.occasions.map((slug) => occasionBySlug.get(slug) as Term),
      totalMinutes: data.prepMinutes + data.cookMinutes,
      introHtml,
    });
  }

  if (problems.length > 0) throw new ContentError(problems);

  recipes.sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) ||
      a.title.localeCompare(b.title),
  );
  return { recipes, categories, regions, occasions };
}

/**
 * Renders the Markdown intro. Raw HTML is refused, and links to /recipes/
 * must point at a recipe that exists.
 */
function renderIntro(
  body: string,
  recipeSlugs: Set<string>,
  report: (message: string) => void,
): string {
  if (!body) {
    report("the Markdown intro below the frontmatter must not be empty");
    return "";
  }
  const tokens = markdown.lexer(body);
  markdown.walkTokens(tokens, (token: Token) => {
    if (token.type === "html") {
      report(
        `raw HTML is not allowed, use Markdown instead: ${token.raw.trim()}`,
      );
    }
    if (token.type === "link") {
      const match = token.href.match(/^\/recipes\/([^/?#]+)/);
      if (match && !recipeSlugs.has(match[1])) {
        report(
          `links to /recipes/${match[1]}, but there is no recipe with that slug`,
        );
      }
    }
  });
  return markdown.parser(tokens);
}
