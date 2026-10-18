# CLAUDE.md: Foodsera

Foodsera (foodsera.com) is a Nigerian recipe blog funded by Google AdSense, built from a finished Claude Design prototype. Most readers are on mobile phones, often on slow or expensive data, so speed, readability and clean ad placement matter as much as looks.

## Golden rules

1. The design is the source of truth. Match the Claude Design handoff in `design/` (colors, type, spacing, components, layouts) closely. If something is unclear or impossible, ask before inventing.
2. Every page ships as prerendered HTML. Google Search and AdSense must see the full content, title, meta tags and recipe schema without running JavaScript.
3. Content first, ads second. Follow the Ads section exactly. AdSense policy problems can get the account banned.
4. Mobile first. Build and check every component at 390px before tablet (768px) and desktop (1440px).
5. Small, reviewable steps. Plan before large changes, keep each commit focused, and run the checks before saying a task is done.
6. Never add Claude as an author or co-author on commits or pull requests. No "Co-Authored-By" trailers and no "Generated with Claude Code" lines.

## Tech stack

- React 19 + TypeScript (strict)
- React Router v8 in framework mode (Vite plugin) with `ssr: false` and `prerender` in `react-router.config.ts`, so every route builds to static HTML. Static output goes to `build/client`.
  - Import from `react-router` and `react-router/dom`. `react-router-dom` no longer exists in v8. If unsure about a v8 API, check reactrouter.com before guessing.
- Tailwind CSS v4 via `@tailwindcss/vite`, design tokens in `app/styles/app.css` using `@theme`
- Content backend: headless WordPress (`wordpress/foodsera-core`), pulled at build time. See Headless WordPress.
- Content: Markdown files with YAML frontmatter in `content/`, read at build time with `gray-matter`, validated with `zod`, Markdown rendered with `marked` (build time only). This is the local and test source.
- Search: `fuse.js` over a JSON index generated at build time
- Icons: `lucide-react`
- Tests: Vitest + React Testing Library
- Lint and format: ESLint + Prettier
- Node 22.22 or newer

Do not add dependencies beyond these without explaining why and getting a yes first. Prefer CSS and native elements over libraries.

## Commands

- `npm run dev` start the dev server (`npm run dev -- --host` to test on a phone on the same Wi-Fi)
- `npm run build` production build with prerendering
- `npm run typecheck` React Router typegen + `tsc`
- `npm run lint` ESLint
- `npm run test` Vitest
- `npx serve build/client` check the built static site locally

A task is done only when typecheck, lint, test and build all pass.

## Project structure

```
app/
  root.tsx              html shell, global meta, fonts, AdSense script loader
  routes.ts             route config
  routes/               home, recipe, category, region, occasion, search, recipe-index,
                        about, contact, privacy, cookies, terms, 404
  components/
    layout/             Header, MegaMenu, MobileMenu, Footer, Breadcrumbs, Sidebar
    recipe/             RecipeCard, QuickFacts, IngredientsExplained, StepList,
                        RecipeCardFull, ServingsAdjuster, FaqAccordion, Reviews,
                        RelatedRecipes
    ads/                AdSlot, InFeedAd, AnchorAd
    ui/                 Button, Chip, Accordion, Input, Badge
  lib/
    content/            getAllRecipes, getRecipe, getCategories, getRegions,
                        getOccasions
                        (the ONLY module that reads content/)
    seo/                meta helpers, JSON-LD builders (Recipe, BreadcrumbList, Organization)
    ads/                ad config, slot ids, which routes allow ads
    format/             durations, quantity scaling, fractions
  styles/app.css        Tailwind import, @theme tokens, print styles
content/
  recipes/<slug>.md
  categories.json
  regions.json
  occasions.json
  pages/                about, privacy, cookies, terms (Markdown)
  .wp/                  pulled WordPress snapshot (gitignored)
public/
  images/recipes/<slug>/
  images/wp/            pulled WordPress images (gitignored)
  ads.txt
  robots.txt
  _headers              Cloudflare Pages headers
scripts/                build-time scripts: search index, sitemap
  content-pull.ts       fetches the WordPress export and images
wordpress/
  foodsera-core/        the WordPress plugin (see Headless WordPress)
design/                 Claude Design handoff or exported bundle. READ ONLY. Never edit.
```

