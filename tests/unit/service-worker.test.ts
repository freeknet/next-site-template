import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  killSwitch,
  readSiteConstant,
  serviceWorker,
  shouldPrecache,
  urlFor,
} from "../../scripts/build-sw.mjs";

const template = readFileSync(path.join(process.cwd(), "scripts", "sw-template.js"), "utf8");
const site = readFileSync(path.join(process.cwd(), "src", "lib", "site.ts"), "utf8");

describe("the service worker build step", () => {
  it("reads the PWA switch and the cache prefix from lib/site.ts", () => {
    expect(typeof readSiteConstant(site, "PWA")).toBe("boolean");
    expect(readSiteConstant(site, "STORAGE_PREFIX")).toMatch(/^[\w-]+$/);
  });

  it("maps exported files to the URLs they are served at", () => {
    expect(urlFor("index.html")).toBe("/");
    expect(urlFor(path.join("guide", "index.html"))).toBe("/guide/");
    expect(urlFor(path.join("_next", "static", "chunks", "a.js"))).toBe("/_next/static/chunks/a.js");
  });

  it("precaches pages, build assets and icons, and nothing else", () => {
    expect(shouldPrecache("index.html")).toBe(true);
    expect(shouldPrecache(path.join("offline", "index.html"))).toBe(true);
    expect(shouldPrecache(path.join("_next", "static", "media", "font.woff2"))).toBe(true);
    expect(shouldPrecache(path.join("icons", "icon-192.png"))).toBe(true);
    expect(shouldPrecache("manifest.webmanifest")).toBe(true);
    expect(shouldPrecache(path.join("guide", "og-image.png"))).toBe(false);
    expect(shouldPrecache(path.join("_not-found", "index.html"))).toBe(false);
    expect(shouldPrecache("sw.js")).toBe(false);
  });

  it("fills every placeholder in the template", () => {
    const source = serviceWorker({ prefix: "site", version: "abc123", precache: ["/", "/guide/"], template });
    expect(source).not.toMatch(/__[A-Z_]+__/);
    expect(source).toContain('const PREFIX = "site";');
    expect(source).toContain('"/guide/"');
    // The result must be valid JavaScript.
    expect(() => new Function(source)).not.toThrow();
  });

  it("names the offline page the template falls back to, and precaches it", () => {
    expect(template).toContain('const OFFLINE_URL = "/offline/";');
    expect(shouldPrecache(path.join("offline", "index.html"))).toBe(true);
  });

  it("writes a worker that removes itself when PWA is off", () => {
    const source = killSwitch("site");
    expect(source).toContain("registration.unregister()");
    expect(source).toContain('"site-"');
    expect(() => new Function(source)).not.toThrow();
  });
});
