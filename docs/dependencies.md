# Dependencies

Every package the template installs, what it is for, where it is used, and what to watch when updating it. **Update this file in the same change as any dependency change**: an addition, a removal, a major upgrade, or a package held back.

Last reviewed: 2026-11-10.

## At a glance

| Package | Kind | In one line |
| --- | --- | --- |
| `next` | runtime | The framework and static exporter |
| `react`, `react-dom` | runtime | UI runtime |
| `react-markdown`, `remark-gfm`, `rehype-slug` | runtime | Render each page's `content.md` |
| `github-slugger` | runtime | Heading slugs for the table of contents and content items |
| `metaplate` | runtime | Social cards: render, metadata, guards, platform checks, export audit |
| `@fontsource/inter`, `space-grotesk`, `jetbrains-mono` | runtime | Self-hosted font files, for pages and cards |
| `satori` | build | Lays out the social cards (Metaplate's renderer) |
| `@resvg/resvg-js` | build | Rasterises the social cards and the app icons |
| `tsx` | build | Runs the TypeScript/JSX build scripts |
| `tailwindcss`, `@tailwindcss/postcss` | build | Styling |
| `typescript`, `@types/*` | check | Type checking |
| `eslint`, `eslint-config-next`, `eslint-plugin-better-tailwindcss` | check | Linting |
| `vitest` | test | Unit tests |
| `@playwright/test`, `@axe-core/playwright` | test | Browser and accessibility tests |
| `linkinator` | test | Broken-link crawl |
| `serve` | test | Static server for the browser tests and link check |
| `@lhci/cli` | test | Lighthouse CI |

"Runtime" means it is in `dependencies` because the pages are built from it. The site is a static export, so nothing here runs on a server: only React, Next's client runtime and the CSS reach a reader's browser.

## `dependencies`

### `next` 16.4.6 (MIT)

The framework: App Router, `output: "export"`, `typedRoutes`, `next/font/local`, metadata routes. Pinned exactly, together with `eslint-config-next`, which must match it (Dependabot groups the two).

- **Where:** everywhere; `next.config.ts`.
- **Watch:** `next build` refuses to run on a version with a published security advisory, so a stale Next blocks deploys. The static export's prefetch file naming has changed before (vercel/next.js#85374); `tests/e2e/console.spec.ts` fails on any prefetch 404, and `scripts/flatten-rsc-segments.mjs` is the workaround. Read `node_modules/next/dist/docs/` for the installed version's behaviour (AGENTS.md says why).

### `react`, `react-dom` 19.3.1 (MIT)

Next's UI runtime. Keep both on the same version.

### `react-markdown` 10.1, `remark-gfm` 4.0, `rehype-slug` 6.0 (MIT)

Turn each page's `content.md` into React elements at build time. `remark-gfm` adds GitHub-flavoured markdown (tables, task lists, strikethrough, autolinks); `rehype-slug` gives headings the `id`s that in-page links and the table of contents point at.

- **Where:** `src/components/Markdown.tsx` (the element mapping that applies the site's type scale).
- **Watch:** these are ESM-only and versioned together through the unified ecosystem; upgrade them together.

### `github-slugger` 2.0 (ISC)

Produces the same heading slugs `rehype-slug` does, so the table of contents links match the rendered ids, and content items (`### Heading` in `content.md`) get stable keys.

- **Where:** `src/lib/markdown-toc.ts`, `src/lib/page-content.ts`. `tests/unit/markdown-toc.test.ts` checks the slugs.

### `metaplate` 0.8.4 (MIT)

freeknet's own social-image library. Renders a card per route before the build, builds each page's `og:image` metadata from the same definition, fails a broken card with render guards, and verifies files, baselines and deployed pages. See [social-cards.md](social-cards.md).

- **Where:** `src/lib/og/`, `scripts/render-cards.mts` (render with `--target`, 0.8.3+), `scripts/audit-export.mts` (`extractPageSocialMetadata`, `verifySocialImage` with `checkUrl`, 0.8.4+), `scripts/preview-cards.mts`, `tests/unit/cards.test.ts`, the `cards:*` npm scripts.
- **Peer dependencies:** `satori` and `@resvg/resvg-js` (installed as devDependencies), `next >=16.3.2 <17`, `react`.
- **Watch:** any upgrade of Metaplate, Satori, resvg or a font can move card pixels with no code change. Run `npm run cards:baseline` before and `npm run cards:compare` after, and read Metaplate's [upgrading guide](https://github.com/freeknet/metaplate/blob/main/docs/upgrading.md) and CHANGELOG.

### `@fontsource/inter`, `@fontsource/space-grotesk`, `@fontsource/jetbrains-mono` 5.3 (OFL-1.1)

The font files, from npm rather than a font service, so no page loads anything from another origin. The pages load them through `next/font/local`; the social cards read the same files.

- **Where:** `src/app/layout.tsx` (weights listed there are preloaded), `src/lib/og/plate.tsx`, `scripts/copy-font-licences.mjs` (publishes each licence at `/fonts/`).
- **Watch:** a font update changes card rendering; see Metaplate above. [styling-and-theme.md](styling-and-theme.md) has the steps for changing a family.

## `devDependencies`

### `satori` 0.63.2 (MPL-2.0)

Lays out the social card JSX into SVG. A peer dependency of Metaplate, so the site installs it. Only runs at build time; `serverExternalPackages` in `next.config.ts` keeps it out of Next's bundle, because pages import the plate for its metadata.

### `@resvg/resvg-js` 2.6.2 (MPL-2.0)

Rasterises SVG to PNG: the social cards (through Metaplate) and the app icons (`scripts/render-icons.mts`). A native module with prebuilt binaries per platform; also in `serverExternalPackages`.

### `tsx` 4.23 (MIT)

Runs `scripts/render-cards.mts`, `scripts/render-icons.mts` and `scripts/preview-cards.mts`, which import TypeScript and JSX that Node cannot load on its own. Used in-process so no `NODE_OPTIONS` is needed (an npm script cannot set it on Windows).

### `tailwindcss`, `@tailwindcss/postcss` 4.3.5 (MIT)

Styling. Tokens are declared in `src/app/globals.css` (`@theme inline`); `postcss.config.mjs` wires the plugin into Next.

### `typescript` 6.0.3, held with `~` (Apache-2.0)

Type checking (`npm run typecheck` runs `next typegen` then `tsc --noEmit`). **Held on 6.0**: TypeScript 7 is the native compiler, and its package exports no JavaScript API (its main entry returns only the version; the API is under `typescript/unstable/*`). Next's build and typescript-eslint load the classic API, so with 7 installed `npm run lint` fails to start (checked on Dependabot's 7.0.2 pull request, November 2026). `.github/dependabot.yml` ignores TypeScript majors until both support it; remove that rule then.

### `@types/node` 26, `@types/react` 19, `@types/react-dom` 19 (MIT)

Types for Node (scripts, tests) and React.

### `eslint` 10.14 (MIT)

Linting, configured in `eslint.config.mjs` (flat config). ESLint 9 is out of support. The React, import and jsx-a11y plugins inside `eslint-config-next` do not list ESLint 10 as a peer yet, so `npm install` prints three `ERESOLVE overriding peer dependency` warnings; their rules still run.

### `eslint-config-next` 16.4.6 (MIT)

Next's rules: Core Web Vitals and TypeScript. Same version as `next`.

### `eslint-plugin-better-tailwindcss` 4.11 (MIT)

Its `enforce-canonical-classes` rule fails a Tailwind arbitrary value that a token already provides (`tracking-[-0.025em]` for `tracking-tight`). Reads the tokens from `globals.css`.

### `vitest` 5.1 (MIT)

Unit tests in `tests/unit/` (`vitest.config.mts`). Version 5 rather than 4 because npm 10 crashes resolving Vitest 4's peer set in this tree.

### `@playwright/test` 1.65 (Apache-2.0), `@axe-core/playwright` 4.14 (MPL-2.0)

Browser tests in `tests/e2e/` against the built `out/` (`playwright.config.ts`), and axe accessibility scans (WCAG 2.1 A and AA). CI installs Chromium with `npx playwright install --with-deps chromium`; locally, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can point at an existing Chromium.

### `linkinator` 8.1 (MIT)

Crawls the built site for broken links and `#fragment` targets, through `scripts/check-links.mjs` (`npm run test:links`).

### `serve` 14.2 (MIT)

Serves `out/` as a static host would, for Playwright (`webServer` in `playwright.config.ts`), the link check, and `npm start`.

### `@lhci/cli` 0.16 (Apache-2.0)

Lighthouse CI (`npm run test:lighthouse`, `lighthouserc.json`): accessibility below 0.95 fails, performance/best practices/SEO below 0.9 warn. Reports go to `.lighthouseci/` only, never to public storage. Needs a Chrome (`CHROME_PATH` locally).

## Outside `package.json`

| What | Version | Where | Notes |
| --- | --- | --- | --- |
| Node.js | 26 | `.nvmrc` | CI and Netlify read it. `engines` allows 22 and up. |
| npm | the one bundled with Node | | `package-lock.json` pins the tree; CI uses `npm ci`. |
| Wrangler | `npx wrangler@4` at deploy time | `scripts/deploy-cloudflare.mjs` | Not installed, to keep `npm ci` light. Pin it as a devDependency if a release breaks deploys. |
| Cloudflare Workers static assets | `compatibility_date` in `wrangler.jsonc` | | Serves `out/`; no Worker script. |
| Chromium | the build Playwright pins | | Installed in CI; used by Playwright and Lighthouse. |
| GitHub Actions | `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7` | `.github/workflows/ci.yml` | Dependabot groups their updates monthly. |

## Updating

- **Patches and minors:** Dependabot opens one grouped pull request a week, after a five-day cooldown (thirty days for majors); security updates are not delayed. CI runs everything on it.
- **Majors:** one at a time. Read the changelog, check peer ranges (`npm ls <package>`), and update this file.
- **Social cards:** `npm run cards:baseline` before any change to Metaplate, Satori, resvg or a font; `npm run cards:compare` after.
- **Adding a package:** prefer none. If it ships to the browser, check its size and that it needs no third-party origin (the CSP blocks it otherwise; see [security.md](security.md)). Add it to this file with what it is for.

## Held back

- `typescript` on 6.0 (see above). Dependabot ignores its majors (`.github/dependabot.yml`).
