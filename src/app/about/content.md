<!-- @lede -->

A starting point for a statically exported site that already has its checks in place, so a new project begins with the decisions made and the tests written.

<!-- @body -->

## What it is for

Marketing sites, project sites and documentation: pages that are known at build time and served as files. What comes with it:

- a static export, so any host can serve the site and nothing runs on a server
- colours as role tokens, with their contrast checked by a test rather than by eye
- copy in markdown beside each page, so changing wording never means reading JSX
- social cards rendered once at build time, with guards that fail a card that overflows
- accessibility, links and Lighthouse checked in CI on every pull request

## What it is not

It is not a component library and it does not try to be a design system for every kind of site. The look is a starting point: change the tokens, the mark and the fonts, and the tests will tell you whether the new palette still reads.

It is also not an application framework. There is no database, no authentication and no server. When a site needs those, it has outgrown a static export.
