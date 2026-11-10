import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wholly static: every page is prerendered at build time into out/, and any static host
  // (Cloudflare Workers assets, Netlify) serves it. No server features, no API routes.
  output: "export",
  // No image optimiser runs behind a static export.
  images: { unoptimized: true },
  // Emits `guide/index.html` rather than `guide.html`, so a directory URL resolves without
  // depending on the host's extension-guessing.
  trailingSlash: true,
  // <Link href> is checked against the real routes at compile time. `npm run typecheck` runs
  // `next typegen` first so a plain tsc sees the generated types.
  typedRoutes: true,
  // Metaplate's renderer: a native binary and a Wasm file located from its own path, which
  // Turbopack cannot bundle. Pages import the plate for its metadata only (lib/og/plate.tsx).
  serverExternalPackages: ["@resvg/resvg-js", "satori"],
};

export default nextConfig;
