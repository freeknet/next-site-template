# Progressive Web App

The site is installable and keeps working offline for pages a visitor has the worker for. It is on by default: `PWA = true` in `src/lib/site.ts`.

## What is included

| Piece | Where | What it does |
| --- | --- | --- |
| Manifest | `src/app/manifest.ts` → `/manifest.webmanifest` | Name, `short_name`, `start_url`, `scope`, `id`, `display: standalone`, colours, icons. Linked from every page by Next. |
| Icons | `scripts/render-icons.mts` → `public/icons/` | `icon-192.png`, `icon-512.png`, `maskable-512.png` (mark inside the safe zone), `apple-touch-icon.png` (180px). Rendered from the mark on every `dev`/`build`; git-ignored. |
| iOS tags | `src/app/layout.tsx` (`appleWebApp`, `icons.apple`) | Home-screen title, status bar style and icon. iOS reads these rather than the manifest. |
| Theme colour | `src/app/layout.tsx` (`viewport.themeColor`) | One per colour scheme, so the browser chrome and an installed app's title bar follow the system theme. |
| Service worker | `scripts/sw-template.js` → `scripts/build-sw.mjs` → `out/sw.js` | Precaches every page and every `/_next/static/` file the build produced; serves them offline. |
| Registration | `src/components/ServiceWorker.tsx` | Registers `/sw.js` after page load, in production only. |
| Offline page | `src/app/offline/` | Shown for a page that was never cached when there is no connection. Precached, not in the sitemap or nav, `noindex`. |
| Headers | `public/_headers` | `/sw.js` is `no-cache, no-store`; the manifest revalidates every time. |

## How the service worker behaves

- **Install:** caches every exported page (`/`, `/guide/`, `/offline/`, …), every file under `/_next/static/`, the icons and the manifest. This template precaches about 1 MB, most of it the JavaScript and fonts every page already loads.
- **Pages:** network first. Online readers always get the current page; offline, the cached copy; never cached, `/offline/`. A request for `/guide` (no slash) offline is answered with the cached `/guide/`.
- **`/_next/static/`:** cache first. Those file names are content hashes, so a cached copy can never be stale.
- **Everything else on this origin** (prefetch data, social cards): network first, cached as it is fetched.
- **Other origins:** never touched, so analytics or embeds behave as if there were no worker.
- **Updates:** each build's cache is named by a hash of what it precaches. When a new build is deployed, the browser notices the changed `sw.js` on the next navigation, installs the new worker, which takes over immediately (`skipWaiting` + `clients.claim`) and deletes the old cache. Because pages are network-first, there is no "stale until you close every tab" problem.

The worker is generated after `next build`, not by a plugin: there is no dependency to keep in step with Next or Turbopack, and the precache list is exactly the files in `out/`.

## Turning it off

Set `PWA = false` in `src/lib/site.ts` and deploy. Then:

- the manifest's `display` becomes `browser`, so nothing offers installation;
- `ServiceWorker.tsx` unregisters any existing worker instead of registering one;
- the build writes a `sw.js` that deletes its caches and unregisters itself. Browsers that installed an earlier build pick it up on their next visit and are cleaned up.

Do not just delete `sw.js` or the registration: a service worker keeps controlling the site until a new one replaces it, so visitors would be served the old cached build indefinitely. Leave the self-removing worker in place for a few months before deleting the PWA files entirely.

When PWA is off, delete `tests/e2e/pwa.spec.ts` or change it to assert that no worker stays registered.

## Customising

- **Name under the icon:** `SHORT_NAME` in `src/lib/site.ts`, 12 characters or fewer.
- **Icons:** they follow the mark (`src/components/brand/Mark.tsx`) and `BRAND.ground`/`BRAND.accent` (`src/lib/constants.ts`). Adjust the `scale` values in `scripts/render-icons.mts` if a new mark crowds the maskable safe zone (a circle 80% of the icon's width); check it at maskable.app or in Chrome DevTools → Application → Manifest.
- **Display mode:** `standalone` (own window, no browser UI) is the default. `minimal-ui` keeps back/reload buttons; `browser` disables installation.
- **What is precached:** `shouldPrecache()` in `scripts/build-sw.mjs`. Keep it to small files; large media should be cached at runtime (it already is, once fetched) or not at all.
- **Caching rules:** `scripts/sw-template.js`. It is plain browser JavaScript with three placeholders (`__CACHE_PREFIX__`, `__VERSION__`, `__PRECACHE__`) that the build fills in.
- **Offline page copy:** `src/app/offline/content.md`.

## Considerations

- **Content freshness.** Pages are always fetched from the network when online, so a deploy is visible on the next navigation. Only offline readers see cached pages, and they see the build they last loaded.
- **Storage.** The browser may evict caches under storage pressure. Do not treat the cache as a guarantee; it is an offline convenience.
- **Third parties.** The worker ignores other origins, so anything loaded from elsewhere (analytics, embeds, fonts you should not be loading anyway) is unavailable offline and is subject only to the CSP ([security.md](security.md)).
- **CSP.** The worker is a same-origin file, allowed by `script-src 'self'` (which `worker-src` falls back to). Registration is in a bundled component, not an inline script, so the hashed policy needs no change.
- **Scope.** The worker controls `/`, the whole site. Serving the site under a sub-path would need `scope`, `start_url`, the registration path and `id` changed together.
- **Dev.** Nothing registers in `next dev`. To work on the worker, `npm run build && npm start` and use DevTools → Application → Service workers ("Update on reload", "Offline").
- **Leftover workers on `localhost`.** A worker registered while testing a build stays on that origin. If `next dev` on the same port behaves oddly, unregister it in DevTools → Application.
- **Lighthouse.** Lighthouse 12 removed its PWA category. Installability is checked by `tests/e2e/pwa.spec.ts` instead, and by Chrome DevTools → Application → Manifest.
- **Push notifications and background sync** are not included. They need a server or a third-party service, which a static export does not have.

## Tests

`tests/e2e/pwa.spec.ts`: the manifest has the fields and icon sizes installation needs, and each icon is a PNG of its stated size; pages link the manifest, the Apple icon and a theme colour per scheme; the worker installs and takes control; offline, a precached page, a slash-less URL and a never-built URL are served correctly; `sw.js` is served with no placeholders left. `tests/unit/service-worker.test.ts` covers the generator: URL mapping, the precache filter, placeholder filling and the self-removing worker.
