# Architecture

A Next.js 16 App Router site exported to static files (`output: "export"`). There is no server at runtime: `out/` is the whole site.

## Build pipeline

`npm run build` runs, in order:

1. **`prebuild` → `npm run assets`**
   - `scripts/copy-font-licences.mjs`: copies the three OFL licences to `public/fonts/`.
   - `scripts/render-icons.mts` (via `tsx`): renders the app icons from the mark into `public/icons/`.
   - `scripts/render-cards.mts` (via `tsx`): Metaplate renders one 1200x630 PNG per route into `public/<route>/og-image.png`. Fails on text overflow, a missing glyph or a blank card.
2. **`next build`**: type-checks, prerenders every route into `out/` (`trailingSlash: true`, so `/guide` becomes `out/guide/index.html`), copies `public/` (including `_headers`) into `out/`.
3. **`postbuild`**
   - `scripts/flatten-rsc-segments.mjs`: copies nested prefetch files to the dotted names the router requests (vercel/next.js#85374). Currently a no-op with `trailingSlash`, kept as a guard.
   - `scripts/build-sw.mjs`: writes `out/sw.js` from `scripts/sw-template.js` with the list of files to precache, or a self-removing worker when `PWA` is off ([pwa.md](pwa.md)).
   - `scripts/csp-hashes.mjs`: hashes every page's inline `<script>`s and writes a `<meta http-equiv="Content-Security-Policy">` first in each `<head>`.

`npm run dev` runs `predev` (the same assets step) and then `next dev`. The postbuild steps do not run in dev, so there is no CSP and no service worker there.

## npm scripts

| Script | What it does |
| --- | --- |
| `dev` | `predev` (assets), then `next dev` on http://localhost:3000 |
| `build` | `prebuild` (assets), `next build` into `out/`, then `postbuild` (prefetch fix, service worker, CSP) |
| `start` | serves `out/` with `serve`, as a static host would |
| `assets` | font licences, app icons, social cards into `public/` |
| `init:site` | rewrites the project identity (`--name`, `--repo`, `--tagline`, `--description`, `--branch`) |
| `lint` | ESLint |
| `typecheck` | `next typegen` (route types), then `tsc --noEmit` |
| `test`, `test:watch` | Vitest, `tests/unit/` |
| `test:e2e`, `test:e2e:update` | Playwright against `out/` |
| `test:links` | serves `out/` on :4173 and crawls it for broken links and anchors |
| `test:lighthouse` | Lighthouse CI against `out/` |
| `check` | lint, typecheck, test, build, cards:verify, test:links |
| `cards:preview` | Metaplate's live card gallery on http://127.0.0.1:4323 |
| `cards:verify` | checks every built card is a complete 1200x630 PNG under 600 KB with visible content |
| `cards:baseline`, `cards:compare` | record the built cards, then fail on any pixel change and write diffs |
| `cards:verify-live` | `-- https://site/`: checks a deployed page's social images as crawlers see them |
| `deploy`, `deploy:preview` | build and deploy to Cloudflare (production, or a preview version) |

## Source layout

```text
src/
  app/
    layout.tsx            fonts, root metadata, theme pre-paint script, header/footer, JSON-LD
    globals.css           palette tokens (4 theme rules), Tailwind @theme, shared CSS classes
    (home)/page.tsx       home; route group so its content.md sits beside it
    (home)/content.md
    <route>/page.tsx      one folder per route
    <route>/content.md    that route's words
    not-found.tsx         404 page (exported as out/404.html)
    offline/              what the service worker shows for an uncached page offline
    robots.ts sitemap.ts manifest.ts llms.txt/route.ts   static metadata routes
    icon.svg              favicon (copy of the mark; tests/unit/brand.test.ts keeps them in step)
  components/             header, footer, nav, markdown, layout pieces
    brand/                Mark, Wordmark, icons
    ui.tsx                Prose, Lede, Panel, Callout, MarkedList, GridFill, Action, ArrowLink
  lib/
    site.ts               identity, nav, routes, INDEXABLE, PWA, SITE_URL  <- single source of truth
    constants.ts          hex palette for Satori, layout constants
    page-content.ts       content.md parser
    markdown-toc.ts       headings -> table of contents
    theme.ts              theme storage key and pre-paint script
    og/cards.ts           per-route social card copy
    og/plate.tsx          social card layout (Metaplate)
    og/metadata.ts        pageMetadata(): every page's Metadata
scripts/                  build, check and deploy scripts (plain Node ESM)
tests/unit/               Vitest
tests/e2e/                Playwright (runs against out/)
public/_headers           security and cache headers (Cloudflare and Netlify)
wrangler.jsonc            Cloudflare Workers static assets
netlify.toml              Netlify alternative
```

## Constraints of a static export

- No API routes, server actions, middleware, ISR, `cookies()`, `headers()`, or `next.config` `headers()`/`redirects()`.
- Route handlers must be GET and declare `export const dynamic = "force-static"`.
- No image optimiser: `images.unoptimized` is set; use plain `<img>` or `next/image` with `unoptimized`.
- Redirects go in `public/_redirects` (Cloudflare and Netlify both read it).
- Anything dynamic happens in the browser (client components) against third-party APIs, which must then be allowed by the CSP ([security.md](security.md)).

## Server and client components

Pages and most components are server components: they read `content.md` at build time with `node:fs`. Only interactive pieces carry `"use client"`: `NavLinks`, `MobileMenu`, `ThemeToggle`, `TableOfContents`, `Reveal`, `ServiceWorker`. Do not import a value from a `"use client"` module into server code (you get a client reference, not the value); shared constants go in a plain module, as `lib/theme.ts` does.
