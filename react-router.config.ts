import { copyFile } from "node:fs/promises";
import { join } from "node:path";

import type { Config } from "@react-router/dev/config";

export default {
  // Every route is prerendered to static HTML in build/client. No server runs.
  ssr: false,
  prerender: ["/", "/404"],
  // Static hosts serve /404.html (with a 404 status) for unknown URLs, but
  // the prerenderer writes that page to /404/index.html.
  async buildEnd({ reactRouterConfig }) {
    const client = join(reactRouterConfig.buildDirectory, "client");
    await copyFile(join(client, "404", "index.html"), join(client, "404.html"));
  },
} satisfies Config;
