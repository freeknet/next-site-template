---
name: add-page
description: Add a new page (route) to this static Next.js site, with its content.md, nav entry, social card, metadata and test coverage. Use when asked to add, create or scaffold a page or route.
---

# Add a page

Follow `docs/pages-and-content.md` ("Add a page"). In short, for a route `/<route>`:

1. Create `src/app/<route>/page.tsx` and `src/app/<route>/content.md`. Put every word in `content.md` blocks (`<!-- @lede -->`, `<!-- @body -->`), none in JSX. Open the page with `PageHeader` (its single `h1`); use `Prose` for short text, `DocBody` for long documents.
2. Export `metadata = pageMetadata("/<route>", { title, description })`. The description must be over 50 characters.
3. In `src/lib/site.ts`, add `"/<route>"` (no trailing slash) to `EXPORTED_ROUTES`, and a `NAV` item if it belongs in the header. A new icon goes in `src/components/brand/icons.tsx`, `IconName` and `NAV_ICONS`.
4. Add the card to `CARDS` in `src/lib/og/cards.ts` (title of 56 characters or fewer).
5. Add a row to `tests/e2e/routes.ts` (the `heading` regex matches the `h1`) and `http://localhost/<route>/index.html` to `lighthouserc.json`.
6. Follow the copy rules: no em dashes, no empty marketing words (see `tests/unit/hardcoded.test.ts`).
7. Run `npm run check`, then `npm run test:e2e`. Fix the cause of any failure; do not weaken tests.

Report the files you created and changed, and the check results.
