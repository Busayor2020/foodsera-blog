import { copyFile } from "node:fs/promises";
import { join } from "node:path";

import type { Config } from "@react-router/dev/config";

import { getContentPaths, getSampleRecipeSlugs } from "./app/lib/content";
import { collectRoutePaths, contentPathsForRoutes } from "./app/lib/prerender";
import routes from "./app/routes";

export default {
  // Every route is prerendered to static HTML in build/client. No server runs.
  ssr: false,
  // Loading content here also validates it, so invalid content fails every
  // build, even before the pages that show it exist.
  async prerender({ getStaticPaths }) {
    const content = getContentPaths();
    const registered = collectRoutePaths(await routes);
    return [
      ...new Set([
        ...getStaticPaths(),
        "/404",
        ...contentPathsForRoutes(content, registered),
      ]),
    ];
  },
  async buildEnd({ reactRouterConfig }) {
    // Static hosts serve /404.html (with a 404 status) for unknown URLs, but
    // the prerenderer writes that page to /404/index.html.
    const client = join(reactRouterConfig.buildDirectory, "client");
    await copyFile(join(client, "404", "index.html"), join(client, "404.html"));

    const samples = getSampleRecipeSlugs();
    if (samples.length > 0) {
      console.warn(
        [
          "",
          `\x1b[33m⚠ ${samples.length} sample recipe${samples.length === 1 ? " is" : "s are"} still in content/recipes (sample: true):`,
          ...samples.map((slug) => `    - ${slug}`),
          "  Replace or delete them before launch.\x1b[0m",
          "",
        ].join("\n"),
      );
    }
  },
} satisfies Config;
