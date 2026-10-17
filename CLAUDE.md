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
- Content: Markdown files with YAML frontmatter in `content/`, read at build time with `gray-matter`, validated with `zod`
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
public/
  images/recipes/<slug>/
  ads.txt
  robots.txt
scripts/                build-time scripts: search index, sitemap
design/                 Claude Design handoff or exported bundle. READ ONLY. Never edit.
```

Keep `lib/content` as the single place that knows where content comes from, so it can later be swapped for a headless CMS (for example the WordPress REST API) without touching components.

## Design implementation

- Before building a screen, open its source in `design/` and match it. Put tokens (colors, fonts, radii, shadows, spacing) into `@theme` once and use them everywhere. No hard-coded hex values in components.
- Name components the way the design handoff names them so the two stay in sync.
- Body text at least 16px on mobile. Tap targets at least 44px.
- Respect `prefers-reduced-motion`. Keep animation light.
- Accessibility: semantic HTML (header, nav, main, article, aside, footer), one h1 per page, alt text on every image, visible focus states, WCAG AA contrast, menus and accordions fully usable by keyboard.

## Content model

Recipe frontmatter. The build must fail on invalid content.

```yaml
title: Egusi Soup
slug: egusi-soup
description: One or two sentences for cards and the meta description
category: soups-and-stews
region: yoruba            # yoruba | igbo | hausa-northern | niger-delta | edo | efik-ibibio
occasions: [party, weeknight]
heroImage: /images/recipes/egusi-soup/hero.jpg
heroImageAlt: Bowl of egusi soup with assorted meat and stockfish
prepMinutes: 20
cookMinutes: 45
servings: 6
difficulty: medium        # easy | medium | hard
vegetarian: false
author: Foodsera Kitchen
publishedAt: 2026-10-01
updatedAt: 2026-10-15
rating: { value: 4.8, count: 32 }
ingredientsExplained:
  - { local: Ugu, meaning: Fluted pumpkin leaves, substitute: Spinach or kale }
ingredients:
  - group: Soup
    items:
      - { qty: 2, unit: cup, name: ground egusi (melon seeds), localMeasure: about 1 derica }
steps:
  - { text: Wash and season the meat, then boil until tender., image: /images/recipes/egusi-soup/step-1.jpg }
tips: [Fry the egusi in palm oil before adding stock for a nuttier taste.]
serveWith: [pounded-yam, eba, fufu, semo]
faqs:
  - { q: Can I freeze egusi soup?, a: Yes, for up to 3 months in an airtight container. }
nutrition: { calories: 450, protein: 28g }   # optional
```

The Markdown body is the short intro story. Keep it skimmable.

## Page features

- Recipe page: breadcrumbs, quick facts bar, Jump to Recipe (smooth scroll to `#recipe`), Print (print stylesheet shows only the recipe card), Ingredients Explained, step photos, tips, recipe card with servings adjuster (scales quantities, shows friendly fractions like 1½) and ingredient checkboxes, serve-with, FAQ accordion, reviews UI, related recipes, desktop sidebar.
- Category, region and occasion pages (occasion slugs: `party`, `christmas`, `sallah`, `weeknight`, `lunch-box`, linked from the menus' "By occasion" group): filter chips (time, difficulty, region, vegetarian) and sort, synced to URL search params so filtered views can be shared. Filtering runs on the client over prerendered data.
- Search: `/search?q=` using the prebuilt Fuse index, with a helpful empty state.
- Recipe index: A to Z, grouped by category.
- Contact form, newsletter and reviews need a backend. Build the UI with one submit handler marked `TODO(backend)`. Do not invent a backend.

## SEO (non-negotiable)

- Every route exports `meta` with a unique title (`Egusi Soup | Foodsera`), description, canonical URL on `https://foodsera.com`, Open Graph and Twitter tags.
- Recipe pages output JSON-LD `Recipe` schema: name, image, description, author, datePublished, dateModified, prepTime, cookTime, totalTime (ISO 8601 durations), recipeYield, recipeCategory, recipeCuisine "Nigerian", recipeIngredient, recipeInstructions as HowToStep, aggregateRating, nutrition when present. Add `BreadcrumbList` on every page below home.
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

- [ ] 1. Foundation: ESLint, Prettier, Vitest scripts; Tailwind tokens from the design; fonts; root layout; Header, MegaMenu, MobileMenu, Footer, Breadcrumbs; 404
- [ ] 2. Content layer: zod schema, loaders, 3 sample recipes (egusi soup, jollof rice, puff-puff) with placeholder images
- [ ] 3. Recipe page, complete, with print view, servings adjuster and JSON-LD
- [ ] 4. Homepage
- [ ] 5. Category, region, occasion, search and recipe index pages
- [ ] 6. About, contact, privacy, cookies, terms
- [ ] 7. Ads system in placeholder mode on every allowed page, matching the ad prototype
- [ ] 8. SEO: meta on every route, sitemap, robots, rich results check
- [ ] 9. Performance and accessibility pass, Lighthouse targets met
- [ ] 10. Deploy the static output from `build/client`
