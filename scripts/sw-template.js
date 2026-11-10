// The service worker, filled in by scripts/build-sw.mjs after each build. Edit this file, not
// out/sw.js. Plain JavaScript: it runs in the browser's worker scope, not through the bundler.
//
// - Install: caches every page and every file under /_next/static/ that the build produced.
// - Pages (navigations): network first, so a reader online always gets the current page; the
//   cached copy when offline; the offline page when the page was never cached.
// - /_next/static/: cache first. Those names are content hashes, so a cached copy is never stale.
// - Anything else on this origin (prefetch data, images, cards): network first, cached as it is
//   fetched, served from the cache when offline.
// - Other origins: untouched.
//
// Each build has its own cache, named by a hash of what it precaches. Activating a new build
// deletes the previous builds' caches. skipWaiting + clients.claim make a new build take over at
// once, which is safe because pages are always fetched from the network first.

const PREFIX = __CACHE_PREFIX__;
const CACHE = `${PREFIX}-${__VERSION__}`;
const PRECACHE = __PRECACHE__;
const OFFLINE_URL = "/offline/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith(`${PREFIX}-`) && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** A cached response for the request, trying `/path/` for `/path` (routes are folders). */
async function fromCache(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
  if (hit) return hit;
  const url = new URL(request.url);
  if (request.mode === "navigate" && !url.pathname.endsWith("/")) {
    return cache.match(`${url.pathname}/`);
  }
  return undefined;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await fromCache(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await fromCache(request);
  return cached ?? networkFirst(request);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  event.respondWith(url.pathname.startsWith("/_next/static/") ? cacheFirst(request) : networkFirst(request));
});
