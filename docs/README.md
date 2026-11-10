# Docs

References for building a site from this template. They describe the template's machinery, which stays the same in every project made from it, so keep them when you replace the demo pages. Written for people and coding agents alike; agents should start with [`../AGENTS.md`](../AGENTS.md) for the rules.

## Start here

- **[getting-started.md](getting-started.md)**: from an empty folder to a deployed site of your own, step by step.
- **[architecture.md](architecture.md)**: what runs when, every npm script, where every file lives, and what a static export cannot do.

## By task

| Task | Read |
| --- | --- |
| Add, change or remove a page; edit copy | [pages-and-content.md](pages-and-content.md) |
| Change colours, fonts, the mark; use the components | [styling-and-theme.md](styling-and-theme.md) |
| Titles, descriptions, canonical URLs, sitemap, robots, JSON-LD, going from noindex to indexed | [metadata.md](metadata.md) |
| Social card images: copy, layout, Metaplate, guards, verification | [social-cards.md](social-cards.md) |
| Installability, offline support, the service worker, app icons | [pwa.md](pwa.md) |
| Add analytics or any third-party script; security headers; CSP | [security.md](security.md) |
| Run the checks, read a failure, add a test | [testing.md](testing.md) |
| Deploy, attach a domain, go live | [deploying.md](deploying.md) |
| What each package is for; updating dependencies | [dependencies.md](dependencies.md) |

`src/app/guide/content.md` is a reader-facing summary of the same material, rendered at `/guide/`. It is demo content and can be deleted; these files are the reference.

Claude Code skills for the two most common jobs are in `.claude/skills/`: `add-page` and `rebrand`.

## Before you finish any change

```bash
npm run check        # lint, typecheck, unit tests, build, card verification, link check
npm run test:e2e     # browser tests against the build
```

Both must pass. If a test fails, fix the cause; do not loosen or skip the test.
