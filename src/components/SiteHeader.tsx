import { GitHubIcon } from "@/components/brand/icons";
import NavLinks from "@/components/NavLinks";
import MobileMenu from "@/components/MobileMenu";
import SiteHeaderLogo from "@/components/SiteHeaderLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { NAME, REPO_URL } from "@/lib/site";

/*
 * Mark and wordmark, uppercase nav, the repository and the theme toggle on the
 * right, a hairline underneath. The only accent is the underline on the
 * current section: one accent per view, and the page you are on owns it.
 */
export default function SiteHeader() {
  return (
    <header className="border-hairline bg-ground/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <a
        href="#main-content"
        className="bg-accent text-on-accent sr-only px-4 py-2 text-sm font-semibold tracking-widest uppercase focus:not-sr-only focus:fixed focus:top-4 focus:left-6 focus:z-100"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-6 sm:px-10">
        <SiteHeaderLogo />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <NavLinks />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${NAME} on GitHub`}
            className="border-hairline-strong text-text hover:border-text hover:bg-panel panel-hover pressable hidden h-9 items-center gap-2 border px-3 text-xs font-semibold tracking-widest uppercase sm:inline-flex"
          >
            <GitHubIcon size={14} />
            GitHub
          </a>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
