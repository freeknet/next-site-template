<!-- @lede -->

Four production sites, built over a few months, kept arriving at the same shape. This template is that shape, with the parts specific to any one project taken out.

<!-- @body -->

## Where it comes from

The structure, components and test suite started on the [Cinnabar](https://github.com/bonzupii/cinnabar/tree/main/site) site and were carried into [Strobe](https://github.com/lnorton89/strobe/tree/master/site)'s. The [golc](https://github.com/lnorton89/golc-site) site and JaJa PDX's site added the rest: a single configuration module, a noindex switch for staging, the Cloudflare deploy and the fix for prefetch requests that 404 in a static export.

What they share is what is here:

- a static export, so any host can serve the site and nothing runs on a server
- colours as role tokens, with their contrast checked by a test rather than by eye
- copy in markdown beside each page, so changing wording never means reading JSX
- social cards rendered once at build time, with guards that fail a card that overflows
- accessibility, links and Lighthouse checked in CI on every pull request

## What it is not

It is not a component library and it does not try to be a design system for every kind of site. The look is a starting point: change the tokens, the mark and the fonts, and the tests will tell you whether the new palette still reads.

It is also not an application framework. There is no database, no authentication and no server. When a site needs those, it has outgrown a static export.
