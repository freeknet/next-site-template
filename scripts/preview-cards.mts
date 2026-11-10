/*
 * Serves Metaplate's live gallery of the social cards while you design them: every route's card,
 * rendered on request, reloading when the plate or the copy is saved. Nothing is written to disk.
 * Under tsx for the same reason as render-cards.mts: the plate is JSX.
 */

import { runCli } from "metaplate/cli";

process.exit(await runCli(["preview", "src/lib/og/cards.render.tsx"]));
