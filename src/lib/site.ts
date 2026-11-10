import type { Route } from "next";

/*
 * The one place the site's identity, navigation and routes are written.
 *
 * Everything else reads from here: the header, footer, mobile menu, sitemap,
 * robots.txt, metadata and social cards. `npm run init:site` rewrites the
 * identity block for a new project, and tests/unit/hardcoded.test.ts fails if
 * the repository slug is typed anywhere else in the source.
 */

/* -------------------------------------------------------------- identity -- */

/** The project's name, as a reader sees it. */
export const NAME = "Next Site Template";

/** GitHub `owner/repo`. Written here and in package.json, nowhere else. */
export const REPO = "freeknet/next-site-template";

export const REPO_URL = `https://github.com/${REPO}`;

/** The branch the site links into. */
export const DEFAULT_BRANCH = "main";

/** What the project is, in one line. The default page title's second half. */
export const TAGLINE = "A static Next.js site that starts finished";

/** The meta description: one or two plain sentences, over 50 characters. */
export const DESCRIPTION =
  "A Next.js 16 static-export template with a tested light and dark palette, markdown-driven pages, build-time social cards, and lint, unit, browser, link and Lighthouse checks wired into CI.";

/** The footer's one line about the project. */
export const SUMMARY =
  "A Next.js static-export template with the house style, tests and deploy setup the freeknet sites share.";

/** The licence, the same words wherever it is named. */
export const LICENCE = "MIT licensed";

/**
 * Whether search engines may index the site.
 *
 * False until launch: robots.txt disallows everything and every page carries
 * `noindex`. Flip it when the production domain is live.
 */
export const INDEXABLE = false;

/**
 * The deployed origin, for canonical and social URLs.
 *
 * The deploy script sets NEXT_PUBLIC_SITE_URL; Netlify sets URL on its own. A
 * local build falls back to the port the test server uses, so canonical and
 * og:image URLs still resolve under Playwright and Lighthouse.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  "http://localhost:4173"
).replace(/\/$/, "");

/** Prefix for anything kept in the visitor's browser storage, and the service worker's caches. */
export const STORAGE_PREFIX = "next-site-template";

/** The installed app's name under its icon: 12 characters or fewer, or it is cut off. */
export const SHORT_NAME = "Site";

/**
 * Whether the site is a Progressive Web App: installable, with a service worker that keeps the
 * pages readable offline (docs/pwa.md).
 *
 * Set to false to turn it off. The build then publishes a service worker that removes itself
 * and its caches from every browser that installed the old one, so switching off is safe.
 * scripts/build-sw.mjs reads this line, so keep it a literal `true` or `false`.
 */
export const PWA = true;

/* ------------------------------------------------------------ navigation -- */

/**
 * Icons are named rather than imported, because this module is read by the
 * sitemap and the metadata, neither of which should pull in components.
 * components/brand/icons.tsx maps each name to its drawing.
 */
export type IconName = "guide" | "about";

export type NavItem = {
  /** Checked against the real routes at compile time (typedRoutes). */
  href: Route;
  label: string;
  /** One line under the label in the mobile menu and the 404 page. */
  blurb: string;
  icon: IconName;
};

export const NAV: readonly NavItem[] = [
  {
    href: "/guide",
    label: "Guide",
    blurb: "How the template is put together, and how to make it yours.",
    icon: "guide",
  },
  {
    href: "/about",
    label: "About",
    blurb: "What the template is for, and what it is not.",
    icon: "about",
  },
] as const;

/**
 * Every page the export produces, for the sitemap, the social cards, llms.txt
 * and the browser tests. A route missing here has no card, which is a type
 * error in lib/og/cards.ts.
 *
 * Written without the trailing slash, because that is the form typedRoutes
 * checks. <Link> adds the slash itself (`trailingSlash` in next.config.ts);
 * `pathOf` adds it where a literal path is needed.
 */
export const EXPORTED_ROUTES = ["/", "/guide", "/about"] as const satisfies readonly Route[];

export type ExportedRoute = (typeof EXPORTED_ROUTES)[number];

/** The path a route is served at: `/guide` is the folder `/guide/`. */
export function pathOf(route: ExportedRoute): string {
  return route === "/" ? "/" : `${route}/`;
}

/** Marks the active nav item, treating nested routes as part of their family. */
export function isActiveRoute(pathname: string, href: string): boolean {
  const normalise = (value: string) =>
    value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
  const current = normalise(pathname);
  const target = normalise(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}