Keep `lib/content` as the single place that knows where content comes from: the WordPress source plugs in here (see Headless WordPress).

## Design implementation

- Before building a screen, open its source in `design/` and match it. Put tokens (colors, fonts, radii, shadows, spacing) into `@theme` once and use them everywhere. No hard-coded hex values in components.
- Name components the way the design handoff names them so the two stay in sync.
- Body text at least 16px on mobile. Tap targets at least 44px.
- Respect `prefers-reduced-motion`. Keep animation light.
- Accessibility: semantic HTML (header, nav, main, article, aside, footer), one h1 per page, alt text on every image, visible focus states, WCAG AA contrast, menus and accordions fully usable by keyboard.

## Content model

Recipe frontmatter, following the fields the design shows. The build must fail on invalid content, with a message naming the file and the field. Unknown keys are errors.

```yaml
title: Egusi Soup with Ugu and Assorted Meat
shortTitle: Egusi Soup        # optional: recipe card heading and breadcrumbs (cards use title)
teaser: Soft melon seed lumps, rich palm oil and bright ugu.   # optional: homepage hero line, falls back to description
seoTitle: Egusi Soup Recipe (Nigerian Melon Seed Soup)   # optional, max 70 chars: overrides the title tag
slug: egusi-soup              # plain ASCII kebab-case, same as the filename
description: One or two sentences for cards and the meta description
category: soups-and-stews     # slug from content/categories.json
region: yoruba                # yoruba | igbo | hausa-northern | niger-delta | edo | efik-ibibio
occasions: [party, weeknight] # slugs from content/occasions.json
heroImage: /images/recipes/egusi-soup/hero.jpg
heroImageAlt: Bowl of egusi soup with assorted meat and stockfish
heroCaption: "Party-style egusi: soft lumps, bright ugu and plenty of assorted meat."   # optional
prepMinutes: 25
cookMinutes: 55
servings: 6
difficulty: medium            # easy | medium | hard
vegetarian: false
author: Foodsera Kitchen
publishedAt: 2026-10-01
updatedAt: 2026-10-15
featured: true                # optional: "Recipe of the week". At most one recipe.
sample: true                  # optional: placeholder content. The build warns while any remain.
rating: { value: 4.8, count: 126 }   # optional, sample: true recipes only (see SEO)
ingredientsExplained:
  - { local: Iru, aka: "dawadawa, locust beans", meaning: Fermented locust beans with a deep, savoury aroma., substitute: A teaspoon of miso, or leave it out. }
ingredients:
  - group: Soup               # optional group heading
    items:
      - name: ground egusi (melon seeds)
        us: { qty: 2, unit: cups }        # US cups view
        metric: { qty: 250, unit: g }     # Metric view
        localMeasure: { qty: 1, unit: derica }   # optional
      - { name: iru (locust beans), us: { qty: 2, unit: tbsp }, metric: { qty: 25, unit: g }, optional: true }
      - { name: "Salt, to taste" }        # no amounts
steps:
  - title: Fry the egusi into lumps
    text: Scoop the paste into the oil in spoonfuls. Leave it alone for 3 to 4 minutes...
    short: Spoon in the paste. Leave 3 to 4 minutes, turn gently, fry 8 to 10 minutes.  # recipe card
    image: /images/recipes/egusi-soup/step-5.jpg    # optional; needs imageAlt
    imageAlt: Egusi lumps frying in red palm oil
    caption: Do not stir yet. The lumps need time to set.   # optional
tips:
  - { kind: do, text: leave the egusi alone for 3 to 4 minutes after it goes into the oil. }
  - { kind: avoid, text: letting the palm oil smoke. }
serveWithIntro: Egusi needs a swallow. Pick your favourite, or serve with boiled yam or white rice.   # optional
serveWith:
  - { name: Pounded yam, note: The classic pairing, image: /images/sides/pounded-yam.jpg, imageAlt: Smooth ball of pounded yam, recipe: pounded-yam }   # recipe: optional slug
faqs:
  - { q: Can I freeze egusi soup?, a: Yes, for up to 3 months in an airtight container. }
notes:                        # optional: the Notes box in the recipe card
  - No bitterleaf? Leave it out. The soup is still complete with ugu alone.
nutritionNote: estimated, per serving, soup only   # optional
nutrition: { calories: 610, protein: 38g, fat: 46g, carbs: 12g, fibre: 4g, sodium: 980mg }   # optional, every field optional
```

