import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

/*
 * What a crawler or a link preview reads. The site ships as a static export,
 * so whatever the build wrote is exactly what gets served.
 */

/** A PNG's dimensions, from its IHDR chunk. */
function pngSize(bytes: Buffer) {
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

for (const route of ROUTES) {
  test(`${route.name} social card is a real 1200x630 PNG`, async ({ request }) => {
    const response = await request.get(route.og);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const body = await response.body();
    expect(body.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(pngSize(body)).toEqual({ width: 1200, height: 630 });
  });
}

test("every page states the Open Graph fields a preview reads", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route.path);
    const meta = (property: string) => page.locator(`meta[property="${property}"]`);
    await expect(meta("og:site_name"), route.name).toHaveAttribute("content", /.+/);
    await expect(meta("og:type"), route.name).toHaveAttribute("content", "website");
    await expect(meta("og:url"), route.name).toHaveAttribute("content", new RegExp(`${route.path}$`));
    await expect(meta("og:image"), route.name).toHaveAttribute("content", new RegExp(route.og.replace(/\./g, "\\.")));
    await expect(meta("og:image:width")).toHaveAttribute("content", "1200");
    await expect(meta("og:image:height")).toHaveAttribute("content", "630");
    await expect(meta("og:image:alt")).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  }
});

test("every page has a title, a description and a canonical link", async ({ page }) => {
  const titles = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route.path);
    titles.add(await page.title());
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length ?? 0, route.name).toBeGreaterThan(50);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical, route.name).toMatch(new RegExp(`${route.path}$`));
  }
  expect(titles.size, "every page needs its own title").toBe(ROUTES.length);
});

test("pages ask not to be indexed until launch, and robots.txt agrees", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /");
});

test("structured data describes the site", async ({ page }) => {
  await page.goto("/");
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(json ?? "{}");
  expect(data["@type"]).toBe("WebSite");
  expect(data.name).toBeTruthy();
});

test("the favicon is an SVG served with the right type", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').first().getAttribute("href");
  expect(href).toMatch(/\.svg/);
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
});

test("the sitemap, manifest and llms.txt list every page", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const llms = await (await request.get("/llms.txt")).text();
  for (const route of ROUTES) {
    expect(sitemap, `sitemap is missing ${route.path}`).toContain(`${route.path}</loc>`);
    expect(llms, `llms.txt is missing ${route.path}`).toContain(`${route.path})`);
  }
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  expect((await manifest.json()).name).toBeTruthy();
});

test("an unknown address gets the 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(/Nothing at this address/);
});
