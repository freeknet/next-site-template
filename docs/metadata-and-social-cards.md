# Metadata and social cards

## Page metadata

Every page exports `metadata = pageMetadata(route, { title, description })` from `src/lib/og/metadata.ts`. Do not build a `Metadata` object by hand: Next shallow-merges `openGraph`, so a page that sets its own replaces the layout's and silently drops `og:site_name`, `og:type` and `og:url`. `pageMetadata` restates all of them and adds the card image, canonical URL and Twitter card.

- `title` becomes `<title>Title · Name</title>` through the layout's template. Every page needs a distinct title (`tests/e2e/metadata.spec.ts`).
- `description` must be over 50 characters.
- Canonical and `og:url` are the route's served path (`/guide/`), made absolute with `SITE_URL`.

`SITE_URL` comes from `NEXT_PUBLIC_SITE_URL` (set by the deploy script), then Netlify's `URL`, then `http://localhost:4173`. It is baked in at build time, so a build for production must have it set.

## Social cards

Each route has copy in `CARDS` (`src/lib/og/cards.ts`): `eyebrow`, `title` (≤ 56 characters), `description` (one short sentence) and `alt`. The layout is `src/lib/og/plate.tsx`, a Satori component: only flexbox, inline `style` objects, no CSS classes or custom properties, colours from `BRAND`.

`npm run assets` (before every dev and build) renders `public/og-image.png` and `public/<route>/og-image.png`. These files are git-ignored. The render fails on:

- text laid out beyond the canvas (`overflow`): shorten the title or description;
- a character no loaded font covers (`missingGlyphs`): add the weight or family to `fontsourceFontLoader`;
- a blank card (`blank`).

The image URL carries `?v=<hash of the copy>`, so editing the copy makes crawlers fetch the new card. When you change the plate's layout without changing copy, raise `revision` in `plate.tsx`.

To design a card, run `npm run cards:preview`: Metaplate's live gallery of every card, reloading on save (`scripts/preview-cards.mts`). Or run `npm run assets` and open the PNGs in `public/`.

## Indexing

`INDEXABLE` in `src/lib/site.ts`:

- `false` (default, staging): `robots.txt` is `Disallow: /`, the sitemap link is omitted, every page has `<meta name="robots" content="noindex, nofollow">`. Lighthouse's SEO score shows about 0.66 because of this; that assertion is a warning.
- `true` (launch): `robots.txt` allows everything and points at the sitemap.

Flip it only when the production domain is live, and update the "pages ask not to be indexed" test in `tests/e2e/metadata.spec.ts` in the same change.

## Other metadata routes

All in `src/app/`, all `dynamic = "force-static"`, all built from `lib/site.ts`, so they follow route changes automatically:

| Route | File | Contents |
| --- | --- | --- |
| `/sitemap.xml` | `sitemap.ts` | every `EXPORTED_ROUTES` path |
| `/robots.txt` | `robots.ts` | per `INDEXABLE` |
| `/manifest.webmanifest` | `manifest.ts` | name, colours, icon |
| `/llms.txt` | `llms.txt/route.ts` | title, description, and each page with its card description (llmstxt.org format) |
| `/icon.svg` | `icon.svg` | favicon |

JSON-LD (`src/components/JsonLd.tsx`, rendered in the layout) describes the site as a schema.org `WebSite`. For page-specific structured data (an `Article`, a `SoftwareApplication`), render the same kind of `<script type="application/ld+json">` in that page, escaping `<` as the component does. It is a data block, so the CSP step does not need to hash it.
