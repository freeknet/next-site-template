# Docs for agents

Task-focused references for working on a site built from this template. They describe the template's machinery, which stays the same in every project made from it, so keep them when you replace the demo pages.

Start with [`../AGENTS.md`](../AGENTS.md) for the rules. Then read the doc for the task:

| Task | Read |
| --- | --- |
| Understand what runs when, and where files live | [architecture.md](architecture.md) |
| Add, change or remove a page; edit copy | [pages-and-content.md](pages-and-content.md) |
| Change colours, fonts, the mark; add components | [styling-and-theme.md](styling-and-theme.md) |
| Titles, descriptions, social cards, sitemap, robots, JSON-LD | [metadata-and-social-cards.md](metadata-and-social-cards.md) |
| Add analytics or any third-party script; headers; CSP | [security.md](security.md) |
| Installability, offline support, the service worker, app icons | [pwa.md](pwa.md) |
| Run the checks, read a failure, add a test | [testing.md](testing.md) |
| Deploy, attach a domain, go live | [deploying.md](deploying.md) |

`src/app/guide/content.md` is the human-facing version of the same material, rendered at `/guide/`. It is demo content and can be deleted; these files are the reference.

Claude Code skills for the two most common jobs live in `.claude/skills/`: `add-page` and `rebrand`.

## Before you finish any change

```bash
npm run check        # lint, typecheck, unit tests, build, link check
npm run test:e2e     # browser tests against the build
```

Both must pass. If a test fails, fix the cause; do not loosen or skip the test.
