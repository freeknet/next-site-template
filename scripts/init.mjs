// Gives a fresh copy of the template its own identity.
//
//   npm run init:site -- --name "My Site" --repo me/my-site [--tagline "..."] [--description "..."]
//
// Rewrites the identity block in src/lib/site.ts, the repository fields in package.json, the
// Worker name in wrangler.jsonc, and the card alt text in src/lib/og/cards.ts. Prints each file it
// changed. Pages, copy, palette and mark are yours to change; the guide (/guide/) lists them.
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    name: { type: "string" },
    repo: { type: "string" },
    tagline: { type: "string" },
    description: { type: "string" },
    branch: { type: "string" },
  },
});

if (!values.name || !values.repo || !/^[\w.-]+\/[\w.-]+$/.test(values.repo)) {
  console.error('usage: npm run init:site -- --name "My Site" --repo owner/repo [--tagline "..."] [--description "..."] [--branch main]');
  process.exit(1);
}

const slug = values.repo.split("/")[1].toLowerCase();
const json = (text) => JSON.stringify(text);

function edit(file, change) {
  const before = readFileSync(file, "utf8");
  const after = change(before);
  if (after === before) return;
  writeFileSync(file, after);
  console.log(`  updated ${file}`);
}

const site = readFileSync("src/lib/site.ts", "utf8");
const oldRepo = /export const REPO = "([^"]+)"/.exec(site)?.[1];
const oldName = /export const NAME = "([^"]+)"/.exec(site)?.[1];
if (!oldRepo || !oldName) throw new Error("src/lib/site.ts has no NAME or REPO to replace");

console.log(`init:site: ${oldName} (${oldRepo}) -> ${values.name} (${values.repo})`);

edit("src/lib/site.ts", (text) => {
  let out = text
    .replace(/export const NAME = "[^"]*";/, `export const NAME = ${json(values.name)};`)
    .replace(/export const REPO = "[^"]*";/, `export const REPO = ${json(values.repo)};`)
    .replace(/export const STORAGE_PREFIX = "[^"]*";/, `export const STORAGE_PREFIX = ${json(slug)};`);
  if (values.branch) out = out.replace(/export const DEFAULT_BRANCH = "[^"]*";/, `export const DEFAULT_BRANCH = ${json(values.branch)};`);
  if (values.tagline) out = out.replace(/export const TAGLINE = "[^"]*";/, `export const TAGLINE = ${json(values.tagline)};`);
  if (values.description) {
    out = out.replace(/export const DESCRIPTION =\s*"[^"]*";/, `export const DESCRIPTION =\n  ${json(values.description)};`);
  }
  return out;
});

edit("package.json", (text) => {
  const manifest = JSON.parse(text);
  manifest.name = slug;
  manifest.description = values.description ?? values.tagline ?? manifest.description;
  manifest.homepage = `https://github.com/${values.repo}`;
  manifest.repository = { type: "git", url: `https://github.com/${values.repo}.git` };
  manifest.bugs = { url: `https://github.com/${values.repo}/issues` };
  return `${JSON.stringify(manifest, null, 2)}\n`;
});

edit("wrangler.jsonc", (text) => text.replace(/"name":\s*"[^"]*"/, `"name": ${json(slug)}`));

edit("src/lib/og/cards.ts", (text) => text.split(oldName).join(values.name));

console.log("\nNext: replace the mark (src/components/brand/Mark.tsx, src/app/icon.svg), the palette");
console.log("(src/app/globals.css, src/lib/constants.ts) and the pages, then run `npm run check`.");
