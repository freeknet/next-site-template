# Social cards (Metaplate)

The image a link preview shows (Slack, Discord, X, LinkedIn, iMessage, WhatsApp) is a 1200x630 PNG per page, rendered at build time by [Metaplate](https://github.com/freeknet/metaplate), freeknet's own social-image library. This page covers how the template uses it, how to change the cards, and how to check them.

## Why build-time cards

A static export has no server to render images on request, and it does not need one: the cards only change when their copy or layout does. So they are rendered once, before `next build`, into `public/` as ordinary files, and every host serves them as static PNGs. Satori and resvg (the renderers) never ship to a reader and never run in production.

Metaplate adds three things over calling Satori directly:

- **One definition, two uses.** The same plate renders the files and builds each page's `og:image` metadata (URL, size, type, alt), so the two can never disagree.
- **Render guards** that fail the build for a card that is broken but still a valid PNG: text off the canvas, a missing glyph, a blank image.
- **Verification tools**: `verify` for the built files, baseline comparison for upgrades, `verify-page` for the deployed site, and compatibility profiles for each platform's documented rules.

## The files

| File | Role |
| --- | --- |
| `src/lib/og/cards.ts` | The copy: `eyebrow`, `title`, `description`, `alt` for each route in `EXPORTED_ROUTES`. Plain data, typed as `Record<ExportedRoute, CardCopy>`, so a route without a card is a type error. |
| `src/lib/og/plate.tsx` | The plate: `createNodeOg<CardCopy>({...})` from `metaplate/node`, with the card's layout as a Satori component. |
| `src/lib/og/cards.render.tsx` | The render module: one job, the plate rendered once per route. `metaplate render` and `metaplate preview` both load it. |
| `src/lib/og/metadata.ts` | `pageMetadata()`: puts `og.metadata(...)`'s images into each page's `openGraph` and `twitter` metadata. |
| `scripts/render-cards.mts` | Runs `metaplate render` in-process under `tsx` (the plate is JSX), with `--target` for each platform and `--max-file-size 600000`. Part of `npm run assets`. |
| `scripts/audit-export.mts` | After the build: checks every exported page names a card that exists and matches its tags. Part of `postbuild`. |
| `scripts/preview-cards.mts` | Runs `metaplate preview`, the live gallery. |

Output: `public/og-image.png` and `public/<route>/og-image.png`, plus `.og-manifest.json` (what was rendered, kept out of `public/`). All git-ignored.

## The plate's options

From `src/lib/og/plate.tsx`:

| Option | Value | Why |
| --- | --- | --- |
| `alt` | `(copy) => copy.alt` | `og:image:alt` and `twitter:image:alt`. Write it as a sentence describing the card. |
| `size` | `OG_SIZE` (1200x630) | The 1.91:1 size every platform accepts. |
| `imagePath` | `"og-image.png"` | The file name beside each route: `/guide/og-image.png`. A real extension, so any static host sends the right type. |
| `version`, `revision` | `"copy"`, `"1"` | Adds `?v=<hash>` to each image URL from the copy, so crawlers fetch a card again when its copy changes. Raise `revision` when the layout changes without the copy changing. |
| `fonts` | `fontsourceFontLoader([...])` | The font files Satori draws with, read from the `@fontsource` packages. Satori has no system fonts: a family or weight not listed here does not exist on the card. |
| `guards` | see below | Fail the render instead of shipping a broken card. |
| `component` | the layout | A function from the copy to Satori JSX. |

No `output` encoder is set, so cards are PNG. A card with a photograph should switch to JPEG (an `output.encode` using `sharp`), because a photographic PNG easily passes WhatsApp's 600 KB limit; see Metaplate's [rendering guide](https://github.com/freeknet/metaplate/blob/main/docs/rendering.md#other-output-formats).

## Render guards

Each is set to `"error"`, so `npm run assets` (and therefore `npm run dev` and `npm run build`) fails with a `RenderGuardError` naming the card, the element and the problem:

| Guard | Fails when | Usual fix |
| --- | --- | --- |
| `missingGlyphs` | a character has no glyph in any loaded font (it would draw as a box or nothing) | add the weight or family to `fonts`; remove the character; emoji need Metaplate's `emoji` option |
| `overflow` | a text element's box reaches past the canvas edge | If the message says the root is larger than the canvas, add `boxSizing: "border-box"` to it. If it says the text needs more room than its container has, shorten the copy, reduce the font size, or clamp it (`lineClamp`). |
| `safeArea` | text sits in the strip that X's 2:1 crop or Open Graph's 1.91:1 crop removes (15px top and bottom on 1200x630) | keep text inside the padding |
| `textOverlap` | two text boxes intersect, typically a long title running into the description | shorten the title or give it a `maxWidth` |
| `blank` | every pixel is one colour (the text never rendered) | usually a padding/`boxSizing` mistake or a missing font |

Two more guards exist and are off here: `avoid` (text too close to an element you key, such as a photo; useful once a card has an image) and per-guard `"warn"` levels. See [render guards](https://github.com/freeknet/metaplate/blob/main/docs/rendering.md#render-guards).

## Satori is not a browser

The plate is laid out by Satori, which implements a subset of CSS:

- **Flexbox only.** Any element with more than one child needs `display: "flex"`. No grid, no floats, no `position: sticky`.
- **Inline `style` objects only.** No class names, no Tailwind, no CSS custom properties. Colours come from `BRAND` in `src/lib/constants.ts`, which `tests/unit/palette.test.ts` keeps equal to the CSS palette.
- **`boxSizing: "border-box"` on a padded root.** Satori defaults to `content-box`, so a full-size root with padding grows past the canvas and bottom content falls off it (the `blank` or `overflow` guard catches this).
- **Silent failures.** A CSS variable, a `fontFamily` that does not exactly match a loaded family's name (`"JetBrains Mono"`, not `"JetBrains"`), or a weight that is not loaded is ignored with no error: the card renders in a fallback face. `npm run cards:preview` is where you see it.
- **`<img>` stretches** to its `width` and `height` unless it has `objectFit: "cover"` (or `"contain"`).
- **Leave `<title>` out of inline SVG.** Through `createNextOg` it prints as visible text; this template's `createNodeOg` plate does not, but the card's accessible name is its `alt` either way.
- **No external images by URL** unless allowed; embed project files with `readImageAsset` from `metaplate/assets` (the component may be `async`).

Metaplate's [plate reference](https://github.com/freeknet/metaplate/blob/main/docs/plate.md) lists every option and member, and its [recipes](https://github.com/freeknet/metaplate/blob/main/docs/recipes.md) cover text beside a photograph, logos, long titles, several fonts and one card per record.

## Changing the cards

- **Copy:** edit `src/lib/og/cards.ts`. Keep titles to 56 characters or fewer (`tests/unit/site.test.ts`) and descriptions to one short sentence. The `?v=` token changes by itself.
- **Layout:** edit the component in `plate.tsx`, then raise `revision`.
- **Fonts:** list each family and weight in `fonts` and use the family name (`"Space Grotesk"`, `"Inter"`) in `fontFamily`.
- **A new page:** add its `CARDS` entry; `cards.render.tsx` picks it up from `EXPORTED_ROUTES`.
- **A second size** (a 1080x1080 square for Instagram or Mastodon): declare it with `variants` on the plate and branch the layout on the size the component receives; `metaplate render` then writes `og-image-square.png` beside each card. See [variants](https://github.com/freeknet/metaplate/blob/main/docs/variants.md).

While designing, run `npm run cards:preview` and open the URL it prints (`http://127.0.0.1:4323/`). It shows every card at every size, with the crop overlays and checks, and reloads when you save the plate or the copy. Nothing is written to disk.

## Checking the cards

| When | Command | What it checks |
| --- | --- | --- |
| Every build | `npm run assets` (automatic) | The guards above; each written file's format and size; and, through `--target`, every platform's documented rules (Open Graph, X, LinkedIn, Facebook, WhatsApp, Slack, Discord) with WhatsApp's 600 KB as the file-size ceiling. A card that breaks one fails the build. |
| Every build | `scripts/audit-export.mts` (`postbuild`, automatic) | Every exported page names a card that is in `out/`, a route names its own card, and the bytes match the tags (size, type, alt) and every platform's rules. On a production build (an HTTPS `NEXT_PUBLIC_SITE_URL`) the image URLs are checked too; on a localhost build they are not. |
| Every `npm test` | `tests/unit/cards.test.ts` | Each card renders and meets the documented rules of Open Graph, X, LinkedIn, Facebook, WhatsApp, Slack and Discord (format, dimensions, file size, alt text). |
| After a build | `npm run cards:verify` (part of `npm run check`) | Every `out/**/og-image.png` is a real, complete 1200x630 PNG under 600 KB with visible content. |
| Browser tests | `tests/e2e/metadata.spec.ts` | Each page declares its card with width, height and alt, and the card is served as `image/png`. |
| Before and after an upgrade | `npm run cards:baseline`, then `npm run cards:compare` | Pixel comparison: fails any card that changed and writes before/after/diff images to `.og-diff/`. |
| After deploying | `npm run cards:verify-live -- https://your-domain/` | Fetches the live page as crawlers do and checks every social image it declares: HTTPS URL, fetchable, size, format, and whether `robots.txt` lets each platform's crawler in. |

### Upgrading Metaplate, Satori, resvg or a font

Metaplate's [upgrading guide](https://github.com/freeknet/metaplate/blob/main/docs/upgrading.md) lists each breaking change and what to do. Guards say nothing is broken, not that nothing changed: a new Satori can move text by a pixel or two with no code change. Around any such upgrade:

```bash
npm run build && npm run cards:baseline   # before: record the current cards in .og-baseline/
# upgrade the package
npm run build && npm run cards:compare    # after: fails on any change, writes .og-diff/
```

Look at the diff images. If the change is acceptable, run `npm run cards:baseline` again to accept it. Both directories are git-ignored.

### After going live

`cards:verify-live` reports a page as failing while `INDEXABLE` is `false`, because `robots.txt` then disallows the crawlers that obey it (X, Facebook), and a local or staging URL that is not HTTPS fails the `universal` profile. That is the point of running it after launch: it is the check that a real preview will work. Platform debuggers are the final word: Meta's Sharing Debugger, LinkedIn Post Inspector, and pasting the link into Slack or Discord.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `RenderGuardError` during `npm run assets` | A card broke a guard; the message names it. See [Render guards](#render-guards). |
| `render failed: ... exceeding the 600000-byte limit` | A card is too large for WhatsApp. Usually a photograph in a PNG: switch the plate to JPEG output. |
| `audit-export: ... is not in the export` | A page names a card that was not rendered: the route is missing from `EXPORTED_ROUTES`, or its path changed. |
| `audit-export: ... expected its own card` | A page uses another route's metadata; give it `pageMetadata("<its route>", ...)`. |
| The card is in the wrong typeface, with no error | `fontFamily` must equal the family name exactly, and the weight must be in `fonts`. |
| `Cannot load ...cards.render.tsx: Node does not transform JSX` | `metaplate` was run directly (`npx metaplate render ...`). Use the npm scripts, which run it under `tsx`. |
| A shared link shows the old card | The platform cached the old URL. Changed copy gets a new `?v=`; raise `revision` when only the layout changed. Then re-scrape it in the platform's debugger. |
| `cards:verify-live` fails on `robots.txt` | The site is still `noindex` (`INDEXABLE = false`). Expected before launch. |

## Reference

Metaplate's own documentation, in its repository's [`docs/`](https://github.com/freeknet/metaplate/tree/main/docs):

- [static-next-site.md](https://github.com/freeknet/metaplate/blob/main/docs/static-next-site.md): the setup this template uses, step by step, with a troubleshooting table
- [testing.md](https://github.com/freeknet/metaplate/blob/main/docs/testing.md): what each check catches, including the export audit
- [recipes.md](https://github.com/freeknet/metaplate/blob/main/docs/recipes.md): photos, logos, long titles, several fonts, brand colours
- [plate.md](https://github.com/freeknet/metaplate/blob/main/docs/plate.md): every plate option and returned member
- [upgrading.md](https://github.com/freeknet/metaplate/blob/main/docs/upgrading.md): breaking changes by version, and what to delete
- [render-cli.md](https://github.com/freeknet/metaplate/blob/main/docs/render-cli.md): `metaplate render`, the manifest, incremental builds
- [rendering.md](https://github.com/freeknet/metaplate/blob/main/docs/rendering.md): plates, output formats, images and assets, plate constraints, guards
- [fonts.md](https://github.com/freeknet/metaplate/blob/main/docs/fonts.md): font loaders, other scripts (CJK, Arabic), subsets
- [verification.md](https://github.com/freeknet/metaplate/blob/main/docs/verification.md): `verify`, `--require-content`, baselines, `verify-url`
- [verify-page.md](https://github.com/freeknet/metaplate/blob/main/docs/verify-page.md): checking a deployed page
- [compatibility.md](https://github.com/freeknet/metaplate/blob/main/docs/compatibility.md): what each platform documents and what is checked
- [preview.md](https://github.com/freeknet/metaplate/blob/main/docs/preview.md): the live gallery
- [variants.md](https://github.com/freeknet/metaplate/blob/main/docs/variants.md): square and other sizes
