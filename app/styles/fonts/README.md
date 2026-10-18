# Fonts

Self-hosted copies of the web fonts, downloaded from the Google Fonts CSS2 API. No npm package is used.

| File                          | Font                                     | Subset                   | Downloaded |
| ----------------------------- | ---------------------------------------- | ------------------------ | ---------- |
| `figtree-latin.woff2`         | Figtree v9, variable, weights 400–700    | latin                    | 2026-10-17 |
| `figtree-latin-ext.woff2`     | Figtree v9, variable, weights 400–700    | latin-ext                | 2026-10-17 |
| `young-serif-latin.woff2`     | Young Serif v2, 400                      | latin                    | 2026-10-17 |
| `young-serif-latin-ext.woff2` | Young Serif v2, 400                      | latin-ext                | 2026-10-17 |
| `noto-sans-nigerian.woff2`    | Noto Sans v42, variable, weights 400–700 | Nigerian letters (below) | 2026-10-18 |
| `noto-serif-nigerian.woff2`   | Noto Serif v33, **600**                  | Nigerian letters (below) | 2026-10-18 |

The `@font-face` rules and `unicode-range` values are in `../app.css`. Only the Figtree and Young Serif latin files are preloaded (in `root.tsx`). Browsers fetch the other files only when a page uses their characters.

## Nigerian letter fallbacks

Figtree and Young Serif don't draw several letters Nigerian languages need. Two small Noto subsets fill the gap, as the families `Foodsera Sans Fallback` and `Foodsera Serif Fallback`, placed second in `--font-sans` and `--font-serif`:

- Yoruba Ẹẹ Ọọ Ṣṣ, Igbo Ịị Ụụ Ṅṅ, Hausa Ɓɓ Ɗɗ Ƙƙ Ƴƴ, and tone-marked Ńń Ǹǹ Ḿḿ
- the combining grave, acute, circumflex, macron, dot above, caron and dot below (U+0300–0302, 0304, 0307, 030C, 0323)
- A–Z and a–z, so a letter carrying combining marks (for example ọ́) is drawn whole by one font

The browser only uses, and only downloads, a fallback for a character the brand font can't draw. This was checked in Chrome on 2026-10-18: pages without these letters load no Noto file, and a page with them loads both.

The serif fallback is Noto Serif at weight 600, declared as 400, because its stroke weight sits closest to Young Serif's single weight. Noto's capital Ƙ and Ƴ have only small hooks, which are hard to see at body sizes.

To rebuild the subsets, request `https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400..700&text=…` and `https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600&text=…` with a modern browser user agent, where `text` is the URL-encoded list of characters above.

## Licences

All fonts are under the SIL Open Font License 1.1 (`OFL-Figtree.txt`, `OFL-YoungSerif.txt`, `OFL-Noto.txt`).

To update Figtree and Young Serif, request `https://fonts.googleapis.com/css2?family=Figtree:wght@400..700&family=Young+Serif&display=swap` with a modern browser user agent and replace the files and `unicode-range` values.
