import { describe, expect, it } from "vitest";
import { CARDS } from "@/lib/og/cards";
import { EXPORTED_ROUTES, isActiveRoute, NAV, pathOf, SITE_URL } from "@/lib/site";

describe("isActiveRoute", () => {
  it("matches the home route only exactly", () => {
    expect(isActiveRoute("/", "/")).toBe(true);
    expect(isActiveRoute("/guide/", "/")).toBe(false);
  });

  it("matches a route with or without its trailing slash", () => {
    expect(isActiveRoute("/guide/", "/guide")).toBe(true);
    expect(isActiveRoute("/guide", "/guide/")).toBe(true);
  });

  it("treats a nested route as part of its family", () => {
    expect(isActiveRoute("/guide/install/", "/guide")).toBe(true);
  });

  it("does not match a route that merely shares a prefix", () => {
    expect(isActiveRoute("/guides/", "/guide")).toBe(false);
  });
});

describe("routes", () => {
  it("start at home and include every nav item", () => {
    expect(EXPORTED_ROUTES[0]).toBe("/");
    for (const item of NAV) expect(EXPORTED_ROUTES).toContain(item.href);
  });

  it("are written without a trailing slash, the form typedRoutes checks", () => {
    for (const route of EXPORTED_ROUTES.slice(1)) expect(route.endsWith("/")).toBe(false);
  });

  it("are served as folders", () => {
    expect(pathOf("/")).toBe("/");
    expect(pathOf("/guide")).toBe("/guide/");
  });

  it("each have a social card whose title fits two lines", () => {
    for (const route of EXPORTED_ROUTES) {
      expect(CARDS[route], route).toBeDefined();
      expect(CARDS[route].title.length, route).toBeLessThanOrEqual(56);
    }
  });

  it("give every nav item a label and a blurb", () => {
    for (const item of NAV) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.blurb.length).toBeGreaterThan(0);
    }
  });
});

describe("SITE_URL", () => {
  it("carries no trailing slash, so joins never double one", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});
