import { describe, expect, it } from "vitest";
import { socialImageCompatibility } from "metaplate";
import { CARDS } from "@/lib/og/cards";
import { og } from "@/lib/og/plate";
import { EXPORTED_ROUTES, pathOf } from "@/lib/site";

/*
 * Every social card, rendered and checked against what each platform documents (Metaplate's
 * compatibility profiles): format, dimensions, file size (WhatsApp's 600 KB, X's 5 MB), alt text.
 *
 * URLs are not checked here: a local build's URLs are http://localhost. After deploying, run
 * `npm run cards:verify-live -- https://your-domain/` to check the live pages, URLs included.
 */

const TARGETS = ["openGraph", "x", "linkedin", "facebook", "whatsapp", "slack", "discord"] as const;

describe.each(EXPORTED_ROUTES)("the card for %s", (route) => {
  it("renders, passes the plate's guards, and meets every platform's documented rules", async () => {
    const bytes = await og.render(CARDS[route]);
    const image = og.metadata(pathOf(route), CARDS[route]).openGraph.images[0];

    const report = socialImageCompatibility(image, {
      targets: [...TARGETS],
      fileSize: bytes.byteLength,
      checkUrl: false,
    });
    expect(report.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(report.compatible).toBe(true);
    expect(image.alt?.length ?? 0).toBeGreaterThan(10);
  }, 20_000);
});

describe("the compatibility check itself", () => {
  it("fails a card over WhatsApp's 600 KB limit, so a pass above means something", () => {
    const image = og.metadata("/", CARDS["/"]).openGraph.images[0];
    const report = socialImageCompatibility(image, { targets: ["whatsapp"], fileSize: 700_000, checkUrl: false });
    expect(report.issues.some((issue) => issue.severity === "error" && issue.code === "file-size")).toBe(true);
  });
});
