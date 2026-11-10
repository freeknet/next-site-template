/*
 * The social cards' copy, one card per exported route.
 *
 * Plain data with no imports from Next or the renderer, because two programs
 * read it: the pages, for their metadata, and `metaplate render`, through
 * ./cards.render.tsx. The `Record` over the route list makes a route without
 * a card a type error.
 */

import type { ExportedRoute } from "../site";

export type CardCopy = {
  /** Small uppercase label above the title. */
  eyebrow: string;
  /** Short enough for two lines at 60px; the render fails if it overflows. */
  title: string;
  /** One short sentence. */
  description: string;
  /** Alternative text for the rendered card. */
  alt: string;
};

export const CARDS: Record<ExportedRoute, CardCopy> = {
  "/": {
    eyebrow: "Template",
    title: "A static Next.js site that starts finished.",
    description: "Tested palette, markdown pages, social cards and CI, ready on day one.",
    alt: "Next Site Template: a static Next.js site that starts finished.",
  },
  "/guide": {
    eyebrow: "Guide",
    title: "How the template is put together.",
    description: "Where each piece lives, and how to make the site your own.",
    alt: "The Next Site Template guide.",
  },
  "/about": {
    eyebrow: "About",
    title: "What the template is for.",
    description: "Static sites with their checks in place, and where it stops.",
    alt: "About the Next Site Template.",
  },
};
