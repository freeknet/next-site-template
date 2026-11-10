# next-site-template

A statically exported Next.js 16 site that starts finished: a palette checked for contrast in light and dark, pages whose words live in markdown, social cards rendered at build time, a hash-based content security policy, and lint, unit, browser, link and Lighthouse checks wired into CI. It deploys to Cloudflare Workers static assets, or to Netlify, or to any static host.

## Start a site

Press **Use this template** on GitHub, or:

```bash
npx degit freeknet/next-site-template my-site
cd my-site
npm install
npm run init:site -- --name "My Site" --repo me/my-site --tagline "What it does in one line"
npm run dev
```

`init:site` rewrites the name, repository, tagline and storage key in `src/lib/site.ts`, plus `package.json`, `wrangler.jsonc` and the card copy. Then replace the mark, the palette and the pages. The site's own [guide](src/app/guide/content.md) (`/guide/` when running) walks through each piece.

## What is in it

| | |
| --- | --- |
| **Framework** | Next.js 16 App Router, `output: "export"`, `trailingSlash`, `typedRoutes`, React 19 |
| **Styling** | Tailwind CSS 4, role tokens in `globals.css`, canonical classes enforced by ESLint |
| **Theme** | Dark by default, light from the system or the toggle, applied before first paint |
| **Content** | `content.md` beside each `page.tsx`, split into named blocks; long documents get a table of contents |
| **Fonts** | Inter, Space Grotesk and JetBrains Mono, self-hosted from `@fontsource`, licences published |
| **Social cards** | [Metaplate](https://github.com/freeknet/metaplate) renders a 1200x630 PNG per route before every build, from the same definition as each page's `og:image` tags. Render guards fail the build for overflowing, cropped, overlapping, unglyphed or blank cards; a live preview gallery, platform compatibility tests, pixel baselines for upgrades, and a post-deploy page check |
| **SEO** | Per-page metadata and canonical URLs, sitemap, robots, web app manifest, JSON-LD, `llms.txt`, and a noindex switch for staging |
| **PWA** | Installable (manifest, maskable and Apple icons rendered from the mark), offline via a generated service worker with network-first pages, an offline page, and a switch that cleanly uninstalls it |
| **Security** | Headers in `public/_headers`; after the build every page gets a CSP that allows only its own inline scripts, by hash |
| **Tests** | Vitest (palette contrast, content parser, CSP, headers, hard-coded values), Playwright + axe (both themes, keyboard, metadata, console, 404s), linkinator, Lighthouse |
| **CI** | GitHub Actions running all of the above on every pull request; Dependabot grouped weekly with a cooldown |
| **Deploy** | `npm run deploy` to Cloudflare Workers static assets; `netlify.toml` for Netlify |

## Documentation

[`docs/`](docs/README.md) has a reference for each part, written for people and coding agents alike:

| | |
| --- | --- |
| [Getting started](docs/getting-started.md) | From an empty folder to a deployed site |
| [Architecture](docs/architecture.md) | Build pipeline, every npm script, file layout |
| [Pages and content](docs/pages-and-content.md) | Adding pages, `content.md` blocks, copy rules |
| [Styling and theme](docs/styling-and-theme.md) | Tokens, palette, fonts, the mark, components |
| [Metadata and SEO](docs/metadata.md) | Titles, canonical URLs, indexing, sitemap, JSON-LD |
| [Social cards](docs/social-cards.md) | Metaplate: the plate, guards, preview, verification |
| [PWA](docs/pwa.md) | Manifest, icons, service worker, offline, turning it off |
| [Security](docs/security.md) | Headers, the hashed CSP, adding third-party origins |
| [Testing](docs/testing.md) | Every check, what it guards, reading failures |
| [Deploying](docs/deploying.md) | Cloudflare, Netlify, domains, going live |
| [Dependencies](docs/dependencies.md) | Every package and what it is for |

Agents: [`AGENTS.md`](AGENTS.md) has the rules (Claude Code reads it through `CLAUDE.md`), and `.claude/skills/` has skills for adding a page and rebranding. The built site also serves `/llms.txt`, a plain-text map of its pages.

## Commands

```bash
npm run dev               # http://localhost:3000
npm run build             # static export into out/
npm run check             # lint, types, unit tests, build, card checks, links
npm run test:e2e          # Playwright against out/ (build first)
npm run test:lighthouse   # Lighthouse CI against out/
npm run cards:preview     # live gallery of the social cards
npm run deploy            # build and deploy to Cloudflare
```

The browser tests can use a Chromium already on the machine: set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path. Set `PLAYWRIGHT_PORT` to serve the build somewhere other than 4173.

Lighthouse's SEO score sits below 0.9 until launch, because every page is `noindex` while `INDEXABLE` is `false`. That assertion is a warning; accessibility below 0.95 is an error.

## License

MIT ([`LICENSE`](LICENSE)).

The fonts are under the SIL Open Font License 1.1: [Inter](https://github.com/rsms/inter), [Space Grotesk](https://github.com/floriankarsten/space-grotesk) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono). Their licences are published with each build at `/fonts/`.
