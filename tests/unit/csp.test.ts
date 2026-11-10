import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { inlineScriptHashes, policyFor, withPolicy } from "../../scripts/csp-hashes.mjs";

const sha = (text: string) => `'sha256-${createHash("sha256").update(text).digest("base64")}'`;

describe("the CSP step", () => {
  it("hashes inline scripts and nothing else", () => {
    const html = [
      `<script>a()</script>`,
      `<script src="/x.js"></script>`,
      `<script type="application/ld+json">{"a":1}</script>`,
      `<script type="module">b()</script>`,
      `<script async="">c()</script>`,
    ].join("");
    expect(inlineScriptHashes(html)).toEqual([sha("a()"), sha("b()"), sha("c()")]);
  });

  it("allows only same-origin and hashed scripts", () => {
    const policy: string = policyFor(`<script>a()</script>`);
    expect(policy).toContain(`script-src 'self' ${sha("a()")}`);
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(policy).toContain("object-src 'none'");
  });

  it("puts the policy first in <head>, where it governs everything after it", () => {
    const out: string = withPolicy(`<html><head><script>a()</script></head></html>`);
    expect(out).toMatch(/^<html><head><meta http-equiv="Content-Security-Policy"/);
  });

  it("does not add a second policy to a page that has one", () => {
    const once: string = withPolicy(`<html><head></head></html>`);
    expect(withPolicy(once)).toBe(once);
  });
});
