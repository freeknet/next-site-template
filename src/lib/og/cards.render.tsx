/*
 * What `metaplate render` draws (scripts/render-cards.mts): the one plate, once
 * per exported route, written to `public/<route>/og-image.png`.
 */

import type { RenderJob, RenderModule } from "metaplate/node";
import { EXPORTED_ROUTES, pathOf } from "../site";
import { CARDS, type CardCopy } from "./cards";
import { og } from "./plate";

const job = {
  plate: og,
  pages: EXPORTED_ROUTES.map((route) => ({ route: pathOf(route), copy: CARDS[route] })),
} satisfies RenderJob<CardCopy>;

export default [job] satisfies RenderModule;
