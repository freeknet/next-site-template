import { expect, test } from "@playwright/test";

/*
 * The site as a Progressive Web App (docs/pwa.md): installable, and readable offline once
 * visited. These run against the built out/, where scripts/build-sw.mjs has written sw.js.
 * If PWA is switched off in src/lib/site.ts, delete this file or replace it with a check that
 * no worker stays registered.
 */

function pngSize(bytes: Buffer) {
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test("the manifest has what a browser needs to offer installation", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name.length).toBeLessThanOrEqual(12);
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.theme_color).toMatch(/^#/);

  const icons: { src: string; sizes: string; type: string; purpose?: string }[] = manifest.icons;
  for (const size of ["192x192", "512x512"]) {
    expect(icons.some((icon) => icon.sizes === size && icon.type === "image/png")).toBe(true);
  }
  expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);

  for (const icon of icons.filter((entry) => entry.type === "image/png")) {
    const response = await request.get(icon.src);
    expect(response.status(), icon.src).toBe(200);
    const [width, height] = icon.sizes.split("x").map(Number);
    expect(pngSize(await response.body()), icon.src).toEqual({ width, height });
  }
});

test("pages link the manifest, the Apple touch icon and a theme colour per scheme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", /apple-touch-icon\.png/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
});

test("the service worker installs, takes control, and keeps visited pages readable offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  // clients.claim() hands this page to the new worker without a reload.
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  await context.setOffline(true);

  // Precached on install, so readable without ever having been opened.
  await page.goto("/about/");
  await expect(page.locator("h1")).toHaveText(/What the template is for/);

  // The slash-less form a reader might type resolves to the cached folder page.
  await page.goto("/guide");
  await expect(page.locator("h1")).toHaveText(/How the template is put together/);

  // A page that was never cached gets the offline page, not the browser's error.
  await page.goto("/never-built/");
  await expect(page.locator("h1")).toHaveText(/No connection/);

  await context.setOffline(false);
});

test("the service worker is served uncached, so a new build always reaches returning visitors", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("javascript");
  const source = await response.text();
  expect(source).toMatch(/const CACHE = /);
  expect(source).not.toMatch(/__[A-Z_]+__/);
});
