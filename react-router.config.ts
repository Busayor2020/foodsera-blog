import type { Config } from "@react-router/dev/config";

export default {
  // Every route is prerendered to static HTML in build/client. No server runs.
  ssr: false,
  prerender: ["/"],
} satisfies Config;
