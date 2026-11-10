import type { Metadata } from "next";
import Mark from "@/components/brand/Mark";
import { Action, Lede, Prose } from "@/components/ui";
import { readPageContent } from "@/lib/page-content";

/*
 * What the service worker shows for a page that was never cached when the device is offline
 * (scripts/sw-template.js). It is precached on install, kept out of the sitemap, the nav and
 * the social cards, and asks not to be indexed.
 */
export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default async function Offline() {
  const content = await readPageContent("offline");
  return (
    <div className="mx-auto flex max-w-[1360px] flex-col px-6 py-32 sm:px-10">
      <Mark size={64} color="var(--hairline-strong)" />
      <p className="text-accent-text mt-10 font-mono text-[11px] tracking-[0.2em] uppercase">Offline</p>
      <h1 className="text-text mt-6 max-w-[18ch] text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">
        No connection.
      </h1>
      <div className="mt-6 max-w-[60ch]">
        <Lede>{content.block("lede")}</Lede>
      </div>
      <div className="text-secondary mt-4 max-w-[60ch]">
        <Prose>{content.block("body")}</Prose>
      </div>
      <div className="mt-10">
        <Action href="/" variant="primary">
          Home
        </Action>
      </div>
    </div>
  );
}
