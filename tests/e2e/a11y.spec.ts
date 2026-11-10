import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { preparePage } from "./prepare";
import { ROUTES } from "./routes";

/*
 * Automated accessibility checks.
 *
 * tests/unit/palette.test.ts proves the tokens clear AA; a contrast failure
 * here means a token was used against the wrong surface.
 */
for (const route of ROUTES) {
  test(`${route.name} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(route.path);
    await preparePage(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}

test("the mobile navigation dialog is accessible while open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("dialog", { name: /site navigation/i })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test("every page has exactly one h1", async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route.path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveAccessibleName(route.heading);
  }
});

test("the skip link reaches the main landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await skip.click();
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the offline and 404 pages have no detectable accessibility violations", async ({ page }) => {
  for (const path of ["/offline/", "/no-such-page/"]) {
    await page.goto(path);
    await preparePage(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.map((violation) => `${path}: ${violation.id}`)).toEqual([]);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});
