import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/*
 * A page load is quiet: nothing 404s, nothing throws, nothing violates the
 * content security policy, and nothing is fetched from another origin.
 *
 * The 404 check is also what watches Next's prefetch file naming in a static
 * export (scripts/flatten-rsc-segments.mjs, vercel/next.js#85374): a link
 * prefetch that misses shows up here as a 404 for a `__next.*.txt` file.
 */

/**
 * Origins a page may load from besides its own. Empty by default: everything is self-hosted.
 * Add an origin here only together with the CSP (scripts/csp-hashes.mjs and public/_headers);
 * docs/security.md has the steps.
 */
const ALLOWED_ORIGINS: readonly string[] = [];

for (const route of ROUTES) {
  test(`${route.name} loads with no errors, violations, 404s or third-party requests`, async ({ page, baseURL }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => problems.push(`exception: ${String(error)}`));
    page.on("response", (response) => {
      if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
    });
    page.on("request", (request) => {
      const url = new URL(request.url());
      const ownOrigin = new URL(baseURL!).origin;
      if (url.protocol.startsWith("http") && url.origin !== ownOrigin && !ALLOWED_ORIGINS.includes(url.origin)) {
        problems.push(`third-party request: ${request.url()}`);
      }
    });
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        console.error(`CSP violation: ${event.violatedDirective} ${event.blockedURI}`);
      });
    });

    await page.goto(route.path);
    // Hovering every internal link makes the router prefetch each one.
    for (const link of await page.locator('a[href^="/"]').all()) {
      if (await link.isVisible()) await link.hover();
    }
    await page.waitForLoadState("networkidle");

    expect(problems).toEqual([]);
  });
}

test("client-side navigation works under the hashed CSP", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Guide" }).click();
  await expect(page).toHaveURL(/\/guide\/$/);
  await expect(page.locator("h1")).toHaveText(/How the template is put together/);
  expect(errors).toEqual([]);
});

test("every page carries a hashed CSP that allows no inline script by default", async ({ request }) => {
  for (const route of ROUTES) {
    const html = await (await request.get(route.path)).text();
    const policy = /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1];
    expect(policy, route.name).toBeDefined();
    expect(policy).toMatch(/script-src 'self' 'sha256-/);
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  }
});

test("the fonts are served from this origin, with their licences", async ({ page, request, baseURL }) => {
  const origins = new Set<string>();
  page.on("response", (response) => {
    if (/\.woff2?(\?|$)/.test(response.url())) origins.add(new URL(response.url()).origin);
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect([...origins]).toEqual([new URL(baseURL!).origin]);

  for (const font of ["inter", "jetbrains-mono", "space-grotesk"]) {
    const licence = await request.get(`/fonts/${font}-LICENSE.txt`);
    expect(licence.status(), font).toBe(200);
    expect(await licence.text()).toContain("SIL Open Font License");
  }
});
