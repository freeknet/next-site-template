// Crawls the built site and fails on any broken internal link or anchor target.
//
// out/ is served on the port a local build bakes into its absolute URLs (canonical links, card
// images: SITE_URL in src/lib/site.ts), so those are checked too. `trailingSlash: true` makes
// every route a folder with an index.html, which `serve` resolves as the deployed host does.
// Links to other origins are skipped: their availability is not this build's to fail on.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { LinkChecker } from "linkinator";

const PORT = process.env.PLAYWRIGHT_PORT ?? "4173";
const ORIGIN = `http://localhost:${PORT}`;

if (!existsSync("out")) {
  console.error("check-links: no out/ folder; run npm run build first.");
  process.exit(1);
}

/*
 * serve's own entry point, run with this Node, so the child is the server itself. Through `npx`
 * the child would be a wrapper: killing it left the real server holding the port, and the
 * Playwright run after this in CI then refused to start.
 */
const require = createRequire(import.meta.url);
const servePackage = require.resolve("serve/package.json");
const serveBin = path.join(path.dirname(servePackage), require(servePackage).bin.serve);
const server = spawn(process.execPath, [serveBin, "out", "-l", PORT, "--no-port-switching"], {
  stdio: "ignore",
});
const exited = new Promise((resolve) => server.once("exit", resolve));

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      if ((await fetch(ORIGIN)).ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`check-links: nothing answered on ${ORIGIN}`);
}

let broken = [];
try {
  await waitForServer();
  const result = await new LinkChecker().check({
    path: ORIGIN,
    recurse: true,
    checkFragments: true,
    linksToSkip: [/^https?:\/\/(?!localhost[:/])/.source, /^mailto:/.source],
  });
  broken = result.links.filter((link) => link.state === "BROKEN");
  for (const link of broken) {
    console.error(`BROKEN ${link.status ?? ""} ${link.url} (on ${link.parent ?? "?"})`);
  }
  console.log(`check-links: ${result.links.length} link(s) checked, ${broken.length} broken.`);
} finally {
  server.kill();
  await exited;
}
process.exit(broken.length === 0 ? 0 : 1);
