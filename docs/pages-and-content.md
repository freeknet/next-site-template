# Pages and content

## Add a page

Do every step; the type checker and tests enforce most of them.

1. **Create the route:** `src/app/<route>/page.tsx` and `src/app/<route>/content.md`.
2. **Register it** in `src/lib/site.ts`:
   - add `"/<route>"` to `EXPORTED_ROUTES` (no trailing slash);
   - if it belongs in the header, add a `NAV` item (`href`, `label`, `blurb`, `icon`). A new icon needs a drawing in `src/components/brand/icons.tsx`, a name in `IconName`, and an entry in `NAV_ICONS`.
3. **Add its social card** to `CARDS` in `src/lib/og/cards.ts`. Without one, the build fails with a type error. Keep the title to 56 characters or fewer (`tests/unit/site.test.ts`).
4. **Set metadata** in the page with `pageMetadata("/<route>", { title, description })`. The description must be over 50 characters.
5. **Add it to the tests:** a row in `tests/e2e/routes.ts` (the `heading` regex must match the page's single `h1`) and a URL in `lighthouserc.json` (`http://localhost/<route>/index.html`).
6. Run `npm run check && npm run test:e2e`.

A minimal page:

```tsx
import PageHeader from "@/components/PageHeader";
import { Prose } from "@/components/ui";
import { pageMetadata } from "@/lib/og/metadata";
import { readPageContent } from "@/lib/page-content";

export const metadata = pageMetadata("/pricing", {
  title: "Pricing",
  description: "What it costs, what each plan includes, and how billing works, in plain terms.",
});

export default async function Pricing() {
  const content = await readPageContent("pricing");
  return (
    <>
      <PageHeader section="Pricing" title="What it costs." lede={content.block("lede")} />
      <div className="mx-auto max-w-[1400px] px-6 pt-6 pb-24 sm:px-10">
        <Prose>{content.block("body")}</Prose>
      </div>
    </>
  );
}
```

For a long document with a table of contents, render `content.block("body")` with `<DocBody markdown={...} />` instead of `Prose` (see `src/app/guide/page.tsx`).

## Remove a page

Delete its folder, then remove it from `EXPORTED_ROUTES`, `NAV`, `CARDS`, `tests/e2e/routes.ts` and `lighthouserc.json`. Search for links to it (`grep -rn '"/<route>' src`); typed routes turn a `<Link>` to a deleted page into a type error, but links inside markdown are only caught by `npm run test:links`.

## content.md

A page's words live in `content.md`, never in JSX. The file is divided into named blocks by marker lines:

```md
<!-- @lede -->
One paragraph under the title.

<!-- @body -->
## A section
Markdown: lists, tables, code, links.
```

Text before the first marker is the `body` block. Markers and `###` headings inside fenced code blocks are ignored.

`readPageContent("<route>")` returns:

| Method | Returns | When the block is missing |
| --- | --- | --- |
| `block(name)` | the block's markdown | throws, failing the build |
| `optional(name)` | the markdown or `undefined` | `undefined` |
| `items(name)` | the block's `###` sections as `{ slug, title, body }[]` | throws; also throws if it has no `###` |
| `item(name, slug)` | one section by slug | throws, naming the slugs it found |
| `list(name)` | the block's top-level bullets as strings | throws |
| `names` | every block name, in order | |

For the home page the route argument is `"(home)"`, the route group's folder.

### Items bound to code

When each item needs something from code (an icon, a link), key it by slug, as `src/app/(home)/page.tsx` does with `HIGHLIGHT_ICONS`. The slug is GitHub's slug of the `###` heading (`### Tests that run in CI` → `tests-that-run-in-ci`). Rewording a heading changes its slug; throw when a slug has no entry so the build fails instead of rendering the wrong icon.

## Rendering markdown

- `<Prose>`: document-scale markdown with the site's type scale.
- `<Lede>`: a larger paragraph that inherits size from its wrapper (page ledes).
- `<InlineMarkdown>`: markdown that inherits the surrounding typography (card bodies, captions).
- `<DocBody>`: long document plus a sticky table of contents from its `##` headings.

Internal links in markdown should use the served path with its trailing slash: `[guide](/guide/)`.

## Copy rules

Enforced by `tests/unit/hardcoded.test.ts` on `content.md`, pages, `lib/site.ts` and `lib/og/cards.ts`:

- no em dashes in reader-facing text (comments may use them);
- none of: powerful, seamless, blazing, stunning, robust, effortless, cutting-edge, next-generation, revolutionary, unleash, supercharge, world-class, game-changing;
- the repository slug only in `lib/site.ts` (build commands that need it, as on the home page, use `REPO`).
