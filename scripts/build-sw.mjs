// Writes out/sw.js from scripts/sw-template.js, after `next build`.
//
// With PWA on (src/lib/site.ts), the worker precaches every exported page and every file under
// /_next/static/, and names its cache by a hash of those files, so each build gets a fresh cache
// and the old one is deleted. With PWA off, it writes a worker that deletes its caches and
// unregisters itself, so browsers that installed an earlier build are cleaned up (a service worker
// keeps running until a new one replaces it; deleting sw.js alone would leave it in place).
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Reads a `export const NAME = <literal>;` from src/lib/site.ts. */
export function readSiteConstant(source, name) {
  const match = new RegExp(`export const ${name} = ("[^"]*"|true|false);`).exec(source);
  if (!match) throw new Error(`src/lib/site.ts has no literal ${name}`);
  return JSON.parse(match[1]);
}

/** The URL a file in out/ is served at: `guide/index.html` is `/guide/`. */
export function urlFor(relativePath) {
  const posix = relativePath.split(path.sep).join("/");
  if (posix === "index.html") return "/";
  if (posix.endsWith("/index.html")) return `/${posix.slice(0, -"index.html".length)}`;
  return `/${posix}`;
}

/** Which exported files the worker caches on install. */
export function shouldPrecache(relativePath) {
  const posix = relativePath.split(path.sep).join("/");
  if (posix.startsWith("_next/static/")) return true;
  if (posix === "index.html" || posix.endsWith("/index.html")) return !posix.startsWith("_not-found/") && !posix.startsWith("404/");
  return ["manifest.webmanifest", "icon.svg"].includes(posix) || posix.startsWith("icons/");
}

export function serviceWorker({ prefix, version, precache, template }) {
  return template
    .replace("__CACHE_PREFIX__", JSON.stringify(prefix))
    .replace("__VERSION__", JSON.stringify(version))
    .replace("__PRECACHE__", JSON.stringify(precache, null, 2));
}

export function killSwitch(prefix) {
  return `// PWA is off (src/lib/site.ts). This worker removes an earlier one and its caches, then unregisters.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(${JSON.stringify(`${prefix}-`)})) await caches.delete(key);
    await self.registration.unregister();
    for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
  })());
});
`;
}

function files(dir, root = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full, root) : [path.relative(root, full)];
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = path.resolve("out");
  if (!fs.existsSync(out)) {
    console.error("build-sw: no out/ folder; run next build first.");
    process.exit(1);
  }
  const site = fs.readFileSync(path.join("src", "lib", "site.ts"), "utf8");
  const prefix = readSiteConstant(site, "STORAGE_PREFIX");

  if (!readSiteConstant(site, "PWA")) {
    fs.writeFileSync(path.join(out, "sw.js"), killSwitch(prefix));
    console.log("build-sw: PWA is off; wrote a worker that removes itself.");
  } else {
    const precached = files(out).filter(shouldPrecache).sort();
    const hash = createHash("sha256");
    for (const file of precached) hash.update(file).update(fs.readFileSync(path.join(out, file)));
    const version = hash.digest("hex").slice(0, 12);
    const template = fs.readFileSync(path.join("scripts", "sw-template.js"), "utf8");
    fs.writeFileSync(
      path.join(out, "sw.js"),
      serviceWorker({ prefix, version, precache: precached.map(urlFor), template }),
    );
    console.log(`build-sw: precaching ${precached.length} file(s), cache version ${version}.`);
  }
}
