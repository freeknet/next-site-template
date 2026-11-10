# Testing

## Commands

```bash
npm run lint             # ESLint: Next rules, canonical Tailwind classes
npm run typecheck        # next typegen && tsc (typed routes included)
npm test                 # Vitest, tests/unit/
npm run build            # also renders cards and hashes the CSP; fails on a missing content block or card
npm run test:links       # serves out/ on :4173, crawls it, fails on a broken internal link or #anchor
npm run test:e2e         # Playwright against out/ (build first)
npm run test:lighthouse  # Lighthouse CI against out/; accessibility < 0.95 fails
npm run check            # lint + typecheck + unit + build + links
```

CI (`.github/workflows/ci.yml`) runs all of them on every push to `main` and every pull request, and uploads the Playwright and Lighthouse reports.

Playwright can use a Chromium already on the machine: set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Otherwise run `npx playwright install chromium` once. `PLAYWRIGHT_PORT` moves the test server off 4173 (and then canonical URLs in a local build will not match; build with `NEXT_PUBLIC_SITE_URL=http://localhost:<port>`). For Lighthouse with a local Chrome, set `CHROME_PATH`.

## What each test guards

### Unit (`tests/unit/`)

| File | Fails when |
| --- | --- |
| `palette.test.ts` | a text token drops below 4.5:1 on any surface in either theme; the two light-theme rules differ; `constants.ts` disagrees with `globals.css` |
| `tailwind-tokens.test.ts` | a class spells a token as an arbitrary value (`bg-[var(--panel)]`) |
| `page-content.test.ts` | the `content.md` parser changes behaviour |
| `markdown-toc.test.ts` | table-of-contents slugs stop matching `rehype-slug`'s ids |
| `site.test.ts` | a nav item is not an exported route, a route has a trailing slash or no card, a card title is over 56 characters |
| `hardcoded.test.ts` | the repo slug appears outside `lib/site.ts`; `package.json`'s repository disagrees; copy uses an em dash or an empty marketing word |
| `headers.test.ts` | `_headers` loses a security header; `wrangler.jsonc` or `netlify.toml` stops matching the export |
| `csp.test.ts` | the CSP step hashes the wrong scripts or allows `'unsafe-inline'` |
| `brand.test.ts` | `src/app/icon.svg` stops matching the mark's geometry or colours |

### Browser (`tests/e2e/`, against `out/`)

| File | Checks |
| --- | --- |
| `a11y.spec.ts` | axe (WCAG 2.1 A/AA) on every route and the open mobile menu; one `h1` per page; the skip link |
| `theme.spec.ts` | system preference and explicit choice in both directions; persistence; axe in the light theme |
| `navigation.spec.ts` | current-section marking; every nav link; mobile menu focus trap, Escape, backdrop; no horizontal overflow at 390px; the guide's table of contents |
| `metadata.spec.ts` | each card is a 1200x630 PNG; Open Graph, Twitter, title, description, canonical; noindex; JSON-LD; favicon; sitemap, manifest, llms.txt; the 404 page |
| `console.spec.ts` | no console error, exception, 4xx/5xx, CSP violation or third-party request on load and after prefetching every link; client navigation under the CSP; self-hosted fonts and their licences |

`tests/e2e/routes.ts` lists the routes the browser tests visit. Add a row for every page.

## Reading common failures

- **`content.md for route "x" has no @y block`**: the page asks for a block the file does not have. Add it, or fix the name.
- **Type error on `CARDS`**: a route in `EXPORTED_ROUTES` has no card.
- **Type error on a `<Link href>`**: the route does not exist (typed routes). Check the path, without a trailing slash.
- **Metaplate `overflow`**: a card's title or description is too long.
- **`--x clears AA` fails**: the new colour is too close to a surface; the message gives the ratio.
- **`CSP violation: script-src ...`**: a script was injected after build or comes from another origin; see [security.md](security.md).
- **`404 .../__next.*.txt`** in the console test: Next changed its prefetch file naming in a static export. See `scripts/flatten-rsc-segments.mjs`.
- **`overflows by Npx`**: something is wider than a phone. Usually a grid or flex child without `min-w-0`, or a long unbroken string.

## Adding tests

- Logic in `src/lib/` gets a Vitest file in `tests/unit/`. Keep functions pure and importable without Next.
- A new page gets coverage from `routes.ts` automatically (axe, metadata, console, overflow). Add a spec only for behaviour specific to it.
- Interactive components get a Playwright spec that drives them by role and accessible name, not CSS selectors.
- Visual screenshots are not committed (`*-snapshots/` is ignored); assert behaviour instead.
