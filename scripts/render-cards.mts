/*
 * Renders the social cards into public/, before `next dev` and `next build`.
 *
 * Through Metaplate's own command, which writes every card where its metadata
 * says it lives, verifies each file, and fails on whatever the plate's guards
 * catch. Called in-process because the plate is JSX that Node cannot load
 * alone: this script runs under tsx, whose loader the import then goes
 * through. That also avoids `NODE_OPTIONS=`, which an npm script cannot set on
 * Windows. The manifest is kept out of public/ so it is not published.
 */

import { runCli } from "metaplate/cli";

const code = await runCli([
  "render",
  "--out",
  "public",
  "--manifest",
  ".og-manifest.json",
  "src/lib/og/cards.render.tsx",
]);
process.exit(code);
