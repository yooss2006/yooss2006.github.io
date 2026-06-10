import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL ?? "https://yusunsang.github.io";
const base = process.env.PUBLIC_BASE_PATH;

export default defineConfig({
  site,
  ...(base ? { base } : {}),
});
