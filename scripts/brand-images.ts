// Renders the brand PNGs that need a raster format:
//   public/logo.png        512x512, transparent: the Organization logo in JSON-LD
//   public/og-default.png  1200x630: the share image when a page has none, or
//                          only an SVG (social networks don't show SVG previews)
// Uses the local Chrome in headless mode through the DevTools protocol, so
// there is no extra dependency. Run with: node scripts/brand-images.ts
// Set CHROME_PATH if Chrome isn't in a standard place.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const FONTS = join(ROOT, "app", "styles", "fonts");

// Brand colours, from the @theme tokens in app/styles/app.css.
const C = {
  palm: "#C2410C",
  palmText: "#B3390E",
  plantain: "#F2B632",
  plantainSoft: "#FCEBC0",
  leaf: "#3E8A3E",
  cream: "#FBF5EA",
  charcoal: "#22201C",
  inkSoft: "#3F3A33",
};

const mark = (size: number) => `
<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
  <circle cx="24" cy="24" r="24" fill="${C.palm}"/>
  <path d="M10 25h28a14 14 0 0 1-28 0z" fill="${C.cream}"/>
  <path d="M19 20c-2-3 2-5 0-9M26 20c-2-3 2-5 0-9" stroke="${C.plantain}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M31 19c1-5 6-7 9-6-1 4-5 7-9 6z" fill="${C.leaf}"/>
</svg>`;

const fontFaces = `
@font-face { font-family: "Young Serif"; src: url("${pathToFileURL(join(FONTS, "young-serif-latin.woff2"))}") format("woff2"); }
@font-face { font-family: "Figtree"; font-weight: 400 700; src: url("${pathToFileURL(join(FONTS, "figtree-latin.woff2"))}") format("woff2"); }
html, body { margin: 0; overflow: hidden; }
svg { display: block; }`;

const LOGO_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
body { width: 512px; height: 512px; background: transparent; }
</style></head><body>${mark(512)}</body></html>`;

const plate = pathToFileURL(
  join(ROOT, "public", "images", "recipes", "egusi-soup", "hero.svg"),
);

const OG_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
body { width: 1200px; height: 630px; background: ${C.cream}; color: ${C.charcoal};
  font-family: Figtree, sans-serif; display: flex; align-items: center; gap: 56px;
  padding: 0 72px; box-sizing: border-box; position: relative; overflow: hidden; }
.text { flex: 1; display: flex; flex-direction: column; gap: 28px; }
.brand { display: flex; align-items: center; gap: 24px; }
.word { font-family: "Young Serif", Georgia, serif; font-size: 104px; line-height: 1; letter-spacing: -0.01em; }
.word span { color: ${C.palmText}; }
.tag { font-size: 46px; font-weight: 700; line-height: 1.15; text-wrap: balance; }
.sub { font-size: 28px; color: ${C.inkSoft}; }
.photo { width: 430px; height: 430px; border-radius: 40px; overflow: hidden; flex: none;
  box-shadow: 0 0 0 16px ${C.plantainSoft}; }
.photo img { width: 100%; height: 100%; object-fit: cover; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: 18px; background: ${C.palm}; }
</style></head><body>
<div class="text">
  <div class="brand">${mark(112)}<span class="word">Food<span>sera</span></span></div>
  <div class="tag">Nigerian recipes, step by step</div>
  <div class="sub">Tested at home, written for kitchens everywhere.</div>
</div>
<div class="photo"><img src="${plate}" alt=""></div>
<div class="band"></div>
</body></html>`;

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const port = 9400 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), "foodsera-brand-"));
  const chrome = spawn(findChrome(), [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--no-first-run",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    `--user-data-dir=${profile}`,
    "about:blank",
  ]);

  try {
    let targets: { type: string; webSocketDebuggerUrl: string }[] = [];
    for (let i = 0; i < 50 && !targets.some((t) => t.type === "page"); i++) {
      try {
        targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      } catch {
        // Chrome is still starting.
      }
      await sleep(200);
    }
    const page = targets.find((t) => t.type === "page");
    if (!page) throw new Error("Chrome did not start.");

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener("open", resolve));
    let id = 0;
    const pending = new Map<
      number,
      (value: { result?: Record<string, unknown> }) => void
    >();
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      pending.get(message.id)?.(message);
      pending.delete(message.id);
    });
    const send = (method: string, params: object = {}) =>
      new Promise<{ result?: Record<string, unknown> }>((resolve) => {
        const n = ++id;
        pending.set(n, resolve);
        ws.send(JSON.stringify({ id: n, method, params }));
      });

    const render = async (
      html: string,
      width: number,
      height: number,
      file: string,
    ) => {
      const htmlFile = join(profile, `${file}.html`);
      writeFileSync(htmlFile, html);
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await send("Emulation.setDefaultBackgroundColorOverride", {
        color: { r: 0, g: 0, b: 0, a: 0 },
      });
      await send("Page.navigate", { url: pathToFileURL(htmlFile).href });
      await sleep(800);
      await send("Runtime.evaluate", {
        expression: "document.fonts.ready.then(() => document.fonts.size)",
        awaitPromise: true,
      });
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        clip: { x: 0, y: 0, width, height, scale: 1 },
      });
      const out = join(ROOT, "public", file);
      writeFileSync(out, Buffer.from(String(shot.result?.data), "base64"));
      console.log(
        `Wrote public/${file} (${width}x${height}, ${readFileSync(out).length} bytes)`,
      );
    };

    await send("Page.enable");
    await send("Runtime.enable");
    await render(LOGO_HTML, 512, 512, "logo.png");
    await render(OG_HTML, 1200, 630, "og-default.png");
    ws.close();
  } finally {
    chrome.kill();
  }
}

await main();
