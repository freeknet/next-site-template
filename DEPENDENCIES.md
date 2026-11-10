# Dependencies

What the site depends on, which version, why, and where each is used. **Update this file in the same change as any dependency change** past a minor version, and whenever you hold one back.

Last reviewed: 2026-11-10.

## How to update

- **Patches and minors:** Dependabot opens one grouped pull request a week. CI runs lint, types, unit tests, the build, links, the browser tests and Lighthouse on it.
- **Majors:** one at a time. Read the changelog and check what depends on the package (peer ranges). Note anything held back below.
- **Next.js:** keep `next` and `eslint-config-next` on the same version; Dependabot groups them. `next build` refuses to run on a version with a published advisory, so a stale Next blocks deploys.
- **Social cards:** a change to `metaplate`, `satori`, `@resvg/resvg-js` or the fonts can change how the cards look even when every check passes. Look at `public/og-image.png` before and after.
- `package-lock.json` pins the exact tree, and CI installs with `npm ci`.

## Runtime and platforms

| What | Version | Notes |
| --- | --- | --- |
| Node.js | 26 (`.nvmrc`) | Local, CI and Netlify. `engines` allows 22 and up. |
| Cloudflare Workers static assets | `compatibility_date` in `wrangler.jsonc` | Serves `out/`. No Worker script, so every request is a free static-asset request. |
| Wrangler | `npx wrangler@4` at deploy time | Not installed, to keep `npm ci` light. Pin it as a devDependency if a release ever breaks deploys. |

## `dependencies`

These are what the pages are built from. The site is a static export, so nothing here runs on a server.

| Package | Version | Why | Where |
| --- | --- | --- | --- |
| `next` | 16.4.6 | The framework: App Router, static export, typed routes. Pinned exactly, with `eslint-config-next`. | everywhere |
| `react`, `react-dom` | 19.3.1 | Next's UI runtime. | everywhere |
| `react-markdown`, `remark-gfm`, `rehype-slug` | 10.1, 4.0, 6.0 | Render each page's `content.md`: GitHub-flavoured markdown, with heading ids for links and the table of contents. | `src/components/Markdown.tsx` |
| `github-slugger` | 2.0 | The same slugs `rehype-slug` makes, for the table of contents and content item keys. | `src/lib/markdown-toc.ts`, `src/lib/page-content.ts` |
| `metaplate` | 0.8.2 | Our own social-card library: renders the cards before the build, builds the `og:image` metadata, and fails a card that overflows. | `src/lib/og/`, `scripts/render-cards.mts` |
| `@fontsource/inter`, `space-grotesk`, `jetbrains-mono` | 5.3 | The font files, self-hosted through `next/font/local`, and the bytes Satori needs for the cards. | `src/app/layout.tsx`, `src/lib/og/plate.tsx` |

## `devDependencies`

| Package | Version | Why | Where |
| --- | --- | --- | --- |
| `satori`, `@resvg/resvg-js` | 0.63.2, 2.6.2 | Metaplate's renderer and rasteriser (its peer dependencies). Kept out of the bundle by `serverExternalPackages`. | build only |
| `tsx` | 4.23 | Runs the card render, whose plate is JSX that Node cannot load alone. | `npm run assets` |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.5 | Styling. Tokens in `src/app/globals.css`. | build |
| `typescript` | 6.0.3 (`~`) | Types. Held on 6.0: TypeScript 7 (native) has no JavaScript API yet, which Next's build and typescript-eslint need. | `npm run typecheck` |
| `@types/node`, `@types/react`, `@types/react-dom` | 26, 19, 19 | Types. | |
| `eslint` | 10.14 | Linting. eslint-plugin-react, -import and -jsx-a11y inside `eslint-config-next` do not list ESLint 10 as a peer yet, so npm prints three ERESOLVE warnings on install; their rules still run. ESLint 9 is out of support. | `npm run lint` |
| `eslint-config-next` | 16.4.6 | Next's rules (Core Web Vitals and TypeScript). Same version as `next`. | `eslint.config.mjs` |
| `eslint-plugin-better-tailwindcss` | 4.11 | Fails a Tailwind arbitrary value that a token already provides. | `eslint.config.mjs` |
| `vitest` | 5.1 | Unit tests. 5, not 4: npm 10 crashes resolving 4's peer set in this tree. | `npm test` |
| `@playwright/test`, `@axe-core/playwright` | 1.65, 4.14 | Browser tests and accessibility scans. | `npm run test:e2e` |
| `linkinator` | 8.1 | Crawls the built site for broken links and anchors. | `scripts/check-links.mjs` |
| `serve` | 14.2 | Serves `out/` for Playwright and the link check, as a static host would. | tests |
| `@lhci/cli` | 0.16 | Lighthouse CI. Reports go to `.lighthouseci/` only, never a public upload. | `npm run test:lighthouse` |

## Held back

- `typescript` on 6.0 (see above).
