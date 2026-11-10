import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MARK_CHEVRON, MARK_CURSOR } from "@/components/brand/Mark";
import { BRAND } from "@/lib/constants";

/* The favicon is a file Next serves as it is, so it is kept in step with the mark by this test. */
describe("src/app/icon.svg", () => {
  const svg = readFileSync(path.join(process.cwd(), "src", "app", "icon.svg"), "utf8");

  it("draws the mark's own geometry", () => {
    expect(svg).toContain(`points="${MARK_CHEVRON}"`);
    for (const [key, value] of Object.entries(MARK_CURSOR)) expect(svg).toContain(`${key}="${value}"`);
  });

  it("uses the brand's ground and accent", () => {
    expect(svg.toLowerCase()).toContain(BRAND.ground.toLowerCase());
    expect(svg.toLowerCase()).toContain(BRAND.accent.toLowerCase());
  });
});
