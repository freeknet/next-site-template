# Security headers and CSP

## Two policies

1. **`public/_headers`** (served as HTTP headers by Cloudflare and Netlify, which share the format) sets for every path: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, HSTS, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and a baseline `Content-Security-Policy` that includes `frame-ancestors 'none'` (a `<meta>` policy cannot set that directive).
2. **`scripts/csp-hashes.mjs`** (postbuild) writes a stricter `<meta http-equiv="Content-Security-Policy">` first in every exported page. Its `script-src` is `'self'` plus the SHA-256 hash of each inline `<script>` on that page (Next's bootstrap payload, the theme pre-paint script). No `'unsafe-inline'` for scripts.

Browsers enforce every policy they receive, so the stricter one decides. The header policy still has `script-src 'unsafe-inline'` as a fallback for hosts that strip the meta tag; the meta policy is what actually protects the page.

`next dev` serves neither, so a CSP problem only shows on the built site: run `npm run build && npm run test:e2e`.

## Add a third-party origin

Analytics, embeds, fonts, an API the browser calls: each origin must be added in **both** places, or the browser blocks it.

1. In `scripts/csp-hashes.mjs`, add the origin to the right directive in `POLICY`:
   - a `<script src>` → `script-src`
   - `fetch`/XHR/beacons/WebSockets → `connect-src`
   - `<iframe>` → `frame-src` (add the directive)
   - images → `img-src`; stylesheets → `style-src`; fonts → `font-src`
   - a form posting elsewhere → `form-action`
2. In `public/_headers`, add the same origin to the same directive of the `/*` rule.
3. Add the origin to `ALLOWED_ORIGINS` in `tests/e2e/console.spec.ts`, which otherwise fails on any request to another origin.
4. Build and run `npm run test:e2e`. A missed directive shows up as `CSP violation: <directive> <url>` in the console test.

Example, Google Analytics 4: `script-src https://www.googletagmanager.com`, `connect-src https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`, `img-src https://*.google-analytics.com`. Load its inline config snippet as a file in `public/` rather than an inline script, or hash it: the CSP step only hashes scripts present in the exported HTML, so an inline snippet written by JavaScript at runtime is blocked.

## Rules

- Do not add `'unsafe-inline'` or `'unsafe-eval'` to `script-src` in `csp-hashes.mjs`. If something needs it, find another way (load it as a file, or hash a static snippet).
- Inline scripts must be static at build time: anything rendered into the HTML is hashed automatically; anything injected later is not.
- JSON-LD (`type="application/ld+json"`) is a data block and is not hashed or blocked.
- `style-src` allows `'unsafe-inline'` because React writes `style` attributes.
- Redirects go in `public/_redirects`, not `next.config` (unsupported in a static export).

## Cache headers

`/_next/static/*` is cached for a year as immutable (its file names are content hashes). Fonts and social cards, which keep their names, are fresh for a day and served stale for a week while revalidating. Add a rule in `_headers` for any other unhashed asset folder you add.

Cloudflare limits `_headers` to 100 rules and 2,000 characters per line.
