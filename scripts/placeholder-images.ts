// Writes placeholder food photos as small SVGs, drawn like the design's Photo
// component (design/Photo.dc.html): a plate of food seen from above, with
// garnish dots, on a dark table. Real photos replace these later.
//
// Run with: node scripts/placeholder-images.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// [table, plate, food, edge, garnish 1, garnish 2], copied from Photo.dc.html.
const TONES = {
  egusi: ["#4A2F22", "#EFE6D6", "#D9A33C", "#B8422A", "#2F7A3A", "#8E2B1C"],
  jollof: ["#3B2A20", "#F7F1E6", "#D9541E", "#B8401A", "#3E7D3A", "#F2B632"],
  puff: ["#3B3026", "#F4ECDD", "#C98A3A", "#A86A22", "#E7B865", "#F6E7C8"],
  pepper: ["#2A2E2A", "#EFE7D7", "#B85A2A", "#8E3E18", "#2F6B3A", "#F2D27A"],
  rice: ["#2F3A33", "#F4ECDD", "#F4F0E4", "#E2DACA", "#C2410C", "#E8E1D2"],
  dodo: ["#30362F", "#F4ECDD", "#E6A13A", "#B56A1C", "#F2C760", "#8E4A14"],
  moimoi: ["#3A2C24", "#F4EDE0", "#E07A4A", "#C8602F", "#F2D27A", "#2F6B3A"],
  zobo: ["#2E2A26", "#E9E3D8", "#6E1230", "#4E0C20", "#E9A23A", "#3E7D3A"],
  stock: ["#3A2C24", "#3D3A36", "#8A5A2E", "#6A4220", "#C8622A", "#E9C9A0"],
  paste: ["#4A3A2C", "#EFE6D6", "#E7D3A1", "#CDB57C", "#DCC48D", "#F2E4C0"],
  lumps: ["#3A2A20", "#3D3A36", "#C8341A", "#9E2410", "#E2B65A", "#EBC671"],
  simmer: ["#3A2A20", "#3D3A36", "#C24A1E", "#9E3412", "#E2B65A", "#B8401A"],
  ugu: ["#3A2A20", "#3D3A36", "#D9A33C", "#B8422A", "#2F7A3A", "#3E8A3E"],
  poundo: ["#3A3027", "#C9B79C", "#F6F1E4", "#E2D7C0", "#E8DFC9", "#D5C8AE"],
  eba: ["#2F3A33", "#EFE7D7", "#EDC96A", "#D6AE4C", "#E3BE5A", "#C99B3C"],
  fufu: ["#3E3328", "#3E7D3A", "#F3EEE2", "#E2DACA", "#E8E1D2", "#D9D0BE"],
  semo: ["#2E2A35", "#EFE7D7", "#F1E6C6", "#DFD1A8", "#E9DCB6", "#D2C296"],
} as const;

type Tone = keyof typeof TONES;

interface Placeholder {
  path: string;
  tone: Tone;
  width: number;
  height: number;
}

const HERO = { width: 1200, height: 900 };
const STEP = { width: 800, height: 600 };
const SIDE = { width: 600, height: 450 };

const recipe = (slug: string, hero: Tone, steps: Record<number, Tone>) => [
  { path: `recipes/${slug}/hero.svg`, tone: hero, ...HERO },
  ...Object.entries(steps).map(([n, tone]) => ({
    path: `recipes/${slug}/step-${n}.svg`,
    tone,
    ...STEP,
  })),
];

const side = (slug: string, tone: Tone) => ({
  path: `sides/${slug}.svg`,
  tone,
  ...SIDE,
});

const PLACEHOLDERS: Placeholder[] = [
  ...recipe("egusi-soup", "egusi", {
    1: "stock",
    3: "paste",
    5: "lumps",
    6: "simmer",
    8: "ugu",
  }),
  ...recipe("jollof-rice", "jollof", {
    1: "pepper",
    2: "rice",
    3: "simmer",
    7: "jollof",
  }),
  ...recipe("puff-puff", "puff", { 1: "paste", 4: "puff", 5: "puff" }),
  side("pounded-yam", "poundo"),
  side("eba", "eba"),
  side("fufu", "fufu"),
  side("semo", "semo"),
  side("dodo", "dodo"),
  side("moi-moi", "moimoi"),
  side("zobo", "zobo"),
];

/** CSS radial-gradient percentages are of the distance to the farthest corner. */
function radius(cx: number, cy: number, w: number, h: number, percent: number) {
  const dx = Math.max(cx, w - cx);
  const dy = Math.max(cy, h - cy);
  return (Math.hypot(dx, dy) * percent) / 100;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function placeholderSvg({
  tone,
  width: w,
  height: h,
}: Placeholder): string {
  const [table, plate, food, edge, g1, g2] = TONES[tone];
  const dot = (
    x: number,
    y: number,
    percent: number,
    fill: string,
    opacity = 1,
  ) => {
    const cx = (w * x) / 100;
    const cy = (h * y) / 100;
    const r = radius(cx, cy, w, h, percent);
    const op = opacity < 1 ? ` fill-opacity="${opacity}"` : "";
    return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}"${op}/>`;
  };
  const cx = w / 2;
  const cy = h / 2;
  const r = (percent: number) => round(radius(cx, cy, w, h, percent));

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${table}"/><stop offset="1" stop-color="#1E1914"/></linearGradient>`,
    `<radialGradient id="s"><stop offset="${round((34.5 / 37) * 100)}%" stop-color="#000" stop-opacity=".28"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient></defs>`,
    `<rect width="${w}" height="${h}" fill="url(#t)"/>`,
    dot(86, 16, 9.25, "#FFFFFF", 0.07),
    dot(12, 88, 11.25, "#FFFFFF", 0.06),
    `<circle cx="${cx}" cy="${cy}" r="${r(37)}" fill="url(#s)"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r(33.5)}" fill="${plate}"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r(25.5)}" fill="${edge}"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r(24)}" fill="${food}"/>`,
    dot(42, 60, 3.45, edge),
    dot(36, 40, 2.85, g1),
    dot(60, 36, 2.35, g2),
    dot(56, 62, 2.15, g1),
    dot(64, 52, 1.85, g2),
    "</svg>",
    "",
  ].join("");
}

function main() {
  const root = join(process.cwd(), "public", "images");
  for (const placeholder of PLACEHOLDERS) {
    const file = join(root, placeholder.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, placeholderSvg(placeholder));
  }
  console.log(
    `Wrote ${PLACEHOLDERS.length} placeholder images to public/images/`,
  );
}

main();