Every entry in `content/categories.json`, `content/regions.json` and `content/occasions.json` has `{ slug, name, intro, introDraft?, seoTitle? }`. `intro` is the term page intro and its meta description. `seoTitle` (max 70 chars) replaces the default `{name} Recipes | Foodsera` title tag. `introDraft: true` marks a placeholder intro written for layout: the production build lists every draft intro in its warning, next to the sample recipes, so each one is rewritten in Victor's own voice and the flag removed before launch. Categories add `image?, imageAlt?` (the homepage tile photo, which must exist in `public/`). Regions add `dishes?` (the list on the homepage region tile).

The Markdown body is the short intro story. Keep it skimmable. It may link to other recipes (`[jollof rice](/recipes/jollof-rice)`); the build fails if a `/recipes/` link points to a recipe that doesn't exist. Markdown is rendered to HTML inside `lib/content` only, so the Markdown library never reaches the browser bundle.

Every string is normalised to Unicode NFC when it is loaded, so the same Yoruba, Igbo or Hausa word always has the same code points. Slugs stay plain ASCII (`efo-riro`, not `ẹfọ-riro`).

## Page features

- Recipe page: breadcrumbs, quick facts bar, Jump to Recipe (smooth scroll to `#recipe`), Print (print stylesheet shows only the recipe card), Ingredients Explained, step photos, tips, recipe card with servings adjuster (scales quantities, shows friendly fractions like 1½) and ingredient checkboxes, serve-with, FAQ accordion, reviews UI, related recipes, desktop sidebar.
- Category, region and occasion pages (occasion slugs: `party`, `christmas`, `sallah`, `weeknight`, `lunch-box`, linked from the menus' "By occasion" group): filter chips (time, difficulty, region, vegetarian) and sort, synced to URL search params so filtered views can be shared. Filtering runs on the client over prerendered data.
- Term pages with fewer than 3 recipes (category, region or occasion) get `noindex`, stay out of the sitemap and show no ads. They are still prerendered, because the menus link to every term.
- Search: `/search?q=` using the prebuilt Fuse index, with a helpful empty state. Search ignores diacritics and tone marks on both the query and the index, so "efo riro" matches "Ẹfọ riro".
- Recipe index: A to Z, grouped by category.
- Contact form, newsletter and reviews need a backend. Build the UI with one submit handler marked `TODO(backend)`. The backend for these forms is the foodsera-core plugin. See Headless WordPress.

## Headless WordPress

WordPress is the content backend. Editors write recipes in wp-admin at `cms.foodsera.com`. Readers never touch WordPress: they get the same static, prerendered React Router site, served from Cloudflare Pages at `foodsera.com`. Everything in Golden rules still applies, especially rule 2 (every page ships as prerendered HTML).

### How it fits together

```
Editor ──► cms.foodsera.com (WordPress + foodsera-core plugin)
              │ publish, update, approve a review
              ▼
        Cloudflare Pages deploy hook
              │
              ▼
        npm run build
          1. npm run content:pull   fetch the export + images from WordPress
          2. react-router build     zod validation, prerender, static output
              │
              ▼
        foodsera.com (static, Cloudflare CDN)
              │ review, contact and newsletter forms POST to
              ▼
        cms.foodsera.com/wp-json/foodsera/v1/{reviews,contact,subscribe}
```

If WordPress is down or a recipe is invalid, the build fails and the live site keeps serving the last good build. That is the intended safety net.

### Repository additions

```
wordpress/
  foodsera-core/            the WordPress plugin, versioned in this repo
    foodsera-core.php
    src/                    PostTypes, Taxonomies, Fields, Export, Reviews,
                            Contact, Newsletter, Deploy, Security, Cli
    acf-json/               SCF field groups, committed so field changes are versioned
    tests/
scripts/
  content-pull.ts           fetches the WordPress export and images
content/
  .wp/                      pulled snapshot (gitignored)
public/
  images/wp/                pulled images (gitignored)
  _headers                  Cloudflare Pages headers (see Hosting)
```

### Content source switch (front end)

- `CONTENT_SOURCE` = `markdown` (default: local dev, tests, fixtures) | `wordpress`.
- `lib/content` stays the only module that knows where content comes from. Components, routes and the zod schemas do not change because of WordPress, apart from the approved reviews added in 7c.
- With `wordpress`, the loaders read the pulled snapshot `content/.wp/export.json` **synchronously**, exactly as they read Markdown today. Prerendering never calls the network.
- The snapshot is validated by the same zod schemas and cross-file checks as Markdown content (slugs, terms, images exist, `/recipes/` links resolve, one featured recipe, ratings only on samples). The export uses the content model's field names exactly (camelCase), so the schemas apply unchanged. The plugin owns the mapping from WordPress fields to that shape.
- The intro comes from WordPress as `introHtml`, already sanitised by `wp_kses` on the WordPress side. The loader still refuses any tag outside `p, a, strong, em, ul, ol, li, br` and still checks every `/recipes/` link.
- `npm run content:pull` (`scripts/content-pull.ts`):
  - fetches `${WP_API_URL}/foodsera/v1/export` page by page, sending `X-Foodsera-Build-Token`
  - downloads every referenced image into `public/images/wp/<recipe-slug>/` with deterministic lowercase names (`hero-1200.webp`, `step-3-800.webp`), and rewrites the paths to `/images/wp/...` so the existing image rules and file-exists checks apply
  - reuses images already downloaded when the URL and modified date match (Cloudflare build cache), so builds stay fast
  - writes `content/.wp/export.json`
  - fails with a clear message if WordPress is unreachable, the token is wrong, or the JSON is malformed
- When `CONTENT_SOURCE=wordpress`, `npm run build` runs `content:pull` first. The Markdown sample recipes stay in the repo as fixtures and do not ship.
- **Parity test:** the 8 sample recipes are imported into WordPress (see WP-CLI below). A test loads them from Markdown and from a recorded WordPress export and asserts the resulting `Recipe` objects are identical. This proves the mapping is lossless.

### The plugin: foodsera-core

**Standards:** current WordPress, PHP 8.1+, namespaced OOP classes with `declare(strict_types=1)`, WordPress Coding Standards (PHPCS), sanitise every input, escape every output, capability checks on every admin action. The dependency rule in Tech stack applies to Composer too: ask before adding a package.

**Required plugins:** Secure Custom Fields (SCF, by WordPress.org) for the field groups, an SMTP plugin for mail, Two Factor for logins. Optional: Antispam Bee. Nothing that renders a front end: no page builders, no SEO plugins, no ad plugins. The React app already does those jobs.

**Post type `recipe`:**
- `show_ui` and `show_in_rest` on (the block editor needs REST); `publicly_queryable` off, so WordPress has no recipe pages of its own.
- Supports: title, editor (the intro), thumbnail (the hero image), revisions, comments (reviews).
- The block editor for recipes allows only Paragraph and List blocks (`allowed_block_types_all`), with bold, italic and links.
- The slug is `post_name`, forced to plain ASCII kebab-case on save: strip diacritics and tone marks first, then `sanitize_title`, so `Ẹ̀fọ́ Riro` becomes `efo-riro`. If the result still isn't plain ASCII kebab-case, refuse to publish and say why. Test this with Yoruba, Igbo and Hausa titles, since `remove_accents` alone may not cover every letter or combining mark.

**Taxonomies:** `recipe_category` and `recipe_region` (exactly one per recipe, enforced on save), `recipe_occasion` (any number). Term slugs match `content/*.json` today. Term fields (SCF): `intro`, `introDraft`, `seoTitle` on all three; `image` and its alt text on categories; `dishes` on regions.

**Recipe fields (SCF field group, registered in code):**

| Content model | WordPress |
|---|---|
| `title`, `slug` | post title, `post_name` |
| intro (`introHtml`) | post content (Paragraph and List blocks only) |
| `description`, `shortTitle`, `teaser`, `seoTitle`, `heroCaption`, `serveWithIntro`, `nutritionNote` | text fields (`seoTitle` max 70 characters) |
| `heroImage`, `heroImageAlt` | featured image and its alt text (required) |
| `category`, `region`, `occasions` | the three taxonomies |
| `prepMinutes`, `cookMinutes`, `servings` | number fields (positive whole numbers) |
| `difficulty` | select: easy, medium, hard |
| `vegetarian`, `featured`, `sample` | true/false. Saving one recipe as featured clears it on all others |
| `author` | text, default "Foodsera Kitchen" |
| `publishedAt`, `updatedAt` | post date and post modified date, as `YYYY-MM-DD` |
| `rating` | group shown only when `sample` is on (layout testing only, as today) |
| `ingredientsExplained` | repeater: local, aka, meaning, substitute |
| `ingredients` | repeater of groups (optional group heading) with a nested repeater of items: name, US qty and unit, metric qty and unit, local qty and unit, optional |
| `steps` | repeater: title, text, short, image (its alt text becomes `imageAlt`), caption |
| `tips` | repeater: kind (do or avoid), text |
| `serveWith` | repeater: name, note, image, recipe (post object limited to recipes, exported as its slug) |
| `faqs` | repeater: question, answer |
| `notes` | repeater: text |
| `nutrition` | group: calories, protein, fat, carbs, fibre, sodium |

SCF validation catches obvious mistakes in wp-admin (required fields, number ranges), but the zod schemas at build time remain the final gate.

**Export endpoint:** `GET /wp-json/foodsera/v1/export?page=N&per_page=50`
- Requires the `X-Foodsera-Build-Token` header (constant `FOODSERA_BUILD_TOKEN` in `wp-config.php`), so the cheap host isn't scraped.
- Published recipes only. Returns `{ recipes, categories, regions, occasions, page, totalPages, generatedAt }` in the content model's shape.
- Images are objects (`url`, `width`, `height`, `alt`, `modified`, available sizes) so `content:pull` can download them.
- Links inside intros that point at a recipe on `cms.foodsera.com` or `foodsera.com` are rewritten to `/recipes/<slug>`.
- Each recipe carries its approved reviews: `reviews: { count, average, items: [{ id, name, rating, text, date }] }`.

**WP-CLI:** `wp foodsera import-markdown <path>` imports `content/recipes/*.md` and the term JSON files (used once for the 8 samples and the parity test). `wp foodsera export --file=<path>` writes the same JSON the endpoint returns (used to record the parity-test fixture).

### Reviews, contact and newsletter

These replace every `TODO(backend)` handler. Forms POST JSON from the static site to `${VITE_WP_API_URL}/foodsera/v1/...`.

**Shared protection on all three:**
- Cloudflare Turnstile token, verified server-side on every request.
- A hidden honeypot field that must be empty.
- Rate limit per IP (for example 5 per hour) using transients.
- CORS: allow only the origins in `FOODSERA_ALLOWED_ORIGINS` (`https://foodsera.com`, the preview domain, `http://localhost:5173`), and answer the `OPTIONS` preflight.
- Never report success unless the action really happened.

**Reviews:** `POST /foodsera/v1/reviews` with recipe slug, rating 1 to 5, name, email, comment.
- Saved as a WordPress comment on that recipe, **held for moderation**, with the rating as comment meta. The email is stored but never published or exported.
- Do not turn on anonymous comments through the core REST API (`rest_allow_anonymous_comments` stays false). This endpoint is the only way in.
- Spam: Turnstile, honeypot, rate limit and manual moderation. Do not use Akismet's free key: Foodsera shows ads, which Akismet counts as commercial.
- Success message: "Thanks. Your review will appear once it's approved."
- Approving, unapproving, spamming or trashing a review triggers a rebuild.
- **SEO change:** the Reviews section lists approved reviews from the snapshot, and the recipe's `aggregateRating` (and the stars and count in the meta row) come from them once a recipe has at least one approved review. Hand-entered `rating` stays sample-only and never reaches JSON-LD.

**Contact:** `POST /foodsera/v1/contact` with name, email, message. Sent with `wp_mail` through the SMTP plugin to `FOODSERA_CONTACT_EMAIL`. Not stored in the database. Success only when `wp_mail` returns true.

**Newsletter:** `POST /foodsera/v1/subscribe` with email. One small adapter class for the email provider (Victor picks: Brevo or MailerLite), API key in `wp-config.php`, double opt-in handled by the provider. The design's success text ("You are in. Check your inbox to confirm your email.") only after the provider accepts the address.

**Privacy:** the Privacy Policy (Phase 6) must say what these forms collect, that reviews store name, email and IP address in WordPress, that Cloudflare Turnstile checks visitors, and which newsletter provider holds subscriber emails.

### Rebuilding on publish

- The Cloudflare Pages deploy hook URL lives in `wp-config.php` as `FOODSERA_DEPLOY_HOOK_URL`. Never in the repo or the database.
- Trigger a rebuild when: a recipe is published, a published recipe is updated, a recipe is unpublished or trashed, a term in the three taxonomies is created, edited or deleted, or a review changes status.
- **Debounce:** schedule one event 90 seconds after the last change (reschedule if one is already queued), then POST to the hook without blocking. A burst of edits makes one build.
- **Real cron is required.** The CMS gets almost no traffic and WP-cron only runs on page loads, so set `DISABLE_WP_CRON` to true and add a server cron job (cPanel) that runs `wp-cron.php` every minute.
- An admin bar button, "Publish site changes" (`manage_options` only), triggers a rebuild immediately. A small settings page shows the last 20 triggers with time and response code.
- Turn on Cloudflare Pages notifications for failed deployments, so a bad recipe is noticed.

### Security (WordPress is never visited by readers)

- Redirect every front-end WordPress request (anything that isn't wp-admin, wp-login, REST, cron or uploads) to `https://foodsera.com` with a 301.
- Send `X-Robots-Tag: noindex, nofollow` on every CMS response, and serve a `robots.txt` that disallows everything.
- Unauthenticated REST access only to the `foodsera/v1` routes. Core `wp/v2` routes, including `/wp/v2/users`, require login (the block editor is already logged in).
- Disable XML-RPC, file editing (`DISALLOW_FILE_EDIT`) and version strings. Block PHP execution in the uploads folder.
- Two-factor login for every account, strong passwords, login rate limiting. If the domain is on Cloudflare, proxy `cms.foodsera.com` and restrict `/wp-admin` and `/wp-login.php` with a WAF rule or Cloudflare Access.
- Automatic updates for core and plugins, daily off-site backups, as few plugins as possible.

### Images

- Editors upload JPEG or PNG. The plugin sets `image_editor_output_format` so WordPress generates WebP sizes, and registers the sizes the design needs (for example 1200, 800 and 400 px wide). This needs no image library in the front end.
- `content:pull` downloads only the sizes the pages use. The front end serves them with `srcset` and keeps `width` and `height` on every image.
- `og:image` must be JPEG or PNG at 1200×630, because some apps don't show WebP link previews. Keep one JPEG size for it in WordPress, or ask before adding an image library.

### Hosting on Cloudflare Pages

Vercel's free Hobby plan is for non-commercial use only, so it stays a temporary team preview with no custom domain and no ads, and is retired once Cloudflare Pages is live.

- Connect the GitHub repo. Production branch `main`, build command `npm run build`, output directory `build/client`.
- Environment variables: `NODE_VERSION` (22.22 or newer), `CONTENT_SOURCE=wordpress`, `WP_API_URL`, `FOODSERA_BUILD_TOKEN` (secret), `VITE_WP_API_URL`, `VITE_TURNSTILE_SITE_KEY`, `VITE_ADS_MODE`, `VITE_ADSENSE_CLIENT`. Keep `.env.example` in step.
- `public/_headers` keeps every `pages.dev` address out of search:
  ```
  https://:project.pages.dev/*
    X-Robots-Tag: noindex

  https://:version.:project.pages.dev/*
    X-Robots-Tag: noindex
  ```
- Unknown URLs get `404.html` with a 404 status (already produced by the build). Check this on the live preview.
- Custom domain `foodsera.com` (with `www` redirecting to it) at launch. `cms.foodsera.com` points at the WordPress host.
- The free plan allows 500 builds a month. The debounce keeps rebuilds well under that.

### Local development

- Front end: unchanged. `CONTENT_SOURCE=markdown` works offline with the sample recipes.
- WordPress: LocalWP on Windows (no Docker needed) at `foodsera-cms.local`, with the plugin folder linked from `wordpress/foodsera-core`. `wp-env` is fine too if Docker is available.
- Plugin tests: unit tests for the mapping, validation, export shape, debounce and CORS rules. Integration tests against a real WordPress where the environment allows.

### Decisions Victor needs to make before 7a

1. WordPress host for `cms.foodsera.com`: any host with PHP 8.1+, cron jobs, SSH or WP-CLI preferred.
2. Newsletter provider: Brevo or MailerLite.
3. Whether `foodsera.com` DNS moves to Cloudflare (recommended: needed for the WAF and Access options above).

## SEO (non-negotiable)

- Every route exports `meta` with a unique title, description, canonical URL on `https://foodsera.com`, Open Graph and Twitter tags.
- Recipe pages output JSON-LD `Recipe` schema: name, image, description, author, datePublished, dateModified, prepTime, cookTime, totalTime (ISO 8601 durations), recipeYield, recipeCategory, recipeCuisine "Nigerian", recipeIngredient, recipeInstructions as HowToStep, aggregateRating, nutrition when present. Add `BreadcrumbList` on every page below home.
- Recipe title tags default to `{shortTitle or title} Recipe | Foodsera` ("Egusi Soup Recipe | Foodsera"). The optional `seoTitle` frontmatter field replaces the whole tag. The h1 always shows `title`.
- `aggregateRating` comes only from genuine reader reviews: the approved reviews in the WordPress snapshot, once a recipe has at least one. Never output it from hand-entered numbers in frontmatter, and never for a `sample: true` recipe.
- Frontmatter `rating` is allowed only on `sample: true` recipes, for layout testing; the build fails if any other recipe has one. Recipes without `sample: true` show "No reviews yet" (no stars or counts) in the meta row and the Reviews summary until genuine reviews exist.
- Generate `sitemap.xml` at build time from all routes. `robots.txt` points to it.
- Clean URLs: `/recipes/<slug>`, `/category/<slug>`, `/region/<slug>`, `/occasion/<slug>`. One canonical form, no trailing-slash duplicates.
- Images: always set width and height, `loading="lazy"` except the hero (eager, `fetchpriority="high"`), WebP or AVIF with sensible sizes.

## Ads (Google AdSense)

All ad code lives in `app/components/ads/` and `app/lib/ads/`. Other components never touch `adsbygoogle` directly.

Environment variables (keep `.env.example` up to date):

- `VITE_ADSENSE_CLIENT` publisher id, `ca-pub-XXXXXXXXXXXXXXXX`
- `VITE_ADS_MODE` = `off` | `placeholder` | `live`. Use `placeholder` in development and `off` in production until AdSense approves the site.

`AdSlot` behavior:

- Props: `slotId`, `format` (leaderboard, rectangle, half-page, in-content, in-feed, multiplex, anchor), optional `className`.
- Always reserve the slot's height for its format at each breakpoint so the page never jumps (CLS).
- A small grey "Advertisement" label sits above every slot.
- `placeholder` mode: neutral grey box showing the format and size. No fake brand names or logos.
- `live` mode: render `<ins class="adsbygoogle">` and call `(window.adsbygoogle = window.adsbygoogle || []).push({})` once after mount. Guard against a double push (StrictMode runs effects twice in development).
- On client-side navigation, key each slot by the current pathname so it re-mounts and AdSense fills it on the new page.
- Load the AdSense script once, async, in `root.tsx`, only when `VITE_ADS_MODE=live` and the route allows ads.
- Ads do not fill on localhost. Add `data-adtest="on"` outside production.

Placement (match the ad-enabled prototype in `design/`):

- Home: leaderboard after the hero; in-content after "Popular right now" and after "Browse by region"; in-feed card roughly every 6 to 8 recipe cards.
- Category and region: leaderboard under the intro; in-feed after every 6 cards; desktop sidebar 300x250 then sticky 300x600.
- Recipe: after the quick facts and hero; in-content after the intro, then every 3 to 4 paragraphs or step blocks (never between a step photo and its text); one before the recipe card; one between ingredients and instructions; one after the recipe card; multiplex after comments; desktop sidebar 300x250 plus sticky 300x600; mobile bottom anchor no taller than about 100px with a close button.

Hard rules:

- No ads inside or right next to navigation, menus, search, buttons (Jump to Recipe, Print, Save, Load more), pagination or form fields.
- Never two ads back to back. Ads must never look like content or navigation.
- On mobile, ads take no more than about 30% of the viewport at any scroll position.
- No pop-ups, interstitials or auto-playing video ads with sound.
- No ads on contact, privacy, cookies, terms, 404, or search with no results. Control this with route `handle: { ads: false }`, checked in one place.
- Every page must look complete when an ad slot is empty.

Consent and policy:

- For EEA, UK and Swiss visitors, use Google's certified consent message from AdSense "Privacy & messaging". Do not build a custom consent system for ads. The design's cookie banner is only for non-ad cookies, if any.
- `public/ads.txt` holds the publisher line once the account is approved.

Design decisions (these settle conflicts between the prototype and the rules above):

- Placeholder ads: `placeholder` mode renders only the design's ad frame: Ad neutral background, its border, 10px radius, the reserved size for the format and the small grey "Advertisement" label, with the format and size in the middle (for example "Leaderboard · 728×90"). Do not build the prototype's sample creatives: no advertiser names, logos, product copy, images or call-to-action buttons.
- Unfilled slots: every slot always reserves its format's height at each breakpoint. When AdSense marks a slot unfilled (`data-ad-status="unfilled"` on the `<ins>`), collapse it only if the whole slot is below the visible screen at that moment. If it is on screen, or above it, keep the neutral frame and label so nothing jumps. This replaces the prototype's note that unfilled slots always collapse.
- Cookie banner: Google's consent message from AdSense "Privacy & messaging" handles all ad consent. Build the design's `CookieBanner` component but keep it switched off at launch with a single config flag. It is only for non-ad cookies added later, so when it is turned on its copy and toggles must not mention ads or Google (the prototype's copy does and must be rewritten).

## Performance budget

- Lighthouse mobile: Performance 90+, Accessibility 95+, SEO 100, CLS under 0.1.
- Lean JavaScript, split by route. No heavy animation or carousel libraries.
- Self-host or preload the web fonts, with `font-display: swap`.

## Code style

- Function components and hooks. Default exports only for route modules.
- Typed props with TypeScript interfaces. No `any`.
- Tailwind utilities in JSX. Repeated patterns become components, not long `@apply` blocks.
- Test the logic: quantity scaling and fractions, duration formatting, content validation, ad route rules, search.

## Git

- Conventional commits: `feat:`, `fix:`, `style:`, `refactor:`, `test:`, `docs:`, `chore:`.
- One logical change per commit. Never commit `.env` files or build output.
- No Claude author, co-author or attribution lines, ever.

### Repository

- Remote: https://github.com/Busayor2020/foodsera-blog (`origin`, default branch `main`).
- After each build phase passes typecheck, lint, test and build, commit and push to `origin main`. Never force-push.

## Build phases

Work through these in order and tick each box here once its checks pass.

- [x] 1. Foundation: ESLint, Prettier, Vitest scripts; Tailwind tokens from the design; fonts; root layout; Header, MegaMenu, MobileMenu, Footer, Breadcrumbs; 404
- [x] 2. Content layer: zod schema, loaders, 3 sample recipes (egusi soup, jollof rice, puff-puff) with placeholder images
- [x] 3. Recipe page, complete, with print view, servings adjuster and JSON-LD
- [x] 4. Homepage
- [ ] 5. Category, region, occasion, search and recipe index pages. The recipe index supports `?time=30` (recipes of 30 minutes or less), which the homepage "More quick recipes" link uses. Search ignores diacritics and tone marks; term pages with fewer than 3 recipes get noindex, no sitemap entry and no ads (see Page features)
- [ ] 6. About, contact, privacy, cookies, terms
- [ ] 7a. WordPress plugin core: post type, taxonomies, SCF field groups in code, export endpoint, security hardening, WP-CLI import/export, plugin tests. Import the 8 sample recipes.
- [ ] 7b. Front end on WordPress: `CONTENT_SOURCE` switch, `content:pull`, images with `srcset`, snapshot validated by zod, Markdown and WordPress parity test.
- [ ] 7c. Forms: reviews (with real `aggregateRating`), contact and newsletter endpoints, Turnstile, CORS. Every `TODO(backend)` is gone.
- [ ] 7d. Hosting: Cloudflare Pages, `_headers`, deploy hook with debounce and real cron, failure notifications. Vercel retired.
- [ ] 8. Ads system in placeholder mode on every allowed page, matching the ad prototype
- [ ] 9. SEO: meta on every route, sitemap, robots, rich results check
- [ ] 10. Performance and accessibility pass, Lighthouse targets met
- [ ] 11. Launch: foodsera.com live on Cloudflare Pages, real recipes in WordPress, sample content removed, legal pages reviewed, then apply for AdSense
