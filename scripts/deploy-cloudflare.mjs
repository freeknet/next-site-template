// Builds the static export and deploys out/ as Cloudflare Workers static assets (wrangler.jsonc).
//
//   npm run deploy            production
//   npm run deploy:preview    a preview version with its own URL, production untouched
//
// The site's origin is baked in at build time (canonical and og:image URLs), so set
// NEXT_PUBLIC_SITE_URL to the production domain once one is attached. Until then it defaults to
// the workers.dev address below. Wrangler needs `npx wrangler login` once, or CLOUDFLARE_API_TOKEN
// and CLOUDFLARE_ACCOUNT_ID in the environment (CI).
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const preview = process.argv.includes("--preview");
const config = readFileSync("wrangler.jsonc", "utf8");
const name = /"name"\s*:\s*"([^"]+)"/.exec(config)?.[1];
if (!name) throw new Error("wrangler.jsonc has no name");

const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.CLOUDFLARE_SUBDOMAIN
      ? `https://${name}.${process.env.CLOUDFLARE_SUBDOMAIN}.workers.dev`
      : undefined),
};
if (!env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "deploy: NEXT_PUBLIC_SITE_URL is not set, so canonical and social URLs will point at localhost.\n" +
      "        Set it to the production origin (or CLOUDFLARE_SUBDOMAIN for the workers.dev URL).",
  );
}

const run = (command) => execSync(command, { stdio: "inherit", env });
run("npm run build");
run(preview ? "npx wrangler@4 versions upload" : "npx wrangler@4 deploy");
