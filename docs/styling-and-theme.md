# Styling and theme

## Tokens

Colours are custom properties named for their role, declared in `src/app/globals.css` and exposed to Tailwind through `@theme inline`:

| Token | Role |
| --- | --- |
| `ground` | page background |
| `panel`, `panel-raised` | cells and raised cells on the ground |
| `hairline`, `hairline-strong` | 1px rules and borders |
| `text`, `bright`, `secondary`, `label` | the grey type ladder, strongest to quietest |
| `grey` | non-text greys |
| `accent` | the one saturated colour: fills, focus, the current-section underline |
| `accent-deep` | accent hover |
| `accent-text` | accent when it carries text (links, eyebrows) |
| `on-accent` | text on an accent fill |
| `stop-1` … `stop-4` | the gradient, for the mark and thin rules only |
| `code-ground`, `code-text`, `code-dim` | code blocks, dark in both themes |

Use them as classes: `bg-panel`, `text-label`, `border-hairline`. Never write a hex value in a component, and never spell a token as an arbitrary value (`bg-[var(--panel)]`): ESLint (`better-tailwindcss/enforce-canonical-classes`) and `tests/unit/tailwind-tokens.test.ts` fail on it. One accent per view: the current page's marker owns it.

## Change the palette

Each theme value is written in four rules, because a theme can come from the system preference or an explicit choice:

1. `:root` (dark default)
2. `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) }` (light from the system)
3. `:root[data-theme="light"]` (light chosen)
4. `:root[data-theme="dark"]` (dark chosen)

Rules 2 and 3 must be identical, and rules 1 and 4 must be identical; `tests/unit/palette.test.ts` checks the light pair. Then update the dark values in `src/lib/constants.ts` (`BRAND`, `SPECTRUM`): the social cards render outside the browser and cannot read CSS. The palette test checks they agree.

Run `npm test`. The palette test reports any text token that falls below WCAG AA (4.5:1) on `ground`, `panel` or `panel-raised` in either theme, with the ratio. A saturated accent usually needs a darker variant for `accent-text` in the light theme.

To add a token: declare it in all four rules, add `--color-<name>: var(--<name>);` to `@theme inline`, and if it carries text, add it to the list in `palette.test.ts`.

## Fonts

Self-hosted from `@fontsource` through `next/font/local` in `src/app/layout.tsx`, exposed as `--font-sans` (Inter), `--font-display` (Space Grotesk, all headings) and `--font-mono` (JetBrains Mono). To change a family:

1. `npm install @fontsource/<family>` and remove the old package.
2. Update the `localFont` `src` paths in `layout.tsx` (list only the weights the pages use; each is preloaded).
3. Update `FAMILIES` in `scripts/copy-font-licences.mjs` and the font list in `tests/e2e/console.spec.ts`.
4. Update `fontsourceFontLoader` and `fontFamily` names in `src/lib/og/plate.tsx` ([social-cards.md](social-cards.md)), and check the cards with `npm run cards:baseline` before and `npm run cards:compare` after.

Never load fonts from Google Fonts or another origin: the CSP blocks it and `console.spec.ts` fails on any third-party request.

## The mark

`src/components/brand/Mark.tsx` holds the geometry (`MARK_VIEWBOX`, `MARK_CHEVRON`, `MARK_CURSOR`). Replace it with the project's own and update in the same change:

- `src/app/icon.svg` (the favicon; `tests/unit/brand.test.ts` checks it draws the same geometry in the brand colours, so adjust that test if the mark's shape changes);
- the `Mark` function in `src/lib/og/plate.tsx` (the social card's copy of it).

`Wordmark` sets `NAME` as live text beside the mark, so it follows the theme.

## Layout and components

- Page width and gutter: `CONTAINER` from `src/lib/constants.ts` (`mx-auto max-w-[1400px] px-6 sm:px-10`).
- `.rule-grid` on a grid container draws 1px hairlines between cells that paint their own background (`Panel`). `GridFill` fills an incomplete last row.
- `SectionHeading` is the uppercase label over a hairline that opens a section; `PageHeader` opens a page and renders its single `h1`.
- `Action` is a button-styled link (`primary` / `secondary` / `ghost`); `ArrowLink` an inline forward link. Internal `href`s are typed routes; pass `external` for other origins.
- `Reveal` fades a block in when scrolled into view. Its hidden state only applies when JavaScript runs, and reduced motion removes it.
- Code blocks: `CodeBlock` (used automatically for fenced markdown).

## Accessibility rules

- Exactly one `h1` per page, from `PageHeader` or the home hero.
- Keep `:focus-visible` outlines; do not remove outlines without a replacement.
- Interactive targets at least 24px; icon-only buttons need an `aria-label`.
- Honour `prefers-reduced-motion`: transitions are disabled globally under it; do not add JS animation that ignores it.
- Decorative SVGs are `aria-hidden`; meaningful ones take a `title`.
