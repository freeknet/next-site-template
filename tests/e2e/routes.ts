/** Every page in the static export, shared by the e2e specs. Add a route here when you add a page. */
export const ROUTES = [
  { name: "home", path: "/", heading: /starts finished/i, og: "/og-image.png", nav: false },
  { name: "guide", path: "/guide/", heading: /How the template is put together/, og: "/guide/og-image.png", nav: true },
  { name: "about", path: "/about/", heading: /What the template is for/, og: "/about/og-image.png", nav: true },
] as const;

export const NAV_ROUTES = ROUTES.filter((route) => route.nav);
