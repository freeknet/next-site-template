// Next 16's static export writes each page's prefetch segment as a folder
// (out/guide/__next.guide/__PAGE__.txt), but the client router requests it with dots
// (/guide/__next.guide.__PAGE__.txt), so every link prefetch 404s and navigation falls back to a
// full page load. This writes a dotted copy of each nested segment file next to its folder.
// Upstream: https://github.com/vercel/next.js/issues/85374. tests/e2e/console.spec.ts fails on any
// prefetch 404, so it will say when an upgrade makes this unnecessary or changes the naming.
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("out");
let copied = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) flatten(full, entry.name, dir);
    else walk(full);
  }
}

/** Copies out/x/__next.a/b/c.txt to out/x/__next.a.b.c.txt. */
function flatten(dir, prefix, parent) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) flatten(full, name, parent);
    else {
      const target = path.join(parent, name);
      if (!fs.existsSync(target)) {
        fs.copyFileSync(full, target);
        copied++;
      }
    }
  }
}

if (!fs.existsSync(out)) {
  console.error("flatten-rsc-segments: no out/ folder; run next build first.");
  process.exit(1);
}
walk(out);
console.log(`flatten-rsc-segments: wrote ${copied} dotted prefetch file(s).`);
