# Fonts

Self-hosted copies of the two web fonts in the design, downloaded once from the Google Fonts CSS2 API on 2026-10-17. No npm package is used.

| File                          | Font                                  | Subset    |
| ----------------------------- | ------------------------------------- | --------- |
| `figtree-latin.woff2`         | Figtree v9, variable, weights 400–700 | latin     |
| `figtree-latin-ext.woff2`     | Figtree v9, variable, weights 400–700 | latin-ext |
| `young-serif-latin.woff2`     | Young Serif v2, 400                   | latin     |
| `young-serif-latin-ext.woff2` | Young Serif v2, 400                   | latin-ext |

The `@font-face` rules and `unicode-range` values are in `../app.css`. Only the latin files are preloaded (in `root.tsx`). Browsers fetch the latin-ext files only when a page uses those characters.

Neither font has the Vietnamese subset, which is where Google puts ẹ and ọ (U+1EB9, U+1ECD). Yoruba text using those letters falls back to Georgia or the system sans for those glyphs only.

Both fonts are licensed under the SIL Open Font License 1.1 (`OFL-Figtree.txt`, `OFL-YoungSerif.txt`).

To update, request `https://fonts.googleapis.com/css2?family=Figtree:wght@400..700&family=Young+Serif&display=swap` with a modern browser user agent and replace the files and `unicode-range` values.
