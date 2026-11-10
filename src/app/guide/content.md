<!-- @lede -->

Where each piece lives, what to change first when you start a new site, and the rules the tests hold you to.

<!-- @body -->

## Start a new site

Copy the template without its history (or press **Use this template** on GitHub), install, and give it your project's identity:

```bash
npx degit <owner>/<template-repo> my-site
cd my-site
npm install
npm run init:site -- --name "My Site" --repo me/my-site --tagline "What it does in one line"
```

`init:site` rewrites the identity block in `src/lib/site.ts`, the `repository` fields in `package.json`, the Worker name in `wrangler.jsonc` and the card copy's alt text. It prints what it changed and leaves the rest to you. Then:

1. Replace the mark in `src/components/brand/Mark.tsx` and copy it into `src/app/icon.svg`.
2. Change the palette in `src/app/globals.css` and the matching hexes in `src/lib/constants.ts`.
3. Rewrite the pages and their `content.md` files, and the routes in `src/lib/site.ts`.
4. Run `npm run check`.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/lib/site.ts` | Name, repository, tagline, description, navigation, routes, the noindex and PWA switches |
| `src/app/globals.css` | The palette as role tokens, in both themes |
| `src/app/<route>/content.md` | A page's words, in named blocks |
| `src/lib/og/cards.ts` | Each route's social card copy |
| `src/lib/og/plate.tsx` | The social card's layout |
| `src/components/` | Header, footer, markdown, layout pieces |
| `public/_headers` | Security and cache headers, for Cloudflare and Netlify |
| `scripts/` | Build steps: cards, icons, font licences, prefetch fix, service worker, CSP hashes, deploy |
| `tests/unit/` | Vitest: palette, content parsing, headers, CSP, service worker, hard-coded values |
| `tests/e2e/` | Playwright: accessibility, navigation, theme, metadata, PWA, console |

## Writing a page

A page is a `page.tsx` that lays out sections, and a `content.md` beside it that holds the words. Next only treats `page`, `layout` and their siblings as routes, so the markdown file is inert. Divide it into blocks with a marker line:

```md
<!-- @lede -->
One paragraph under the title.

<!-- @body -->
## A section
Prose, lists, tables and code.
```

Read it with `readPageContent("guide")` and take blocks by name with `block("lede")`. A block of repeated things, such as the highlights on the home page, is divided again by `###` headings and read with `items("highlights")`. Each item is keyed by its heading's slug, which is what binds it to the icon or link that stays in TypeScript. Asking for a block that is not there fails the build.

To add a route:

1. Create `src/app/<route>/page.tsx` and `content.md`.
2. Add the route to `EXPORTED_ROUTES` in `src/lib/site.ts`, and to `NAV` if it belongs in the header.
3. Add its card to `CARDS` in `src/lib/og/cards.ts`. Until you do, the build is a type error.
4. Add it to `tests/e2e/routes.ts` and `lighthouserc.json`.

Long documents go through `DocBody`, which renders the markdown with a sticky table of contents built from its `##` headings. This page is one.

## The palette

Colours are named for the role they play, not the colour they are: `ground`, `panel`, `hairline`, `text`, `secondary`, `label`, `accent`. Components use them only as Tailwind tokens (`bg-panel`, `text-label`), and ESLint rejects an arbitrary value that spells a token the long way.

Dark is the default. Light applies when the system asks for it, and an explicit choice from the toggle wins over the system in both directions. A small inline script applies a stored choice before the first paint, so a returning visitor never sees the other theme flash.

`tests/unit/palette.test.ts` reads `globals.css` and checks every text token against every surface in both themes at WCAG AA. Change a hex value and run `npm test`: it will say whether the new colour still reads.

## Social cards

The preview image a link shows in Slack, Discord, X or LinkedIn is rendered at build time by [Metaplate](https://github.com/freeknet/metaplate). `npm run assets` runs before `dev` and `build` and writes one 1200 by 630 PNG per route into `public/`, from the copy in `src/lib/og/cards.ts` and the layout in `src/lib/og/plate.tsx`. The same plate builds each page's `og:image` tags, so the file and the metadata cannot disagree.

Metaplate's render guards fail the build for a card that would ship broken: text past the edge, text in the strip a platform crops, two lines of text overlapping, a character no font covers, or a blank image. The same step checks each card against what every major platform documents, including WhatsApp's 600 KB limit, and after the build an audit reads every exported page and fails it if the card it names is missing, belongs to another page, or does not match its tags.

| Command | Use it to |
| --- | --- |
| `npm run cards:preview` | design a card in a live gallery that reloads on save |
| `npm run cards:verify` | check the built cards are complete PNGs with visible content |
| `npm run cards:baseline`, `npm run cards:compare` | catch any pixel change around a Metaplate, Satori or font upgrade |
| `npm run cards:verify-live -- https://your-domain/` | check the live site's previews as the crawlers see them |

A changed card gets a new `?v=` token in its URL, so crawlers fetch it again. Raise `revision` in the plate when you change the layout without changing any copy.

## Security headers and CSP

`public/_headers` sets the usual headers for every response: `nosniff`, a referrer policy, HSTS, a permissions policy and `frame-ancestors 'none'`. Both Cloudflare and Netlify read it.

A static export cannot use nonces, and Next inlines its bootstrap scripts, so most static sites fall back to `script-src 'unsafe-inline'`. After each build `scripts/csp-hashes.mjs` hashes every page's inline scripts and writes a `<meta>` policy that allows exactly those. The browser enforces both policies, so the stricter one decides. To load something from another origin, add it to the policy in that script and to `_headers`.

## Installing and offline

The site is a Progressive Web App: browsers offer to install it, and a service worker keeps pages readable offline. The worker is generated after each build from the files actually exported, fetches pages from the network first so a deploy is visible at once, and serves the cached copy only when there is no connection. The icons are rendered from the mark.

Set `PWA` in `src/lib/site.ts` to `false` to turn it off. The next build publishes a worker that removes itself from every browser that installed the old one, which is why the worker file is never simply deleted.

## Search engines

`INDEXABLE` in `src/lib/site.ts` is `false` until launch. While it is, `robots.txt` disallows everything and every page carries `noindex`. Set it to `true` when the production domain is live.

## Testing

```bash
npm run lint && npm run typecheck && npm test
npm run build
npm run test:e2e
npm run test:links
npm run test:lighthouse
```

`npm run check` runs lint, types, unit tests, the build and the link check together. The browser tests run against the built `out/`, so build first. They check every page with axe in both themes, keyboard focus in the mobile menu, that the theme survives a reload, that each page has a card and a canonical link, and that a page load logs no errors, no CSP violations and no 404s.

## Deploying

```bash
npm run deploy
```

builds the site and deploys `out/` as Cloudflare Workers static assets, as described in `wrangler.jsonc`. Set `NEXT_PUBLIC_SITE_URL` to the production origin so canonical and card URLs point at it. `npm run deploy:preview` uploads a version with its own URL and leaves production alone.

For Netlify, link the repository and it will build with `netlify.toml`. Any other static host can serve `out/` as it is.

## Keeping it current

Dependabot opens one grouped pull request a week for minor and patch updates, and keeps `next` and `eslint-config-next` together because their versions must match. New releases wait a few days before they are proposed. `docs/dependencies.md` records why each package is there; update it in the same change as the package.
