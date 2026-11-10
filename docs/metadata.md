# Metadata and SEO

What search engines and link previews read from each page. The preview images themselves are covered in [social-cards.md](social-cards.md).

## Page metadata

Every page exports its metadata through one function:

```tsx
import { pageMetadata } from "@/lib/og/metadata";

export const metadata = pageMetadata("/pricing", {
  title: "Pricing",
  description: "What it costs, what each plan includes, and how billing works, in plain terms.",
});
```

Do not build a `Metadata` object by hand. Next shallow-merges `openGraph` and `twitter`, so a page that sets its own replaces the layout's and silently drops `og:site_name`, `og:type` and `og:url`. `pageMetadata` (`src/lib/og/metadata.ts`) states all of them:

| Tag | Value |
| --- | --- |
| `<title>` | `Title · Name` (the layout's template). Every page needs a distinct title (`tests/e2e/metadata.spec.ts`). |
| `description`, `og:description`, `twitter:description` | The description, which must be over 50 characters. |
| `link rel="canonical"`, `og:url` | The route's served path (`/pricing/`), made absolute with `SITE_URL`. |
| `og:title`, `twitter:title` | The card's title from `src/lib/og/cards.ts`. |
| `og:image` (+ width, height, type, alt), `twitter:image` | The route's social card. |
| `og:site_name`, `og:type`, `og:locale`, `twitter:card` | `NAME`, `website`, `en_US`, `summary_large_image`. |

The root layout adds what every page shares: `metadataBase`, `applicationName`, the icons, the Apple web-app tags, `robots`, and `viewport.themeColor` (one per colour scheme).

## The site's origin

`SITE_URL` in `src/lib/site.ts` is read at build time from `NEXT_PUBLIC_SITE_URL`, then Netlify's `URL`, then `http://localhost:4173` (the test server). Canonical links, `og:url`, card URLs, the sitemap and `llms.txt` are all built from it, so **a production build must have `NEXT_PUBLIC_SITE_URL` set**. `npm run deploy` sets it; `.env.example` shows the variable.

## Indexing

`INDEXABLE` in `src/lib/site.ts`:

| | `false` (default; staging) | `true` (launch) |
| --- | --- | --- |
| `robots.txt` | `Disallow: /`, no sitemap line | `Allow: /`, `Sitemap: <SITE_URL>/sitemap.xml` |
| Every page | `<meta name="robots" content="noindex, nofollow">` | `index, follow` |
| Lighthouse SEO | about 0.66 (warning only) | should clear 0.9 |
| Link previews | X and Facebook obey `robots.txt`, so staging URLs show no preview there; Slack and Discord ignore it | all platforms |

Flip it only when the production domain is live, and update the "pages ask not to be indexed" test in `tests/e2e/metadata.spec.ts` in the same change. The 404 and offline pages are always `noindex`.

## Metadata routes

All in `src/app/`, all `dynamic = "force-static"` (required for a route handler in a static export), and all built from `src/lib/site.ts`, so they follow route changes automatically:

| URL | File | Contents |
| --- | --- | --- |
| `/sitemap.xml` | `sitemap.ts` | every path in `EXPORTED_ROUTES`, with the build time as `lastModified` |
| `/robots.txt` | `robots.ts` | per `INDEXABLE` |
| `/manifest.webmanifest` | `manifest.ts` | name, colours, icons, display mode ([pwa.md](pwa.md)) |
| `/llms.txt` | `llms.txt/route.ts` | title, description, and each page with its card description ([llmstxt.org](https://llmstxt.org) format) |
| `/icon.svg` | `icon.svg` | the favicon |

To add another (an RSS feed, `/.well-known/security.txt`), create `src/app/<path>/route.ts` exporting `dynamic = "force-static"` and a `GET` that returns a `Response`; `llms.txt/route.ts` is the pattern.

## Structured data

`src/components/JsonLd.tsx`, rendered in the layout, describes the site as a schema.org `WebSite` (name, description, URL, repository as `sameAs`). For page-specific structured data (an `Article`, a `SoftwareApplication`, an `FAQPage`), render the same kind of element in that page:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
/>
```

Escaping `<` keeps the JSON from closing the tag. It is a data block, not a script, so the CSP step does not need to hash it. Validate it with Google's Rich Results Test after deploying.
