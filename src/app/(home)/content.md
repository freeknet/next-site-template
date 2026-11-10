<!-- @lede -->

Clone it, run one command to give it your project's name, and you have a statically exported Next.js site with a tested palette in light and dark, pages written in markdown, social cards rendered at build time, and lint, unit, browser, link and Lighthouse checks already in CI.

<!-- @highlights -->

### A palette that is checked

Colours are role tokens in one CSS file. A unit test reads that file and fails if any text colour drops below WCAG AA on any surface, in either theme.

### Pages written in markdown

Each route keeps its prose in a `content.md` beside its `page.tsx`, split into named blocks. A missing block fails the build instead of rendering an empty section.

### Social cards at build time

Metaplate renders one card per route into `public/` before every build. A card whose text overflows, or uses a glyph no font covers, fails the build.

### Tests that run in CI

Vitest for the logic and the palette, Playwright with axe for every page in both themes, linkinator for links, Lighthouse with accessibility as a hard gate.

### A strict content security policy

After the build, every page gets a policy that allows only its own inline scripts, by hash. No `unsafe-inline` for scripts, with no server needed.

### Deploys to any static host

Cloudflare Workers static assets by default, Netlify as the alternative. Both read the same `_headers` file, so security headers are written once.

<!-- @closing -->

The [guide](/guide/) covers where each piece lives and what to change first.
