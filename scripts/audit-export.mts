/*
 * Checks every exported page against the card it names, offline, after `next build`.
 *
 * `metaplate render` proves the card files are good; it cannot prove a page points at them.
 * This reads each page's tags the way `metaplate verify-page` will after the deploy (Metaplate's
 * own parser), finds the file its og:image names in out/, and verifies the bytes against the
 * tags: width and height (both required), type, alt text (required), and each platform's rules.
 * A page for a route in EXPORTED_ROUTES must name that route's own card, which catches a page
 * that inherits another page's metadata. Other pages (the offline page) only need a valid card.
 * Any failure fails the build. Adapted from Metaplate's testing guide.
 *
 * The URL rules (an absolute HTTPS URL) only run when the build's origin is HTTPS, i.e. a
 * production build with NEXT_PUBLIC_SITE_URL set. A local or CI build's URLs are
 * http://localhost, so there `checkUrl: false` checks the files and tags alone (Metaplate 0.8.4+).
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
  const documentUrl = new URL(page, `${SITE_URL}/`).href;
  const { openGraph } = extractPageSocialMetadata(html, documentUrl);
  const [image] = openGraph.images;
  if (!image?.url) {
    failures.push(`${page}: no og:image`);
    continue;
  }

  // Values come back as written, so resolve a relative URL against the page.
  // `?v=` is a cache-busting token on the URL; the file on disk does not carry it.
  const cardPath = new URL(image.url, documentUrl).pathname;
  const expected = EXPECTED.get(page);
  if (expected && cardPath !== expected) failures.push(`${page}: names ${cardPath}, expected its own card ${expected}`);

  const bytes = await readFile(path.join(OUT, cardPath)).catch(() => undefined);
  if (!bytes) {
    failures.push(`${page}: ${image.url} is not in the export`);
    continue;
  }

  // Tag values are strings as written; the descriptor compares numbers.
  const width = Number(image.width);
  const height = Number(image.height);
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    failures.push(`${page}: og:image:width and og:image:height must both be set`);
    continue;
  }

  // A missing alt is passed as "" so the targets' alt-text rule fails it.
  const report = verifySocialImage(
    bytes,
    { url: image.url, alt: image.alt ?? "", ...(image.type ? { type: image.type } : {}), width, height },
    { targets: TARGETS, checkUrl: CHECK_URLS },
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
