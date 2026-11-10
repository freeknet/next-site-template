---
name: rebrand
description: Give a site made from this template its own identity - name, repository, palette, mark, fonts. Use when starting a new project from the template or when asked to rename, rebrand, retheme or change colours or the logo.
---

# Rebrand

1. **Identity.** Run `npm run init:site -- --name "<Name>" --repo <owner>/<repo> --tagline "<one line>" --description "<one or two sentences, over 50 characters>"`. It updates `src/lib/site.ts`, `package.json`, `wrangler.jsonc` and the card alt text. Then edit `SUMMARY` and `LICENCE` in `src/lib/site.ts` by hand, and the copy in `src/lib/og/cards.ts`.
2. **Palette.** Follow `docs/styling-and-theme.md` ("Change the palette"): change each token in all four theme rules of `src/app/globals.css`, keep the two light rules identical, and mirror the dark values in `BRAND` and `SPECTRUM` in `src/lib/constants.ts`. Run `npm test`; `palette.test.ts` reports any text colour below WCAG AA with its ratio. Adjust until it passes, typically by darkening `accent-text` and `accent` in the light theme.
3. **Mark.** Replace the geometry in `src/components/brand/Mark.tsx`, copy it into `src/app/icon.svg` and into the `Mark` in `src/lib/og/plate.tsx`. Update `tests/unit/brand.test.ts` if the mark's shape (not just its values) changes.
4. **Fonts (optional).** Follow `docs/styling-and-theme.md` ("Fonts"). Self-hosted only.
5. **Check the cards.** Run `npm run cards:preview` and look at every card in both its layout and copy.
6. Run `npm run check` and `npm run test:e2e`. Take a screenshot of the home page in both themes and look at it.

Report what changed and the check results. Do not set `INDEXABLE` to true unless asked; that is a launch decision.
