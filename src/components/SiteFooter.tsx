import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import { GitHubIcon, GuideIcon, NAV_ICONS } from "@/components/brand/icons";
import { DEFAULT_BRANCH, LICENCE, NAV, REPO_URL, SUMMARY } from "@/lib/site";
import { CONTAINER, ICON } from "@/lib/constants";

/*
 * The lockup and one line about the project on the left, a map of the site
 * and the project's links on the right, and the gradient once, as a hairline
 * across the top. Every site link carries the same icon the section uses
 * elsewhere.
 */

const LINK =
  "text-secondary hover:text-text panel-hover flex items-center gap-2.5 text-sm";

const HEADING = "text-label mb-1 font-mono text-[10px] tracking-[0.16em] uppercase";

const PROJECT_LINKS = [
  { label: "Repository", href: REPO_URL, icon: GitHubIcon },
  { label: "Issues", href: `${REPO_URL}/issues`, icon: GitHubIcon },
  { label: "License", href: `${REPO_URL}/blob/${DEFAULT_BRANCH}/LICENSE`, icon: GuideIcon },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-hairline border-t">
      <div aria-hidden="true" className="spectrum-rule h-px opacity-60" />
      <div className={`${CONTAINER} py-14`}>
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-5">
            <Wordmark size={22} withMark />
            <p className="text-secondary max-w-[46ch] text-sm leading-relaxed">{SUMMARY}</p>
          </div>

          <div className="flex flex-wrap gap-16">
            <nav aria-label="Footer" className="flex flex-col gap-3">
              <h2 className={HEADING}>Site</h2>
              {NAV.map((item) => {
                const Icon = NAV_ICONS[item.icon];
                return (
                  <Link key={item.href} href={item.href} className={LINK}>
                    <Icon size={ICON.inline} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3">
              <h2 className={HEADING}>Project</h2>
              {PROJECT_LINKS.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  <Icon size={ICON.inline} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-hairline mt-14 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-label font-mono text-[11px] tracking-[0.04em]">{LICENCE}</span>
          <span className="text-label font-mono text-[11px]">{REPO_URL.replace("https://", "")}</span>
        </div>
      </div>
    </footer>
  );
}
