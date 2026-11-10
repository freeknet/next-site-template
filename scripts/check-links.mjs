// Crawls the built site and fails on any broken internal link or anchor target.
//
// out/ is served on the port a local build bakes into its absolute URLs (canonical links, card
// images: SITE_URL in src/lib/site.ts), so those are checked too. `trailingSlash: true` makes
// every route a folder with an index.html, which `serve` resolves as the deployed host does.
// Links to other origins are skipped: their availability is not this build's to fail on.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { LinkChecker } from "linkinator";

const PORT = process.env.PLAYWRIGHT_PORT ?? "4173";
const ORIGIN = `http://localhost:${PORT}`;

if (!existsSync("out")) {
  console.error("check-links: no out/ folder; run npm run build first.");
  process.exit(1);
}

const server = spawn("npx", ["serve", "out", "-l", PORT, "--no-port-switching"], {
  stdio: "ignore",
  shell: process.platform === "win32",
});

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
}
process.exit(broken.length === 0 ? 0 : 1);
