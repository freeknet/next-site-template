# Deploying

## Cloudflare Workers static assets (default)

`wrangler.jsonc` serves `out/` with no Worker script: `html_handling: "force-trailing-slash"` (matching `trailingSlash: true`) and `not_found_handling: "404-page"` (serves `out/404.html` with status 404). `public/_headers` and `public/_redirects`, if present, are copied into `out/` and applied.

```bash
npx wrangler login                                        # once per machine
NEXT_PUBLIC_SITE_URL=https://example.com npm run deploy   # production
npm run deploy:preview                                    # a separate preview version and URL
```

`scripts/deploy-cloudflare.mjs` builds with `NEXT_PUBLIC_SITE_URL` (canonical and card URLs are baked in at build time) and runs `npx wrangler@4 deploy` or `versions upload`. Without `NEXT_PUBLIC_SITE_URL` it uses `https://<name>.<CLOUDFLARE_SUBDOMAIN>.workers.dev` if `CLOUDFLARE_SUBDOMAIN` is set, and otherwise warns that URLs will point at localhost.

In CI, provide `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit) and `CLOUDFLARE_ACCOUNT_ID` as secrets instead of logging in. Deploys are manual by default; to deploy on push, add a job after `check` in `ci.yml` that runs `npm run deploy` on `main`.

### Attach a domain

With the domain's DNS on Cloudflare, add to `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "example.com", "custom_domain": true }],
"workers_dev": true
```

(`workers_dev: true` keeps the workers.dev URL, which Wrangler otherwise turns off once `routes` exists.) A custom domain cannot be created over an existing DNS record for the same name; delete the record first.

## Netlify

Link the repository in Netlify; it builds with `netlify.toml` (`npm run build`, publish `out`, Node from `.nvmrc`'s major). `NETLIFY_NEXT_PLUGIN_SKIP` must stay `"true"`: Netlify's Next runtime plugin fails a static export. Netlify sets `URL` during the build, which `SITE_URL` picks up. Headers come from the same `public/_headers`.

## Any static host

Serve `out/` as files. The host must resolve `/guide/` to `/guide/index.html`, return `404.html` for missing paths, and ideally send the headers in `public/_headers` (translate them to the host's format if it does not read that file).

## Going live

1. Attach the production domain.
2. Set `INDEXABLE = true` in `src/lib/site.ts` and update the noindex test in `tests/e2e/metadata.spec.ts`.
3. Deploy with `NEXT_PUBLIC_SITE_URL` set to the production origin.
4. Check the live site: a page's canonical link and `og:image` use the production origin; `/robots.txt` allows indexing and names the sitemap; a link preview (paste a URL into a chat app) shows the card.
