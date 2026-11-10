# Next Site Template

A statically exported Next.js 16 site (App Router, Tailwind v4), deployed as Cloudflare Workers static assets.

**Read [`docs/README.md`](docs/README.md) before changing anything.** It indexes task-focused references: getting started, architecture (with every npm script), pages and content, styling and theme, metadata and SEO, social cards (Metaplate), PWA, security and CSP, testing, deploying, and dependencies (what each package is for). Claude Code skills for adding a page and rebranding are in `.claude/skills/`. This file is the short version.

## Commands

- `npm run dev`, `npm run build` (static export into `out/`; `prebuild` renders the social cards, `postbuild` fixes prefetch names and hashes the CSP)
- `npm run lint`, `npm run typecheck` (`next typegen && tsc`), `npm test` (Vitest, `tests/unit/`)
- `npm run test:e2e` (Playwright against the built `out/`; build first), `npm run test:links`, `npm run test:lighthouse`
- `npm run check` runs lint, types, unit tests, the build, card verification and the link check
- `npm run cards:preview` (live social-card gallery), `cards:baseline` / `cards:compare` (pixel diff around an upgrade), `cards:verify-live -- <url>` (after deploying)
- `npm run deploy` / `deploy:preview` (Cloudflare, `scripts/deploy-cloudflare.mjs`)
- Node 26 (`.nvmrc`; CI reads the same file)

## Rules

- `output: "export"`: no server, no API routes, no `headers()` in next.config. Only GET route handlers with `dynamic = "force-static"`.
- Identity, navigation and routes live in `src/lib/site.ts` only. The repository slug is written there and in package.json, nowhere else (`tests/unit/hardcoded.test.ts`).
- Routes are written without a trailing slash (`/guide`): that is what `typedRoutes` checks. `<Link>` adds the slash; use `pathOf()` where a literal path is needed.
- A new page needs: `page.tsx` + `content.md`, an entry in `EXPORTED_ROUTES` (and `NAV` if it is in the header), a card in `src/lib/og/cards.ts`, a row in `tests/e2e/routes.ts` and `lighthouserc.json`.
- Words go in the route's `content.md`, in `<!-- @name -->` blocks, never in JSX. Every page sets metadata through `pageMetadata()`.
- Social cards are rendered by Metaplate from `src/lib/og/cards.ts` and `src/lib/og/plate.tsx` (`docs/social-cards.md`). The plate is Satori, not a browser: flexbox and inline styles only, colours from `BRAND`. Its render guards fail the build for a broken card; fix the card, do not turn a guard off.
- Colours are role tokens in `src/app/globals.css`, used as Tailwind classes (`bg-panel`, `text-label`). No raw hex in components and no arbitrary values that spell a token. Change a colour in all four theme rules and in `src/lib/constants.ts`; `tests/unit/palette.test.ts` checks contrast.
- A third-party origin (analytics, embeds) must be added to both `scripts/csp-hashes.mjs` and `public/_headers`, or it is blocked.
- Copy rules (tested): no em dashes in reader-facing text, none of the empty marketing words listed in `tests/unit/hardcoded.test.ts`.
- `INDEXABLE` in `src/lib/site.ts` stays `false` until launch.
- The site is a PWA (`PWA` in `src/lib/site.ts`; `docs/pwa.md`). Change caching in `scripts/sw-template.js`, never in `out/sw.js`. To turn PWA off, set the flag to `false` and deploy; never delete `sw.js` or the registration, or visitors stay on the old cached build.
- Keep `prefers-reduced-motion` honoured and focus styles visible. Every page has exactly one `h1`.
- Update `docs/dependencies.md` in the same change as any dependency change past a minor. Prefer adding no package.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
