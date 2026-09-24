import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los E2E locales usan su propio directorio (ver playwright.config.ts) para
  // no chocar con el `next dev` normal. Sin la variable, el default de siempre.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
