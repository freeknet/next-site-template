import type { ComponentType } from "react";
import CodeBlock from "@/components/CodeBlock";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import {
  CardIcon,
  CheckIcon,
  DeployIcon,
  DocumentIcon,
  GuideIcon,
  LayersIcon,
  PaletteIcon,
} from "@/components/brand/icons";
import { Action, Lede, Panel, Prose } from "@/components/ui";
import { InlineMarkdown } from "@/components/Markdown";
import { CONTAINER, ICON } from "@/lib/constants";
import { readPageContent } from "@/lib/page-content";
import { NAME, REPO, REPO_URL, TAGLINE } from "@/lib/site";

/*
 * The home page composes sections; its words live in ./content.md.
 *
 * The highlights are keyed by their heading's slug, which binds each one to
 * its icon here. Rewording a heading fails the build rather than silently
 * pairing the wrong icon with the new title.
 */

const HIGHLIGHT_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  "a-palette-that-is-checked": PaletteIcon,
  "pages-written-in-markdown": DocumentIcon,
  "social-cards-at-build-time": CardIcon,
  "tests-that-run-in-ci": CheckIcon,
  "a-strict-content-security-policy": LayersIcon,
  "deploys-to-any-static-host": DeployIcon,
};

export default async function Home() {
  const content = await readPageContent("(home)");
  const highlights = content.items("highlights");
  // Built from REPO rather than written in content.md, so it follows the project when it moves.
  const start = [
    `npx degit ${REPO} my-site`,
    "cd my-site",
    "npm install",
    'npm run init:site -- --name "My Site" --repo me/my-site',
    "npm run dev",
  ].join("\n");

  return (
    <>
      <section className="hero-field border-hairline border-b">
        <div className={`${CONTAINER} pt-20 pb-24 sm:pt-28 sm:pb-32`}>
          <p className="text-accent-text font-mono text-[11px] tracking-[0.2em] uppercase">
            {NAME}
          </p>
          <h1 className="text-text mt-6 max-w-[18ch] text-[44px] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-[68px]">
            {TAGLINE}.
          </h1>
          <div className="mt-8 max-w-[68ch]">
            <Lede>{content.block("lede")}</Lede>
          </div>
          <div className="mt-11 flex flex-wrap gap-3">
            <Action href="/guide" variant="primary" icon={GuideIcon}>
              Read the guide
            </Action>
            <Action href={REPO_URL} external>
              Use the template
            </Action>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} py-20 sm:py-24`}>
        <SectionHeading title="What is already done" note={`${highlights.length} things`} />
        <ul className="rule-grid mt-10 grid list-none sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[item.slug];
            if (!Icon) throw new Error(`no icon for highlight "${item.slug}"`);
            return (
              <Panel key={item.slug} as="li" className="gap-4 p-8">
                <Reveal delay={(index % 3) * 0.06} className="flex flex-col gap-4">
                  <span className="text-text">
                    <Icon size={ICON.card} />
                  </span>
                  <h3 className="text-text text-[19px] leading-snug font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-secondary text-[15px] leading-[1.65]">
                    <InlineMarkdown>{item.body}</InlineMarkdown>
                  </div>
                </Reveal>
              </Panel>
            );
          })}
        </ul>
      </section>

      <section className={`${CONTAINER} pb-24`}>
        <SectionHeading title="Start a site" note="five commands" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <CodeBlock text={start} language="bash" />
          <Prose className="text-[17px]">{content.block("closing")}</Prose>
        </div>
      </section>
    </>
  );
}
