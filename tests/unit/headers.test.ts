import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Guards the deploy configuration, which the browser tests cannot reach: they
 * serve out/ with `serve`, which knows nothing about _headers or wrangler.jsonc.
 */

const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

/** The header lines under one `_headers` path rule. */
function rule(headers: string, forPath: string): string {
  const blocks = headers.split(/\n(?=\/)/);
  const block = blocks.find((entry) => entry.split("\n")[0].trim() === forPath);
  if (!block) throw new Error(`_headers has no rule for ${forPath}`);
  return block;
}

describe("public/_headers", () => {
  const headers = read("public/_headers");

  it("sends the security headers a static site should, on every path", () => {
    const all = rule(headers, "/*");
    for (const header of [
      /X-Content-Type-Options:\s*nosniff/,
      /Referrer-Policy:/,
      /Strict-Transport-Security:/,
      /Permissions-Policy:/,
      /frame-ancestors 'none'/,
      /object-src 'none'/,
    ]) {
      expect(all).toMatch(header);
    }
  });

  it("caches content-hashed build output immutably", () => {
    expect(rule(headers, "/_next/static/*")).toMatch(/immutable/);
  });
});

describe("wrangler.jsonc", () => {
  const config = read("wrangler.jsonc");

  it("serves the static export, with the export's own 404 page", () => {
    expect(config).toMatch(/"directory":\s*"\.\/out"/);
    expect(config).toMatch(/"not_found_handling":\s*"404-page"/);
  });

  it("matches next.config.ts's trailing slashes", () => {
    expect(read("next.config.ts")).toMatch(/trailingSlash:\s*true/);
    expect(config).toMatch(/"html_handling":\s*"(force|auto)-trailing-slash"/);
  });

  it("runs no Worker script, so every request is a static-asset request", () => {
    expect(config).not.toMatch(/"main"\s*:/);
  });
});

describe("netlify.toml", () => {
  const config = read("netlify.toml");

  it("publishes the static export and skips the Next runtime plugin", () => {
    expect(config).toMatch(/publish\s*=\s*"out"/);
    expect(config).toMatch(/NETLIFY_NEXT_PLUGIN_SKIP\s*=\s*"true"/);
  });

  it("builds on the same Node release as local and CI", () => {
    const major = read(".nvmrc").trim().split(".")[0];
    expect(config).toMatch(new RegExp(`NODE_VERSION\\s*=\\s*"${major}"`));
  });
});
