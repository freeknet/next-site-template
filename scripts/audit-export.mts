/*
 * Checks every exported page against the card it names, offline, after `next build`.
 *
 * `metaplate render` proves the card files are good; it cannot prove a page points at them.
 * This reads each page's tags the way `metaplate verify-page` will after the deploy (Metaplate's
 * own parser), finds the file its og:image names in out/, and verifies the bytes against the
 * tags: dimensions, type, alt text, and each platform's rules. A route's page must name that
 * route's own card. Any failure fails the build. Adapted from Metaplate's testing guide.
 *
 * The URL rules (an absolute HTTPS URL) only run when the build's origin is HTTPS, i.e. a
 * production build with NEXT_PUBLIC_SITE_URL set. A local or CI build's URLs are
 * http://localhost, so there the descriptor's URL is left out and the bytes are checked alone.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { verifySocialImage } from "metaplate";
import { extractPageSocialMetadata } from "metaplate/node";
import { EXPORTED_ROUTES, pathOf, SITE_URL } from "../src/lib/site";

const OUT = path.resolve("out");
const TARGETS = ["openGraph", "x", "linkedin", "facebook", "whatsapp", "slack", "discord"] as const;
const CHECK_URLS = SITE_URL.startsWith("https://");

const entries = await readdir(OUT, { recursive: true, withFileTypes: true });
/** Exported pages as served paths (`/guide/index.html`), without Next's internal and 404 pages. */
const pages = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => `/${path.relative(OUT, path.join(entry.parentPath, entry.name)).split(path.sep).join("/")}`)
  .filter((page) => !/^\/(_next|_not-found|404)(\/|\.)/.test(page));

/** The card each exported route must name: /guide/ names /guide/og-image.png. */
const EXPECTED = new Map<string, string>(
  EXPORTED_ROUTES.map((route) => [`${pathOf(route)}index.html`, `${pathOf(route)}og-image.png`]),
);

const failures: string[] = [];

for (const page of pages) {
  const html = await readFile(path.join(OUT, page), "utf8");
  const { openGraph } = extractPageSocialMetadata(html, new URL(page, `${SITE_URL}/`).href);
  const [image] = openGraph.images;
  if (!image?.url) {
    failures.push(`${page}: no og:image`);
    continue;
  }

  // `?v=` is a cache-busting token on the URL; the file on disk does not carry it.
  const cardPath = new URL(image.url).pathname;
  const expected = EXPECTED.get(page);
  if (expected && cardPath !== expected) failures.push(`${page}: names ${cardPath}, expected its own card ${expected}`);

  const bytes = await readFile(path.join(OUT, cardPath)).catch(() => undefined);
  if (!bytes) {
    failures.push(`${page}: ${image.url} is not in the export`);
    continue;
  }

  // Tag values are strings as written; the descriptor compares numbers.
  const report = verifySocialImage(
    bytes,
    {
      ...(CHECK_URLS ? { url: image.url } : {}),
      ...(image.alt ? { alt: image.alt } : {}),
      ...(image.type ? { type: image.type } : {}),
      width: Number(image.width),
      height: Number(image.height),
    },
    { targets: TARGETS },
  );
  for (const issue of report.issues) {
    if (issue.severity === "error") failures.push(`${page}: ${issue.target ?? ""} ${issue.message}`);
  }
}

if (failures.length > 0) {
  console.error(`audit-export: social card audit failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `audit-export: ${pages.length} page(s) name a card that exists and matches its tags${CHECK_URLS ? ", URLs included" : " (URLs not checked: the origin is not HTTPS)"}.`,
);
