# Getting started

From an empty folder to a deployed site of your own. Each step links to the doc with the detail.

## 1. Prerequisites

- Node.js 26 (`.nvmrc`; 22 or newer works). With nvm: `nvm use`.
- Git, and a GitHub repository for the new site.
- For deploying: a Cloudflare account (or Netlify).

## 2. Copy the template

Press **Use this template** on the template's GitHub page, or copy it without its history:

```bash
npx degit <owner>/<template-repo> my-site
cd my-site
git init
npm install
```

`npm install` prints three `ERESOLVE overriding peer dependency` warnings from ESLint 10; they are expected ([dependencies.md](dependencies.md)).

## 3. Give it your identity

```bash
npm run init:site -- --name "My Site" --repo me/my-site --tagline "What it does in one line" --description "One or two sentences about it, over 50 characters."
```

This rewrites `NAME`, `REPO`, `TAGLINE`, `DESCRIPTION` and `STORAGE_PREFIX` in `src/lib/site.ts`, the repository fields in `package.json`, the Worker name in `wrangler.jsonc`, and the card alt text. By hand, in `src/lib/site.ts`: `SUMMARY` (the footer line), `LICENCE`, `SHORT_NAME` (the name under an installed app's icon), and `DEFAULT_BRANCH` if it is not `main`.

## 4. Run it

```bash
npm run dev
```

Open http://localhost:3000. `predev` renders the social cards and app icons first. Edits to pages and `content.md` files reload in the browser.

## 5. Make it yours

In roughly this order:

1. **Palette:** the hex values in `src/app/globals.css` (four theme rules) and `src/lib/constants.ts`. Run `npm test`; it reports any colour that fails contrast. → [styling-and-theme.md](styling-and-theme.md)
2. **Mark:** `src/components/brand/Mark.tsx`, copied into `src/app/icon.svg` and the card plate. The app icons follow it. → [styling-and-theme.md](styling-and-theme.md#the-mark)
3. **Pages:** replace the demo pages (`/guide/`, `/about/`) with your own, and the home page's copy in `src/app/(home)/content.md`. → [pages-and-content.md](pages-and-content.md)
4. **Social cards:** the copy in `src/lib/og/cards.ts`; the layout in `src/lib/og/plate.tsx`. Preview with `npm run cards:preview`. → [social-cards.md](social-cards.md)
5. **Third-party services** (analytics, embeds): allow them in the CSP. → [security.md](security.md)

Claude Code users can run the `rebrand` and `add-page` skills (`.claude/skills/`) for steps 1–3.

## 6. Check it

```bash
npm run check      # lint, types, unit tests, build, card verification, link check
npm run test:e2e   # browser tests against the build
```

First time only, if you have no Chromium for Playwright: `npx playwright install chromium`. → [testing.md](testing.md)

Push to GitHub and CI runs all of it, plus Lighthouse, on every pull request.

## 7. Deploy

```bash
npx wrangler login
NEXT_PUBLIC_SITE_URL=https://my-site.example npm run deploy
```

The site stays `noindex` until you set `INDEXABLE = true` in `src/lib/site.ts`. → [deploying.md](deploying.md)

## 8. Go live

Attach the domain, set `INDEXABLE = true`, deploy with `NEXT_PUBLIC_SITE_URL` set to it, then check the live site:

```bash
npm run cards:verify-live -- https://my-site.example/
```

→ [deploying.md](deploying.md#going-live)
